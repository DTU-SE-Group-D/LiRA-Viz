import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
