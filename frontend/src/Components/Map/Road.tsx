import { IRoad } from '../../models/path';
import { LatLng, LatLngLiteral } from 'leaflet';
import { Polyline } from 'react-leaflet';
import React, { ReactElement, useEffect } from 'react';

interface Props {
  /** The roads */
  road: IRoad;
  /** The event handlers, when a road is selected */
  onClick: (position: LatLng) => void;
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
    const data: LatLngLiteral[][] = Object.values(road.geometries);

    lines.push(
      <Polyline
        key={road.branches.join('-')} // use by React JS to identify the element
        pathOptions={{ weight: 5, opacity: opacity }}
        positions={data}
        eventHandlers={{
          click: ({ latlng }) => {
            if (onClick) onClick(latlng);
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
