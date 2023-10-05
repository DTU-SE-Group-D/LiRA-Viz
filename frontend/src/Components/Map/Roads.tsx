import React from 'react';
import { IRoad, LatLon } from '../../models/path';
import Road from './Road';

interface Props {
  /** The roads */
  roads?: IRoad[];
  /** The event handlers, when a road is selected */
  onSelectedRoad?: (road: IRoad, position: LatLon) => void;
}

/**
 * A components that renders the roads on the map
 */
const Roads: React.FC<Props> = ({ roads, onSelectedRoad }) => {
  return (
    <>
      {roads?.map((road) => (
        <Road
          key={road.way_name}
          road={road}
          onClick={(position) => {
            console.log(road, position);
            if (onSelectedRoad) {
              onSelectedRoad(road, position);
            }
          }}
        />
      ))}
    </>
  );
};

export default Roads;
