import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RCController } from './conditions/rc.controller';
import { RCService } from './conditions/rc.service';

import { DB_GROUPD_CONFIG, DB_LIRAMAP_CONFIG } from './database';
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
    database(DB_LIRAMAP_CONFIG, 'lira-map'),
    database(DB_GROUPD_CONFIG, 'group-d'),
    ServeStaticModule.forRoot({
      rootPath:
        process.env.IMAGE_PATH_FOR_DEV === 'true'
          ? join(__dirname, '..', '..', '..', 'images')
          : '/home/fish/images/',
      serveRoot: '/images/',
    }),
  ],
  controllers: [AppController, RCController, RoadController],
  providers: [AppService, ConfigService, RCService, RoadService],
})
export class AppModule {}
