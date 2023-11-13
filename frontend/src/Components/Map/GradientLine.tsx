import { FC, useMemo } from 'react';

import { HotlineOptions, Palette } from 'react-leaflet-hotline';
import { HotlineEventHandlers } from 'react-leaflet-hotline/dist/types/types';
import { DataPoint, Node } from '../../models/path';
import DistHotline from './Renderers/DistHotline';
import { LatLng } from 'leaflet';

interface Props {
  /** A list of coordinates corresponding to the path to draw */
  geometry?: LatLng[];
  /** The data used to color the path **/
  data?: DataPoint[];
  /** The color scheme. It is a list of keypoint for a specific color. t correspond to the value of the conditions in percentage of the range of all values **/
  palette: Palette;
  /** The minimum value of the data. If not provided, it will be computed from the data **/
  minValue?: number;
  /** The maximum value of the data. If not provided, it will be computed from the data **/
  maxValue?: number;
  /** If true, add a zero data point ({value: 0, way_dist: the total path length}) at the end of the data list **/
  addZeroDataPointAtTheEnd?: boolean;
  /** The function to call when the path is clicked **/
  onClick?: (way_id: string) => void;
}

/**
 * GradientLine component to render the path on the map. This path is colored
 * using a palette and the data provided.
 *
 *
 * @author LiRA Map (Called Ways), Kerbourc'h
 */
const GradientLine: FC<Props> = ({
  geometry,
  data,
  minValue,
  maxValue,
  addZeroDataPointAtTheEnd,
  palette,
  onClick,
}) => {
  const nodes = useMemo<Node[] | undefined>(() => {
    if (geometry) {
      const n: Node[] = [];
      let distFromStart = 0;

      for (let i = 0; i < geometry.length; i++) {
        const item = geometry[i];
        const dist = i === 0 ? 0 : geometry[i - 1].distanceTo(item);
        n.push({
          lat: item.lat,
          lng: item.lng,
          way_dist: distFromStart + dist,
        });
        distFromStart += dist;
      }
      return n;
    }
    return undefined;
  }, [geometry]);

  const dataWithZero = useMemo<DataPoint[] | undefined>(() => {
    if (data && nodes) {
      if (addZeroDataPointAtTheEnd)
        return [
          ...data,
          { way_dist: nodes[nodes.length - 1].way_dist, value: 0 },
        ];
      return data;
    }

    return undefined;
  }, [data, nodes, addZeroDataPointAtTheEnd]);

  const options = useMemo<HotlineOptions>(
    () => ({
      palette: palette,
      min: minValue
        ? minValue
        : data
        ? Math.min(...data.map((item) => item.value))
        : 0,
      max: maxValue
        ? maxValue
        : data
        ? Math.max(...data.map((item) => item.value))
        : 0,
    }),
    [palette, data, minValue, maxValue],
  );

  const handlers = useMemo<HotlineEventHandlers>(
    () => ({
      click: (_) => {
        if (onClick) onClick('for now this is the way id');
      },
    }),
    [onClick],
  );

  return (
    <>
      {nodes && dataWithZero ? (
        <DistHotline
          geometry={nodes}
          datas={dataWithZero}
          options={options}
          eventHandlers={handlers}
        />
      ) : null}
    </>
  );
};

export default GradientLine;
