import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import {
  SurveyData,
  SurveyImage,
  SurveyRoadParameters,
  SurveyStructure,
} from './upload';
import { join } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

import * as process from 'process';
import * as sharp from 'sharp';
import { OSMWayId } from '../models';
import { IWay, Way } from '../tables';
import { getOSMWaysInARoad } from './osm';
import {
  distanceFromWayBeginningToShapePoint,
  Edge,
  getGpsPointAtDistance,
  valhalla,
} from './valhalla';

@Injectable()
export class UploadService {
  constructor(
    @InjectConnection('group-d') private readonly knex_group_d: Knex,
  ) {}

  /**
   * Uploads one entry to the measurement table with the given parameters as data. Is meant for dynatest data.
   * @param {string} fk_survey_id the automatically generated uuid from the database for the corresponding survey entry in the survey table.
   * @param {SurveyRoadParameters} data the data to be uploaded to the database.
   * @param {boolean} debug debug boolean for printing relevant information, and is false by default. It is highly recommended to set the debug boolean to false.
   * @author Vejlgaard, Liu
   */
  async db_insert_measurement_data(
    fk_survey_id: string,
    data: SurveyRoadParameters,
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
        await sharp(sourcePath).rotate(-90).toFile(destinationPath);
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

  /**
   * Insert a way in the database.
   * @param way the way to insert
   * @returns the inserted way (in an array)
   *
   * @author Kerbourc'h
   */
  async insertWay(way: IWay) {
    const { section_geom, ...rest } = way;

    return Way(this.knex_group_d)
      .insert({
        ...rest,
        section_geom: this.knex_group_d.raw('ST_GeomFromGeoJSON(?)', [
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
        this.knex_group_d.raw(
          'ST_AsGeoJSON(section_geom)::json as section_geom',
        ),
        'isoneway',
      ]);
  }

  /**
   * Get or create the ways corresponding to the OSMWayIds.
   *
   * You should definitely use this function instead of getOrCreateWay if you have multiple ways that
   * are likely on the same road.
   *
   * This executes the queries sequentially to avoid useless queries to OSM
   * and the database. This is especially useful when the ways are in the same road.
   *
   * @param wayIds
   *
   * @author Kerbourc'h
   */
  async getOrCreateWays(wayIds: OSMWayId[]): Promise<IWay[]> {
    let tasks: any = wayIds.map((id, index) =>
      index === 0 ? this.getOrCreateWay(id).then((value: IWay) => [value]) : id,
    );

    return await tasks.reduce(async (cur: Promise<IWay[]>, next: string) => {
      return cur.then(async (value: IWay[]) => [
        ...value,
        await this.getOrCreateWay(next),
      ]);
    });
  }

  /**
   * Will get the Way corresponding to the OSMWayId either from the database if
   * available or from OSM and insert the whole road containing it in the database.
   *
   * @param OSMWayId the osm id of a way in the road
   *
   * @author Kerbourc'h
   */
  async getOrCreateWay(OSMWayId: OSMWayId): Promise<IWay> | null {
    const way = await Way(this.knex_group_d)
      .select(
        'id',
        'way_name',
        'osm_id',
        'node_start',
        'node_end',
        'length',
        this.knex_group_d.raw(
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
   * Do the map matching of the data using valhalla.
   * The result will directly be stored in the data array.
   *
   * @author Kerbourc'h
   */
  async mapMatch(survey: SurveyStructure, data: SurveyData[]) {
    let geometry = survey.geometry;

    // To have a good result for valhalla, first the point at the
    // same distance from the beginning of the survey are removed
    // the following arrays will allow to find back the corresponding data
    let dataToPositionIndex: number[] = [];
    let distances: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const exist = distances.indexOf(data[i].distance_survey);

      if (exist === -1) {
        distances.push(data[i].distance_survey);
        dataToPositionIndex.push(distances.length - 1);
      } else {
        dataToPositionIndex.push(exist);
      }
    }

    // find the gps coordinates of the distances along the survey
    let positions = distances.map((d) =>
      getGpsPointAtDistance(geometry, d / 1000),
    );

    // use valhalla to map match that data (by construction matched_points.length === positions.length)
    const matched = await valhalla(positions);
    if (!matched) {
      return false;
    }

    // get or create the ways (also inserting the road if needed) using osm
    const ways = await this.getOrCreateWays(
      matched.edges.map((m) => String(m.way_id)),
    );

    // for each edge, pair it with the corresponding way
    // and determine the direction of the edge along the way and
    // the distance from the beginning of the way to the beginning of the edge
    const edges: Edge[] = matched.edges.map((e, idx) => {
      // calculate the distance from the beginning of the way to the beginning of the edge
      const distance_way_start_edge_start =
        distanceFromWayBeginningToShapePoint(
          e.begin_shape,
          ways[idx].section_geom.coordinates.map((c) => ({
            lat: c[1],
            lng: c[0],
          })),
        );

      // calculate the distance from the beginning of the way to the end of the edge
      const distance_way_start_edge_end = distanceFromWayBeginningToShapePoint(
        e.end_shape,
        ways[idx].section_geom.coordinates.map((c) => ({
          lat: c[1],
          lng: c[0],
        })),
      );

      return {
        beginning_from_way_start: distance_way_start_edge_start,
        way: ways[idx],
        // apply a minus if the edge is not in the same direction as the way
        length:
          distance_way_start_edge_start < distance_way_start_edge_end
            ? e.length
            : -e.length,
      };
    });

    for (let i = 0; i < data.length; i++) {
      // find the corresponding matched data using dataToPositionIndex
      const matched_data = matched.matched_points[dataToPositionIndex[i]];

      // find corresponding edge
      const edge = edges[matched_data.edge_index];

      // edit data
      data[i].fk_way_id = edge.way.id;
      data[i].distance_way =
        edge.beginning_from_way_start +
        edge.length * matched_data.distance_ratio_along_edge;
      data[i].position = matched_data.coordinates;
    }

    return true;
  }
}
