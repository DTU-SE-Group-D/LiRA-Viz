import { Controller, Get, Query } from '@nestjs/common';

import { Condition, WaysConditions } from 'src/models';
import { RCService } from './rc.service';

@Controller('conditions')
export class RCController {
  constructor(private readonly service: RCService) {}

  @Get('ways')
  getWaysConditions(
    @Query() query: { type: string; zoom: string },
  ): Promise<WaysConditions> {
    const { type, zoom } = query;
    return this.service.getWaysConditions(type, zoom);
  }

  @Get('way')
  getWayConditions(
    @Query() query: { wayId: string; type: string },
  ): Promise<Condition[]> {
    const { wayId, type } = query;
    return this.service.getWayRoadConditions(wayId, type);
  }

  @Get('way2')
  getWay2Conditions(
    @Query() query: { dbId: string; type: string },
  ): Promise<Condition[]> {
    const { dbId, type } = query;
    return this.service.getWay2RoadConditions(dbId, type);
  }

  @Get('')
  getConditions(
    @Query()
    query: {
      minLat: string;
      maxLat: string;
      minLng: string;
      maxLng: string;
      type: string;
      valid_before: string;
      valid_after: string;
      computed_after: string;
    },
  ): Promise<any> {
    const {
      minLat,
      maxLat,
      minLng,
      maxLng,
      type,
      valid_before,
      valid_after,
      computed_after,
    } = query;
    return this.service.getConditions(
      minLat,
      maxLat,
      minLng,
      maxLng,
      type,
      valid_before,
      valid_after,
      computed_after,
    );
  }
}
