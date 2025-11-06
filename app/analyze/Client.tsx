'use client';
import { useState } from 'react';
import { API_BASE, postForm } from '@/lib/api';
import StepViewer from '@/components/StepViewer';
import SliderThreshold from '@/components/SliderThreshold';
export default function Client(){
  const [steps, setSteps] = useState<any>(null);
  const [rgbB64, setRgbB64] = useState<string>('');
  const [probPack, setProbPack] = useState<{prob:string, shape:[number,number]}|null>(null);
  const [percent, setPercent] = useState<number|null>(null);
  async function onFile(f: File){
    const fd = new FormData();
    fd.append('file', f);
    fd.append('default_threshold', '0.5');
    let data;
    try{ data = await postForm(`${API_BASE}/+api/analyze`, fd); }
    catch{ data = await postForm(`${API_BASE}/analyze`, fd); }
    setSteps(data);
    setPercent(data.percent);
    setProbPack({prob: data.prob_b64, shape: [data.prob_shape[0], data.prob_shape[1]]});
    setRgbB64(data.masked);
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
  return (
    <div className="container">
      <div className="card" style={{marginBottom:16}}>
        <h1>Compteur de mildiou</h1>
        <p>Charge une photo, vérifie chaque étape, ajuste le seuil, et télécharge la heatmap annotée.</p>
        <input className="input" type="file" accept="image/*" onChange={e=>{
          const f = e.target.files?.[0]; if(f) onFile(f);
        }}/>
      </div>
      {steps && (<>
        <StepViewer steps={steps}/>
        {probPack && rgbB64 && (
          <SliderThreshold prob={probPack.prob} shape={probPack.shape} rgbB64={rgbB64}
            init={steps.default_threshold} onUpdate={onThresholdUpdate}/>
        )}
        <div className="row">
          <button className="btn" onClick={downloadHeatmap}>Télécharger la heatmap annotée</button>
          {percent!==null && <div className="card">Pourcentage infecté : <strong>{percent?.toFixed(2)}%</strong></div>}
        </div>
      </>)}
    </div>
  );
}
