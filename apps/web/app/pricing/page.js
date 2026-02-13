export default function PricingPage() {
  return (
    <main className="container grid cols-3" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
      {[
        ['Starter', '₦12,000/mo'],
        ['Pro', '₦35,000/mo'],
        ['Business', '₦95,000/mo']
      ].map(([name, price]) => (
        <section key={name} className="card"><h3>{name}</h3><p>{price}</p></section>
      ))}
    </main>
  );
}
