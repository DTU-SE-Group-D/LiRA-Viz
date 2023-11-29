import React from 'react';
import Path from './Path';
import { LatLng } from '../../models/models';

interface Props {
  /** A path can either be one or multiple line(s) so a paths is a list of that */
  paths?: LatLng[][] | LatLng[][][];
  /** The event handlers, when a path is selected */
  onSelectedPath?: (
    index: number,
    path: LatLng[] | LatLng[][],
    position: LatLng,
  ) => void;
}

/**
 * A components that renders clickable paths on the map
 *
 * @author Kerbourc'h
 */
const Paths: React.FC<Props> = ({ paths, onSelectedPath }) => {
  return (
    <>
      {paths instanceof Array // prevent the component to crash if the data returned is a http error
        ? paths?.map((path, index) => (
            <Path
              key={index}
              path={path}
              onClick={(position) => {
                if (onSelectedPath) {
                  onSelectedPath(index, path, position);
                }
              }}
            />
          ))
        : null}
    </>
  );
};

export default Paths;
