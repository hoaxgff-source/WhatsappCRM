import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import crmRoutes from './routes/crm.js';
import paymentRoutes from './routes/payments.js';
import automationRoutes from './routes/automation.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errors.js';
import { env } from './config/env.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_URL }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use('/api/payments/webhooks/paystack', express.raw({ type: '*/*' }));
app.use('/api/payments/webhooks/stripe', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use(errorHandler);
