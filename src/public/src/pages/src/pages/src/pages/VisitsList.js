import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function VisitsList() {
  const [visits, setVisits] = useState([]);
  const [sites, setSites] = useState({});

  useEffect(() => {
    async function fetchAll() {
      const sitesSnap = await getDocs(collection(db, "sites"));
      const sitesMap = {};
      sitesSnap.docs.forEach(d => { sitesMap[d.id] = d.data().name; });
      setSites(sitesMap);
      const q = query(collection(db,"visits"), orderBy("bookedAt","desc"));
      const snap = await getDocs(q);
      setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchAll();
  }, []);

  return (
    <div style={{maxWidth:500,margin:"0 auto",padding:20,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={()=>window.location.href="/"}
          style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>
          ← Back
        </button>
        <h2 style={{margin:0}}>Badhi Visits ({visits.length})</h2>
      </div>
      {!visits.length && <p style={{color:"#666",textAlign:"center",padding:40}}>Koi visit nathi abhi.</p>}
      {visits.map(v => (
        <div key={v.id} style={{border:"1px solid #ddd",padding:14,borderRadius:8,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <strong>{v.name}</strong>
            <span style={{fontSize:12,background:"#E1F5EE",color:"#0F6E56",padding:"2px 8px",borderRadius:20}}>
              {sites[v.siteId] || v.siteName}
            </span>
          </div>
          <p style={{color:"#666",margin:"6px 0",fontSize:14}}>📞 {v.phone}</p>
          <p style={{color:"#666",margin:"4px 0",fontSize:14}}>📅 {v.date} &nbsp; ⏰ {v.time}</p>
        </div>
      ))}
    </div>
  );
}
