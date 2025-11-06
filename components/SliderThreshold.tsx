'use client';
import { useState, useEffect } from 'react';
import { API_BASE, postForm } from '@/lib/api';
export default function SliderThreshold({prob, shape, rgbB64, onUpdate, init}:{ 
  prob:string, shape:[number,number], rgbB64:string, init:number, onUpdate:(x:any)=>void
}){
  const [t, setT] = useState(init);
  useEffect(()=>{ (async()=>{
    const fd = new FormData();
    fd.append('prob_b64', prob);
    fd.append('h', String(shape[0]));
    fd.append('w', String(shape[1]));
    fd.append('rgb_b64', rgbB64);
    fd.append('threshold', String(t));
    const data = await postForm(`${API_BASE}/+api/threshold`, fd).catch(async()=>{
      return await postForm(`${API_BASE}/threshold`, fd);
    });
    onUpdate(data);
  })(); }, [t]);
  return (
    <div className="card">
      <label>Ajuster le seuil ({t.toFixed(2)})</label>
      <input className="slider" type="range" min={0} max={1} step={0.01}
        value={t} onChange={e=>setT(parseFloat(e.target.value))}/>
    </div>
  );
}
