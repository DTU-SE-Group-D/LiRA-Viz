import { IRoad } from '../models/path';
import { get, post } from './fetch';
import { PathWithConditions } from '../models/models';

/**
 * @param setRoads the function called back with the roads paths
 *
 * @author Kerbourc'h
 */
export const getRoadsPaths = (setRoads: (data: IRoad[]) => void) => {
  get('/roads/paths', setRoads);
};

/**
 * @param wayIds the way ids used to filter the data
 * @param callback the function called back when the request is responded
 *
 * @author Kerbourc'h
 */
export const getRoadsData = (
  wayIds: string[],
  callback: (data: PathWithConditions) => void,
) => {
  post('/roads/data', wayIds, callback);
};
