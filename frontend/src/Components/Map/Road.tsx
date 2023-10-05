import { IRoad, LatLon } from '../../models/path';
import { LatLngLiteral } from 'leaflet';
import { Polyline } from 'react-leaflet';
import React, { ReactElement, useEffect } from 'react';

interface Props {
  /** The roads */
  road: IRoad;
  /** The event handlers, when a road is selected */
  onClick: (position: LatLon) => void;
}

/**
 * A components that renders a road on the map
 */
const Road: React.FC<Props> = ({ road, onClick }) => {
  const [lines, setLines] = React.useState<ReactElement[]>([]);
  const [opacity, setOpacity] = React.useState<number>(0.2);

  useEffect(() => {
    if (road === undefined) return;
    const lines: ReactElement[] = [];
    const data: LatLngLiteral[][] = [];

    let idx = 0;
    // For each segment of the road create a array of the GPS points and a Polyline to show
    road.way_ids.forEach((way_ids: string[]) => {
      data[idx] = [];
      way_ids.forEach((way_id, way_idx) => {
        if (way_idx === 0) {
          // add all the points for the first
          data[idx].push(
            ...road.geometries[way_id].map((p: LatLon) => ({
              lat: p.lat,
              lng: p.lon,
            })),
          );
        } else if (way_idx === way_ids.length - 1) {
          // add all the points except the first for the last ways
          data[idx].push(
            ...road.geometries[way_id].slice(1).map((p: LatLon) => ({
              lat: p.lat,
              lng: p.lon,
            })),
          );
        } else {
          // add all the points except the first and last point for the middle ways
          data[idx].push(
            ...road.geometries[way_id].slice(1, -1).map((p: LatLon) => ({
              lat: p.lat,
              lng: p.lon,
            })),
          );
        }
      });
      idx++;
    });

    lines.push(
      <Polyline
        key={road.way_ids.join('-')} // use by React JS to identify the element
        pathOptions={{ weight: 5, opacity: opacity }}
        positions={data}
        eventHandlers={{
          click: ({ latlng }) => {
            if (onClick) onClick({ lat: latlng.lat, lon: latlng.lng });
          },
          mouseover: () => {
            setOpacity(0.8);
          },
          mouseout: () => {
            setOpacity(0.2);
          },
        }}
      />,
    );

    setLines(lines);
  }, [road, opacity]);

  return <>{lines.map((line) => line)}</>;
};

export default Road;
