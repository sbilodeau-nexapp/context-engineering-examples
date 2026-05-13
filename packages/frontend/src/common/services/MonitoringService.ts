import * as Sentry from '@sentry/react';

interface MonitoringService {
  init: () => void;
  logError: (error: Error) => void;
  logMessage: (message: string) => void;
}

export const MonitoringService: MonitoringService = {
  init: () => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
    });
  },

  logError: Sentry.captureException,
  logMessage: Sentry.captureMessage,
};
