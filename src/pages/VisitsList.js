import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const styles = {
  container: { maxWidth: '680px', margin: '0 auto' },
  title: {
    color: '#e2b96f',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '18px 20px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: '16px', marginBottom: '4px' },
  detail: { color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: '1.6' },
  badge: (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: status === 'approved' ? 'rgba(46,204,113,0.2)' :
                status === 'rejected' ? 'rgba(231,76,60,0.2)' :
                'rgba(226,185,111,0.2)',
    color: status === 'approved' ? '#2ecc71' :
           status === 'rejected' ? '#e74c3c' :
           '#e2b96f',
    border: `1px solid ${status === 'approved' ? '#2ecc71' : status === 'rejected' ? '#e74c3c' : '#e2b96f'}`,
  }),
  empty: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '15px',
  },
  searchInput: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '10px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    marginBottom: '16px',
  },
};

export default function VisitsList() {
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'visits'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = visits.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search) ||
    v.property?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.title}>📋 Scheduled Visits</div>

      <input
        style={styles.searchInput}
        placeholder="🔍 Naam, phone, ya property thi search karo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading && <div style={styles.empty}>⏳ Loading visits...</div>}

      {!loading && filtered.length === 0 && (
        <div style={styles.empty}>
          {search ? '🔍 Koi visit mili nahi.' : '📭 Haju koi visit book nathi thai.'}
        </div>
      )}

      {filtered.map(v => (
        <div key={v.id} style={styles.card}>
          <div style={styles.info}>
            <div style={styles.name}>👤 {v.name}</div>
            <div style={styles.detail}>
              📱 {v.phone} &nbsp;|&nbsp; 📅 {v.date} &nbsp;|&nbsp; ⏰ {v.time}
            </div>
            <div style={{ ...styles.detail, marginTop: '4px' }}>
              🏘️ {v.property}
            </div>
          </div>
          <span style={styles.badge(v.status || 'pending')}>
            {v.status === 'approved' ? '✅ Approved' :
             v.status === 'rejected' ? '❌ Rejected' :
             '⏳ Pending'}
          </span>
        </div>
      ))}
    </div>
  );
}
