'use client';
import { useEffect, useState } from 'react';
import { API_BASE, postForm, downscaleImage, base64ToThumbnail } from '@/lib/api';
import StepViewer from '@/components/StepViewer';
import ProgressBar from '@/components/ProgressBar';
import AuthModal from '@/components/AuthModal';
import Sidebar from '@/components/Sidebar';
import { Analysis, getSavedUser, setSavedUser, listAnalyses, safeUpsertAnalysis, deleteAnalyses, nextName, uid } from '@/lib/storage';
import { zipAnalyses } from '@/lib/zip';

export default function Client(){
  // --- Auth (inchangé) ---
  const [showAuth, setShowAuth] = useState(true);
  const [userId, setUserId] = useState<string>('guest');
  const [isGuest, setIsGuest] = useState(true);
  useEffect(()=>{ const u=getSavedUser(); if(u?.userId&&u.remember){setUserId(u.userId);setIsGuest(false);setShowAuth(false);} },[]);

  function handleLogin(id:string, remember:boolean){ setUserId(id); setIsGuest(false); setSavedUser({userId:id, remember}); }
  function handleGuest(){ setUserId('guest'); setIsGuest(true); setSavedUser({userId:'guest', remember:false}); }

  // --- UI / analyse (sans slider) ---
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<any>(null);
  const [percent, setPercent] = useState<number|null>(null);
  const [status, setStatus] = useState<string>('Prêt');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  // --- Historique ---
  const [items, setItems] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(()=>{ setItems(listAnalyses(userId)); setSelected(new Set()); },[userId]);

  function openItem(id:string){
    const it = items.find(x=>x.id===id); if(!it) return;
    setSteps({ ...it.images, percent: it.percent, default_threshold: it.threshold });
    setPercent(it.percent);
    setStatus(`Ouvert: ${it.name}`);
  }
  function toggle(id:string){ const s=new Set(selected); s.has(id)?s.delete(id):s.add(id); setSelected(s); }
  function toggleAll(){ selected.size===items.length?setSelected(new Set()):setSelected(new Set(items.map(x=>x.id))); }
  async function zipSel(){ const arr=items.filter(x=>selected.has(x.id)); if(arr.length) await zipAnalyses(arr); }
  function delSel(){ deleteAnalyses(userId, Array.from(selected)); setItems(listAnalyses(userId)); setSelected(new Set()); }

  async function runAnalyze(f: File){
    setIsLoading(true); setErrorMsg(''); setStatus('Analyse en cours...'); setProgress(10);
    try{
      const fd = new FormData();
      const small = await downscaleImage(f, 1600); setProgress(25);
      fd.append('file', small); fd.append('default_threshold', '0.5'); setProgress(40);

      let data;
      try{ data = await postForm(`${API_BASE}/analyze`, fd); }
      catch{ data = await postForm(`${API_BASE}/+api/analyze`, fd); }
      setSteps(data); setPercent(data.percent); setProgress(95);

      // Sauvegarde légère (sans prob/slider)
      const id = uid(); const name = nextName(userId);
      const thumb = data.annotated ? await base64ToThumbnail(data.annotated, 120) : '';
      const rec: Analysis = {
        id, name, createdAt: new Date().toISOString(),
        threshold: data.default_threshold ?? 0.5, percent: data.percent ?? 0,
        images: { masked:data.masked, thr_mask:data.thr_mask, heatmap:data.heatmap,
                  annotated:data.annotated, leaf_mask:data.leaf_mask, veins_removed:data.veins_removed }
        , originalFileName: f.name, thumbnail: thumb
      };
      const res = safeUpsertAnalysis(userId, rec);
      setItems(listAnalyses(userId));
      if (!res.ok) setStatus("Sauvegarde limitée : quota dépassé (supprime d’anciennes feuilles).");
      else if (res.trimmed) setStatus("Sauvegarde OK (anciennes feuilles purgées).");
      else if (res.compacted) setStatus("Sauvegarde OK (compactée).");
      else setStatus('Analyse terminée ✔️');

      setProgress(100);
    }catch(e:any){
      setErrorMsg(e?.message || 'Erreur pendant l’analyse'); setStatus('Erreur'); setProgress(0);
    }finally{ setIsLoading(false); }
  }

  function downloadHeatmap(){
    if(!steps?.annotated) return;
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${steps.annotated}`;
    a.download = 'mildiou_heatmap_annotee.png';
    a.click();
  }
  function resetAll(){ setFile(null); setSteps(null); setPercent(null); setErrorMsg(''); setStatus('Prêt'); setProgress(0); }

  return (
    <>
      <Sidebar items={items} selected={selected} onToggle={toggle} onToggleAll={toggleAll} onOpen={openItem} onDelete={delSel} onZip={zipSel}/>
      <div className="container" style={{flex:1}}>
        <div className="card" style={{marginBottom:16}}>
          <h1 style={{marginTop:0}}>Compteur de mildiou</h1>
          <p>1 Choisis une photo. 2 Clique <em>Analyser</em>. 3 Télécharge la heatmap annotée.</p>
          <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
            <input className="input" type="file" accept="image/*"
              onChange={e=>{ const f=e.target.files?.[0]||null; setFile(f); setStatus(f?'Fichier prêt':'Prêt'); setProgress(f?5:0); }}/>
            <button className="btn" disabled={!file||isLoading} onClick={()=>file&&runAnalyze(file)}>{isLoading?'Analyse...':'Analyser'}</button>
            <button className="btn btn-ghost" onClick={resetAll}>Réinitialiser</button>
            <span style={{color:'#94a3b8'}}>{status}</span>
          </div>
          <div style={{marginTop:12}}><ProgressBar value={progress}/></div>
          {errorMsg && <div style={{marginTop:8, color:'#fecaca'}}>⚠️ {errorMsg}</div>}
        </div>

        {steps && (
          <>
            <StepViewer steps={steps}/>
            <div className="row">
              <button className="btn" onClick={downloadHeatmap}>Télécharger la heatmap annotée</button>
              {percent!==null && <div className="card">Pourcentage infecté : <strong>{percent.toFixed(2)}%</strong></div>}
            </div>
          </>
        )}
      </div>

      <AuthModal open={showAuth} onClose={()=>setShowAuth(false)} onLogin={handleLogin} onGuest={handleGuest}/>
    </>
  );
}
