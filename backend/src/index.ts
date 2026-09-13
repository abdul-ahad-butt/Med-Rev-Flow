import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { envStorage } from './config/envStorage';

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

const app = new Hono();

app.use('*', async (c, next) => {
  return envStorage.run(c.env, next);
});

app.use('*', cors({
  origin: config.frontendUrl,
  credentials: true,
}));

if (config.nodeEnv !== 'test') {
  app.use('*', logger());
}

app.get('/', (c) => c.json({ message: 'MedRevFlow API is running!' }));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/claims', claimsRouter);
app.route('/api/denials', denialsRouter);
app.route('/api/ar', arRouter);
app.route('/api/prior-authorizations', priorAuthRouter);
app.route('/api/patients', patientsRouter);
app.route('/api/appointments', appointmentsRouter);
app.route('/api/providers', providersRouter);
app.route('/api/insurance', insuranceRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/messages', messagesRouter);
app.route('/api/notifications', notificationsRouter);
app.route('/api/leads', leadsRouter);
app.route('/api/seo', seoRouter);
app.route('/api/reports', reportsRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/contact', contactRouter);
app.route('/api/audit', auditRouter);

app.notFound((c) => c.json({ error: 'Route not found' }, 404));
app.onError(errorHandler);

export default app;
