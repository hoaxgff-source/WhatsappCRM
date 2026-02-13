import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateSmartReply } from '../services/ai.js';
import { ok } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

router.post('/smart-reply', async (req, res, next) => {
  try {
    const { context } = req.body;
    const reply = await generateSmartReply(context);
    return ok(res, { reply });
  } catch (error) {
    return next(error);
  }
});

export default router;
