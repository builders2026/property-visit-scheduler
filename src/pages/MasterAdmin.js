import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const s = {
  title: { color: '#e2b96f', fontSize: '22px', fontWeight: '700', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: (active) => ({
    padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#e2b96f' : 'rgba(255,255,255,0.08)',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
    fontWeight: active ? '700' : '400', fontSize: '13px',
  }),
  card: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', padding: '20px', marginBottom: '12px',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  name: { color: '#fff', fontWeight: '600', fontSize: '15px' },
  detail: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '12px',
  },
  btn: (color = '#e2b96f') => ({
    padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: color, color: color === '#e2b96f' ? '#1a1a2e' : '#fff',
    fontWeight: '700', fontSize: '13px',
  }),
  delBtn: {
    padding: '6px 12px', borderRadius: '6px', border: '1px solid #e74c3c',
    background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: '12px',
  },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' },
  statCard: (c) => ({
    background: `rgba(${c},0.15)`, border: `1px solid rgba(${c},0.3)`,
    borderRadius: '12px', padding: '16px', textAlign: 'center',
  }),
  statNum: { color: '#fff', fontSize: '28px', fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px', fontSize: '14px' },
  badge: (status) => ({
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
    background: status === 'approved' ? 'rgba(46,204,113,0.2)' : status === 'rejected' ? 'rgba(231,76,60,0.2)' : 'rgba(226,185,111,0.2)',
    color: status === 'approved' ? '#2ecc71' : status === 'rejected' ? '#e74c3c' : '#e2b96f',
  }),
  formBox: {
    background: 'rgba(226,185,111,0.08)', border: '1px solid rgba(226,185,111,0.2)',
    borderRadius: '14px', padding: '20px', marginBottom: '20px',
  },
  formTitle: { color: '#e2b96f', fontWeight: '600', fontSize: '15px', marginBottom: '16px' },
};

export default function MasterAdmin() {
  const [tab, setTab] = useState('builders');
  const [builders, setBuilders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [b, l, si] = await Promise.all([
      supabase.from('builders').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*, sites(name), builders(name)').order('created_at', { ascending: false }),
      supabase.from('sites').select('*, builders(name)').order('created_at', { ascending: false }),
    ]);
    setBuilders(b.data || []);
    setLeads(l.data || []);
    setSites(si.data || []);
    setLoading(false);
  };

  const createBuilder = async () => {
    if (!form.name || !form.email || !form.password) { setMsg('⚠️ Badha fields bharо'); return; }
    const { error } = await supabase.from('builders').insert([form]);
    if (error) { setMsg('❌ ' + error.message); return; }
    setMsg('✅ Builder create thayu!');
    setForm({ name: '', email: '', password: '' });
    fetchAll();
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteBuilder = async (id) => {
    if (!window.confirm('Builder delete karvo? Tena badha sites ane leads pan delete thashе.')) return;
    await supabase.from('builders').delete().eq('id', id);
    fetchAll();
  };

  const updateLeadStatus = async (id, status) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchAll();
  };

  return (
    <div>
      <div style={s.title}>👑 Master Admin Panel</div>

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.statCard('226,185,111')}>
          <div style={s.statNum}>{builders.length}</div>
          <div style={s.statLabel}>Total Builders</div>
        </div>
        <div style={s.statCard('52,152,219')}>
          <div style={s.statNum}>{sites.length}</div>
          <div style={s.statLabel}>Total Sites</div>
        </div>
        <div style={s.statCard('46,204,113')}>
          <div style={s.statNum}>{leads.length}</div>
          <div style={s.statLabel}>Total Leads</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(tab === 'builders')} onClick={() => setTab('builders')}>🏗️ Builders ({builders.length})</button>
        <button style={s.tab(tab === 'sites')} onClick={() => setTab('sites')}>🏘️ All Sites ({sites.length})</button>
        <button style={s.tab(tab === 'leads')} onClick={() => setTab('leads')}>📋 All Leads ({leads.length})</button>
      </div>

      {/* Builders Tab */}
      {tab === 'builders' && (
        <>
          <div style={s.formBox}>
            <div style={s.formTitle}>➕ Navo Builder Create Karo</div>
            <input style={s.input} placeholder="Builder nu naam..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input style={s.input} placeholder="Email..." type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input style={s.input} placeholder="Password..." type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button style={s.btn()} onClick={createBuilder}>✅ Builder Create Karo</button>
            {msg && <div style={{ color: msg.includes('✅') ? '#2ecc71' : '#e74c3c', marginTop: '10px', fontSize: '13px' }}>{msg}</div>}
          </div>

          {loading ? <div style={s.empty}>⏳ Loading...</div> :
            builders.length === 0 ? <div style={s.empty}>📭 Koi builder nathi.</div> :
            builders.map(b => (
              <div key={b.id} style={s.card}>
                <div style={s.row}>
                  <div>
                    <div style={s.name}>🏗️ {b.name}</div>
                    <div style={s.detail}>📧 {b.email} | 🔑 {b.password}</div>
                    <div style={s.detail}>
                      Sites: {sites.filter(si => si.builder_id === b.id).length} &nbsp;|&nbsp;
                      Leads: {leads.filter(l => l.builder_id === b.id).length}
                    </div>
                  </div>
                  <button style={s.delBtn} onClick={() => deleteBuilder(b.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* Sites Tab */}
      {tab === 'sites' && (
        loading ? <div style={s.empty}>⏳ Loading...</div> :
        sites.length === 0 ? <div style={s.empty}>📭 Koi sites nathi.</div> :
        sites.map(si => (
          <div key={si.id} style={s.card}>
            <div style={s.name}>🏘️ {si.name}</div>
            <div style={s.detail}>📍 {si.location || 'No location'}</div>
            <div style={s.detail}>Builder: {si.builders?.name || '-'}</div>
          </div>
        ))
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        loading ? <div style={s.empty}>⏳ Loading...</div> :
        leads.length === 0 ? <div style={s.empty}>📭 Koi leads nathi.</div> :
        leads.map(l => (
          <div key={l.id} style={s.card}>
            <div style={s.row}>
              <div>
                <div style={s.name}>👤 {l.visitor_name}</div>
                <div style={s.detail}>📱 {l.phone} | 📅 {l.visit_date} | ⏰ {l.visit_time}</div>
                <div style={s.detail}>🏘️ {l.sites?.name || '-'} | Builder: {l.builders?.name || '-'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <span style={s.badge(l.status)}>{l.status === 'approved' ? '✅ Approved' : l.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ ...s.delBtn, borderColor: '#2ecc71', color: '#2ecc71' }} onClick={() => updateLeadStatus(l.id, 'approved')}>✅</button>
                  <button style={s.delBtn} onClick={() => updateLeadStatus(l.id, 'rejected')}>❌</button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
