import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminPanel() {
  const [sites, setSites] = useState([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const BASE_URL = window.location.origin;

  useEffect(() => { fetchSites(); }, []);

  async function fetchSites() {
    const snap = await getDocs(collection(db, "sites"));
    setSites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function addSite() {
    if (!name || !number) return alert("Naam ane number nakho");
    await addDoc(collection(db, "sites"), { name, number, createdAt: new Date() });
    setName(""); setNumber(""); fetchSites();
  }

  async function deleteSite(id) {
    if (!window.confirm("Sure?")) return;
    await deleteDoc(doc(db, "sites", id)); fetchSites();
  }

  function copyLink(id) {
    navigator.clipboard.writeText(`${BASE_URL}/chat/${id}`);
    alert("Link copy thayi!");
  }

  return (
    <div style={{maxWidth:500,margin:"0 auto",padding:20,fontFamily:"sans-serif"}}>
      <h2>🏠 Property Visit Manager</h2>
      <div style={{background:"#f5f5f5",padding:16,borderRadius:8,marginBottom:20}}>
        <input placeholder="Site naam" value={name} onChange={e=>setName(e.target.value)}
          style={{display:"block",width:"100%",padding:10,marginBottom:8,borderRadius:6,border:"1px solid #ddd",fontSize:16,boxSizing:"border-box"}} />
        <input placeholder="WhatsApp number (919876543210)" value={number} onChange={e=>setNumber(e.target.value)}
          style={{display:"block",width:"100%",padding:10,marginBottom:8,borderRadius:6,border:"1px solid #ddd",fontSize:16,boxSizing:"border-box"}} />
        <button onClick={addSite}
          style={{width:"100%",padding:12,background:"#534AB7",color:"#fff",border:"none",borderRadius:6,fontSize:16,cursor:"pointer"}}>
          + Site Add Karo
        </button>
      </div>
      {sites.map(site => (
        <div key={site.id} style={{border:"1px solid #ddd",padding:16,borderRadius:8,marginBottom:10}}>
          <strong style={{fontSize:16}}>{site.name}</strong>
          <p style={{color:"#666",margin:"4px 0"}}>+{site.number}</p>
          <p style={{fontSize:12,color:"#999",wordBreak:"break-all",margin:"4px 0"}}>{BASE_URL}/chat/{site.id}</p>
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            <button onClick={()=>copyLink(site.id)}
              style={{padding:"8px 14px",background:"#1D9E75",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}}>
              Copy Link
            </button>
            <button onClick={()=>window.location.href="/visits"}
              style={{padding:"8px 14px",background:"#378ADD",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}}>
              Visits Juo
            </button>
            <button onClick={()=>deleteSite(site.id)}
              style={{padding:"8px 14px",background:"#E24B4A",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}}>
              Delete
            </button>
          </div>
        </div>
      ))}
      <button onClick={()=>window.location.href="/visits"}
        style={{width:"100%",padding:12,background:"#378ADD",color:"#fff",border:"none",borderRadius:6,fontSize:16,cursor:"pointer",marginTop:8}}>
        Badhi Visits Juo
      </button>
    </div>
  );
                                              }
