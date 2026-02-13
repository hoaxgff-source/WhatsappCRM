import { Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { providers } from '../services/payments.js';
import { generateInvoicePdf } from '../services/invoice.js';
import { sendMail } from '../services/email.js';
import { ok, fail } from '../utils/http.js';

const router = Router();

router.post('/initialize', requireAuth, async (req, res, next) => {
  try {
    const { provider, amount, currency, email, planCode } = req.body;
    if (!providers[provider]) return fail(res, 'Unsupported provider');

    const reference = `${provider}_${crypto.randomUUID()}`;
    const payment = await providers[provider].initialize({
      email,
      amount,
      currency,
      reference,
      tx_ref: reference,
      callback_url: `${process.env.WEB_URL}/dashboard/billing`
    });

    await query(
      'insert into payments(organization_id, provider, reference, amount, currency, status, metadata) values ($1,$2,$3,$4,$5,$6,$7)',
      [req.user.organizationId, provider, reference, amount, currency, 'pending', { planCode, gateway: payment }]
    );

    return ok(res, payment);
  } catch (error) {
    return next(error);
  }
});

router.post('/webhooks/paystack', express.raw({ type: '*/*' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.body.toString();
    if (!providers.paystack.verifyWebhook(rawBody, signature)) return fail(res, 'Invalid signature', 401);

    const body = JSON.parse(rawBody);
    if (body.event !== 'charge.success') return ok(res, { ignored: true });

    const ref = body.data.reference;
    const amount = body.data.amount / 100;
    await query('update payments set status = $1 where reference = $2', ['paid', ref]);
    const payment = await query('select * from payments where reference = $1', [ref]);
    const p = payment.rows[0];
    await query("update organizations set plan = 'pro', subscription_status='active', subscription_ends_at = now() + interval '30 days' where id = $1", [p.organization_id]);

    const invoiceNo = `INV-${Date.now()}`;
    const invoicePath = await generateInvoicePdf({
      invoiceNumber: invoiceNo,
      businessName: 'WhatsApp CRM',
      customerName: body.data.customer.email,
      amount,
      currency: body.data.currency
    });
    await query('insert into invoices(organization_id, invoice_number, amount, currency, file_path) values ($1,$2,$3,$4,$5)', [p.organization_id, invoiceNo, amount, body.data.currency, invoicePath]);
    await sendMail({ to: body.data.customer.email, subject: 'Payment confirmed', html: `<p>Your payment succeeded. Invoice: ${invoiceNo}</p>` });

    return ok(res, { received: true });
  } catch (error) {
    return next(error);
  }
});

router.post('/webhooks/flutterwave', async (req, res, next) => {
  try {
    const signature = req.headers['verif-hash'];
    if (!providers.flutterwave.verifyWebhook(signature)) return fail(res, 'Invalid signature', 401);
    const { status, tx_ref } = req.body;
    if (status === 'successful') {
      await query('update payments set status = $1 where reference = $2', ['paid', tx_ref]);
    }
    return ok(res, { received: true });
  } catch (error) {
    return next(error);
  }
});

router.post('/webhooks/stripe', express.raw({ type: '*/*' }), async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!providers.stripe.verifyWebhook(req.body.toString(), signature)) return fail(res, 'Invalid signature', 401);
    const event = JSON.parse(req.body.toString());
    if (event.type === 'checkout.session.completed') {
      const reference = event.data.object.id;
      await query('update payments set status = $1 where metadata->\'gateway\'->>\'reference\' = $2', ['paid', reference]);
    }
    return ok(res, { received: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
