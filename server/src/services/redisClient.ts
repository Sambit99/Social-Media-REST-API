import Redis from 'ioredis';
import config from '../config/config';

const client = new Redis({
  port: Number(config.REDIS_PORT), // Redis port
  host: config.REDIS_HOST, // Redis host
  username: config.REDIS_USERNAME, // needs Redis >= 6
  password: config.REDIS_PASSWORD,
  db: Number(config.REDIS_DB) // Defaults to 0
});

export { client };
