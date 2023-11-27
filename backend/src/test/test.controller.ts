import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('map_matching')
export class TestController {
  constructor(private readonly service: TestService) {}

  @Get('')
  async match() {
    return this.service.matchData();
  }

  @Get('database')
  async matchDynatest() {
    return this.service.matchDynatest();
  }
}
