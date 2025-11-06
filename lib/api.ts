export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; // ex: https://huggingface.co/spaces/<org>/<space>
export async function postForm(url: string, data: FormData) {
  const r = await fetch(url, { method: 'POST', body: data });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
export function b64ToBlob(b64: string, type = 'image/png') {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type });
}
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
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
  return new File([blob!], file.name.replace(/\.\w+$/, '') + '_scaled.jpg', { type: 'image/jpeg' });
}
