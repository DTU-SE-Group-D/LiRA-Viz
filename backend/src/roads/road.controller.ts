import { Controller, Get } from '@nestjs/common';
import { RoadService } from './road.service';

@Controller('road')
export class RoadController {
  constructor(private readonly service: RoadService) {}

  @Get('')
  getRoads() {
    return this.service.getRoads();
  }
}
