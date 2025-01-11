import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
import ApiRouter from './routes/api.routes';
import HealthCheckRouter from './routes/healthCheck.routes';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import ApiError from './util/ApiError';
import statusCodes from './constant/statusCodes';
app.use('/api/v1', ApiRouter);
app.use('/api/v1/healthCheck', HealthCheckRouter);

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('Route'));
  } catch (error) {
    ApiError(next, error, req, statusCodes.UNAUTHENTICATED);
  }
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
