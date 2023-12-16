import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { SurveyData, SurveyImage, SurveyStructure } from './upload';
import { join } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

import * as process from 'process';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  constructor(
    @InjectConnection('group-d') private readonly knex_group_d: Knex,
  ) {}

  /**
   * Uploads one entry to the measurement table with the given parameters as data. Is meant for dynatest data.
   * @param {string} fk_survey_id the automatically generated uuid from the database for the corresponding survey entry in the survey table.
   * @param {SurveyData} data the data to be uploaded to the database.
   * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
   * @author Vejlgaard, Liu
   */
  async db_insert_measurement_data(
    fk_survey_id: string,
    data: SurveyData,
    debug: boolean,
  ): Promise<void> {
    try {
      await this.knex_group_d('measurement').insert({
        type_index: data.type_index,
        value: data.value,
        timestamp: data.timestamp,
        distance_way: data.distance_way,
        fk_way_id: data.fk_way_id,
        distance_survey: data.distance_survey,
        fk_survey_id: fk_survey_id,
        latitude: data.position?.lat,
        longitude: data.position?.lng,
      });
      if (debug) {
        console.log('Data uploaded to the database: ');
        console.log('distance_survey: ' + data.distance_survey);
        console.log('type_index: ' + data.type_index);
        console.log('value: ' + data.value);
        console.log('timestamp: ' + data.timestamp);
        console.log('distance_way: ' + data.distance_way);
        console.log('fk_way_id: ' + data.fk_way_id);
        console.log('fk_survey_id: ' + fk_survey_id);
        console.log('-----------------------------------');
      }
    } catch (error) {
      console.error('Error uploading measurement data:', error);
      throw error;
    }
  }

  /**
   * Uploads one entry to the survey table with the given parameters as data.
   * @param {SurveyStructure} survey the survey structure for the dataset.
   * @param {boolean} debug debug boolean for printing relevant information, and is false by default.
   * @returns the automatically generated id of the entry as a string, for use in the measurement upload function.
   * @author Vejlgaard, Liu
   */
  async db_insert_survey_data(
    survey: SurveyStructure,
    debug: boolean,
  ): Promise<string> {
    try {
      const res = await this.knex_group_d('survey')
        .insert({
          section_geom: this.knex_group_d.raw('ST_GeomFromGeoJSON(?)', [
            JSON.stringify({
              type: 'MultiLineString',
              coordinates: [
                survey.geometry.map((coord) => [coord.lng, coord.lat]),
              ],
            }),
          ]),
          timestamp: survey.XMLs[0].date,
          survey_id: survey.dynatestId,
          data_source: 'Dynatest',
        })
        .returning('id');

      const insertedId = res[0].id;
      if (debug) {
        console.log('ID given by database: ' + insertedId);
        console.log('Data uploaded to the database: ');
        console.log('timestamp: ' + survey.XMLs[0].date);
        console.log('survey_id: ' + survey.dynatestId);
        console.log('-----------------------------------');
      }
      return insertedId;
    } catch (error) {
      console.error('Error uploading survey data:', error);
      throw error;
    }
  }

  /**
   * Uploads one entry to the image table in the database with the provided parameters as data.
   * @param {string} fk_survey_id - The foreign key corresponding to the survey entry in the survey table.
   * @param {SurveyImage} image - The image data to be uploaded.
   * @param {boolean} debug - A boolean for enabling debug logging, false by default.
   * @author Liu
   */
  async db_insert_image_data_and_move_to_image_store(
    fk_survey_id: string,
    image: SurveyImage,
    debug: boolean,
  ): Promise<void> {
    try {
      const res = await this.knex_group_d('image')
        .insert({
          fk_survey_id,
          type: image.type,
          image_path: '', // empty for now
          distance_survey: image.distance_survey,
          timestamp: image.timestamp,
          fk_way_id: image.fk_way_id,
          distance_way: image.distance_way,
        })
        .returning('id');
      const id: string = res[0].id;
      // create directory if it doesn't exist
      const outputFolder = join(
        process.env.IMAGE_STORE_PATH,
        fk_survey_id,
        image.type,
      );
      if (!existsSync(outputFolder)) {
        mkdirSync(outputFolder, { recursive: true });
      }

      const destinationPath = join(outputFolder, `${id}.jpg`);
      copyFileSync(image.image_path, destinationPath);

      const sourcePath = image.image_path;
      if (image.type !== 'DashCamera') {
        await sharp(sourcePath).rotate(90).toFile(destinationPath);
      } else {
        copyFileSync(sourcePath, destinationPath);
      }
      // update the image_path in the database
      await this.knex_group_d('image')
        .update({ image_path: destinationPath })
        .where({ id });

      if (debug) {
        console.log('Image data uploaded to the database: ');
        console.log('fk_survey_id: ' + fk_survey_id);
        console.log('timestamp: ' + image.timestamp);
        console.log('type: ' + image.type);
        console.log('image_path: ' + image.image_path);
        console.log('distance_survey: ' + image.distance_survey);
        console.log('-----------------------------------');
      }
    } catch (error) {
      console.error('Error uploading image data: ', error);
      throw error;
    }
  }
}
