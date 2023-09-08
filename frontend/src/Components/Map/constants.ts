import {LatLng} from 'leaflet'
import {Palette} from 'react-leaflet-hotline';
import {ActiveMeasProperties, RendererOptions, XAxisType} from '../../models/properties';
import {RendererName} from '../../models/renderers';

// Map
export const MAP_OPTIONS = {
    center: new LatLng(55.672, 12.458),
    zoom: 12,
    minZoom: 5,
    maxZoom: 18,
    scaleWidth: 100
}

// Renderer
export const RENDERER_WIDTH = 4
export const RENDERER_WEIGHT = 4
export const RENDERER_COLOR = 'red'
export const RENDERER_OPACITY = 1.0

// TODO, ekki@dtu.dk: this was a quick fix; this was a constant used in
// different places in the software. But someone changed the components,
// in order for this not to happen, I made this a function, which makes
// a new copy. Eventually we should track down where the change of the
// constant is made and fix this.
export function RENDERER_PALETTE(): Palette  {
    return [
        { r: 0,   g: 160, b: 0,  t: 0    },
        { r: 255, g: 255, b: 0,  t: 0.5  },
        { r: 255, g: 0,   b: 0,  t: 1    }
    ] };


export function RENDERER_OPTIONS(): Required<RendererOptions> {
    return {
        rendererName: 'hotline' as RendererName,
        dilatationFactor: 1,
        arrowHead: 0,
        min: 0,
        max: 10,
        width: RENDERER_WIDTH,
        weight: RENDERER_WEIGHT,
        color: RENDERER_COLOR,
        opacity: RENDERER_OPACITY,
        palette: RENDERER_PALETTE()
    }
}

export function RENDERER_MEAS_PROPERTIES(): Required<ActiveMeasProperties>  {
    return {
        ...(RENDERER_OPTIONS()),
        dbName: '',
        name: '',
        hasValue: true,
        xAxisType: XAxisType.distance,
        isActive: false
    }
}

// Heatmap
// ekki@dtu.dk (precaussion: see comment on PALLETTE
export function HEATMAP_PALETTE(): Palette {
    return [
        {r: 0, g: 0, b: 255, t: 0},
        {r: 255, g: 255, b: 255, t: 0.5},
        {r: 255, g: 0, b: 0, t: 1}
    ]
}

export function HEATMAP_OPTIONS()  {
    return {
        max: 10,
        radius: 10,
        palette: HEATMAP_PALETTE()
    }
}