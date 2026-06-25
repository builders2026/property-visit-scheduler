import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const s = {
  title: { color: '#e2b96f', fontSize: '22px', fontWeight: '700', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: (active) => ({
    padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#e2b96f' : 'rgba(255,255,255,0.08)',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
    fontWeight: active ? '700' : '400', fontSize: '13px',
  }),
  card: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', padding: '18px 20px', marginBottom: '12px',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  name: { color: '#fff', fontWeight: '600', fontSize: '15px' },
  detail: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px', lineHeight: '1.6' },
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
  linkBox: {
    background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '10px', padding: '12px 16px', marginTop: '8px',
    color: '#3498db', fontSize: '13px', wordBreak: 'break-all',
  },
};

export default function BuilderDashboard({ builder }) {
  const [tab, setTab] = useState('sites');
  const [sites, setSites] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', location: '' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [si, l] = await Promise.all([
      supabase.from('sites').select('*').eq('builder_id', builder.id).order('created_at', { ascending: false }),
      supabase.from('leads').select('*, sites(name)').eq('builder_id', builder.id).order('created_at', { ascending: false }),
    ]);
    setSites(si.data || []);
    setLeads(l.data || []);
    setLoading(false);
  };

  const createSite = async () => {
    if (!form.name) { setMsg('⚠️ Site nu naam nakhso'); return; }
    const { error } = await supabase.from('sites').insert([{ ...form, builder_id: builder.id }]);
    if (error) { setMsg('❌ ' + error.message); return; }
    setMsg('✅ Site create thayi!');
    setForm({ name: '', location: '' });
    fetchAll();
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteSite = async (id) => {
    if (!window.confirm('Site delete karvo? Tena leads pan delete thashе.')) return;
    await supabase.from('sites').delete().eq('id', id);
    fetchAll();
  };

  const updateStatus = async (id, status, lead) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    if (lead?.phone) {
      const msg = status === 'approved'
        ? `Namaste ${lead.visitor_name}! Tamari visit confirm thai chhe. 📅 ${lead.visit_date} ⏰ ${lead.visit_time} - ${lead.sites?.name}`
        : `Namaste ${lead.visitor_name}! Maafi kharva, tamari visit available nathi. Please baijo slot try karo.`;
      window.open(`https://wa.me/91${lead.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    fetchAll();
  };

  const getSiteBookingLink = (siteId) => {
    return `${window.location.origin}?site=${siteId}`;
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => (l.status || 'pending') === filter);
  const pendingCount = leads.filter(l => !l.status || l.status === 'pending').length;

  return (
    <div>
      <div style={s.title}>🏗️ {builder.name} - Dashboard</div>

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.statCard('226,185,111')}>
          <div style={s.statNum}>{sites.length}</div>
          <div style={s.statLabel}>My Sites</div>
        </div>
        <div style={s.statCard('52,152,219')}>
          <div style={s.statNum}>{leads.length}</div>
          <div style={s.statLabel}>Total Leads</div>
        </div>
        <div style={s.statCard('231,76,60')}>
          <div style={s.statNum}>{pendingCount}</div>
          <div style={s.statLabel}>Pending</div>
        </div>
      </div>

      <div style={s.tabs}>
        <button style={s.tab(tab === 'sites')} onClick={() => setTab('sites')}>🏘️ My Sites ({sites.length})</button>
        <button style={s.tab(tab === 'leads')} onClick={() => setTab('leads')}>📋 Leads ({leads.length})</button>
      </div>

      {/* Sites Tab */}
      {tab === 'sites' && (
        <>
          <div style={s.formBox}>
            <div style={s.formTitle}>➕ Navi Site Add Karo</div>
            <input style={s.input} placeholder="Site/Property nu naam..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input style={s.input} placeholder="Location (optional)..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <button style={s.btn()} onClick={createSite}>✅ Site Add Karo</button>
            {msg && <div style={{ color: msg.includes('✅') ? '#2ecc71' : '#e74c3c', marginTop: '10px', fontSize: '13px' }}>{msg}</div>}
          </div>

          {loading ? <div style={s.empty}>⏳ Loading...</div> :
            sites.length === 0 ? <div style={s.empty}>📭 Koi sites nathi. Upar thi add karo!</div> :
            sites.map(si => (
              <div key={si.id} style={s.card}>
                <div style={s.row}>
                  <div style={{ flex: 1 }}>
                    <div style={s.name}>🏘️ {si.name}</div>
                    <div style={s.detail}>📍 {si.location || 'No location'}</div>
                    <div style={s.detail}>Leads: {leads.filter(l => l.site_id === si.id).length}</div>
                    <div style={s.linkBox}>
                      🔗 Booking Link:<br />
                      <span>{getSiteBookingLink(si.id)}</span>
                      <button onClick={() => { navigator.clipboard.writeText(getSiteBookingLink(si.id)); }}
                        style={{ marginLeft: '8px', background: 'transparent', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '12px' }}>
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  <button style={s.delBtn} onClick={() => deleteSite(si.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button key={f} style={s.tab(filter === f)} onClick={() => setFilter(f)}>
                {f === 'all' ? `All (${leads.length})` : f === 'pending' ? `⏳ Pending (${pendingCount})` : f === 'approved' ? `✅ Approved` : `❌ Rejected`}
              </button>
            ))}
          </div>

          {loading ? <div style={s.empty}>⏳ Loading...</div> :
            filteredLeads.length === 0 ? <div style={s.empty}>📭 Koi leads nathi.</div> :
            filteredLeads.map(l => (
              <div key={l.id} style={s.card}>
                <div style={s.row}>
                  <div>
                    <div style={s.name}>👤 {l.visitor_name}</div>
                    <div style={s.detail}>📱 {l.phone}<br />📅 {l.visit_date} | ⏰ {l.visit_time}<br />🏘️ {l.sites?.name || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <span style={s.badge(l.status || 'pending')}>
                      {l.status === 'approved' ? '✅ Approved' : l.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ ...s.delBtn, borderColor: '#2ecc71', color: '#2ecc71' }}
                        onClick={() => updateStatus(l.id, 'approved', l)}>✅ Approve</button>
                      <button style={s.delBtn} onClick={() => updateStatus(l.id, 'rejected', l)}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}
