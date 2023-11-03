import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { IWay, Way } from '../tables';
import { LatLng, OSMWayId, Road } from '../models';
import { getOSMWaysInARoad } from './osm';

@Injectable()
export class RoadService {
  constructor(
    @InjectConnection('group-d') private readonly knex_groupd: Knex,
  ) {}

  /**
   * Insert a way in the database.
   * @param way the way to insert
   * @returns the inserted way (in an array)
   *
   * @author Kerbourc'h
   */
  async insertWay(way: IWay) {
    const { section_geom, ...rest } = way;

    return Way(this.knex_groupd)
      .insert({
        ...rest,
        section_geom: this.knex_groupd.raw('ST_GeomFromGeoJSON(?)', [
          JSON.stringify(section_geom),
        ]),
      })
      .onConflict('osm_id')
      .merge() // Force to update because returning doesn't work with ignore()
      .returning([
        'id',
        'way_name',
        'osm_id',
        'node_start',
        'node_end',
        'length',
        this.knex_groupd.raw(
          'ST_AsGeoJSON(section_geom)::json as section_geom',
        ),
        'isoneway',
      ]);
  }

  /**
   * Get or create the ways corresponding to the OSMWayIds.
   * You should definitely use this function instead of getOrCreateWay if you
   * have multiple ways to get.
   * This executes the queries sequentially to avoid useless queries to OSM
   * and the database. This is especially useful when the ways are in the same road.
   *
   * // TODO: change this a nest queue
   *
   * @param wayIds
   *
   * @author Kerbourc'h
   */
  async getOrCreateWays(wayIds: OSMWayId[]) {
    let tasks: any = wayIds.map((id, index) =>
      index === 0 ? this.getOrCreateWay(id).then((value: IWay) => [value]) : id,
    );

    return await tasks.reduce(async (cur: Promise<IWay[]>, next: string) => {
      return cur.then(async (value: IWay[]) => {
        if (((value.length / tasks.length) * 100) % 10 === 0)
          console.info(
            'Importation status',
            `${(value.length / tasks.length) * 100}%`,
          );

        return [...value, await this.getOrCreateWay(next)];
      });
    });
  }

  /**
   * Will get the Way corresponding to the OSMWayId either from the database if
   * available or from OSM and insert the whole road containing it in the database.
   *
   * // TODO: change this a nest queue
   *
   * @param OSMWayId the osm id of a way in the road
   *
   * @author Kerbourc'h
   */
  async getOrCreateWay(OSMWayId: OSMWayId): Promise<IWay> {
    const way = await Way(this.knex_groupd)
      .select(
        'id',
        'way_name',
        'osm_id',
        'node_start',
        'node_end',
        'length',
        this.knex_groupd.raw(
          'ST_AsGeoJSON(section_geom)::json as section_geom',
        ),
        'isoneway',
      )
      .where('osm_id', OSMWayId)
      .limit(1);

    // If the way doesn't exist in the database, fetch the road from OSM
    // and insert it in the database. Then return the way.
    if (way.length === 0) {
      console.info(
        `Way ${OSMWayId} doesn't exist in the database, fetching road from OSM.`,
      );
      return await getOSMWaysInARoad(OSMWayId, async (data): Promise<IWay> => {
        if (data.length > 0) {
          console.info(
            `Inserting road containing ${data.length} ways in the database.`,
          );
          return await Promise.all(data.map((way) => this.insertWay(way))).then(
            async (result): Promise<IWay> => {
              const ways = result.flat();
              console.debug(
                "Road's OSM Ids:",
                ways.map((way) => way.osm_id).join(', '),
              );
              return ways.filter((way) => way.osm_id === OSMWayId)[0];
            },
          );
        } else {
          console.error('No way found in the road. Check the OSM Id.');
          return null;
        }
      });
    }

    return way[0];
  }

  /**
   * Query the geometry, node_start and node_end of each way and structure the data properly
   */
  async getWaysGeometry() {
    const ways: Record<
      WayId,
      {
        geometry: LatLng[];
        node_start: number;
        node_end: number;
      }
    > = Object.fromEntries(
      (
        await Ways(this.knex_liramap).select(
          this.knex_liramap.raw('"OSM_Id"'),
          this.knex_liramap.raw(
            "ST_AsGeoJSON(section_geom)::json->'coordinates' as geometry",
          ),
          'node_start',
          'node_end',
        )
      ).map((way) => [
        way.OSM_Id,
        {
          geometry: way.geometry
            ? way.geometry.map((coord: number[]) => {
                return {
                  lat: coord[1],
                  lng: coord[0],
                };
              })
            : null,
          node_start: way.node_start,
          node_end: way.node_end,
        },
      ]),
    );

    return ways;
  }

