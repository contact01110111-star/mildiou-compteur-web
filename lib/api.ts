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
