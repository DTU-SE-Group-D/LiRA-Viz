import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Ways } from '../tables';
import { LatLon, Road, WayId } from '../models';

@Injectable()
export class RoadService {
  constructor(
    @InjectConnection('lira-map') private readonly knex_liramap: Knex,
  ) {}

  /**
   * Return a dictionary of the roads. A road is defined by a name, a list of branch (each branch
   * is a list of way ids) and the geometry (a list of coordinates) of each way.
   *
   * TODO: return branch corresponding to the direction of the road instead of chunk of road
   * TODO: add parameters to get the road of a specific area
   * TODO: grouping the way by road name is not perfect, some roads can have the same name...
   */
  async getRoads() {
    // Query the geometry, node_start and node_end of each way and structure the data properly
    const ways: Record<
      WayId,
      {
        geometry: LatLon[];
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
                  lon: coord[0],
                };
              })
            : null,
          node_start: way.node_start,
          node_end: way.node_end,
        },
      ]),
    );

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

    // TODO: create a function of the following and add unit tests with mock data:
    //  - a road completely split into two branches
    //  - a road splitting into two branches and then merging back
    const roads: Road[] = [];

    for (const road of waysInRoads) {
      if (road.way_ids.length === 0) continue;

      let geometries: Record<WayId, LatLon[]> = {};

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
}
