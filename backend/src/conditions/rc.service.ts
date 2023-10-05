import { Injectable } from '@nestjs/common';

import { InjectConnection, Knex } from 'nestjs-knex';
import { Condition } from 'src/models';
import { Conditions, Conditions2 } from '../tables';
import knexPostgis = require('knex-postgis');

@Injectable()
export class RCService {
  constructor(@InjectConnection('lira-map') private readonly liramap: Knex) {}

  async getWayRoadConditions(dbId: string): Promise<Condition[]> {
    return (
      Conditions(this.liramap)
        .select(
          'cond1.value as KPI',
          'cond2.value as DI',
          'cond1.distance01 as way_dist',
        )
        .join(
          'condition_coverages as cond2',
          'cond1.distance01',
          '=',
          'cond2.distance01',
        )
        .where('cond1.type', 'KPI')
        .where('cond2.type', 'DI')
        .where(this.liramap.raw('cond1.fk_way_id = cond2.fk_way_id'))
        // .where('cond1.distance01', '<>', 0)
        .where('cond1.fk_way_id', dbId)
        .orderBy('cond1.distance01')
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
    const db = this.liramap;
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
