import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// WhatsApp send karo - owner nu number yahan nakhvo
const OWNER_PHONE = '919876543210'; // Replace with actual owner's WhatsApp number (country code + number)

const STEPS = ['name', 'phone', 'property', 'date', 'time', 'confirm'];

const PROPERTIES = [
  { id: 'prop1', label: '🏠 Shyamal Road - 3BHK Apartment' },
  { id: 'prop2', label: '🏢 SG Highway - Commercial Office' },
  { id: 'prop3', label: '🏡 Bopal - 4BHK Villa' },
  { id: 'prop4', label: '🏗️ Prahlad Nagar - Under Construction Plot' },
];

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    maxWidth: '680px',
    margin: '0 auto',
  },
  header: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  headerText: {
    color: '#1a1a2e',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: '16px',
  },
  headerSub: {
    fontSize: '12px',
    opacity: 0.8,
  },
  messages: {
    padding: '20px',
    minHeight: '350px',
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  botMsg: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    maxWidth: '85%',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  userMsg: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)',
    color: '#1a1a2e',
    padding: '12px 16px',
    borderRadius: '16px 16px 4px 16px',
    maxWidth: '85%',
    fontSize: '14px',
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  sendBtn: {
    background: 'linear-gradient(90deg, #e2b96f, #c9934a)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  optionBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(226,185,111,0.4)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#e2b96f',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  successBox: {
    background: 'rgba(39,174,96,0.15)',
    border: '1px solid rgba(39,174,96,0.4)',
    borderRadius: '12px',
    padding: '16px',
    color: '#2ecc71',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  whatsappBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '8px',
    width: '100%',
    justifyContent: 'center',
  },
};

const botMessages = {
  name: '👋 Namaste! Maro naam PropVisit Assistant chhe.\n\nApnu **puru naam** nakhso please:',
  phone: '📱 Saru! Havan apno **WhatsApp number** nakhso (10 digit):',
  property: '🏘️ Kayo property joi chho? Niche select karo:',
  date: '📅 Visit mate **tarikh** nakhso (YYYY-MM-DD format ma, jema DD/MM/YYYY chale):\n\nExample: 2025-07-15',
  time: '⏰ Kaya samaye avaso? Time slot select karo:',
  confirm: (data) => `✅ **Confirm karo tmaari visit:**\n\n👤 Naam: ${data.name}\n📱 Phone: ${data.phone}\n🏘️ Property: ${data.property}\n📅 Tarikh: ${data.date}\n⏰ Samay: ${data.time}\n\nBook karu?`,
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: botMessages.name },
  ]);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', property: '', date: '', time: '' });
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (from, text) => {
    setMessages(prev => [...prev, { from, text }]);
  };

  const handleTextInput = () => {
    const val = inputVal.trim();
    if (!val) return;
    const currentStep = STEPS[step];

    if (currentStep === 'name') {
      addMsg('user', val);
      setFormData(p => ({ ...p, name: val }));
      setInputVal('');
      setTimeout(() => { addMsg('bot', botMessages.phone); setStep(1); }, 400);
    } else if (currentStep === 'phone') {
      const digits = val.replace(/\D/g, '');
      if (digits.length < 10) { addMsg('bot', '⚠️ Valid 10-digit number nakhso.'); return; }
      addMsg('user', val);
      setFormData(p => ({ ...p, phone: digits }));
      setInputVal('');
      setTimeout(() => { addMsg('bot', botMessages.property); setStep(2); }, 400);
    } else if (currentStep === 'date') {
      addMsg('user', val);
      setFormData(p => ({ ...p, date: val }));
      setInputVal('');
      setTimeout(() => { addMsg('bot', botMessages.time); setStep(4); }, 400);
    }
  };

  const handlePropertySelect = (prop) => {
    addMsg('user', prop.label);
    setFormData(p => ({ ...p, property: prop.label }));
    setTimeout(() => { addMsg('bot', botMessages.date); setStep(3); }, 400);
  };

  const handleTimeSelect = (time) => {
    addMsg('user', time);
    const updated = { ...formData, time };
    setFormData(updated);
    setTimeout(() => { addMsg('bot', botMessages.confirm(updated)); setStep(5); }, 400);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'visits'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      addMsg('user', '✅ Haa, Book Karo!');

      const whatsappMsg = encodeURIComponent(
        `🏢 *New Property Visit Request*\n\n👤 Naam: ${formData.name}\n📱 Phone: ${formData.phone}\n🏘️ Property: ${formData.property}\n📅 Tarikh: ${formData.date}\n⏰ Samay: ${formData.time}\n\n_PropVisit Scheduler thi aavyu_`
      );

      setTimeout(() => {
        addMsg('bot', `🎉 **Visit book thai gayi!**\n\nTumne successfully ${formData.property} mate ${formData.date} na ${formData.time} vage visit book karyu.\n\nOwner ne WhatsApp notification jai rahyu chhe...`);
        setDone(true);
        window.open(`https://wa.me/${OWNER_PHONE}?text=${whatsappMsg}`, '_blank');
      }, 500);
    } catch (err) {
      addMsg('bot', '❌ Error aavi: ' + err.message);
    }
    setLoading(false);
  };

  const handleRestart = () => {
    setMessages([{ from: 'bot', text: botMessages.name }]);
    setStep(0);
    setFormData({ name: '', phone: '', property: '', date: '', time: '' });
    setInputVal('');
    setDone(false);
  };

  const currentStep = STEPS[step];
  const showTextInput = ['name', 'phone', 'date'].includes(currentStep);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>🤖</div>
        <div style={styles.headerText}>
          <div style={styles.headerTitle}>PropVisit Assistant</div>
          <div style={styles.headerSub}>● Online - Visit book karo easily</div>
        </div>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.from === 'bot' ? styles.botMsg : styles.userMsg}>
            {msg.text.split('\n').map((line, j) => (
              <span key={j}>
                {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                {j < msg.text.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        {!done && currentStep === 'property' && (
          <div style={styles.optionsGrid}>
            {PROPERTIES.map(p => (
              <button key={p.id} style={styles.optionBtn} onClick={() => handlePropertySelect(p)}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {!done && currentStep === 'time' && (
          <div style={styles.optionsGrid}>
            {TIME_SLOTS.map(t => (
              <button key={t} style={styles.optionBtn} onClick={() => handleTimeSelect(t)}>
                ⏰ {t}
              </button>
            ))}
          </div>
        )}

        {!done && currentStep === 'confirm' && (
          <>
            <button style={styles.sendBtn} onClick={handleConfirm} disabled={loading}>
              {loading ? '⏳ Saving...' : '✅ Confirm & Book Visit'}
            </button>
            <button style={{ ...styles.sendBtn, background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={handleRestart}>
              🔄 Navo Visit Book Karo
            </button>
          </>
        )}

        {!done && showTextInput && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              style={styles.input}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTextInput()}
              placeholder={
                currentStep === 'name' ? 'Tamaru puru naam...' :
                currentStep === 'phone' ? '10-digit WhatsApp number...' :
                'YYYY-MM-DD (e.g. 2025-07-20)...'
              }
            />
            <button style={styles.sendBtn} onClick={handleTextInput}>Send</button>
          </div>
        )}

        {done && (
          <button style={styles.sendBtn} onClick={handleRestart}>
            🔄 Ek Vaat Vadhu Book Karo
          </button>
        )}
      </div>
    </div>
  );
}
