import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/client.js';
import { env } from '../config/env.js';
import { ok, fail } from '../utils/http.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { businessName, name, email, password } = req.body;
    if (!businessName || !name || !email || !password) return fail(res, 'Missing fields');

    const hash = await bcrypt.hash(password, 10);
    const orgResult = await query(
      `insert into organizations(name, plan, trial_ends_at) values ($1, 'starter', now() + interval '14 days') returning id`,
      [businessName]
    );
    const organizationId = orgResult.rows[0].id;

    const userResult = await query(
      'insert into users(organization_id, name, email, password_hash, role) values ($1,$2,$3,$4,$5) returning id, role',
      [organizationId, name, email, hash, 'admin']
    );

    const token = jwt.sign(
      { userId: userResult.rows[0].id, organizationId, role: 'admin', email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ok(res, { token, organizationId }, 201);
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query('select * from users where email = $1', [email]);
    const user = result.rows[0];
    if (!user) return fail(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return fail(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ok(res, { token });
  } catch (error) {
    return next(error);
  }
});

export default router;
