import { MapBounds } from '../models/map';
import { ConditionKPIDI, WaysConditions } from '../models/path';
import { asyncPost, get, post } from './fetch';
import { FeatureCollection } from 'geojson';

export const getWaysConditions = (
  type: string,
  zoom: number,
  setWays: (data: WaysConditions) => void,
) => {
  post('/conditions/ways', { type, zoom }, setWays);
};

export const getConditionsWay = (
  dbId: string,
  setConditions: (data: ConditionKPIDI[]) => void,
) => {
  post('/conditions/way', { dbId }, setConditions);
};

export const getBoundedWaysConditions = async (
  bounds: MapBounds,
  type: string,
  zoom: number,
) => {
  console.log(bounds);
  return await asyncPost<WaysConditions>('/conditions/bounded/ways', {
    ...bounds,
    type,
    zoom,
  });
};

export const getAllConditions = (
  callback: (data: FeatureCollection) => void,
) => {
  get('/conditions', callback);
};
