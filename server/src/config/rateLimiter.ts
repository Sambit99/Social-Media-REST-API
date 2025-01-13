import { Connection } from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';

export let rateLimiterMongo: null | RateLimiterMongo = null;

const POINTS = 10; // Note: Points defines how many requets can be done
const DURATION = 60; // Note: Duration defines the time period in which the requests can be done. it's in seconds

export const initRateLimiter = (mongooseConnection: Connection) => {
  rateLimiterMongo = new RateLimiterMongo({
    storeClient: mongooseConnection,
    points: POINTS,
    duration: DURATION
  });
};
