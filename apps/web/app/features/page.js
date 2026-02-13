export default function FeaturesPage() {
  const features = ['WhatsApp lead tracking', 'Kanban order board', 'Paystack/Flutterwave/Stripe billing', 'Automated reminders', 'AI smart replies', 'Admin analytics'];
  return <main className="container card"><h2>Features</h2><ul>{features.map((f) => <li key={f}>{f}</li>)}</ul></main>;
}
