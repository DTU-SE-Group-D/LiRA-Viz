import React from 'react';
import ImageGallery from './ImageGallery';
import MapWrapper from '../Map/MapWrapper';
import ForceMapUpdate from '../Map/Hooks/ForceMapUpdate';
import { IRangeForDashCam, LatLng } from '../../models/models';

interface Props {
  /** The trigger to update the map */
  triggerUpdate: number;
  /** The children to display in the map */
  children?: React.ReactNode;
  /** The center of the map */
  center?: LatLng;
  /** The distance from left to right displayed on surface images */
  rangeDashCamImages?: IRangeForDashCam | null;
}
/**
 * The map area op the road details(road inspect) page
 */
const MapArea: React.FC<Props> = ({
  triggerUpdate,
  children,
  center,
  rangeDashCamImages,
}) => {
  return (
    <div
      className="map-area"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="map_area" style={{ flex: 1, overflow: 'hidden' }}>
        <MapWrapper>
          {children}
          <ForceMapUpdate triggerUpdate={triggerUpdate} position={center} />
        </MapWrapper>
      </div>
      <div
        className="imageGallery_container"
        style={{ height: '95px', overflow: 'hidden' }}
      >
        <ImageGallery rangeDashCamImages={rangeDashCamImages} />{' '}
        {/* Use the imageGallery component */}
      </div>
    </div>
  );
};

export default MapArea;
