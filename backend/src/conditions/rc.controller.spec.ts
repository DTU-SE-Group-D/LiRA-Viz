import { Test, TestingModule } from '@nestjs/testing';

import { RCController } from './rc.controller';
import { RCService } from './rc.service';

import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DB_GROUPD_CONFIG } from '../database';

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
      imports: [ConfigModule.forRoot(), database(DB_GROUPD_CONFIG, 'group-d')],
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
