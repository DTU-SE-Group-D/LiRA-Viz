// TODO ekki@dtu.dk: This should eventually be aligned with and reused from fetch

import { FeatureCollection } from 'geojson';

const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const devURL = process.env.REACT_APP_BACKEND_URL_DEV;
const prodURL = process.env.REACT_APP_BACKEND_URL_PROD;

const getPath = (p: string) => (development ? devURL : prodURL) + p;

export function getConditions(callback: (data: FeatureCollection) => void) {
  fetch(getPath('/conditions')).then((res) =>
    res.json().then((json) => callback(json)),
  );
}
