import {
  MapContainer,
  ScaleControl,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';

import InfoButton from '../Conditions/InfoButton';
import '../../css/map.css';
import { MAP_OPTIONS } from './constants';
import React, { FC } from 'react';
import Selector from './Inputs/Selector';

/**
 *  properties
 */
interface IMapWrapper {
  /** The children to add on the map */
  children?: React.ReactNode;
}

/**
 * MapWrapper is the component to show a map.
 */
const MapWrapper: FC<IMapWrapper> = ({ children }) => {
  const { center, zoom, minZoom, maxZoom, scaleWidth } = MAP_OPTIONS;

  return (
    <>
      <Selector
        options={['All', 'Critical', 'High', 'Medium', 'Low']}
        onSelect={(e) => console.log(e)}
      />
      <MapContainer
        preferCanvas={true}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          maxNativeZoom={maxZoom}
          maxZoom={maxZoom}
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <ScaleControl
          imperial={false}
          position="bottomright"
          maxWidth={scaleWidth}
        />
        {children}
        <InfoButton />
      </MapContainer>
    </>
  );
};

export default MapWrapper;
