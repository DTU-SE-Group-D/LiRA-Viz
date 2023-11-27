import { IRoad } from '../models/path';
import { get } from './fetch';

export const getRoadsPaths = (setRoads: (data: IRoad[]) => void) => {
  get('/roads/paths', setRoads);
};
