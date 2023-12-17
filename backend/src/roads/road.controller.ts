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
   * Get the length of a specific way
   * Get all the roads in the database.
   *
   * @author Kerbourc'h, Chen
   */
  @Get('paths/:wayId?')
  async getRoadsInfo(@Param('wayId') wayId?: OSMWayId) {
    if (wayId) {
      // Get the length of the specific way
      const wayData = await this.service.getWayData(wayId);
      return { length: wayData.length };
    } else {
      // Get all roads if no specific wayId is provided
      return await this.service.getRoadsPaths();
    }
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
}
