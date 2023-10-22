import React, { useEffect, useState } from 'react';
import ImageGallery from './ImageGallery';
import MapWrapper from '../Map/MapWrapper';
import ForceMapUpdate from '../Map/ForceMapUpdate';
import { IRoad } from '../../models/path';
import { getRoads } from '../../queries/road';
import Roads from '../Map/Roads';

interface Props {
  triggerUpdate: number;
}
/**
 * The map area op the road details(road inspect) page
 */
const MapArea: React.FC<Props> = ({ triggerUpdate }) => {
  const [roads, setRoads] = useState<IRoad[]>();

  // get the actual roads
  useEffect(() => {
    getRoads(setRoads);
  }, []);

  return (
    <div
      className="map-area"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="map_area" style={{ flex: 1, overflow: 'hidden' }}>
        <MapWrapper>
          <Roads roads={roads} />
          <ForceMapUpdate triggerUpdate={triggerUpdate} />
        </MapWrapper>
      </div>
      <div
        className="imageGallery_container"
        style={{ height: '14vh', overflow: 'hidden' }}
      >
        <ImageGallery /> {/* Use the imageGallery component */}
      </div>
    </div>
  );
};

export default MapArea;
