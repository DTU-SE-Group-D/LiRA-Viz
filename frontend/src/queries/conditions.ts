import { MapBounds } from "../models/map"
import { Condition, WaysConditions } from "../models/path"
import { asyncPost, post } from "./fetch"


export const getWaysConditions = ( type: string, zoom: number, setWays: (data: WaysConditions) => void ) => {
    post( '/conditions/ways', { type, zoom }, setWays )
}

export const getConditions = ( wayId: string, type: string, setConditions: (data: Condition[]) => void ) => {
    post( '/conditions/way', { wayId, type }, setConditions )
}

export const getBoundedWaysConditions = async ( bounds: MapBounds, type: string, zoom: number ) => {
    console.log(bounds);
    return await asyncPost<WaysConditions>( '/conditions/bounded/ways', { ...bounds, type, zoom } )
}