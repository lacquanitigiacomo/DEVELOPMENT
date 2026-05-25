import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// ═══════════════════════════════════════════════════════════════
// ZERO-STRESS ENV: importa l'engine prima di TUTTO
// ═══════════════════════════════════════════════════════════════
import { loadEnv, applyEnv, getEnv } from '../../shared/env-engine';

const envConfig = loadEnv();
applyEnv(envConfig);

// Ora process.env è garantito popolato — mai crash per .env mancante
// ═══════════════════════════════════════════════════════════════

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { setupLogger } from './utils/logger';

const app = express();
const logger = setupLogger();
const PORT = parseInt(getEnv('PORT', '3001'));

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: getEnv('CORS_ORIGIN', 'http://localhost:5173'), 
  credentials: true 
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000')),
  max: parseInt(getEnv('RATE_LIMIT_MAX', '100')),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', apiRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 RYB API v20.0 running on http://localhost:${PORT}`);
  logger.info(`   Environment: ${getEnv('NODE_ENV')}`);
  logger.info(`   AI Strategy: ${getEnv('AI_STRATEGY')}`);
  logger.info(`   Config source: ${envConfig.source} (${envConfig.path})`);
});

export { app };
