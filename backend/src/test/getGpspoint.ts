/**
 * Get the coordinates of the point at the given distance along the path
 * @param coordinates path from the .rsp file
 * @param givenDistance distance in km
 * @param debug
 * @returns { lat: number; lon: number } the coordinates of the point at the given distance
 *
 * @author Liwei
 */
export default function getGpsPointAtDistance(
  coordinates: { lat: number; lon: number }[],
  givenDistance: number,
  debug: boolean = false,
): { lat: number; lon: number } {
  function calculateDistance(
    coord1: { lat: number; lon: number },
    coord2: { lat: number; lon: number },
  ) {
    const earthRadius = 6371; //Unit: kilometers
    const [lat1, lon1] = [coord1.lat, coord1.lon];
    const [lat2, lon2] = [coord2.lat, coord2.lon];
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
    coordinates[targetSegmentIndex].lon,
  ];
  const [endLat, endLon] = [
    coordinates[targetSegmentIndex + 1].lat,
    coordinates[targetSegmentIndex + 1].lon,
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

  return { lat: targetLatitude, lon: targetLongitude };
}
