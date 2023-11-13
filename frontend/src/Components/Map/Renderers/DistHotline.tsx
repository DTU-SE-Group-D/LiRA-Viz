import { FC, useMemo } from 'react';
import { LeafletEvent, Polyline } from 'leaflet';
import {
  HotlineOptions,
  HotPolyline,
  useCustomHotline,
} from 'react-leaflet-hotline';

import { DataPoint, Node } from '../../../models/path';

import DistRenderer from '../../../assets/hotline/DistRenderer';
import { DistData } from '../../../assets/hotline/hotline';
import {
  HotlineEventFn,
  HotlineEventHandlers,
} from 'react-leaflet-hotline/dist/types/types';
import useZoom from '../Hooks/useZoom';

const getLat = (n: Node) => n.lat;
const getLng = (n: Node) => n.lng;
const getVal = (n: Node) => n.way_dist;
const getWeight = (z: number | undefined) =>
  z === undefined ? 0 : Math.max(z > 8 ? z - 6 : z - 5, 2);

interface IDistHotline {
  /** the coordinates and the length of the line to render */
  geometry: Node[];
  /** The conditions of the line to render */
  datas: DataPoint[];
  /** The option of the gradient line */
  options?: HotlineOptions;
  /** The event handlers of the gradient line */
  eventHandlers?: HotlineEventHandlers;
}

/**
 * A small utility function to create a handler for a specific event.
 *
 * @param eventHandlers the default event handlers
 * @param event the event to handle
 * @param opacity the opacity to set to the line
 */
const handler = (
  eventHandlers: HotlineEventHandlers | undefined,
  event: keyof HotlineEventHandlers,
  opacity: number,
) => {
  return (e: LeafletEvent, i: number, p: Polyline<any, any>) => {
    p.setStyle({ opacity });
    if (eventHandlers && eventHandlers[event] !== undefined)
      (eventHandlers[event] as HotlineEventFn)(e, i, p);
  };
};

/**
 * Draw a gradient line using the values in the data array. This allows to draw
 * data in function of the distance of the beginning of a path.
 *
 * It uses the react-leaflet-hotline library.
 */
const DistHotline: FC<IDistHotline> = ({
  geometry,
  datas,
  options,
  eventHandlers,
}) => {
  const zoom = useZoom();

  const opts = useMemo(
    () => ({
      ...options,
      weight: getWeight(zoom), // make size of line dependent on zoom level
    }),
    [options, zoom],
  );

  // create an event handler for each event to handle for a line
  const handlers: HotlineEventHandlers = useMemo(
    () => ({
      ...eventHandlers,
      mouseover: handler(eventHandlers, 'mouseover', 0.5),
      mouseout: handler(eventHandlers, 'mouseout', 0),
    }),
    [eventHandlers],
  );

  // create the custom gradient line
  useCustomHotline<Node, DistData>(
    // the custom renderer to use. The data contains the geometry and the distance
    // to the beginning of the path and the datas contains the value and
    // the distance from the beginning of the path.
    DistRenderer,
    // This is a custom polyline that can handle the hover event
    HotPolyline,
    {
      data: geometry,
      getLat,
      getLng,
      getVal,
      options: opts,
      eventHandlers: handlers,
    },
    datas,
  );
  return null;
};

export default DistHotline;
