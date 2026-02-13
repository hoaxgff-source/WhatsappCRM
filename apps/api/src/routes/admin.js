import { Router } from 'express';
import { query } from '../db/client.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ok } from '../utils/http.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/overview', async (req, res, next) => {
  try {
    const [users, revenue, subscriptions] = await Promise.all([
      query('select count(*) from users where organization_id = $1', [req.user.organizationId]),
      query("select coalesce(sum(amount),0) as total from payments where organization_id = $1 and status = 'paid'", [req.user.organizationId]),
      query('select subscription_status, subscription_ends_at, plan from organizations where id = $1', [req.user.organizationId])
    ]);

    return ok(res, {
      users: Number(users.rows[0].count),
      revenue: Number(revenue.rows[0].total),
      subscription: subscriptions.rows[0]
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const logs = await query('select * from system_logs where organization_id = $1 order by created_at desc limit 100', [req.user.organizationId]);
    return ok(res, logs.rows);
  } catch (error) {
    return next(error);
  }
});

export default router;
