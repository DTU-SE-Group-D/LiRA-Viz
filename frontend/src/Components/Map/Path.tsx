import L, { LatLngLiteral } from 'leaflet';
import { Polyline } from 'react-leaflet';
import React from 'react';
import { LatLng } from '../../models/models';

interface Props {
  /** The paths. It can be one or multiple line(s) */
  path: LatLng[] | LatLng[][];
  /** The event handlers, when a road is selected */
  onClick: (position: LatLng) => void;
}

/**
 * A components that renders a path on the map
 *
 * @author Kerbourc'h
 */
const Path: React.FC<Props> = ({ path, onClick }) => {
  const [opacity, setOpacity] = React.useState<number>(0.4);

  return (
    <Polyline
      pathOptions={{ weight: 5, opacity: opacity }}
      positions={
        path[0] instanceof Array
          ? (path as LatLngLiteral[][])
          : [path as LatLngLiteral[]]
      }
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e); // used to prevent the map to detect the click
          if (onClick) onClick(e.latlng);
        },
        mouseover: () => {
          setOpacity(0.9);
        },
        mouseout: () => {
          setOpacity(0.4);
        },
      }}
    />
  );
};

export default Path;
