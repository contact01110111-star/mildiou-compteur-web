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
// … dans le rendu, près des autres étapes :
{steps?.veins_mask && (
  <div className="card">
    <h3>Masque des nervures</h3>
    <img src={`data:image/png;base64,${steps.veins_mask}`} alt="Veins mask"/>
  </div>
)}
{steps?.veins_removed && (
  <div className="card">
    <h3>Feuille sans nervures (zone analysable)</h3>
    <img src={`data:image/png;base64,${steps.veins_removed}`} alt="Vein-removed"/>
  </div>
)}

