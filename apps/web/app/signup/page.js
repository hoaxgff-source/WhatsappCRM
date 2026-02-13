'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function SignupPage() {
  const [form, setForm] = useState({ businessName: '', name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    const res = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) });
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } else setMsg(res.message || 'Error');
  }

  return <main className="container card"><h2>Start Free Trial</h2><form onSubmit={submit} className="grid">{['businessName','name','email','password'].map((k)=><input key={k} type={k==='password'?'password':'text'} placeholder={k} onChange={(e)=>setForm({ ...form, [k]: e.target.value })}/>)}<button className="btn">Create Account</button></form><p>{msg}</p></main>;
}
