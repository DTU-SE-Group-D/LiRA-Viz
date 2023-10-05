import { IRoad } from '../models/path';
import { get } from './fetch';

export const getRoads = (setRoads: (data: IRoad[]) => void) => {
  get('/road', setRoads);
};
