import { useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { FC } from 'react';

interface Props {
  /** The callback function */
  onClick: (latLng: LatLng) => void;
}

/**
 * A component that detects a click on the map and calls the callback function
 *
 * @author Kerbourc'h
 */
const DetectMapClick: FC<Props> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng);
    },
  });
  return null;
};

export default DetectMapClick;
