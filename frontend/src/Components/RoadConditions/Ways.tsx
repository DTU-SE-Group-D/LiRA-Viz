import { FC, useEffect, useMemo, useState } from 'react';

import { HotlineOptions } from 'react-leaflet-hotline';
import { HotlineEventHandlers } from 'react-leaflet-hotline/dist/types/types';
import { useGraph } from '../../context/GraphContext';
import { WaysConditions } from '../../models/path';
import { getWaysConditions } from '../../queries/conditions';
import useZoom from '../Map/Hooks/useZoom';
import DistHotline from '../Map/Renderers/DistHotline';

interface IWays {
  type: string;
  onClick?: (way_id: string, way_length: number) => void;
}

const Ways: FC<IWays> = ({ type, onClick }) => {
  const zoom = useZoom();
  const { minY, maxY } = useGraph();

  const [ways, setWays] = useState<WaysConditions>();

  const options = useMemo<HotlineOptions>(
    () => ({
      min: minY,
      max: maxY,
    }),
    [minY, maxY],
  );

  const handlers = useMemo<HotlineEventHandlers>(
    () => ({
      click: (_, i) => {
        if (ways && onClick) onClick(ways.way_ids[i], ways.way_lengths[i]);
      },
    }),
    [ways],
  );

  useEffect(() => {
    if (zoom === undefined) return;
    const z = Math.max(0, zoom - 12);
    getWaysConditions(type, z, (data: WaysConditions) => {
      console.log(data);
      setWays(data);
    });
  }, [zoom]);

  return (
    <>
      {ways ? (
        <DistHotline
          way_ids={ways.way_ids}
          geometry={ways.geometry}
          conditions={ways.conditions}
          options={options}
          eventHandlers={handlers}
        />
      ) : null}
    </>
  );
};

export default Ways;
