import { FC, useEffect, useMemo } from 'react';
import { LeafletEvent, Polyline } from 'leaflet';
import { HotlineOptions, useCustomHotline } from 'react-leaflet-hotline';

import { Condition, Node, WayId } from '../../../models/path';

import DistRenderer from '../../../assets/hotline/DistRenderer';
import { DistData } from '../../../assets/hotline/hotline';
import HoverHotPolyline from '../../../assets/hotline/HoverHotPolyline';
import {
  HotlineEventFn,
  HotlineEventHandlers,
} from 'react-leaflet-hotline/dist/types/types';
import useZoom from '../Hooks/useZoom';
import { useHoverContext } from '../../../context/GraphHoverContext';

const getLat = (n: Node) => n.lat;
const getLng = (n: Node) => n.lng;
const getVal = (n: Node) => n.way_dist;
const getWeight = (z: number | undefined) =>
  z === undefined ? 0 : Math.max(z > 8 ? z - 6 : z - 5, 2);

interface IDistHotline {
  /** the way ids of the line to render */
  way_ids: WayId[];
  /** the coordinates and the length of the line to render */
  geometry: Node[][];
  /** the conditions of the line to render */
  conditions: Condition[][];
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
 * Draw a gradient line using the value of a specific road condition.
 * It uses the react-leaflet-hotline library. The dot hover can be
 * used to draw a circle at a certain point on the line (See the original
 * version of the project and ReactJS context mechanism).
 */
const DistHotline: FC<IDistHotline> = ({
  way_ids,
  geometry,
  conditions,
  options,
  eventHandlers,
}) => {
  const { dotHover } = useHoverContext();
  const zoom = useZoom();

  const opts = useMemo(
    () => ({
      ...options,
      weight: getWeight(zoom),
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
  const { hotline } = useCustomHotline<Node, DistData>(
    // the custom renderer to use. Instead of having the road condition values in the data,
    // we have the road condition values in the conditions array and the distance
    // of the condition are in the data array.
    DistRenderer,
    // This is a custom polyline that can handle the hover event
    HoverHotPolyline,
    {
      data: geometry,
      getLat,
      getLng,
      getVal,
      options: opts,
      eventHandlers: handlers,
    },
    way_ids,
    conditions,
  );

  // set the hover state of the polyline
  useEffect(() => {
    if (hotline === undefined) return;
    (hotline as HoverHotPolyline<Node, DistData>).setHover(dotHover);
  }, [dotHover]);

  return null;
};

export default DistHotline;
