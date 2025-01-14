import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD'],
    // origin: ['https://client.com'], // Note: Add the origin address from which our application can be accessed
    credentials: true // Note: Use to parse cookies
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
import ApiRouter from './routes/api.routes';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import ApiError from './util/ApiError';
import statusCodes from './constant/statusCodes';
import AuthRouter from './routes/auth.routes';

app.use('/api/v1', ApiRouter);
app.use('/api/v1/auth', AuthRouter);

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
