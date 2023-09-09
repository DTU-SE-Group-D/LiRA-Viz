import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState,
} from "react";

import { Map } from "leaflet"

import useMinMaxAxis from "../hooks/useMinMaxAxis";
import { AddMinMaxFunc, DotHover, RemMinMaxFunc } from "../assets/graph/types";


interface HoverContextProps {
	dotHover: DotHover | undefined;
	setDotHover: Dispatch<SetStateAction<DotHover | undefined>>;
	map: Map | undefined;
	setMap: Dispatch<SetStateAction<Map | undefined>>
}

const HoverContext = createContext({} as HoverContextProps);

export const HoverProvider = ({ children }: any) => {

	const [ dotHover, setDotHover ] = useState<DotHover>()
	const [ map, setMap ] = useState<Map>()

	return (
		<HoverContext.Provider
			value={{
				dotHover, setDotHover,
				map, setMap
			}}
		>
			{children}
		</HoverContext.Provider>
	);
};

export const useHoverContext = () => useContext(HoverContext);