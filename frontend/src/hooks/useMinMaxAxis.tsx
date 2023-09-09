
import { MinMax } from "../assets/graph/types";
import { Bounds } from "../models/path";
import useMinMax from "./useMinMax";

const defaultMinMax = [0, 10] as MinMax

const useMinMaxAxis = () => {

    const { bounds: boundsX, addInterval: addIntervalX, remInterval: remIntervalX } = useMinMax(defaultMinMax)
    const { bounds: boundsY, addInterval: addIntervalY, remInterval: remIntervalY } = useMinMax(defaultMinMax)

    const addBounds = ( id: string, bounds: Required<Bounds> ) => {
        const { minX, maxX, minY, maxY } = bounds;
        addIntervalX( id, [minX, maxX] )
        addIntervalY( id, [minY, maxY] )
    }

    const remBounds = (id: string) => {
        remIntervalX(id)
        remIntervalY(id)
    }

    const bounds = {
        minX: boundsX[0], 
        maxX: boundsX[1], 
        minY: boundsY[0], 
        maxY: boundsY[1]
    }

    return { bounds, addBounds, remBounds }
}

export default useMinMaxAxis;