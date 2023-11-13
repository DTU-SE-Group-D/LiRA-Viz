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
  id?: number;
  fk_survey_id: number;
  distance_survey: number;
  image_path: string;
  type: ImageType;
  fk_way_id: number;
  distance_way: number;
  timestamp: Date;
  image?: HTMLImageElement;
}

export interface SurveyConditions {
  type: string;
  value: number;
  distance_survey: number;
}

export interface Survey {
  id: string;
  geometry: number[][];
  data: SurveyConditions[];
}
