'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api('/api/admin/logs').then((r) => setLogs(r.data || [])); }, []);
  return <main className="container card"><h2>System Logs</h2>{logs.map((l)=><p key={l.id}>{l.level}: {l.message}</p>)}</main>;
}
