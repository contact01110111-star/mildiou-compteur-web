'use client';
import { useState, useEffect, useRef } from 'react';
import { API_BASE, postForm } from '@/lib/api';

type Props = {
  prob: string;                      // prob map encodée en b64 (uint8)
  shape: [number, number];           // [H, W]
  rgbB64: string;                    // image de référence (ex: masked) en b64
  leafMaskB64: string;               // leaf_mask en b64 (0/255 PNG)
  init: number;                      // seuil initial
  onUpdate: (payload: any) => void;  // { thr_mask, heatmap, annotated, percent }
};

export default function SliderThreshold({ prob, shape, rgbB64, leafMaskB64, init, onUpdate }: Props){
  const [t, setT] = useState(init);
  const debounce = useRef<number | null>(null);

  // Si la valeur initiale change (nouvelle image), on resynchronise
  useEffect(() => { setT(init); }, [init]);

  useEffect(() => {
    // petit debounce pour éviter d'appeler l'API à chaque "pixel" du slider
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      try{
        const fd = new FormData();
        fd.append('prob_b64', prob);
        fd.append('prob_h', String(shape[0]));
        fd.append('prob_w', String(shape[1]));
        fd.append('rgb_b64', rgbB64);
        fd.append('leaf_mask_b64', leafMaskB64);
        fd.append('t', String(t));

        // priorité au chemin proxy Vercel +api/, fallback direct
        let data;
try {
  data = await postForm(`${API_BASE}/recalc`, fd);
} catch {
  data = await postForm(`${API_BASE}/+api/recalc`, fd);
}
        onUpdate(data);
      }catch(e){
        // en cas d'erreur réseau, on n'écrase rien dans l'UI
        console.error('Recalc error:', e);
      }
    }, 200); // 200ms lisse bien les glissements

    return () => { if (debounce.current) window.clearTimeout(debounce.current); };
  }, [t, prob, shape, rgbB64, leafMaskB64, onUpdate]);

  return (
    <div className="card">
      <label>Ajuster le seuil ({t.toFixed(2)})</label>
      <input
        className="slider"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={t}
        onChange={(e)=> setT(parseFloat(e.target.value))}
      />
    </div>
  );
}
