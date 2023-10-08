import { Controller, Get, Query } from '@nestjs/common';

import { Condition } from 'src/models';
import { RCService } from './rc.service';

@Controller('conditions')
export class RCController {
  constructor(private readonly service: RCService) {}

  @Get('way')
  getWayConditions(@Query() query: { dbId: string }): Promise<Condition[]> {
    const { dbId } = query;
    return this.service.getWayRoadConditions(dbId);
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
