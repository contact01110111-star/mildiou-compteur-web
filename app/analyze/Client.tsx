'use client';
import { useState } from 'react';
import { API_BASE, postForm, downscaleImage } from '@/lib/api';
import StepViewer from '@/components/StepViewer';
import SliderThreshold from '@/components/SliderThreshold';

export default function Client(){
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<any>(null);
  const [rgbB64, setRgbB64] = useState<string>('');
  const [probPack, setProbPack] = useState<{prob:string, shape:[number,number]}|null>(null);
  const [percent, setPercent] = useState<number|null>(null);
  const [status, setStatus] = useState<string>('Prêt');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  async function runAnalyze(f: File){
    setIsLoading(true);
    setErrorMsg('');
    setStatus('Analyse en cours...');
    try{
      const fd = new FormData();
      const small = await downscaleImage(f, 1600);
      fd.append('file', small);
      fd.append('default_threshold', '0.5');
      let data;
      try{
        data = await postForm(`${API_BASE}/+api/analyze`, fd);
      }catch{
        data = await postForm(`${API_BASE}/analyze`, fd);
      }
      setSteps(data);
      setPercent(data.percent);
      setProbPack({prob: data.prob_b64, shape: [data.prob_shape[0], data.prob_shape[1]]});
      setRgbB64(data.masked);
      setStatus('Analyse terminée ✔️');
    }catch(e:any){
      setErrorMsg(e?.message || 'Erreur pendant l’analyse');
      setStatus('Erreur');
    }finally{
      setIsLoading(false);
    }
  }

  function onThresholdUpdate(d:any){
    setSteps((s:any)=>({...s, thr_mask:d.thr_mask, heatmap:d.heatmap, annotated:d.annotated}));
    setPercent(d.percent);
  }

  function downloadHeatmap(){
    if(!steps?.annotated) return;
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${steps.annotated}`;
    a.download = 'mildiou_heatmap_annotated.png';
    a.click();
  }

  function resetAll(){
    setFile(null); setSteps(null); setRgbB64('');
    setProbPack(null); setPercent(null); setErrorMsg('');
    setStatus('Prêt');
  }

  return (
    <div className="container">
      <div className="card" style={{marginBottom:16}}>
        <h1>Compteur de mildiou</h1>
        <p>1) Choisis une photo de feuille. 2) Clique <em>Analyser</em>. 3) Ajuste le seuil et télécharge la heatmap annotée.</p>

        <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={e=>{
              const f = e.target.files?.[0] || null;
              setFile(f);
              setStatus(f ? 'Fichier prêt' : 'Prêt');
            }}
          />
          <button className="btn" disabled={!file || isLoading} onClick={()=>file && runAnalyze(file)}>
            {isLoading ? 'Analyse...' : 'Analyser'}
          </button>
          <button className="btn" style={{background:'#475569'}} onClick={resetAll}>Réinitialiser</button>
          <span style={{color:'#94a3b8'}}>{status}</span>
        </div>

        {errorMsg && <div style={{marginTop:8, color:'#fecaca'}}>⚠️ {errorMsg}</div>}
      </div>

      {steps && (
        <>
          <StepViewer steps={steps}/>
          {probPack && rgbB64 && (
            <SliderThreshold
              prob={probPack.prob}
              shape={probPack.shape}
              rgbB64={rgbB64}
              init={steps.default_threshold}
              onUpdate={onThresholdUpdate}
            />
          )}
          <div className="row">
            <button className="btn" onClick={downloadHeatmap}>Télécharger la heatmap annotée</button>
            {percent!==null && <div className="card">Pourcentage infecté : <strong>{percent?.toFixed(2)}%</strong></div>}
          </div>
        </>
      )}
    </div>
  );
}
