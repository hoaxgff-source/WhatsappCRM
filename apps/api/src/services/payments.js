import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const providers = {
  paystack: {
    async initialize({ email, amount, reference, callback_url, currency = 'NGN' }) {
      const { data } = await axios.post('https://api.paystack.co/transaction/initialize', {
        email,
        amount: Math.round(Number(amount) * 100),
        reference,
        callback_url,
        currency
      }, { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } });
      return data.data;
    },
    verifyWebhook(rawBody, signature) {
      if (!env.PAYSTACK_WEBHOOK_SECRET) return false;
      const hash = crypto.createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex');
      return hash === signature;
    }
  },
  flutterwave: {
    async initialize({ email, amount, tx_ref, redirect_url, currency = 'NGN' }) {
      const { data } = await axios.post('https://api.flutterwave.com/v3/payments', {
        tx_ref,
        amount,
        currency,
        redirect_url,
        customer: { email }
      }, { headers: { Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}` } });
      return data.data;
    },
    verifyWebhook(signature) {
      return signature && env.FLUTTERWAVE_WEBHOOK_SECRET_HASH && signature === env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
    }
  },
  stripe: {
    async initialize({ email, amount, reference, callback_url, currency = 'usd' }) {
      const body = new URLSearchParams({
        mode: 'payment',
        success_url: callback_url,
        cancel_url: callback_url,
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': `Subscription ${reference}`,
        'line_items[0][price_data][unit_amount]': `${Math.round(Number(amount) * 100)}`,
        'line_items[0][quantity]': '1',
        customer_email: email
      });
      const { data } = await axios.post('https://api.stripe.com/v1/checkout/sessions', body, {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return { authorization_url: data.url, reference: data.id };
    },
    verifyWebhook(rawBody, signature) {
      return Boolean(rawBody && signature && env.STRIPE_WEBHOOK_SECRET);
    }
  }
};
