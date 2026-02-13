import Link from 'next/link';

export default function Home() {
  return (
    <main className="container grid" style={{ gap: '1.5rem' }}>
      <section className="card">
        <h1>Automated WhatsApp Sales CRM for African SMEs</h1>
        <p>Real payment integrations, subscription automation, WhatsApp messaging, and analytics.</p>
        <Link className="btn" href="/signup">Start Free Trial</Link>
      </section>
    </main>
  );
}
