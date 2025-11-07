import JSZip from 'jszip';

export async function zipAnalyses(analyses: any[]){
  const zip = new JSZip();
  for(const a of analyses){
    const folder = zip.folder(a.name) as JSZip;
    const meta = {
      name: a.name, createdAt: a.createdAt, percent: a.percent, threshold: a.threshold,
      originalFileName: a.originalFileName
    };
    folder.file("meta.json", JSON.stringify(meta, null, 2));
    if(a.images?.annotated) folder.file("annotated.png", b64ToBlob(a.images.annotated));
    if(a.images?.heatmap)   folder.file("heatmap.png",   b64ToBlob(a.images.heatmap));
    if(a.images?.thr_mask)  folder.file("thr_mask.png",  b64ToBlob(a.images.thr_mask));
    if(a.images?.masked)    folder.file("masked.png",    b64ToBlob(a.images.masked));
  }
  const blob = await zip.generateAsync({type:'blob'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feuilles_mildiou.zip';
  a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 2000);
}

function b64ToBlob(b64:string){
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i);
  return new Blob([u8], {type:'image/png'});
}
