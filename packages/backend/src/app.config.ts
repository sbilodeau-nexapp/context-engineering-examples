export const appConfiguration = () => ({
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV,
  },
});
