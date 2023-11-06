import React from 'react';
import { IRoad } from '../../models/path';
import Road from './Road';
import { LatLng } from '../../models/models';

interface Props {
  /** The roads */
  roads?: IRoad[];
  /** The selected road index */
  selectedRoadIdx?: number;
  /** The event handlers, when a road is selected */
  onSelectedRoad?: (index: number, road: IRoad, position: LatLng) => void;
}

/**
 * A components that renders the roads on the map
 *
 * @author Kerbourc'h
 */
const Roads: React.FC<Props> = ({ roads, selectedRoadIdx, onSelectedRoad }) => {
  return (
    <>
      {selectedRoadIdx === undefined || selectedRoadIdx === -1 || !roads ? (
        roads?.map((road, index) => (
          <Road
            key={road.way_name}
            road={road}
            onClick={(position) => {
              if (onSelectedRoad) {
                onSelectedRoad(index, road, position);
              }
            }}
          />
        ))
      ) : (
        <Road
          key={roads[selectedRoadIdx].way_name}
          road={roads[selectedRoadIdx]}
          onClick={(position) => {
            if (onSelectedRoad) {
              onSelectedRoad(selectedRoadIdx, roads[selectedRoadIdx], position);
            }
          }}
        />
      )}
    </>
  );
};

export default Roads;
