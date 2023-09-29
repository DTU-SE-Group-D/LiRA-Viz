import React from 'react';
import ImageGallery from './ImageGallery';
import MapWrapper from '../Map/MapWrapper';

/**
 * The map area op the road details(road inspect) page
 */
const MapArea: React.FC = () => {
  return (
    <div className="map-area">
      <div className="map_area" style={{ height: '100%' }}>
        <MapWrapper></MapWrapper>
      </div>
      <div className="imageGallery_container">
        <ImageGallery /> {/* Use the imageGallery component */}
      </div>
    </div>
  );
};

export default MapArea;
