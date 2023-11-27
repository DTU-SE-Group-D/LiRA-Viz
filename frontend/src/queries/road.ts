import { IRoad } from '../models/path';
import { get, post } from './fetch';
import { PathWithConditions } from '../models/models';

export const getRoadsPaths = (setRoads: (data: IRoad[]) => void) => {
  get('/roads/paths', setRoads);
};

export const getRoadsData = (
  wayIds: string[],
  callback: (data: PathWithConditions) => void,
) => {
  post('/roads/data', wayIds, callback);
};
