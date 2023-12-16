import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { RoadService } from './road.service';
import { OSMWayId } from '../models';

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
   * Get the data indicators for specific consecutive ways.
   * @param wayIds the ways (osm) ids
   *
   * @author Kerbourc'h
   */
  @Post('data')
  async getDataForWays(@Body() wayIds: OSMWayId[]) {
    const dataForWays = await Promise.all(
      wayIds.map((id: string) => this.service.getWayData(id)),
    );

    const data: { type: string; value: number; distance: number }[] = [];
    const geometry: number[][] = [];

    let distanceFromBeginning = 0;

    for (let i = 0; i < dataForWays.length; i++) {
      data.push(
        ...dataForWays[i].data.map(
          (d: { type: string; value: number; distance_way: number }) => ({
            type: d.type,
            value: d.value,
            distance:
              i === 0 ? d.distance_way : d.distance_way + distanceFromBeginning,
          }),
        ),
      );
      geometry.push(...dataForWays[i].geometry);
      distanceFromBeginning += dataForWays[i].length;
    }

    return { data: data, geometry: geometry };
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

  /**
   * Get the length of a specific way.
   *
   * @param wayId the OSM id of the way
   * @returns the length of the way
   *
   * @author Chen
   */
  @Get('waylength/:wayId')
  async getWayLength(
    @Param('wayId') wayId: OSMWayId,
  ): Promise<{ length: number }> {
    const wayData = await this.service.getWayData(wayId);
    // Only return the length part of the way data
    return { length: wayData.length };
  }
}
