import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RCController } from './conditions/rc.controller';
import { RCService } from './conditions/rc.service';

import { DB_LIRAMAP_CONFIG, POSTGIS_DB_CONFIG } from './database';
import { RoadController } from './roads/road.controller';
import { RoadService } from './roads/road.service';

const database = (config: any, name: string) => {
  return KnexModule.forRootAsync(
    {
      useFactory: () => ({ config }),
    },
    name,
  );
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    database(POSTGIS_DB_CONFIG, 'postgis'),
    database(DB_LIRAMAP_CONFIG, 'lira-map'),
  ],
  controllers: [AppController, RCController, RoadController],
  providers: [AppService, ConfigService, RCService, RoadService],
})
export class AppModule {}
