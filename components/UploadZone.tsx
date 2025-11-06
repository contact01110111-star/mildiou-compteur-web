'use client';
import { useRef, useState } from 'react';
export default function UploadZone({ onFile }: { onFile: (f: File) => void }){
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  return (
    <div className="card" onClick={()=>ref.current?.click()} style={{textAlign:'center',cursor:'pointer'}}>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e=>{
        const f = e.target.files?.[0]; if (f){ setName(f.name); onFile(f); }
      }}/>
      <p><strong>Dépose ou clique pour choisir une photo de feuille</strong></p>
      <small>{name || 'PNG/JPG'}</small>
    </div>
  );
}
