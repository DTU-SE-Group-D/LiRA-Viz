import { HotPolyline } from 'react-leaflet-hotline';
import { DotHover } from '../graph/types';


export default class HoverHotPolyline<T, U> extends HotPolyline<T, U>
{
    setHover(dotHover: DotHover | undefined) 
    {
        if ( this._canvas._hotline === undefined ) return;
        (this._canvas._hotline as any).dotHover = dotHover
        this._canvas._update()
        this.redraw()
    }
}