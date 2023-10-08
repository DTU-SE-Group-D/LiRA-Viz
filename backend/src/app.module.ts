import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RCController } from './conditions/rc.controller';
import { RCService } from './conditions/rc.service';

import { DB_LIRAMAP_CONFIG } from './database';

const database = (config: any, name: string) => {
  return KnexModule.forRootAsync(
    {
      useFactory: () => ({ config }),
    },
    name,
  );
};

@Module({
  imports: [ConfigModule.forRoot(), database(DB_LIRAMAP_CONFIG, 'lira-map')],
  controllers: [AppController, RCController],
  providers: [AppService, ConfigService, RCService],
})
export class AppModule {}
