/**
 * @author this is from the template of NestJS
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getStatus(): string {
    return this.appService.getStatus();
  }
}
