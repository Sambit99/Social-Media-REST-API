import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
import ApiRouter from './routes/api.routes';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import ApiError from './util/ApiError';
import statusCodes from './constant/statusCodes';
app.use('/api/v1', ApiRouter);

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('Route'));
  } catch (error) {
    ApiError(next, error, req, statusCodes.NOT_FOUND);
  }
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
