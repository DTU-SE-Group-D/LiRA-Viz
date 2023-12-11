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
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';

import { BullModule } from '@nestjs/bull';
import { FileProcessor } from './upload/file.processor';
import * as process from 'process';

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
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  controllers: [
    AppController,
    RCController,
    RoadController,
    SurveyController,
    ImageController,
    UploadController,
  ],
  providers: [
    AppService,
    ConfigService,
    RCService,
    RoadService,
    SurveyService,
    ImageService,
    FileProcessor,
    UploadService,
  ],
})
export class AppModule {}
