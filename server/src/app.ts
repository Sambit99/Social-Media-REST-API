import express, { Application } from 'express';
import path from 'path';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
import healthCheckRouter from './routes/healthCheck.routes';
app.use('/api/v1/healthCheck', healthCheckRouter);

export default app;
