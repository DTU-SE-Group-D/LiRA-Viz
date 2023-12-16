import { LatLng } from '../models';
import * as polyline from 'polyline';
import { IWay } from '../tables';

/**
 * Calculate the distance between two points on the earth's surface.
 * @param coord1 the first point
 * @param coord2 the second point
 *
 * @author Liu
 */
function calculateDistance(coord1: LatLng, coord2: LatLng) {
  const earthRadius = 6371; //Unit: kilometers
  const [lat1, lon1] = [coord1.lat, coord1.lng];
  const [lat2, lon2] = [coord2.lat, coord2.lng];
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); //Use the Haversine formula
  return earthRadius * c; //// Returns the distance between two points in kilometers.
}

/**
 * Get the coordinates of the point at the given distance along the path
 * @param coordinates path from the .rsp file
 * @param givenDistance distance in km
 * @param debug
 * @returns { lat: number; lon: number } the coordinates of the point at the given distance
 *
 * @author Liu
 */
export function getGpsPointAtDistance(
  coordinates: LatLng[],
  givenDistance: number,
  debug: boolean = false,
): LatLng {
  let remainingDistance = givenDistance;
  let targetSegmentIndex = -1;

  if (debug)
    console.debug(
      `before for, remainingDistance: ${remainingDistance}, targetSegmentIndex: ${targetSegmentIndex}`,
    );

  for (let i = 0; i < coordinates.length - 1; i++) {
    const segmentDistance = calculateDistance(
      coordinates[i],
      coordinates[i + 1],
    );
    if (remainingDistance > segmentDistance) {
      remainingDistance -= segmentDistance;
    } else {
      targetSegmentIndex = i;
      break;
    }
  }

  if (targetSegmentIndex === -1) {
    if (debug)
      console.warn(
        'The given distance is longer than the path length. The last point of the path is returned.',
      );
    return coordinates[coordinates.length - 1];
  }

  if (debug)
    console.debug(
      `remainingDistance: ${remainingDistance}, targetSegmentIndex: ${targetSegmentIndex}`,
    );

  const [startLat, startLon] = [
    coordinates[targetSegmentIndex].lat,
    coordinates[targetSegmentIndex].lng,
  ];
  const [endLat, endLon] = [
    coordinates[targetSegmentIndex + 1].lat,
    coordinates[targetSegmentIndex + 1].lng,
  ];

  if (debug) console.debug(startLat, startLon, endLat, endLon);

  const ratio =
    remainingDistance /
    calculateDistance(
      coordinates[targetSegmentIndex],
      coordinates[targetSegmentIndex + 1],
    ); // Calculate the proportion of the target point's position in the current segment.
  const targetLatitude = startLat + ratio * (endLat - startLat);
  const targetLongitude = startLon + ratio * (endLon - startLon);

  return { lat: targetLatitude, lng: targetLongitude };
}

export interface RawEdge {
  way_id: number;
  begin_shape: LatLng;
  end_shape: LatLng;
  length: number;
}
export interface Edge {
  beginning_from_way_start: number;
  way: IWay;
  length: number;
}
export interface MatchedPoint {
  edge_index: number;
  distance_ratio_along_edge: number;
  coordinates: LatLng;
}

/**
 * The path of data that needs to be map matched.
 * @param data the path of data.
 * @result for each point of the data array, the way_id, the distance along the way and the length of the way is returned.
 *
 * @author Kerbourc'h
 */
export async function valhalla(data: LatLng[]): Promise<{
  edges: RawEdge[];
  matched_points: MatchedPoint[];
}> {
  const request = {
    shape: data.map((v) => ({ lat: v.lat, lon: v.lng })),
    costing: 'auto',
    shape_match: 'map_snap',
    directions_options: {
      units: 'km',
    },
    filters: {
      attributes: [
        'edge.way_id',
        'edge.length',
        'edge.begin_shape_index',
        'edge.end_shape_index',
        'matched.point',
        'matched.type',
        'matched.edge_index',
        'matched.distance_along_edge',
        'shape',
      ],
      action: 'include',
    },
  };

  return fetch(process.env.VALHALLA_ENDPOINT + '/trace_attributes', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      const json = await res.json();
      if (json.error) return null;

      let lastValidEdgeIndex = 0;

      const shape: LatLng[] = polyline
        .decode(json.shape, 6)
        .map((c: number[]) => ({ lat: c[0], lng: c[1] }));

      const edges: RawEdge[] = json.edges.map(
        (e: {
          way_id: number;
          begin_shape_index: number;
          end_shape_index: number;
          length: number;
        }) => ({
          way_id: e.way_id,
          begin_shape: shape[e.begin_shape_index],
          end_shape: shape[e.end_shape_index],
          length: e.length * 1000,
        }),
      );

      const matched_data: MatchedPoint[] = json.matched_points.map(
        (p: {
          edge_index: number;
          distance_along_edge: number;
          lat: number;
          lon: number;
        }) => {
          // homemade fix for https://github.com/valhalla/valhalla/issues/3699
          if (p.edge_index != 18446744073709551615)
            lastValidEdgeIndex = p.edge_index;

          return {
            edge_index: lastValidEdgeIndex,
            distance_ratio_along_edge: p.distance_along_edge,
            coordinates: { lat: p.lat, lng: p.lon },
          };
        },
      );

      return {
        edges: edges,
        matched_points: matched_data,
      };
    })
    .catch((err) => {
      console.error("Error while fetching Valhalla's API: ", err);
      return null;
    });
}

/**
 * Get the distance from the beginning of the way's geometry to the given point.
 * This is only usefully for point of the way's geometry (hence coming from
 * valhalla).
 *
 * @author Kerbourc'h
 */
export function distanceFromWayBeginningToShapePoint(
  shape_point: LatLng,
  geometry: LatLng[],
) {
  // distance until geometry[i]
  let distance = 0;

  for (let i = 0; i < geometry.length - 1; i++) {
    if (
      calculateDistance(geometry[i], shape_point) <
      calculateDistance(geometry[i + 1], shape_point)
    ) {
      return (distance + calculateDistance(geometry[i], shape_point)) * 1000;
    }
    const segmentDistance = calculateDistance(geometry[i], geometry[i + 1]);
    distance += segmentDistance;
  }

  return distance * 1000;
}
