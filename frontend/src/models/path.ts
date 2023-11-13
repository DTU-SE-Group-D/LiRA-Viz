// Represents a point containing (lat, lng) coordinates,
import { LatLng } from './models';

// rendering properties, and optionally, a value and some metadata (like timestamp)
export interface PointData extends LatLng {
  value?: number;
  metadata?: any;
}

// A Path is a collection of points
export type Path = PointData[];

export interface Bounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface Node {
  lat: number;
  lng: number;
  way_dist: number;
}

export interface Condition {
  type: string;
  way_dist: number;
  value: number;
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
