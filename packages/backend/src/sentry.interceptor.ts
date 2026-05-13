/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { catchError, type Observable } from 'rxjs';

import type { appConfiguration } from './app.config';
import type {
  AlertEntry,
  GetAlertService,
  SeverityLevel,
} from './GetAlertService';

@Injectable()
export class SentryService implements GetAlertService {
  private isInit = false;
  constructor(
    private readonly configService: ConfigService<typeof appConfiguration>,
  ) {
    Sentry.init({
      dsn: this.configService.get('sentry.dsn'),
      environment: this.configService.get('sentry.environment'),
      tracesSampleRate: 1.0,
    });

    this.isInit = true;
  }
  addLog(severity: SeverityLevel, entry: AlertEntry, error: Error | string) {
    if (!this.isInit) {
      return;
    }

    Sentry.withScope((scope) => {
      scope.setExtra('body', entry.body);
      scope.setExtra('origin', entry.origin);
      scope.setExtra('action', entry.action);
      scope.setLevel(severity);

      typeof error === 'string'
        ? Sentry.captureMessage(error)
        : Sentry.captureException(error);
    });
  }
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, body, url } = request;

    const entry: AlertEntry = {
      action: method,
      origin: url,
      body,
    };

    return next.handle().pipe(
      catchError((error) => {
        this.sentryService.addLog('error', entry, error);
        throw error;
      }),
    );
  }
}
