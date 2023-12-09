import { Injectable } from '@nestjs/common';

import { InjectConnection, Knex } from 'nestjs-knex';
import { Measurement } from '../tables';
import { MeasurementType } from '../models';
import knexPostgis = require('knex-postgis');

@Injectable()
export class RCService {
  constructor(@InjectConnection('group-d') private readonly groupd: Knex) {}

  /**
   * Query the database to get the conditions.
   *
   * @param minLat the minimum latitude
   * @param maxLat the maximum latitude
   * @param minLng the minimum longitude
   * @param maxLng the maximum longitude
   * @param type the type of condition
   * @param valid_before the maximum timestamp
   * @param valid_after the minimum timestamp
   *
   * @author Kerbourc'h
   */
  async getConditions(
    minLat: string,
    maxLat: string,
    minLng: string,
    maxLng: string,
    type: string,
    valid_before: string,
    valid_after: string,
  ) {
    const db = this.groupd;
    const st = knexPostgis(db);

    let res;
    try {
      let query = Measurement(db)
        .select(
          'id',
          'type_index',
          'value',
          'latitude',
          'longitude',
          db.raw('ST_MakePoint(longitude,latitude) as section_geom'),
          'timestamp',
        )
        .where('type_index', '<', MeasurementType['DI'])
        .whereNotNull('latitude')
        .whereNotNull('longitude');

      if (type !== undefined) {
        query = query.where('type_index', MeasurementType[type]);
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
        query.where(st.boundingBoxIntersects(bounds, 'section_geom'));
      }

      if (valid_after !== undefined) {
        query.where('timestamp', '>=', valid_after);
      }

      if (valid_before !== undefined) {
        query.where('timestamp', '<=', valid_before);
      }

      res = await query;
    } catch (e) {
      console.error(e);
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
          geometry: {
            type: 'Point',
            coordinates: [r.longitude, r.latitude],
          },
          properties: {
            type: MeasurementType[r.type_index],
            value: r.value,
            valid_time: r.timestamp,
          },
        };
      }),
    };
  }
}
