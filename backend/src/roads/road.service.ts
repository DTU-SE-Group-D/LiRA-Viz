import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { IWay, Measurement, Way } from '../tables';
import { LatLng, MeasurementType, OSMWayId, Road } from '../models';
import { constructNavigationTable, findLongestBranch } from './roads';

@Injectable()
export class RoadService {
  constructor(
    @InjectConnection('group-d') private readonly knex_groupd: Knex,
  ) {}

  /**
   * Query the geometry, node_start and node_end of each way and structure the data properly
   *
   * @author Kerbourc'h
   */
  async getWaysGeometry(OSMWayId: OSMWayId[]): Promise<IWay[]> {
    return Way(this.knex_groupd)
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
      )
      .whereIn('osm_id', OSMWayId);
  }

  /**
   * Make an ordered lists of ways that represent a road.
   *
   * @author Kerbourc'h
   */
  async roadsForming(wayIds: OSMWayId[], wayName: string): Promise<Road> {
    // Extract the way object
    let ways: Record<OSMWayId, IWay<LatLng[]>> = {};
    for (const way of await this.getWaysGeometry(wayIds)) {
      ways[way.osm_id] = {
        ...way,
        section_geom: way.section_geom.coordinates.map(
          (coordinate: number[]): LatLng => {
            return {
              lat: coordinate[1],
              lng: coordinate[0],
            };
          },
        ),
      };
    }

    // Create record storing for each way next and previous ways
    let navigationTable: Record<
      OSMWayId,
      { next: OSMWayId[]; prev: OSMWayId[] }
    > = constructNavigationTable(ways);

    const longestBranches: { ids: OSMWayId[]; length: number }[] = [];

    // add all the longest branch of all the way with no prev way
    for (const way_id of Object.keys(navigationTable)) {
      if (navigationTable[way_id].prev.length === 0) {
        longestBranches.push(findLongestBranch(way_id, navigationTable, ways));
      }
    }

    // For each look if the way is in other branch and remove
    // the way from the shortest branch
    for (let i = 0; i < longestBranches.length; i++) {
      const branch = longestBranches[i];
      for (let j = 0; j < i; j++) {
        const otherBranch = longestBranches[j];

        // remove the way in common to the two branches in the shortest branch
        if (branch.length > otherBranch.length) {
          otherBranch.ids = otherBranch.ids.filter((id) => {
            if (branch.ids.includes(id)) otherBranch.length -= ways[id].length;
            return !branch.ids.includes(id);
          });
        } else {
          branch.ids = branch.ids.filter((id) => {
            if (otherBranch.ids.includes(id)) branch.length -= ways[id].length;
            return !otherBranch.ids.includes(id);
          });
        }
      }
    }

    const branches: OSMWayId[][] = longestBranches.map((branch) => branch.ids);
    // TODO expends branches in the opposite direction if the way is not isoneway

    const geometries: Record<OSMWayId, LatLng[]> = {};
    Object.values(ways).forEach((way) => {
      geometries[way.osm_id] = way.section_geom;
    });

    const sumLength = longestBranches.reduce(
      (total, branch) => total + branch.length,
      0,
    );

    return {
      way_name: wayName,
      branches: branches,
      geometries: geometries,
      length: sumLength,
    };
  }

  /**
   * Return a dictionary of the roads. A road is defined by a name, a list of branch (each branch
   * is a list of way ids) and the geometry (a list of coordinates) of each way.
   *
   * TODO: add parameters to get the road of a specific area (then remove the limit in the query)
   *
   * @author Kerbourc'h
   */
  async getRoadsPaths() {
    // Query the way ids of a road ordered by the number of ways in the road. Also remove the way_count column.
    const waysInRoads = (
      await Way(this.knex_groupd)
        .select(
          this.knex_groupd.raw('ARRAY_AGG("osm_id") as way_ids'),
          'way_name',
          this.knex_groupd.raw(
            'ARRAY_LENGTH(ARRAY_AGG("osm_id"), 1) as way_count',
          ),
        )
        .where('way_name', '!=', '')
        .groupBy('way_name')
        // This is a small trick to show the bigger roads first
        .orderBy('way_count', 'desc')
        .limit(500)
    ).map((road): { way_ids: string[]; way_name: string } => {
      return {
        way_ids: road.way_ids,
        way_name: road.way_name,
      };
    });

    return Promise.all(
      waysInRoads.map(async (waysInRoad) =>
        this.roadsForming(waysInRoad.way_ids, waysInRoad.way_name),
      ),
    );
  }

  /**
   * Get the data of a way.
   *
   * @param wayId
   * @returns type: the index of the type of the data,
   *          value: the value of the data,
   *          distance_way: the distance along the way,
   *          geometry: the geometry of the way,
   *          length: the length of the way
   *
   * @author Kerbourc'h
   */
  async getWayData(wayId: OSMWayId): Promise<{
    data: {
      type: string;
      value: number;
      distance_way: number;
    }[];
    geometry: number[][];
    length: number;
  }> {
    const way = (
      await Way(this.knex_groupd)
        .select(
          'id',
          'length',
          this.knex_groupd.raw(
            'st_asgeojson(section_geom)::json as section_geom',
          ),
        )
        .where('osm_id', Number(wayId))
        .limit(1)
    )[0];

    if (way === undefined) return { data: [], geometry: [], length: 0 };

    return Measurement(this.knex_groupd)
      .select('type_index', 'value', 'distance_way')
      .where('fk_way_id', way.id)
      .orderBy('distance_way')
      .where('type_index', '<', 33)
      .then(
        (
          data: {
            type_index: number;
            value: number;
            distance_way: number;
            length: number;
          }[],
        ) => {
          if (!data) return { data: [], geometry: [], length: way.length };

          const length = way.length;

          return {
            data: data.map((d) => {
              return {
                type: MeasurementType[d.type_index],
                value: d.value,
                distance_way: d.distance_way,
              };
            }),
            geometry: way.section_geom.coordinates,
            length: length,
          };
        },
      );
  }
}
