/**
 * @author this is from the template of NestJS
 */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  @Inject(ConfigService)
  public config: ConfigService;

  getStatus(): string {
    return 'OK';
  }
}
