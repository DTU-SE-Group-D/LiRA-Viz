import { HotPolyline } from 'react-leaflet-hotline';
import { DotHover } from '../graph/types';

/**
 * This class extends the HotPolyline class from react-leaflet-hotline
 * to add the ability to set the dotHover property. But I'm not sure
 * what the dotHover property is used for internally.
 */
export default class HoverHotPolyline<T, U> extends HotPolyline<T, U> {
  setHover(dotHover: DotHover | undefined) {
    if (this._canvas._hotline === undefined) return;
    (this._canvas._hotline as any).dotHover = dotHover;
    this._canvas._update();
    this.redraw();
  }
}
