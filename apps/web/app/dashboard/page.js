'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Loader from '../../components/Loader';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/api/admin/overview').then(setData); }, []);
  if (!data) return <Loader />;
  const d = data.data || {};
  return <main className="container grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}><section className="card"><h3>Users</h3><p>{d.users}</p></section><section className="card"><h3>Revenue</h3><p>{d.revenue}</p></section><section className="card"><h3>Plan</h3><p>{d.subscription?.plan}</p></section></main>;
}
