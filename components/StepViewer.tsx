'use client';
export function ImgB64({b64}:{b64?:string}){
  if(!b64) return null; return <img src={`data:image/png;base64,${b64}`} alt="step"/>;
}
export default function StepViewer({steps}:{steps:any}){
  if(!steps) return null;
  return (
    <div className="grid">
      <div><label>Masque feuille</label><ImgB64 b64={steps.leaf_mask}/></div>
      <div><label>Feuille isolée</label><ImgB64 b64={steps.masked}/></div>
      <div><label>Anti‑reflet</label><ImgB64 b64={steps.glare_fixed}/></div>
      <div><label>Anti‑nervures</label><ImgB64 b64={steps.veins_removed}/></div>
      <div><label>Seuil courant</label><ImgB64 b64={steps.thr_mask}/></div>
      <div><label>Heatmap</label><ImgB64 b64={steps.heatmap}/></div>
      <div><label>Heatmap annotée</label><ImgB64 b64={steps.annotated}/></div>
    </div>
  );
}
