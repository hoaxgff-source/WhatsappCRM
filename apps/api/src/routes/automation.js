import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../db/client.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';
import { ok } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

router.post('/followups', async (req, res, next) => {
  try {
    const { customerId, message, sendAt } = req.body;
    const result = await query(
      'insert into followups(organization_id, customer_id, message, send_at, status) values($1,$2,$3,$4,$5) returning *',
      [req.user.organizationId, customerId, message, sendAt, 'scheduled']
    );
    return ok(res, result.rows[0], 201);
  } catch (error) {
    return next(error);
  }
});

router.post('/send-now', async (req, res, next) => {
  try {
    const { phone, text } = req.body;
    const resp = await sendWhatsAppMessage({ to: phone, text });
    return ok(res, resp);
  } catch (error) {
    return next(error);
  }
});

export default router;
