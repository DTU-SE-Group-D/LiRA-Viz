import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DB_LIRAMAP_CONFIG } from './database';

const database = (config: any, name: string) => {
  return KnexModule.forRootAsync(
    {
      useFactory: () => ({ config }),
    },
    name,
  );
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        database(DB_LIRAMAP_CONFIG, 'lira-map'),
      ],
      controllers: [AppController],
      providers: [AppService, ConfigService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /', () => {
    it('should return "OK"', () => {
      expect(appController.getStatus()).toBe('OK');
    });
  });
});
