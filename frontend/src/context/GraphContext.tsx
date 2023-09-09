import {
	createContext,
	useContext,
} from "react";

import useMinMaxAxis from "../hooks/useMinMaxAxis";
import { AddMinMaxFunc, RemMinMaxFunc } from "../assets/graph/types";


interface ContextProps {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;

    addBounds: AddMinMaxFunc;
	remBounds: RemMinMaxFunc;
}

const GraphContext = createContext({} as ContextProps);

// TODO: remove bounds / refactor?  -> is it needed really?
// TODO: generalize DotHover into an "Event State" (to support for more events at once)
export const GraphProvider = ({ children }: any) => {

	const { bounds, addBounds, remBounds } = useMinMaxAxis()

	const { minX, maxX, minY, maxY } = bounds;

	return (
		<GraphContext.Provider
			value={{
				minX, maxX, minY, maxY,
				addBounds, remBounds,
			}}
		>
			{children}
		</GraphContext.Provider>
	);
};

export const useGraph = () => useContext(GraphContext);