'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } else setMsg(res.message);
  }

  return <main className="container card"><h2>Login</h2><form onSubmit={submit} className="grid"><input placeholder="Email" onChange={(e)=>setForm({ ...form, email: e.target.value})}/><input type="password" placeholder="Password" onChange={(e)=>setForm({ ...form, password: e.target.value})}/><button className="btn">Login</button></form><p>{msg}</p></main>;
}
