import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc
} from 'firebase/firestore';

// Simple password protection — Firebase Auth vapsro to better raheshe
const ADMIN_PASSWORD = 'admin123'; // Change this!

const styles = {
  container: { maxWidth: '780px', margin: '0 auto' },
  loginBox: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '380px',
    margin: '60px auto',
    textAlign: 'center',
  },
  loginIcon: { fontSize: '48px', marginBottom: '16px' },
  loginTitle: { color: '#e2b96f', fontSize: '20px', fontWeight: '700', marginBottom: '8px' },
  loginSub: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '24px' },
  input: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    marginBottom: '12px',
  },
  btn: (color = '#e2b96f') => ({
    background: color,
    color: color === '#e2b96f' ? '#1a1a2e' : '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  }),
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: { color: '#e2b96f', fontSize: '22px', fontWeight: '700' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: (color) => ({
    background: `rgba(${color}, 0.15)`,
    border: `1px solid rgba(${color}, 0.3)`,
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'center',
  }),
  statNum: { fontSize: '28px', fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '10px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' },
  name: { color: '#fff', fontWeight: '600', fontSize: '15px' },
  detail: { color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: '1.7', marginTop: '4px' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  actionBtn: (color) => ({
    padding: '7px 14px',
    borderRadius: '8px',
    border: `1px solid ${color}`,
    background: 'transparent',
    color: color,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s',
  }),
  badge: (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: status === 'approved' ? 'rgba(46,204,113,0.2)' :
                status === 'rejected' ? 'rgba(231,76,60,0.2)' :
                'rgba(226,185,111,0.2)',
    color: status === 'approved' ? '#2ecc71' :
           status === 'rejected' ? '#e74c3c' : '#e2b96f',
  }),
  filterRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filterBtn: (active) => ({
    padding: '7px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: active ? '#e2b96f' : 'transparent',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
  }),
  empty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, 'visits'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [authed]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('❌ Wrong password!');
    }
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'visits', id), { status });
  };

  const deleteVisit = async (id) => {
    if (window.confirm('Delete karvo chhe?')) {
      await deleteDoc(doc(db, 'visits', id));
    }
  };

  const sendWhatsApp = (v, message) => {
    const msg = encodeURIComponent(
      `Namaste ${v.name}! 🏢\n\n${message}\n\n📅 ${v.date} | ⏰ ${v.time}\n🏘️ ${v.property}\n\n_PropVisit Team_`
    );
    window.open(`https://wa.me/91${v.phone}?text=${msg}`, '_blank');
  };

  if (!authed) {
    return (
      <div style={styles.loginBox}>
        <div style={styles.loginIcon}>🔐</div>
        <div style={styles.loginTitle}>Admin Login</div>
        <div style={styles.loginSub}>Admin panel access mate password nakhso</div>
        <input
          style={styles.input}
          type="password"
          placeholder="Password..."
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        {error && <div style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
        <button style={styles.btn()} onClick={login}>🔓 Login</button>
      </div>
    );
  }

  const filtered = filter === 'all' ? visits : visits.filter(v => (v.status || 'pending') === filter);
  const counts = {
    all: visits.length,
    pending: visits.filter(v => !v.status || v.status === 'pending').length,
    approved: visits.filter(v => v.status === 'approved').length,
    rejected: visits.filter(v => v.status === 'rejected').length,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🔐 Admin Panel</div>
        <button style={{ ...styles.btn('#e74c3c'), width: 'auto', padding: '8px 16px' }} onClick={() => setAuthed(false)}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard('226,185,111')}>
          <div style={styles.statNum}>{counts.all}</div>
          <div style={styles.statLabel}>Total Visits</div>
        </div>
        <div style={styles.statCard('46,204,113')}>
          <div style={styles.statNum}>{counts.approved}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={styles.statCard('231,76,60')}>
          <div style={styles.statNum}>{counts.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === 'all' ? `📋 All (${counts.all})` :
             f === 'pending' ? `⏳ Pending (${counts.pending})` :
             f === 'approved' ? `✅ Approved (${counts.approved})` :
             `❌ Rejected (${counts.rejected})`}
          </button>
        ))}
      </div>

      {loading && <div style={styles.empty}>⏳ Loading...</div>}
      {!loading && filtered.length === 0 && <div style={styles.empty}>📭 Koi visits nahi.</div>}

      {filtered.map(v => (
        <div key={v.id} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.name}>👤 {v.name}</div>
              <div style={styles.detail}>
                📱 {v.phone}<br />
                📅 {v.date} &nbsp;⏰ {v.time}<br />
                🏘️ {v.property}
              </div>
            </div>
            <span style={styles.badge(v.status || 'pending')}>
              {v.status === 'approved' ? '✅ Approved' :
               v.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
            </span>
          </div>

          <div style={styles.actions}>
            <button style={styles.actionBtn('#2ecc71')} onClick={() => {
              updateStatus(v.id, 'approved');
              sendWhatsApp(v, 'Tamari property visit *confirm* thai gayi chhe! 🎉 Please samaye par aavjo.');
            }}>✅ Approve & WhatsApp</button>

            <button style={styles.actionBtn('#e74c3c')} onClick={() => {
              updateStatus(v.id, 'rejected');
              sendWhatsApp(v, 'Maafi kharva, tamari requested visit slot available nathi. Please baijo slot choose karo.');
            }}>❌ Reject & WhatsApp</button>

            <button style={styles.actionBtn('#3498db')} onClick={() =>
              sendWhatsApp(v, 'Tamari visit ni yaad dilaavvu chhe! Kal samaye par aavjo.')
            }>📲 Reminder</button>

            <button style={styles.actionBtn('#e74c3c')} onClick={() => deleteVisit(v.id)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
