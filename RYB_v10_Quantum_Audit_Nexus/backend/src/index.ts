import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes/api';
import { payrollRouter } from './routes/payroll';
import { errorHandler } from './middleware/errorHandler';
import { setupLogger } from './utils/logger';

dotenv.config();

const app = express();
const logger = setupLogger();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', apiRouter);
app.use('/api/v1/payroll', payrollRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 RYB API v10.0 running on http://localhost:${PORT}`);
});

export { app };
