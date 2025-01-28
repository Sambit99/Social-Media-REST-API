export enum ApplicationEnvironment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development'
}

export const TimeInSeconds = {
  DAY_IN_SECONDS: 24 * 60 * 60,
  HOUR_IN_SECONDS: 60 * 60,
  X_DAYS_IN_SECONDS: (x: number) => x * 24 * 60 * 60
};
