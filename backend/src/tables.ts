import { Knex } from 'knex';
import { Geometry, LineString } from 'geojson';
import { ImageType, MeasurementType } from './models';

//
// ====================================== Tables of LiRAMap (LiraVis) database ======================================
//

export interface IConditionCoverage {
  id: string;
  fk_way_id: string;
  type: string;
  value: number;
  section_geom: Geometry;
  compute_time: Date;
}

export const Conditions = (k: Knex) =>
  k.from<IConditionCoverage>('condition_coverages as cond1');

export const CoverageValues = (k: Knex) =>
  k.from<IConditionCoverage>('coverage_values');

interface IWays {
  OSM_Id: number[];
  way_name: string;
  section_geom: any;
  node_start: number;
  node_end: number;
}

export const Ways = (k: Knex) => k.from<IWays>('ways');

//
// ====================================== Tables of GroupD database ======================================
//

export interface IImage {
  id?: number;
  fk_survey_id: number;
  distance_survey: number;
  image_path: string;
  type: ImageType;
  fk_way_id: number;
  distance_way: number;
  timestamp: Date;
}

export const Image = (k: Knex) => k.from<IImage>('image');

export interface IMeasurement {
  id?: number;
  fk_survey_id: number;
  distance_survey: number;
  type_index: MeasurementType;
  value: number;
  fk_way_id: number;
  distance_way: number;
  timestamp: Date;
}

export const Measurement = (k: Knex) => k.from<IMeasurement>('measurement');

export interface ISurvey {
  id?: number;
  section_geom: Geometry;
  timestamp: Date;
  /** The Dynatest id of the surveys or null */
  survey_id: number;
}

export const Survey = (k: Knex) => k.from<ISurvey>('survey');

export interface IWay<T = LineString> {
  id?: number;
  way_name: string;
  osm_id: string; // This is because bigint is not supported by knex
  node_start: string; // See https://stackoverflow.com/questions/39168501/pg-promise-returns-integers-as-strings/39176670#39176670
  node_end: string; // Same here
  length: number;
  section_geom: T; // T should either be LineString or LatLng[]
  isoneway: boolean;
}

export const Way = (k: Knex) => k.from<IWay<LineString>>('way');
