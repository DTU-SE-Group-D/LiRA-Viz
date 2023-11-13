import { LatLng, Map } from 'leaflet';
import { HotlineOptions, Renderer } from 'react-leaflet-hotline';

import { DataPoint } from '../../models/path';
import { DistData, DistPoint } from './hotline';
import Edge from './Edge';

/**
 * A renderer that allow the condition to be projected between two GPS points
 * (knowing the distance from the start of the path)
 */
export default class DistRenderer extends Renderer<DistData> {
  conditions: DataPoint[];
  edges: Edge[];

  constructor(options?: HotlineOptions, ...args: any[]) {
    super({ ...options });
    this.conditions = args[0][0];
    this.edges = [];
  }

  projectLatLngs(
    _map: Map,
    latlngs: LatLng[],
    result: any,
    projectedBounds: any,
  ) {
    const len = latlngs.length;
    const ring: DistData = [];
    for (let i = 0; i < len; i++) {
      ring[i] = _map.latLngToLayerPoint(latlngs[i]) as any;
      ring[i].i = i;
      ring[i].way_dist = latlngs[i].alt || 0;
      projectedBounds.extend(ring[i]);
    }
    result.push(ring);
  }

  onProjected(): number {
    this.updateEdges();
    return 0;
  }

  _addWayColorGradient(
    gradient: CanvasGradient,
    edge: Edge,
    dist: number,
  ): void {
    const opacity = 1;
    try {
      gradient.addColorStop(dist, `rgba(${edge.get().join(',')},${opacity})`);
    } catch {
      // eslint-disable-next-line no-empty
    }
  }

  /**
   * Find the closest conditions around each edge (node for ways) and interpolate the color
   */
  private updateEdges() {
    let i = 0;

    const calcValue = (a: DataPoint, b: DataPoint, cur: DistPoint) => {
      const A = 1 - (cur.way_dist - a.way_dist);
      const B = 1 - (cur.way_dist - b.way_dist);
      return (A * a.value + B * b.value) / (A + B);
    };

    const getValue = (d: DistPoint, conditions: DataPoint[]): number => {
      if (d.way_dist <= 0) return conditions[0].value;
      else if (d.way_dist >= 1 || i >= conditions.length)
        return conditions[conditions.length - 1].value;

      while (conditions[i].way_dist <= d.way_dist && ++i < conditions.length) {
        // eslint-disable-next-line no-empty
      }

      if (i === 0) return conditions[0].value;
      else if (i >= conditions.length - 1)
        return conditions[conditions.length - 1].value;

      return calcValue(conditions[i - 1], conditions[i], d);
    };

    this.edges = this.projectedData[0].map((d) => {
      const value = getValue(d, this.conditions);
      const rgb = this.getRGBForValue(value);
      return new Edge(...rgb);
    });
  }

  _drawHotline(): void {
    const ctx = this._ctx;
    if (ctx === undefined) return;

    const path = this._data[0];
    const edges = this.edges;

    const conditions = this.conditions;

    for (let j = 1; j < path.length; j++) {
      const start = path[j - 1];
      const end = path[j];

      const gradient = this._addGradient(ctx, start, end, conditions);

      this._addWayColorGradient(gradient, edges[start.i], 0);
      this._addWayColorGradient(gradient, edges[end.i], 1);

      this.drawGradient(ctx, gradient, start, end);
    }
  }

  drawGradient(
    ctx: CanvasRenderingContext2D,
    gradient: CanvasGradient,
    pointStart: DistPoint,
    pointEnd: DistPoint,
  ) {
    ctx.beginPath();
    ctx.lineWidth = this._options.weight;
    ctx.strokeStyle = gradient;
    ctx.moveTo(pointStart.x, pointStart.y);
    ctx.lineTo(pointEnd.x, pointEnd.y);
    ctx.stroke();
    ctx.closePath();
  }

  _addGradient(
    ctx: CanvasRenderingContext2D,
    start: DistPoint,
    end: DistPoint,
    conditions: DataPoint[],
  ): CanvasGradient {
    const gradient: CanvasGradient = ctx.createLinearGradient(
      start.x,
      start.y,
      end.x,
      end.y,
    );
    this.computeGradient(gradient, start, end, conditions);
    return gradient;
  }

  computeGradient(
    gradient: CanvasGradient,
    pointStart: DistPoint,
    pointEnd: DistPoint,
    conditions: DataPoint[],
  ) {
    const start_dist = pointStart.way_dist;
    const end_dist = pointEnd.way_dist;

    if (start_dist === end_dist) return;

    for (let i = 0; i < conditions.length; i++) {
      // const { dist: way_dist, value } = conditions[i] as any
      const { way_dist, value } = conditions[i];

      if (way_dist < start_dist) continue;
      else if (way_dist > end_dist) return;

      const rgb = this.getRGBForValue(value);
      const dist = (way_dist - start_dist) / (end_dist - start_dist);

      this._addWayColorGradient(gradient, new Edge(...rgb), dist);
    }
  }
}
