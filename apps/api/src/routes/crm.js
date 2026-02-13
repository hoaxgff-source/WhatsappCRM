import { Router } from 'express';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

router.get('/customers', async (req, res, next) => {
  try {
    const result = await query('select * from customers where organization_id = $1 order by created_at desc', [req.user.organizationId]);
    return ok(res, result.rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/customers', async (req, res, next) => {
  try {
    const { name, phone, email, status = 'new', tags = [] } = req.body;
    const result = await query(
      'insert into customers(organization_id, name, phone, email, status, tags) values ($1,$2,$3,$4,$5,$6) returning *',
      [req.user.organizationId, name, phone, email, status, tags]
    );
    return ok(res, result.rows[0], 201);
  } catch (error) {
    return next(error);
  }
});

router.post('/orders', async (req, res, next) => {
  try {
    const { customerId, amount, currency = 'NGN', stage = 'new' } = req.body;
    const result = await query(
      'insert into orders(organization_id, customer_id, amount, currency, stage) values($1,$2,$3,$4,$5) returning *',
      [req.user.organizationId, customerId, amount, currency, stage]
    );
    return ok(res, result.rows[0], 201);
  } catch (error) {
    return next(error);
  }
});

router.get('/kanban', async (req, res, next) => {
  try {
    const result = await query('select id, customer_id, amount, stage, created_at from orders where organization_id = $1', [req.user.organizationId]);
    return ok(res, result.rows);
  } catch (error) {
    return next(error);
  }
});

export default router;