  /**
   * Make an ordered lists of ways that represent a road.
   *
   * TODO: create a function of the following and add unit tests with mock data:
   *     //  - a road completely split into two branches
   *     //  - a road splitting into two branches and then merging back
   */
  roadsForming(ways: any, waysInRoads: any) {
    const roads: Road[] = [];

    for (const road of waysInRoads) {
      if (road.way_ids.length === 0) continue;

      let geometries: Record<WayId, LatLng[]> = {};

      // extract the geometry of each way
      for (const way_id of road.way_ids) {
        geometries[way_id] = ways[way_id].geometry;
      }

      let road_way_ids: WayId[][] = [];

      let road_branch_idx = 0;
      while (road.way_ids.length > 0) {
        // extract branches of the road
        let curr_way_id = road.way_ids[0];
        // find the beginning of the branch containing road
        for (const way_id of road.way_ids) {
          if (ways[way_id].node_end === ways[curr_way_id].node_start) {
            curr_way_id = way_id;
          }
        }

        // extract the branch
        road_way_ids[road_branch_idx] = [];
        while (curr_way_id) {
          road_way_ids[road_branch_idx].push(curr_way_id);

          // find the next way (or undefined if the branch is finished)
          const next_way_id: WayId = road.way_ids.find(
            (way_id: WayId) =>
              ways[curr_way_id].node_end === ways[way_id].node_start,
          );
          // remove the way from the list
          road.way_ids.splice(road.way_ids.indexOf(curr_way_id), 1);

          curr_way_id = next_way_id;
        }
        road_branch_idx++;
      }

      roads.push({
        way_name: road.way_name,
        way_ids: road_way_ids,
        geometries: geometries,
      });
    }

    return roads;
  }

  /**
   * Return the path of the surveys.
   */
  async getSurveysPath() {
    const ways = await this.getWaysGeometry();

    // SELECT ARRAY_AGG(DISTINCT "OSM_Id"), fk_trip_id
    // FROM coverage
    // JOIN ways ON coverage.fk_way_id = ways.id
    // GROUP BY fk_trip_id
    const waysInRoads = (
      await Ways(this.knex_liramap)
        .select(
          this.knex_liramap.raw('ARRAY_AGG(DISTINCT "OSM_Id") as way_ids'),
          'fk_trip_id',
        )
        .join('coverage', 'coverage.fk_way_id', 'ways.id')
        .groupBy('fk_trip_id')
    ).map((road: { way_ids: string[]; fk_trip_id: string }) => {
      return {
        way_ids: road.way_ids,
        way_name: road.fk_trip_id,
      };
    });

    return this.roadsForming(ways, waysInRoads);
  }

  /**
   * Return a dictionary of the roads. A road is defined by a name, a list of branch (each branch
   * is a list of way ids) and the geometry (a list of coordinates) of each way.
   *
   * TODO: return branch corresponding to the direction of the road instead of chunk of road
   * TODO: add parameters to get the road of a specific area
   * TODO: grouping the way by road name is not perfect, some roads can have the same name...
   */
  async getRoads() {
    const ways = await this.getWaysGeometry();

    // Query the way ids of a road ordered by the number of ways in the road. Also remove the way_count column.
    const waysInRoads = (
      await Ways(this.knex_liramap)
        .select(
          this.knex_liramap.raw('ARRAY_AGG("OSM_Id") as way_ids'),
          'way_name',
          this.knex_liramap.raw(
            'ARRAY_LENGTH(ARRAY_AGG("OSM_Id"), 1) as way_count',
          ),
        )
        .where('way_name', '!=', '')
        .groupBy('way_name')
        // This is a small trick to show the bigger roads first
        .orderBy('way_count', 'desc')
        // TODO: remove limit when frontend can deals with it
        .limit(700)
    ).map((road) => {
      return {
        way_ids: road.way_ids,
        way_name: road.way_name,
      };
    });

    return this.roadsForming(ways, waysInRoads);
  }
}
