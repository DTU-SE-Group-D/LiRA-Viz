
import { LatLng, Map } from 'leaflet';
import { HotlineOptions, Renderer } from 'react-leaflet-hotline';

import { Condition, Node, WayId } from "../../models/path";
import { DotHover } from '../graph/types';
import { DistData, DistPoint } from "./hotline";
import Edge from "./Edge";


export default class DistRenderer extends Renderer<DistData> {

    way_ids: string[];
    conditions: Condition[][];
    edgess: Edge[][];
    dotHover: DotHover | undefined;

    constructor( options?: HotlineOptions, ...args: any[] ) 
    {
        super({...options})
        this.way_ids = args[0][0];
        this.conditions = args[0][1];
        this.edgess = [];
        this.dotHover = undefined;
    }

    projectLatLngs(_map: Map, latlngs: LatLng[], result: any, projectedBounds: any) 
    {
        const len = latlngs.length;
        const ring: DistData = [];    
        for (let i = 0; i < len; i++) 
        {
            ring[i] = _map.latLngToLayerPoint(latlngs[i]) as any;
            ring[i].i = i
            ring[i].way_dist = latlngs[i].alt || 0
            projectedBounds.extend(ring[i]);
        }
        result.push(ring);
    }

    onProjected(): number {
        this.updateEdges();
        return 0;
    }

    _addWayColorGradient(gradient: CanvasGradient, edge: Edge, dist: number, way_id: string): void {
        const opacity = this.dotHover !== undefined && this.dotHover.label !== way_id 
            ? 0.3
            : 1
        try{
            gradient.addColorStop(dist, `rgba(${edge.get().join(',')},${opacity})`);
        }
        catch
        {
        }
    }

    /**
     * Find the closest conditions around each edge (node for ways) and interpolate the color
     */
    private updateEdges()
    {
        let i = 0

        const calcValue = (a: Condition, b: Condition, cur: DistPoint ) => {
            const A = 1 - (cur.way_dist - a.way_dist)
            const B = 1 - (cur.way_dist - b.way_dist)
            return (A * a.value + B * b.value) / (A + B)
        }

        const getValue = (d: DistPoint, conditions: Condition[]): number => {
            if ( d.way_dist <= 0 ) return conditions[0].value
            else if ( d.way_dist >= 1 || i >= conditions.length ) return conditions[conditions.length - 1].value
            
            while ( conditions[i].way_dist <= d.way_dist && ++i < conditions.length ) {}

            if ( i === 0 ) return conditions[0].value
            else if ( i >= conditions.length - 1 ) return conditions[conditions.length - 1].value

            return calcValue(conditions[i - 1], conditions[i], d)
        }

        this.edgess = this.projectedData.map( (data, j) => {
            i = 0;
            return data.map( d => {
                const value = getValue(d, this.conditions[j])
                const rgb = this.getRGBForValue( value )
                return new Edge( ...rgb ) 
            } )
        } )
    }

    setWayIds( way_ids: WayId[] )
    {
        this.way_ids = way_ids;
    }

    setConditions(conditions: Condition[][])
    {
        this.conditions = conditions
        this.updateEdges()
    }

    _drawHotline(): void 
    {
        const ctx = this._ctx;
        if ( ctx === undefined ) return;
        
        const dataLength = this._data.length

        for (let i = 0; i < dataLength; i++) 
        {
            const path = this._data[i];
            const edges = this.edgess[i]

            const way_id = this.way_ids[i];
            const conditions = this.conditions[i]

            for (let j = 1; j < path.length; j++) 
            {
                const start = path[j - 1];
                const end = path[j];
                
                const gradient = this._addGradient(ctx, start, end, conditions, way_id);
                
                this._addWayColorGradient(gradient, edges[start.i], 0, way_id)
                this._addWayColorGradient(gradient, edges[end.i],   1, way_id)
                
                this.drawGradient(ctx, gradient, way_id, start, end)
            }
        }
    }

    drawGradient(
        ctx: CanvasRenderingContext2D, gradient: CanvasGradient, way_id: string,
        pointStart: DistPoint, pointEnd: DistPoint
    ) {
        ctx.beginPath();
        const hoverWeight = this.dotHover !== undefined 
            && this.dotHover.label === way_id 
            && (pointStart.way_dist) <= this.dotHover.point.x
            && (pointEnd.way_dist) >= this.dotHover.point.x
            ? 10
            : 0

        ctx.lineWidth = this._options.weight + hoverWeight
        ctx.strokeStyle = gradient;
        ctx.moveTo(pointStart.x, pointStart.y);
        ctx.lineTo(pointEnd.x, pointEnd.y); 
        ctx.stroke();
        ctx.closePath()
    }

    _addGradient( ctx: CanvasRenderingContext2D, start: DistPoint, end: DistPoint, conditions: Condition[], way_id: string ): CanvasGradient
    {

        const gradient: CanvasGradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        this.computeGradient(gradient, start, end, conditions, way_id)
        return gradient
    }

    computeGradient(gradient: CanvasGradient, pointStart: DistPoint, pointEnd: DistPoint, conditions: Condition[], way_id: string )
    {
        const start_dist = pointStart.way_dist
        const end_dist = pointEnd.way_dist

        if ( start_dist === end_dist ) return;
    
        for ( let i = 0; i < conditions.length; i++ )
        {
            // const { dist: way_dist, value } = conditions[i] as any 
            const { way_dist, value } = conditions[i] 
            
            if ( way_dist < start_dist ) continue;
            else if ( way_dist > end_dist ) return;

            const rgb = this.getRGBForValue(value);                                                      
            const dist = (way_dist - start_dist) / (end_dist - start_dist)

            this._addWayColorGradient(gradient, new Edge(...rgb), dist, way_id)
        }
    }
}



