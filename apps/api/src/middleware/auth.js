import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/http.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return fail(res, 'Missing auth token', 401);

  try {
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch {
    return fail(res, 'Invalid auth token', 401);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return fail(res, 'Forbidden', 403);
    return next();
  };
}
