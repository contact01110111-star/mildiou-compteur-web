// lib/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; // ex: https://mildiou-compteur-lab.hf.space

export async function postForm(url: string, data: FormData) {
  const r = await fetch(url, { method: 'POST', body: data });
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(`HTTP ${r.status}${t ? ` – ${t.slice(0,180)}` : ""}`);
  }
  return r.json();
}

export function b64ToBlob(b64: string, type = 'image/png') {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type });
}

/** Redimensionne l’image côté client avant upload (max côté le plus long) */
export async function downscaleImage(file: File, maxSide = 1600): Promise<File> {
  const img = await new Promise<HTMLImageElement>((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.src = URL.createObjectURL(file);
  });

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  if (scale === 1) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/jpeg', 0.9)
  );
  return new File(
    [blob!],
    file.name.replace(/\.\w+$/, '') + '_scaled.jpg',
    { type: 'image/jpeg' }
  );
}

/** Crée une petite miniature base64 (pour la liste) à partir d’une image base64 */
export async function base64ToThumbnail(b64: string, maxSide = 120): Promise<string> {
  const img = new Image();
  img.src = `data:image/png;base64,${b64}`;
  await new Promise((r) => { img.onload = r; });

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // retourne juste les données base64 (sans le prefix data URL)
  return canvas.toDataURL('image/png').split(',')[1];
}
