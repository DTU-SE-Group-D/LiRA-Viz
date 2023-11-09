/**
 * @author this is from the template of NestJS
 */
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
import { ImageController } from './images/image.controller';
import { ImageService } from './images/image.service';
import { SurveyService } from './surveys/survey.service';
import { SurveyController } from './surveys/survey.controller';

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
      serveRoot: '/cdn/',
    }),
  ],

  controllers: [
    AppController,
    RCController,
    RoadController,
    SurveyController,
    ImageController,
  ],
  providers: [
    AppService,
    ConfigService,
    RCService,
    RoadService,
    SurveyService,
    ImageService,
  ],
})
export class AppModule {}
