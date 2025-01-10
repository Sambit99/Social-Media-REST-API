import app from './app';
import config from './config/config';

process.on('uncaughtException', (err: Error) => {
  console.log(`UNCAUGHT EXCEPTION! SHUTTING DOWN...`);
  console.log(err.name, err.message, err);
  process.exit(1);
});

const PORT = config.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on Port : ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log(`UNHANDLER REJECTION! SHUTTING DOWN...`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
