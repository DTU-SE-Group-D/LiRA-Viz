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
    <div className="map-area">
      <div className="map_area" style={{ height: '100%' }}>
        <MapWrapper>
          <Roads roads={roads} />
          <ForceMapUpdate triggerUpdate={triggerUpdate} />
        </MapWrapper>
      </div>
      <div className="imageGallery_container">
        <ImageGallery /> {/* Use the imageGallery component */}
      </div>
    </div>
  );
};

export default MapArea;
