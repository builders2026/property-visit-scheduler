import React, { useState } from 'react';
import Chatbot from './pages/Chatbot';
import AdminPanel from './pages/AdminPanel';
import VisitsList from './pages/VisitsList';

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
  logo: {
    color: '#e2b96f',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    fontWeight: '400',
    display: 'block',
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: (active) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    background: active ? '#e2b96f' : 'transparent',
    color: active ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
  }),
  content: {
    padding: '32px 16px',
    maxWidth: '900px',
    margin: '0 auto',
  },
};

export default function App() {
  const [page, setPage] = useState('book');

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div>
          <span style={styles.logo}>🏢 PropVisit</span>
          <span style={styles.logoSub}>Property Visit Scheduler</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.navBtn(page === 'book')} onClick={() => setPage('book')}>
            📅 Book Visit
          </button>
          <button style={styles.navBtn(page === 'visits')} onClick={() => setPage('visits')}>
            📋 My Visits
          </button>
          <button style={styles.navBtn(page === 'admin')} onClick={() => setPage('admin')}>
            🔐 Admin
          </button>
        </div>
      </nav>
      <div style={styles.content}>
        {page === 'book' && <Chatbot />}
        {page === 'visits' && <VisitsList />}
        {page === 'admin' && <AdminPanel />}
      </div>
    </div>
  );
}
