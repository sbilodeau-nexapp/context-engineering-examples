import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { appConfiguration } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SentryInterceptor, SentryService } from './sentry.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfiguration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SentryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
