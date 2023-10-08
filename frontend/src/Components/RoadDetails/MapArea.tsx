import React from 'react';
import ImageGallery from './ImageGallery';
import MapWrapper from '../Map/MapWrapper';
import ForceMapUpdate from '../Map/ForceMapUpdate';

interface Props {
  triggerUpdate: number;
}
/**
 * The map area op the road details(road inspect) page
 */
const MapArea: React.FC<Props> = ({ triggerUpdate }) => {
  return (
    <div className="map-area">
      <div className="map_area" style={{ height: '100%' }}>
        <MapWrapper>
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
