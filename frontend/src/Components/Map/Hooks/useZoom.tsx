import { useEffect, useState } from 'react';
import { useMapEvents } from 'react-leaflet';

/**
 * Zoom implementation on map events
 *
 * @author LiraVis
 */
const useZoom = () => {
  const [zoom, setZoom] = useState<number>();

  const update = () => setZoom(map.getZoom());

  const map = useMapEvents({
    zoom: update,
  });

  useEffect(update, []);

  return zoom;
};

export default useZoom;
