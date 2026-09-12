import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { claimsRouter } from './routes/claims.routes';
import { denialsRouter } from './routes/denials.routes';
import { arRouter } from './routes/ar.routes';
import { priorAuthRouter } from './routes/priorAuth.routes';
import { patientsRouter } from './routes/patients.routes';
import { appointmentsRouter } from './routes/appointments.routes';
import { providersRouter } from './routes/providers.routes';
import { insuranceRouter } from './routes/insurance.routes';
import { tasksRouter } from './routes/tasks.routes';
import { messagesRouter } from './routes/messages.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { leadsRouter } from './routes/leads.routes';
import { seoRouter } from './routes/seo.routes';
import { reportsRouter } from './routes/reports.routes';
import { settingsRouter } from './routes/settings.routes';
import { contactRouter } from './routes/contact.routes';
import { auditRouter } from './routes/audit.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/denials', denialsRouter);
app.use('/api/ar', arRouter);
app.use('/api/prior-authorizations', priorAuthRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/insurance', insuranceRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/seo', seoRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/audit', auditRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 MedRevFlow API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Frontend: ${config.frontendUrl}`);
});

export default app;
