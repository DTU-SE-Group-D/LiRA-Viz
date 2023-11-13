// Data format
export type GraphPoint = {
  x: number;
  y: number;
  lat: number;
  lng: number;
}; // [number, number]

// Events
export interface DotHover {
  label: string;
  point: GraphPoint;
}
