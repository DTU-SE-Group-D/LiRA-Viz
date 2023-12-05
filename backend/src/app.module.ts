/**
 * @author this is from the template of NestJS
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RCController } from './conditions/rc.controller';
import { RCService } from './conditions/rc.service';

import { DB_GROUPD_CONFIG } from './database';
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
    database(DB_GROUPD_CONFIG, 'group-d'),
    ServeStaticModule.forRoot({
      rootPath: process.env.IMAGE_STORE_PATH,
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
