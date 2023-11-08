import React from 'react';
import { IRoad } from '../../models/path';
import Road from './Road';
import { LatLng } from '../../models/models';
import { useNavigate } from 'react-router-dom';

interface Props {
  /** The roads */
  roads?: IRoad[];
  /** The event handlers, when a road is selected */
  onSelectedRoad?: (road: IRoad, position: LatLng) => void;
}

/**
 * A components that renders the roads on the map
 */
const Roads: React.FC<Props> = ({ roads, onSelectedRoad }) => {
  const navigate = useNavigate();

  return (
    <>
      {roads?.map((road) => (
        <Road
          key={road.way_name}
          road={road}
          onClick={(position) => {
            console.log(road, position);
            // TODO: remove when possible to select a road
            navigate('/inspect');

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
