import app from './app';
import config from './config/config';
import Logger from './util/Logger';

process.on('uncaughtException', (err: Error) => {
  Logger.error('UNCAUGHT EXCEPTION! SHUTTING DOWN...', { meta: err });
  process.exit(1);
});

const PORT = config.PORT || 5000;
const server = app.listen(PORT);

(() => {
  try {
    Logger.info(`APPLICATION STARTED`, {
      meta: {
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL
      }
    });
  } catch (error) {
    Logger.error('APPLICATION ERROR', { meta: error });
  }
})();

process.on('unhandledRejection', (err: Error) => {
  Logger.error('UNHANDLER REJECTION! SHUTTING DOWN...', { meta: err });
  server.close(() => {
    process.exit(1);
  });
});
