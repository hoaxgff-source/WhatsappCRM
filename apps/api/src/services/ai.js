import axios from 'axios';
import { env } from '../config/env.js';

export async function generateSmartReply(context) {
  if (!env.OPENAI_API_KEY) {
    return 'Thanks for reaching out. We will send you available offers shortly.';
  }

  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a sales assistant for a WhatsApp CRM SaaS.' },
        { role: 'user', content: context }
      ],
      temperature: 0.3
    },
    { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } }
  );

  return data.choices?.[0]?.message?.content || 'Could you share more details about your request?';
}
