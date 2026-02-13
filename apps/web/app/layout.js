import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'WhatsApp Sales CRM' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bubbles">
        <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>WhatsApp CRM</strong>
          <div>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Login</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
