'use client';
import React from 'react';

type Steps = {
  leaf_mask?: string;
  masked?: string;
  glare_fixed?: string;
  veins_removed?: string;
  veins_mask?: string;
  thr_mask?: string;
  heatmap?: string;
  annotated?: string;
};

export function ImgB64({ b64 }: { b64?: string }) {
  if (!b64) return null;
  return <img src={`data:image/png;base64,${b64}`} alt="step" />;
}

export default function StepViewer({ steps }: { steps: Steps | null }) {
  if (!steps) return null;

  return (
    <>
      <div className="grid">
        <div><label>Masque feuille</label><ImgB64 b64={steps.leaf_mask} /></div>
        <div><label>Feuille isolée</label><ImgB64 b64={steps.masked} /></div>
        <div><label>Anti-reflet</label><ImgB64 b64={steps.glare_fixed} /></div>

        {/* zone “anti-nervures” */}
        {steps.veins_removed && (
          <div><label>Feuille sans nervures</label><ImgB64 b64={steps.veins_removed} /></div>
        )}
        {steps.veins_mask && (
          <div><label>Masque des nervures</label><ImgB64 b64={steps.veins_mask} /></div>
        )}

        <div><label>Seuil courant</label><ImgB64 b64={steps.thr_mask} /></div>
        <div><label>Heatmap</label><ImgB64 b64={steps.heatmap} /></div>
        <div><label>Heatmap annotée</label><ImgB64 b64={steps.annotated} /></div>
      </div>
    </>
  );
}
