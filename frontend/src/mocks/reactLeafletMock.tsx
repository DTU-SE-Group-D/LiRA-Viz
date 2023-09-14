import React from 'react';

function MapContainer(props: any) {
  const { children } = props;

  return (
    <div className={'react-leaflet'}>
      <span>MapContainer</span>
      <br />
      {children}
    </div>
  );
}

function TileLayer() {
  return (
    <div className={'react-leaflet'}>
      <span>TileLayer</span>
    </div>
  );
}

function ScaleControl() {
  return (
    <div className={'react-leaflet'}>
      <span>ScaleControl</span>
    </div>
  );
}
function ZoomControl() {
  return (
    <div className={'react-leaflet'}>
      <span>ZoomControl</span>
    </div>
  );
}

function useMapEvents() {
  return {
    getZoom: () => {},
  };
}

module.exports = {
  MapContainer,
  TileLayer,
  ScaleControl,
  ZoomControl,
  useMapEvents,
};
