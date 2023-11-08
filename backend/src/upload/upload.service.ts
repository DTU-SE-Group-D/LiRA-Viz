import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Measurement } from '../tables';

@Injectable()
export class UploadService {
  constructor(
    @InjectConnection('group-d') private readonly knex_group_d: Knex,
  ) {}

  /**
   * Uploads one entry to the measurment table with the given parameters as data. Is meant for dynatest data.
   * @param {number} distance_survey the distance from the begining of the survey. Can be null.
   * @param {number} type_index the type of measurment, see readme or bottom of file for description of numbers. Can be null.
   * @param {number} value the value for the measurment, can mean different things dependant on type of measurment. Can be null.
   * @param {number} timestamp the date in format: year/month/day hour:minut:second.milisecond. Can be null.
   * @param {number} distance_way the distance from the begining of the way. Can be null.
   * @param {string} fk_way_id the automatically generated uuid from the database for the corresponding way entry in the way table. Can be null.
   * @param {string} fk_survey_id the automatically generated uuid from the database for the corresponding survey entry in the survey table. Can't be null.
   * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
   * @author Vejlgaard, Liu
   */
  async db_insert_measurement_data(
    distance_survey: number,
    type_index: number,
    value: number,
    timestamp: number,
    distance_way: number,
    fk_way_id: string,
    fk_survey_id: string,
    debug: boolean,
  ) {
    try {
      await Measurement(this.knex_group_d).insert({
        distance_survey: distance_survey,
        type_index: type_index,
        value: value,
        timestamp: timestamp,
        distance_way: distance_way,
        fk_way_id: fk_way_id,
        fk_survey_id: fk_survey_id,
      });
    } catch (error) {
      console.error(error);
    }
    if (debug) {
      console.log('Data uploaded to the database: ');
      console.log('distance_survey: ' + distance_survey);
      console.log('type_index: ' + type_index);
      console.log('value: ' + value);
      console.log('timestamp: ' + timestamp);
      console.log('distance_way: ' + distance_way);
      console.log('fk_way_id: ' + fk_way_id);
      console.log('fk_survey_id: ' + fk_survey_id);
      console.log('-----------------------------------');
    }
  }
}
