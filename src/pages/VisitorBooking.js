import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';

const TIME_SLOTS = ['10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

const s = {
  container: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
    maxWidth: '680px', margin: '0 auto',
  },
  header: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)',
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px',
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '22px',
  },
  headerTitle: { color: '#1a1a2e', fontWeight: '700', fontSize: '16px' },
  headerSub: { color: 'rgba(26,26,46,0.7)', fontSize: '12px' },
  messages: {
    padding: '20px', minHeight: '350px', maxHeight: '400px',
    overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  botMsg: {
    background: 'rgba(255,255,255,0.08)', color: '#fff',
    padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
    maxWidth: '85%', fontSize: '14px', lineHeight: '1.6',
  },
  userMsg: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)', color: '#1a1a2e',
    padding: '12px 16px', borderRadius: '16px 16px 4px 16px',
    maxWidth: '85%', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-end',
  },
  inputArea: {
    padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  input: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px',
    outline: 'none', width: '100%',
  },
  sendBtn: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)', color: '#1a1a2e',
    border: 'none', borderRadius: '10px', padding: '12px 24px',
    fontWeight: '700', cursor: 'pointer', fontSize: '14px',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  optBtn: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(226,185,111,0.4)',
    borderRadius: '10px', padding: '10px 12px', color: '#e2b96f',
    cursor: 'pointer', fontSize: '13px', textAlign: 'left',
  },
};

const STEPS = ['name', 'phone', 'site', 'date', 'time', 'confirm'];

export default function VisitorBooking() {
  const [messages, setMessages] = useState([{ from: 'bot', text: '👋 Namaste! Maro naam PropVisit Assistant chhe.\n\nApnu puru naam nakhso please:' }]);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', phone: '', site_id: '', site_name: '', date: '', time: '' });
  const [inputVal, setInputVal] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    supabase.from('sites').select('*, builders(name, id)').then(({ data }) => setSites(data || []));
  }, []);

  const addMsg = (from, text) => setMessages(p => [...p, { from, text }]);

  const next = (newData, botMsg, nextStep) => {
    setData(p => ({ ...p, ...newData }));
    setTimeout(() => { addMsg('bot', botMsg); setStep(nextStep); }, 400);
  };

  const handleText = () => {
    const val = inputVal.trim();
    if (!val) return;
    const cur = STEPS[step];
    if (cur === 'name') {
      addMsg('user', val);
      setInputVal('');
      next({ name: val }, '📱 Saru! Havan apno WhatsApp number nakhso (10 digit):', 1);
    } else if (cur === 'phone') {
      const digits = val.replace(/\D/g, '');
      if (digits.length < 10) { addMsg('bot', '⚠️ Valid 10-digit number nakhso.'); return; }
      addMsg('user', val);
      setInputVal('');
      next({ phone: digits }, '🏘️ Koi property visit karvi chhe? Select karo:', 2);
    } else if (cur === 'date') {
      addMsg('user', val);
      setInputVal('');
      next({ date: val }, '⏰ Kaya samaye avaso?', 4);
    }
  };

  const selectSite = (site) => {
    addMsg('user', site.name);
    next({ site_id: site.id, site_name: site.name, builder_id: site.builders?.id }, '📅 Visit ni tarikh nakhso (YYYY-MM-DD):\n\nExample: 2025-07-20', 3);
  };

  const selectTime = (time) => {
    addMsg('user', time);
    const updated = { ...data, time };
    setData(updated);
    setTimeout(() => {
      addMsg('bot', `✅ Confirm karo:\n\n👤 ${updated.name}\n📱 ${updated.phone}\n🏘️ ${updated.site_name}\n📅 ${updated.date}\n⏰ ${time}\n\nBook karvu?`);
      setStep(5);
    }, 400);
  };

  const confirm = async () => {
    setLoading(true);
    const selectedSite = sites.find(si => si.id === data.site_id);
    const { error } = await supabase.from('leads').insert([{
      visitor_name: data.name,
      phone: data.phone,
      site_id: data.site_id,
      builder_id: selectedSite?.builder_id || selectedSite?.builders?.id,
      visit_date: data.date,
      visit_time: data.time,
      status: 'pending',
    }]);
    if (error) { addMsg('bot', '❌ Error: ' + error.message); setLoading(false); return; }
    addMsg('user', '✅ Haa, Book Karo!');
    setTimeout(() => {
      addMsg('bot', `🎉 Visit successfully book thai gayi!\n\n${data.site_name} par ${data.date} na ${data.time} vage.\n\nBuilder tamane confirm kareshе.`);
      setDone(true);
    }, 400);
    setLoading(false);
  };

  const restart = () => {
    setMessages([{ from: 'bot', text: '👋 Namaste! Maro naam PropVisit Assistant chhe.\n\nApnu puru naam nakhso please:' }]);
    setStep(0); setData({ name: '', phone: '', site_id: '', site_name: '', date: '', time: '' });
    setInputVal(''); setDone(false);
  };

  const cur = STEPS[step];
  const showText = ['name', 'phone', 'date'].includes(cur);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.avatar}>🤖</div>
        <div>
          <div style={s.headerTitle}>PropVisit Assistant</div>
          <div style={s.headerSub}>● Online — Visit book karo easily</div>
        </div>
      </div>

      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={m.from === 'bot' ? s.botMsg : s.userMsg}>
            {m.text.split('\n').map((line, j, arr) => (
              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
            ))}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={s.inputArea}>
        {!done && cur === 'site' && (
          <div style={s.grid}>
            {sites.length === 0 ? <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>⏳ Sites load thai rahi chhe...</div> :
              sites.map(si => (
                <button key={si.id} style={s.optBtn} onClick={() => selectSite(si)}>
                  🏘️ {si.name}<br />
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>📍 {si.location || 'No location'}</span>
                </button>
              ))
            }
          </div>
        )}

        {!done && cur === 'time' && (
          <div style={s.grid}>
            {TIME_SLOTS.map(t => (
              <button key={t} style={s.optBtn} onClick={() => selectTime(t)}>⏰ {t}</button>
            ))}
          </div>
        )}

        {!done && cur === 'confirm' && (
          <>
            <button style={s.sendBtn} onClick={confirm} disabled={loading}>
              {loading ? '⏳ Saving...' : '✅ Confirm & Book Visit'}
            </button>
            <button style={{ ...s.sendBtn, background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={restart}>
              🔄 Navo Visit Book Karo
            </button>
          </>
        )}

        {!done && showText && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={s.input} value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleText()}
              placeholder={cur === 'name' ? 'Tamaru naam...' : cur === 'phone' ? '10-digit number...' : 'YYYY-MM-DD...'}
            />
            <button style={s.sendBtn} onClick={handleText}>Send</button>
          </div>
        )}

        {done && <button style={s.sendBtn} onClick={restart}>🔄 Ek Vaar Vadhu Book Karo</button>}
      </div>
    </div>
  );
}
