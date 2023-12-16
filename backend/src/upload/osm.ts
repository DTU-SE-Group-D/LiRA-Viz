/**
 * This files contains functions to query the OSM API.
 */

import { IWay } from '../tables';
import { LatLng } from '../models';

/**
 * The timeout of the OSM API in seconds.
 */
const OSM_API_TIMEOUT = 900;

/**
 * Queries the OSM API with the given query and calls the callback function with the result.
 * @param query the query to send to the OSM API
 * @param callback the callback function to call with the result
 *
 * @author Kerbourc'h
 */
async function queryOSM<T>(
  query: string,
  callback: (data: any) => T,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    (OSM_API_TIMEOUT + 10) * 1000, // +10 seconds to be sure that the OSM API timeout (and the fetch request)
  );
  const result = await fetch(process.env.OSM_ENDPOINT, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    signal: controller.signal,
  })
    .then(async (data) => {
      if (data.ok) {
        const json = await data.json();
        // If the OSM API responded with a remark, log it.
        if (json.remark) {
          if (json.remark.includes('error')) {
            console.warn('OSM API responded with an error: ', json.remark);
            return null;
          } else {
            console.debug('OSM API responded with a remark: ', json.remark);
          }
        }
        return callback(json);
      }
      // If the OSM API responded with an error, log it and return null.
      console.warn('OSM API responded with an error ', data.status);
      return null;
    })
    .catch((err) => {
      console.error('Error while querying the OSM API', err);
      return null;
    });

  clearTimeout(timeoutId);

  return result;
}

/**
 * Converts degrees to radians.
 * @param degrees the degrees to convert
 *
 * @author Kerbourc'h
 */
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the distance between two GPS coordinates.
 * @param start the starting position
 * @param end the ending position
 * @return the distance between the two GPS coordinates in meters
 *
 * @author Kerbourc'h
 */
function distanceBetweenNodes(start: LatLng, end: LatLng) {
  let lat1 = start.lat;
  const lon1 = start.lng;
  let lat2 = end.lat;
  const lon2 = end.lng;

  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 1000;
}

/**
 * Gets the ways in a Road using one way id of the road.
 * @param OSMWayId the id of a way in the road
 * @param callback the callback function to call with the result
 *
 * @author Kerbourc'h
 */
export async function getOSMWaysInARoad<T>(
  OSMWayId: string,
  callback: (data: IWay[]) => T,
): Promise<T> {
  const query = `[out:json][timeout:${OSM_API_TIMEOUT}];
  way(${OSMWayId});
  foreach((._;complete{way[highway][name](around:100)(if:t["name"]==u(t["name"]));};);
         way._[highway~"^(motorway|trunk|pedestrian|primary|secondary|tertiary|unclassified|service|residential|living_street)(_link)?$"];
             
  (._;.result;)->.result;);.result;
  out geom;`;
  return await queryOSM(query, (data) => {
    let ways: IWay[] = [];
    for (const element of data.elements) {
      if (element.type === 'way') {
        let length = 0;
        for (let i = 0; i < element.nodes.length - 1; i++) {
          const start: LatLng = {
            lat: element.geometry[i].lat,
            lng: element.geometry[i].lon,
          };
          const end: LatLng = {
            lat: element.geometry[i + 1].lat,
            lng: element.geometry[i + 1].lon,
          };
          length += distanceBetweenNodes(start, end);
        }

        ways.push({
          osm_id: element.id,
          way_name: element.tags.name,
          section_geom: {
            type: 'LineString',
            coordinates: element.geometry.map((LatLon: any) => {
              return [LatLon.lon, LatLon.lat];
            }),
          },
          node_start: element.nodes[0],
          node_end: element.nodes[element.nodes.length - 1],
          length: length,
          isoneway: false,
        });
      }
    }

    return callback(ways);
  });
}
