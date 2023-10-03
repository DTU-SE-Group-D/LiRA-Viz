import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import { Map } from 'leaflet';

import { DotHover } from '../assets/graph/types';

interface HoverContextProps {
  dotHover: DotHover | undefined;
  setDotHover: Dispatch<SetStateAction<DotHover | undefined>>;
  map: Map | undefined;
  setMap: Dispatch<SetStateAction<Map | undefined>>;
}

const HoverContext = createContext({} as HoverContextProps);

/**
 * The context provider for the hover context. It contains the dotHover context and the map.
 * This context is used in the original website to draw a circle at a certain point on the line.
 */
export const HoverProvider = ({ children }: any) => {
  const [dotHover, setDotHover] = useState<DotHover>();
  const [map, setMap] = useState<Map>();

  return (
    <HoverContext.Provider
      value={{
        dotHover,
        setDotHover,
        map,
        setMap,
      }}
    >
      {children}
    </HoverContext.Provider>
  );
};

export const useHoverContext = () => useContext(HoverContext);
