'use client';
import { useEffect, useState } from 'react';

export default function AuthModal({
  open, onClose, onLogin, onGuest
}:{
  open:boolean;
  onClose: ()=>void;
  onLogin: (userId:string, remember:boolean)=>void;
  onGuest: ()=>void;
}) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);

  useEffect(()=>{ if(open){ setUser(''); setPass(''); } },[open]);

  if(!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }}>
      <div className="card" style={{width:420}}>
        <h2 style={{marginTop:0}}>Connexion</h2>
        <p style={{color:'#94a3b8', marginTop:0}}>Identifie-toi ou continue en invité.</p>

        <div style={{display:'grid', gap:10}}>
          <div>
            <label>Identifiant</label>
            <input className="input" placeholder="ex: vigneron42"
              value={user} onChange={e=>setUser(e.target.value)} />
          </div>
          <div>
            <label>Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••"
              value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
          <label style={{display:'flex', gap:8, alignItems:'center', color:'#bcd'}}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
            Se souvenir de moi
          </label>

          <div className="row">
            <button className="btn btn-accent" onClick={()=>{
              if(!user.trim()) return;
              onLogin(user.trim(), remember);
              onClose();
            }}>Se connecter</button>
            <button className="btn btn-ghost" onClick={()=>{
              onGuest(); onClose();
            }}>Continuer en invité</button>
          </div>
        </div>
      </div>
    </div>
  );
}
