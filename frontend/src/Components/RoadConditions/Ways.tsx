import { FC, useMemo, useState } from 'react';

import { HotlineOptions } from 'react-leaflet-hotline';
import { HotlineEventHandlers } from 'react-leaflet-hotline/dist/types/types';
import { WaysConditions } from '../../models/path';
import DistHotline from '../Map/Renderers/DistHotline';

interface IWays {
  type: string;
  onClick?: (way_id: string, way_length: number) => void;
}

const Ways: FC<IWays> = ({ type, onClick }) => {
  console.log(type);

  const [ways, _] = useState<WaysConditions>();

  const options = useMemo<HotlineOptions>(
    () => ({
      min: 0,
      max: 1,
    }),
    [],
  );

  const handlers = useMemo<HotlineEventHandlers>(
    () => ({
      click: (_, i) => {
        if (ways && onClick) onClick(ways.way_ids[i], ways.way_lengths[i]);
      },
    }),
    [ways],
  );

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
