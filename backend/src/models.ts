/**
 * The latitude and longitude of a point.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * A OSM Node
 */
export interface OSMNode extends LatLng {
  id: number;
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
export interface Survey {
  id: string;
  geometry: number[][];
  data: SurveyConditions[];
}

/**
 * The data of a survey.
 */
export interface SurveyConditions {
  type: number;
  value: number;
  distance_survey: number;
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
}
