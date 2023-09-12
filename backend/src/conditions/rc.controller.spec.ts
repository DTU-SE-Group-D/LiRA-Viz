import { Test, TestingModule } from '@nestjs/testing';

import { RCController } from './rc.controller';
import { RCService } from './rc.service';

import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DB_LIRAMAP_CONFIG, POSTGIS_DB_CONFIG } from '../database';

const database = (config: any, name: string) => {
  return KnexModule.forRootAsync(
    {
      useFactory: () => ({ config }),
    },
    name,
  );
};

describe('Road Condition Controller', () => {
  let rcController: RCController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        database(POSTGIS_DB_CONFIG, 'postgis'),
        database(DB_LIRAMAP_CONFIG, 'lira-map'),
      ],
      controllers: [RCController],
      providers: [RCService, ConfigService],
    }).compile();

    rcController = app.get<RCController>(RCController);
  });

  describe('RoadCondition Controller', () => {
    it('Should be defined', () => {
      expect(rcController).toBeDefined();
    });
  });
});
