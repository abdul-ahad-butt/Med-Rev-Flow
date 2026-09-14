import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { envStorage } from './config/envStorage';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

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
import { adminRouter } from './routes/admin.routes';
import { contactRouter } from './routes/contact.routes';
import { auditRouter } from './routes/audit.routes';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import bcrypt from 'bcryptjs';

const app = new Hono();

app.use('*', async (c, next) => {
  return envStorage.run(c.env, next);
});

app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://med-rev-flow.pages.dev',
      'https://super-admin-med-rev-flow.pages.dev'
    ];
    const envOrigin = (c.env as any)?.FRONTEND_URL;
    if (envOrigin && !allowedOrigins.includes(envOrigin)) {
      allowedOrigins.push(envOrigin);
    }
    
    // Always return the exact origin if it's in our allowed list, 
    // otherwise fallback to the first allowed origin
    return origin && allowedOrigins.includes(origin) ? origin : (origin || allowedOrigins[0]);
  },
  credentials: true,
}));

if (config.nodeEnv !== 'test') {
  app.use('*', logger());
}

app.get('/favicon.ico', (c) => c.body(null, 204));
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
app.route('/api/admin', adminRouter);
app.route('/api/contact', contactRouter);
app.route('/api/audit', auditRouter);

// Temporary seed endpoint
app.get('/api/seed', async (c) => {
  const adapter = new PrismaD1((c.env as any).DB);
  const prisma = new PrismaClient({ adapter });
  const email = 'abdulahadbutt420@gmail.com';
  const hashedPassword = await bcrypt.hash('Qaz123$$', 10);
  
  // First clean up any existing bad record
  try {
    await (c.env as any).DB.prepare('DELETE FROM User WHERE email = ?').bind(email).run();
  } catch (e) {}

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      firstName: 'Abdul Ahad',
      lastName: 'Butt',
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: false,
    }
  });

  return c.json({ message: 'Super admin seeded', user });
});

app.notFound((c) => c.json({ error: 'Route not found' }, 404));
app.onError(errorHandler);

export default app;
