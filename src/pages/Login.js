import React, { useState } from 'react';
import { supabase } from '../supabase';

const s = {
  wrap: { maxWidth: '400px', margin: '40px auto' },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
  },
  title: { color: '#e2b96f', fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', marginBottom: '28px' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '16px',
  },
  btn: {
    width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)',
    color: '#1a1a2e', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
  },
  err: { color: '#e74c3c', fontSize: '13px', textAlign: 'center', marginTop: '12px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: (active) => ({
    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#e2b96f' : 'rgba(255,255,255,0.08)',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
    fontWeight: active ? '700' : '400', fontSize: '13px',
  }),
};

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('builder'); // 'master' | 'builder'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'master') {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();
        if (error || !data) { setError('❌ Wrong email or password'); setLoading(false); return; }
        onLogin({ role: 'master', data });
      } else {
        const { data, error } = await supabase
          .from('builders')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();
        if (error || !data) { setError('❌ Wrong email or password'); setLoading(false); return; }
        onLogin({ role: 'builder', data });
      }
    } catch (e) {
      setError('❌ Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>🔐 Login</div>
        <div style={s.sub}>Apna account select karo</div>

        <div style={s.tabs}>
          <button style={s.tab(tab === 'builder')} onClick={() => setTab('builder')}>🏗️ Builder</button>
          <button style={s.tab(tab === 'master')} onClick={() => setTab('master')}>👑 Master Admin</button>
        </div>

        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />

        <label style={s.label}>Password</label>
        <input style={s.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="Password..." />

        <button style={s.btn} onClick={handleLogin} disabled={loading}>
          {loading ? '⏳ Logging in...' : '🔓 Login'}
        </button>

        {error && <div style={s.err}>{error}</div>}

        {tab === 'master' && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
            Default: admin@propvisit.com / admin123
          </div>
        )}
      </div>
    </div>
  );
}
