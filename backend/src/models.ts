export interface LatLng {
  lat: number;
  lng: number;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface PointData extends LatLng {
  properties?: PointProperties;
  value?: number;
  metadata?: any;
}

export type Path = PointData[];

export enum RendererName {
  circle = 'circle',
  circles = 'circles',
  rectangles = 'rectangles',
  line = 'line',
  hotline = 'hotline',
  hotpoints = 'hotpoints',
}

export interface PaletteColor {
  offset: number;
  color: string;
  stopValue?: number;
}
export type Palette = PaletteColor[];

// Rendering properties of a single point belonging to a Path
// If an attribute is defined for a point, it overwrites the properties for the path
export interface PointProperties {
  // Color of a point or the entire path
  color?: string;
  // Radius or largeness of a point or the entire path
  width?: number;
  // Weight (boldness) of a point or the entire path
  weight?: number;
  // Opacity (between 0 and 1) of a point or the entire path
  opacity?: number;
}

// Rendering properties of an entire Path
export interface PathProperties extends PointProperties {
  // The name of the renderer to use - see ./renderers for the list of names
  rendererName: RendererName;
  // Weight can be multiplied by the dilatationFactor
  // 	< 1 -> shrinks ; > 1 -> grows ; == 1 -> stays the same
  dilatationFactor?: number;
  // Palette used for coloring the path and graph
  palette?: Palette;
}

export interface Measurement extends PathProperties {
  // measurement as it is in the database
  dbName: string;
  // human friendly name of the measurement
  name: string;
  // Needs to be specified if the points have a value attached to them
  hasValue?: boolean;
}

export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export interface LatLngDist extends LatLng {
  way_dist: number;
}

export interface LatLonDist extends LatLon {
  way_dist: number;
}

export interface ValueLatLng extends LatLng {
  value: number;
}

export interface Condition {
  way_dist: number;
  value: number;
}

export type WayId = string;

export interface WaysConditions {
  way_lengths: number[];
  way_ids: WayId[];
  geometry: LatLngDist[][];
  conditions: Condition[][];
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// geometry: LatLng[][]
// wayIds: WayId[]
// conditions:

export interface BoundedCondition {
  conditions: { [condition_type: string]: Condition[] };
  length: number;
  coordinates: LatLonDist[];
}

export interface Road {
  // the name of the road
  way_name: string;
  // the ids of the ways of each branch of the way. Can be the two directions or when a road
  // split into two branches
  // Example:
  //            /---<---\
  // -----------         -----------
  //            \--->---/
  way_ids: WayId[][];
  // the geometry of each way
  geometries: Record<WayId, LatLon[]>;
}
