// Represents a point containing (lat, lng) coordinates,
import { LatLng } from './models';
import { MeasProperties, PathProperties } from './properties';
import { PathEventHandler } from './renderers';

// rendering properties, and optionally, a value and some metadata (like timestamp)
export interface PointData extends LatLng {
  value?: number;
  metadata?: any;
}

// A Path is a collection of points
export type Path = PointData[];

export type Metadata = { [key: string]: any };

export interface Bounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

// measurement name -> trip task id -> bounded path (used in Rides)
export type MeasMetaPath = { [key: string]: { [key: number]: BoundedPath } };

// Props passed to the Path and EventPath components
export interface PathProps {
  path: Path;
  bounds?: Bounds;
  properties: PathProperties;
  metadata?: Metadata;
  onClick?: PathEventHandler;
}

// used for queries
export interface BoundedPath {
  path: Path;
  bounds?: Bounds;
}

// This interface is used as a type for server's response
// for instance, JSON files follow this format
export interface JSONProps extends BoundedPath {
  properties: MeasProperties;
  metadata?: Metadata;
}

export interface Node {
  lat: number;
  lng: number;
  way_dist: number;
}

export type Ways = { [key: string]: Node[] };

export interface ValueLatLng extends LatLng {
  value: number;
}

export interface Condition {
  type: string;
  way_dist: number;
  value: number;
}

export interface SurveyConditions {
  type: string;
  value: number;
  distance_survey: number;
}

export type WayId = string;

export interface WaysConditions {
  way_lengths: number[];
  way_ids: WayId[];
  geometry: Node[][];
  conditions: Condition[][];
}

// A road is a collection of road segments (which are of collection ways that are connected to each other).
export interface IRoad {
  // the name of the road
  way_name: string;
  // the ids of the ways of each branch of the way. Can be the two directions or when a road
  // split into two branches
  // Example:
  //            /---<---\
  // -----------         -----------
  //            \--->---/
  branches: WayId[][];
  // the geometry of each way
  geometries: Record<WayId, LatLng[]>;
}

// A road segment is a collection of ways that are connected to each other.
export interface IRoadSegment {
  // ways that are connected to each other
  way_ids: WayId[];
  // the geometry of each way
  geometries: Record<WayId, LatLng[]>;
}
