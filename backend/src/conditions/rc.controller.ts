import { Controller, Get, Query } from '@nestjs/common';
import { RCService } from './rc.service';

@Controller('conditions')
export class RCController {
  constructor(private readonly service: RCService) {}

  /**
   * Get all the conditions in the database.
   *
   * @param query the parameters to filter the conditions
   *
   * @author Kerbourc'h
   */
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
    },
  ): Promise<any> {
    const { minLat, maxLat, minLng, maxLng, type, valid_before, valid_after } =
      query;
    return this.service.getConditions(
      minLat,
      maxLat,
      minLng,
      maxLng,
      type,
      valid_before,
      valid_after,
    );
  }
}
