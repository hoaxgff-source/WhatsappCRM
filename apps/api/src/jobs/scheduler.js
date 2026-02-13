import cron from 'node-cron';
import { query } from '../db/client.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';
import { sendMail } from '../services/email.js';

export function startSchedulers() {
  cron.schedule('*/2 * * * *', async () => {
    const followups = await query(
      "select f.id, f.message, c.phone, c.email from followups f join customers c on c.id = f.customer_id where f.status = 'scheduled' and f.send_at <= now() limit 50"
    );

    for (const item of followups.rows) {
      try {
        await sendWhatsAppMessage({ to: item.phone, text: item.message });
        await query("update followups set status = 'sent', sent_at = now() where id = $1", [item.id]);
      } catch {
        await query("update followups set status = 'failed' where id = $1", [item.id]);
      }
    }
  });

  cron.schedule('0 * * * *', async () => {
    const expired = await query(
      "update organizations set subscription_status = 'expired', plan='starter' where subscription_ends_at is not null and subscription_ends_at < now() and subscription_status != 'expired' returning id, name"
    );

    for (const org of expired.rows) {
      await query('insert into system_logs(organization_id, level, message) values($1,$2,$3)', [org.id, 'warn', 'Subscription expired; plan downgraded']);
      const admins = await query("select email from users where organization_id=$1 and role='admin'", [org.id]);
      await Promise.all(admins.rows.map((a) => sendMail({ to: a.email, subject: 'Subscription expired', html: '<p>Your account has been downgraded to Starter.</p>' })));
    }
  });
}
