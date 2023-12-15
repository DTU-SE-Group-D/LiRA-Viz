/**
 * The latitude and longitude of a point.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Used in the data plot to show the condition of a road.
 * The way_dist is the distance from the start of the way. It will be the x-axis in the plot.
 * The value is the condition value. It will be the y-axis in the plot.
 */
export interface Condition {
  way_dist: number;
  value: number;
}

/**
 * Type of answer from backend for a survey.
 */
export interface ISurvey {
  id: string;
  geometry: number[][];
  data: SurveyConditions[];
  timestamp: string;
}

/**
 * The data of a survey.
 */
export interface SurveyConditions {
  type: number;
  value: number;
  distance: number;
}

/**
 * The OSM id of a way.
 */
export type OSMWayId = string;

/**
 * The description of a road
 * The way_ids are the ids of the ways of each branch of the way. Can be the two directions or when a road
 * split into two branches.
 *
 * Example:
 *           /---<---\
 * ----------         -----------
 *           \--->---/
 *
 * The list of point for the geometry of each way.
 */
export interface Road {
  way_name: string;
  branches: OSMWayId[][];
  geometries: Record<OSMWayId, LatLng[]>;
}

/**
 * The image types.
 */
export enum ImageType {
  Image3D,
  ImageInt,
  ImageRng,
  Overlay3D,
  OverlayInt,
  OverlayRng,
}

/**
 * The measurement types.
 */
export enum MeasurementType {
  Crack = 0,
  Rutting = 1,
  MacroTexture = 2,
  LaneMarking = 3,
  RumbleStrip = 4,
  Potholes = 5,
  DropOffCurb = 6,
  Joint = 7,
  Raveling = 8,
  Roughness = 9,
  RoadGeometry = 10,
  WaterEntrapment = 11,
  Shoving = 12,
  PickOut = 13,
  Bleeding = 14,
  SealedCrack = 15,
  Manholes = 16,
  Patch = 17,
  Pumping = 18,
  E_norm = 19,
  KPI = 20,
  Mu = 21,
  DI = 22,
  E_whl = 23,
  E_areo = 24,
  E_whl_std = 25,
  E_tire_std = 26,
  E_tire = 27,
  E_ineratia_slope = 28,
  E_inertia_slope_std = 29,
  E_areo_std = 30,
  E_norm_std = 31,
  mu_std = 32,
  IRI = 33,
}

/** An array of surveys, identified by their id and timestamp. */
export type SurveyList = {
  id: string;
  timestamp: string;
}[];
