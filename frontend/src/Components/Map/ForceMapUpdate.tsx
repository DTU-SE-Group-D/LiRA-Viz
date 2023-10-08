import { LatLng } from '../../models/models';
import { useMap } from 'react-leaflet';
import React, { useEffect } from 'react';

interface Props {
  /** A modification of this value is used to trigger an update of the map */
  triggerUpdate: number;
  /** The coordinates of the map center*/
  position?: LatLng;
}

/**
 * This component is used to force an update of the map. It is used in conjunction with the useMap hook.
 */
const ForceMapUpdate: React.FC<Props> = ({ triggerUpdate, position }) => {
  const map = useMap();

  useEffect(() => {
    console.log('hello');
    map.invalidateSize();
  }, [triggerUpdate]);

  useEffect(() => {
    if (position) {
      map.flyTo(position);
    }
  }, [position]);

  return null;
};

export default ForceMapUpdate;
