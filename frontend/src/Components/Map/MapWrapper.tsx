import {
  MapContainer,
  ScaleControl,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';

import '../../css/map.css';
import { MAP_OPTIONS } from './constants';
import React, { FC, useEffect, useState } from 'react';
import Selector from './Inputs/Selector';
import { IRoad } from '../../models/path';
import { getRoads } from '../../queries/road';
import Roads from './Roads';

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

  const [roads, setRoads] = useState<IRoad[]>();

  // get the actual roads
  useEffect(() => {
    getRoads(setRoads);
  }, []);

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
        <Roads roads={roads} />
        <ZoomControl position="topright" />
        <ScaleControl
          imperial={false}
          position="bottomright"
          maxWidth={scaleWidth}
        />
        {children}
      </MapContainer>
    </>
  );
};

export default MapWrapper;
