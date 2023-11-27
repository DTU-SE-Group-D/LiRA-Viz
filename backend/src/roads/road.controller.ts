import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { RoadService } from './road.service';

@Controller('roads')
export class RoadController {
  constructor(private readonly service: RoadService) {}

  /**
   * Get all the roads in the database.
   *
   * @author Kerbourc'h
   */
  @Get('paths')
  async getRoadsPaths() {
    return await this.service.getRoadsPaths();
  }

  /**
   * Add a specific road to the database using the OSM id of a way in the road.
   * **It might get removed in the future.**
   *
   * @param id the OSM id of a way in the road
   * @author Kerbourc'h
   */
  @Get('getorcreateway/:id')
  async insertRoad(@Param('id') id: string) {
    if (isNaN(Number(id))) throw new BadRequestException('Invalid id');
    return await this.service.getOrCreateWay(id);
  }
}
