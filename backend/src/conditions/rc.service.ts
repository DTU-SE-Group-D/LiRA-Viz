import { Injectable } from '@nestjs/common';

import { InjectConnection, Knex } from 'nestjs-knex';
import { Condition, LatLngDist, WayId, WaysConditions } from 'src/models';
import groupBy from '../util';
import { RoadConditions, Ways, ZoomConditions, Conditions2 } from '../tables';

import knexPostgis = require('knex-postgis');

@Injectable()
export class RCService {
  constructor(
    @InjectConnection('postgis') private readonly knex: Knex,
    @InjectConnection('lira-map') private readonly knex_liramap: Knex,
  ) {}

  async getWays(
    wayIds: string[],
  ): Promise<[{ [key: WayId]: LatLngDist[] }, { [key: WayId]: number }]> {
    const ways = await Ways(this.knex)
      .select(
        'id as way_id',
        this.knex.raw(
          "ST_AsGeoJSON((ST_DumpPoints(geom)).geom)::json->'coordinates' as pos",
        ),
        this.knex.raw(
          'ST_LineLocatePoint(geom, (ST_DumpPoints(geom)).geom) as way_dist',
        ),
        this.knex.raw('ST_Length(geom::geography) as length'),
      )
      .whereIn('id', wayIds)
      .orderBy(this.knex.raw('id::integer') as any);

    return [
      groupBy<any, LatLngDist>(ways, 'way_id', (cur: any) => ({
        lat: cur.pos[1],
        lng: cur.pos[0],
        way_dist: cur.way_dist,
      })),
      ways.reduce((acc, cur) => {
        acc[cur.way_id] = cur.length;
        return acc;
      }, {}),
    ];
  }

  async getWayRoadConditions(
    way_id: string,
    type: string,
  ): Promise<Condition[]> {
    return RoadConditions(this.knex)
      .select('way_id', 'way_dist', 'value')
      .where({ type: type, way_id: way_id })
      .orderBy('way_dist');
  }

  async getZoomConditions(
    type: string,
    zoom: string,
  ): Promise<{ [key: WayId]: Condition[] }> {
    const res = await ZoomConditions(this.knex)
      .select('way_id', 'way_dist', 'value')
      .where({ type: type, zoom: parseInt(zoom, 10) })
      .orderBy('way_dist');
    return groupBy(res, 'way_id', ({ way_dist, value }) => ({
      way_dist,
      value,
    }));
  }

  async getWaysConditions(type: string, zoom: string): Promise<WaysConditions> {
    const zoomConditions = await this.getZoomConditions(type, zoom);
    const wayIds = Object.keys(zoomConditions);
    const [ways, way_lengths] = await this.getWays(wayIds);

    return wayIds.reduce(
      (acc, way_id) => {
        {
          acc.way_ids.push(way_id);
          acc.way_lengths.push(way_lengths[way_id]);
          acc.geometry.push(ways[way_id]);
          acc.conditions.push(zoomConditions[way_id]);
        }
        return acc;
      },
      {
        way_ids: [],
        way_lengths: [],
        geometry: [],
        conditions: [],
      } as WaysConditions,
    );
  }

  async getConditions(
    minLat: string,
    maxLat: string,
    minLng: string,
    maxLng: string,
    type: string,
    valid_before: string,
    valid_after: string,
    computed_after: string,
  ) {
    const db = this.knex_liramap;
    const st = knexPostgis(db);

    let res;
    try {
      let query = Conditions2(db)
        .select(
          'coverage_values.id',
          'type',
          'value',
          'std',
          'start_time_utc',
          'compute_time',
          'task_id',
          st.asGeoJSON('coverage.section_geom').as('section_geom'),
          'IsHighway',
        )
        .innerJoin(
          'coverage',
          'public.coverage.id',
          'coverage_values.fk_coverage_id',
        )
        .innerJoin('trips', 'trips.id', 'coverage.fk_trip_id')
        .innerJoin('ways', 'ways.id', 'coverage.fk_way_id')
        .whereNull('coverage_values.ignore');

      if (type !== undefined) {
        query = query.where({ type: type });
      }

      const minLatNo = Number(minLat);
      const maxLatNo = Number(maxLat);
      const minLngNo = Number(minLng);
      const maxLngNo = Number(maxLng);
      if (
        !isNaN(minLatNo) &&
        !isNaN(maxLatNo) &&
        !isNaN(minLngNo) &&
        !isNaN(maxLngNo)
      ) {
        const bounds = st.makeEnvelope(minLngNo, minLatNo, maxLngNo, maxLatNo);
        // query.where(st.boundingBoxContains(bounds, 'section_geom'))
        // query.where(st.boundingBoxIntersects(bounds, 'section_geom'))
        query.where(st.boundingBoxIntersects(bounds, 'coverage.section_geom'));
      }

      if (valid_after !== undefined) {
        query.where('start_time_utc', '>=', valid_after);
      }

      if (valid_before !== undefined) {
        query.where('start_time_utc', '<=', valid_before);
      }

      if (computed_after !== undefined) {
        query.where('compute_time', '>', computed_after);
      }

      res = await query;
    } catch (e) {
      console.log(e);
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    return {
      type: 'FeatureCollection',
      features: res.map((r) => {
        return {
          type: 'Feature',
          geometry: JSON.parse(r.section_geom),
          properties: {
            id: r.id,
            type: r.type,
            value: r.value,
            std: r.std,
            valid_time: r.start_time_utc,
            motorway: r.IsHighway,
            compute_time: r.compute_time,
            task_id: r.task_id,
          },
        };
      }),
    };
  }
}
