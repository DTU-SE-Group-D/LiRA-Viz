export interface LatLng {
  lat: number;
  lng: number;
}

export enum ImageType {
  Image3D = 'Image3D',
  ImageInt = 'ImageInt',
  ImageRng = 'ImageRng',
  Overlay3D = 'Overlay3D',
  OverlayInt = 'OverlayInt',
  OverlayRng = 'OverlayRng',
}

export interface IImage {
  id?: string;
  fk_survey_id: number;
  distance_survey: number;
  image_path: string;
  type: ImageType;
  fk_way_id: number;
  distance_way: number;
  timestamp: Date;
  image?: HTMLImageElement;
}

export interface IImageValuesForPixels {
  id?: string;
  distanceSurvey: number;
  pixelLeft: number;
  pixelRight: number;
  pixelWidth: number;
  firstVisiblePixelLeft: number;
  lastVisiblePixelRight: number;
  absoluteIndex: number;
}

export interface Conditions {
  type: string;
  value: number;
  distance: number;
}

export interface IRangeForDashCam {
  minRange: number;
  maxRange: number;
  maxRangeSurvey: number;
}

export interface Path {
  geometry: number[][];
}

export interface PathWithConditions extends Path {
  data: Conditions[];
}

export interface Survey extends PathWithConditions {
  id: string;
}

export interface SurveyListItem extends Path {
  id: string;
  timestamp: string;
  dynatest_id: number;
}
