import { LatLng } from '../../../models/models';
import { useMap } from 'react-leaflet';
import React, { useEffect } from 'react';

interface Props {
  /** A modification of this value is used to trigger an update of the map */
  triggerUpdate?: number;
  /** The coordinates of the map center*/
  position?: LatLng;
  /** Zoom level for the map */
  zoomLevel?: number;
}

/**
 * This component is used to force an update of the map. It is used in conjunction with the useMap hook.
 *
 * @author Kerbourc'h, Chen
 */
const ForceMapUpdate: React.FC<Props> = ({
  triggerUpdate,
  position,
  zoomLevel = 13, // Default value set here if zoomLevel is not provided
}) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [triggerUpdate]);

  // TODO: not working when moving too little
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoomLevel);
    }
  }, [position, zoomLevel]);

  return null;
};

export default ForceMapUpdate;
