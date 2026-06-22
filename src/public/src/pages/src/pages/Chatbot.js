import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";

export default function Chatbot() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [step, setStep] = useState("name");
  const [form, setForm] = useState({ name:"", phone:"", date:"", time:"" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "sites", siteId)).then(d => {
      if (d.exists()) setSite({ id: d.id, ...d.data() });
    });
  }, [siteId]);

  const dates = Array.from({length:5},(_,i) => {
    const d = new Date(); d.setDate(d.getDate()+i+1);
    return d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  });

  async function confirmBooking() {
    await addDoc(collection(db,"visits"), {
      ...form, siteId, siteName:site.name, bookedAt:new Date()
    });
    const msg = encodeURIComponent(
      `🏠 *Navi Visit - ${site.name}*\n\n👤 ${form.name}\n📞 ${form.phone}\n📅 ${form.date}\n⏰ ${form.time}`
    );
    window.open(`https://wa.me/${site.number}?text=${msg}`,"_blank");
    setDone(true);
  }

  const btn = (label, onClick) => (
    <button onClick={onClick} style={{display:"block",width:"100%",padding:12,margin:"8px 0",
      background:"#534AB7",color:"#fff",border:"none",borderRadius:8,fontSize:16,cursor:"pointer"}}>
      {label}
    </button>
  );

  if (!site) return <p style={{padding:20,fontFamily:"sans-serif"}}>Loading...</p>;
  if (done) return (
    <div style={{textAlign:"center",padding:40,fontFamily:"sans-serif"}}>
      <div style={{fontSize:48}}>✅</div>
      <h2>Visit Confirm Thayi!</h2>
      <p>{form.name} ji, {form.date} na {form.time} baje tamari visit set chhe.</p>
      <p style={{color:"#666"}}>Aapna number par contact thashe.</p>
    </div>
  );

  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:24,fontFamily:"sans-serif"}}>
      <h3>🏠 {site.name}</h3>
      <div style={{background:"#f5f5f5",padding:16,borderRadius:8}}>
        {step==="name" && <>
          <p>Tamaru naam shu chhe?</p>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
            placeholder="Naam lakho"
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ddd",fontSize:16,marginBottom:8,boxSizing:"border-box"}} />
          {btn("Next →", () => form.name && setStep("phone"))}
        </>}
        {step==="phone" && <>
          <p>Tamaro phone number?</p>
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}
            placeholder="Phone number" type="tel"
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ddd",fontSize:16,marginBottom:8,boxSizing:"border-box"}} />
          {btn("Next →", () => form.phone && setStep("date"))}
        </>}
        {step==="date" && <>
          <p>Date select karo:</p>
          {dates.map(d => btn(d, () => { setForm({...form,date:d}); setStep("time"); }))}
        </>}
        {step==="time" && <>
          <p>Time select karo:</p>
          {["10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM"].map(t =>
            btn(t, () => { setForm({...form,time:t}); setStep("confirm"); })
          )}
        </>}
        {step==="confirm" && <>
          <p><strong>Confirm karo:</strong></p>
          <p>👤 {form.name}</p>
          <p>📞 {form.phone}</p>
          <p>📅 {form.date}</p>
          <p>⏰ {form.time}</p>
          {btn("✓ Confirm & Book", confirmBooking)}
          <button onClick={()=>setStep("name")}
            style={{width:"100%",padding:12,background:"#fff",color:"#333",border:"1px solid #ddd",borderRadius:8,fontSize:16,cursor:"pointer"}}>
            Dobara Bharo
          </button>
        </>}
      </div>
    </div>
  );
              }
