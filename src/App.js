import React, { useState } from 'react';
import MasterAdmin from './pages/MasterAdmin';
import BuilderDashboard from './pages/BuilderDashboard';
import VisitorBooking from './pages/VisitorBooking';
import Login from './pages/Login';

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Inter', sans-serif",
  },
  nav: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: { color: '#e2b96f', fontSize: '20px', fontWeight: '700' },
  logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', display: 'block' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  roleTag: {
    background: 'rgba(226,185,111,0.2)',
    color: '#e2b96f',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'rgba(231,76,60,0.2)',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  content: { padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' },
  navLinks: { display: 'flex', gap: '8px' },
  navBtn: (active) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    background: active ? '#e2b96f' : 'transparent',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
  }),
};

export default function App() {
  const [user, setUser] = useState(null); // { role: 'master'|'builder', data: {...} }
  const [page, setPage] = useState('book');

  const logout = () => { setUser(null); setPage('book'); };

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div>
          <span style={styles.logo}>🏢 PropVisit</span>
          <span style={styles.logoSub}>Property Visit Scheduler</span>
        </div>

        <div style={styles.navLinks}>
          <button style={styles.navBtn(page === 'book')} onClick={() => setPage('book')}>📅 Book Visit</button>
          {!user && <button style={styles.navBtn(page === 'login')} onClick={() => setPage('login')}>🔐 Login</button>}
          {user?.role === 'master' && (
            <button style={styles.navBtn(page === 'master')} onClick={() => setPage('master')}>⚙️ Master Admin</button>
          )}
          {user?.role === 'builder' && (
            <button style={styles.navBtn(page === 'builder')} onClick={() => setPage('builder')}>📊 My Dashboard</button>
          )}
        </div>

        <div style={styles.navRight}>
          {user && (
            <>
              <span style={styles.roleTag}>
                {user.role === 'master' ? '👑 Master Admin' : `🏗️ ${user.data.name}`}
              </span>
              <button style={styles.logoutBtn} onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <div style={styles.content}>
        {page === 'book' && <VisitorBooking />}
        {page === 'login' && !user && <Login onLogin={(u) => { setUser(u); setPage(u.role === 'master' ? 'master' : 'builder'); }} />}
        {page === 'master' && user?.role === 'master' && <MasterAdmin />}
        {page === 'builder' && user?.role === 'builder' && <BuilderDashboard builder={user.data} />}
      </div>
    </div>
  );
}
