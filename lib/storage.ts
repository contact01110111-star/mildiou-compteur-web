export type Analysis = {
  id: string;
  name: string;
  createdAt: string;      // ISO
  threshold: number;
  percent: number;
  images: {
    // on ne persiste que 'annotated' pour rester léger
    annotated?: string;

    // les autres existent à l'écran mais ne sont pas persistés pour éviter le quota
    masked?: string;
    thr_mask?: string;
    heatmap?: string;
    leaf_mask?: string;
    veins_removed?: string;
  };
  originalFileName?: string;
  notes?: string;
  thumbnail?: string;     // petite image base64 pour la liste
};

const KEY_USER = "mildiou.user";               // { userId, remember }
const KEY_DATA = (uid:string)=>`mildiou.analyses.${uid}`;
const GUEST_ID = "guest";

// ~4.5 Mo pour rester safe sous 5 Mo (localStorage varie selon navigateur)
const MAX_BYTES_PER_USER = 4_500_000;

export function getSavedUser(): { userId:string, remember:boolean } | null {
  try{
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}

export function setSavedUser(u:{userId:string, remember:boolean}) {
  localStorage.setItem(KEY_USER, JSON.stringify(u));
}

export function logoutUser(){
  localStorage.removeItem(KEY_USER);
}

export function getUserIdOrGuest(): string {
  const u = getSavedUser();
  return u?.userId || GUEST_ID;
}

export function listAnalyses(userId:string): Analysis[] {
  try{
    const raw = localStorage.getItem(KEY_DATA(userId));
    return raw ? JSON.parse(raw) : [];
  }catch{ return []; }
}

export function saveAnalyses(userId:string, arr:Analysis[]){
  localStorage.setItem(KEY_DATA(userId), JSON.stringify(arr));
}

function approxBytesOf(obj:any){
  // estimation simple : 2 octets par caractère pour JSON
  try { return new TextEncoder().encode(JSON.stringify(obj)).length; } 
  catch { return (JSON.stringify(obj) || '').length * 2; }
}

/** Garde seulement 'annotated' + thumbnail pour limiter la taille */
function lighten(a: Analysis): Analysis {
  return {
    ...a,
    images: { annotated: a.images?.annotated },
  };
}

/** Purge en FIFO (les plus anciennes en bas) jusqu’à repasser sous le seuil */
function trimUntilFits(userId: string, arr: Analysis[], maxBytes = MAX_BYTES_PER_USER): Analysis[] {
  let bytes = approxBytesOf(arr);
  while (bytes > maxBytes && arr.length > 1) {
    arr.pop(); // on enlève la plus ancienne (on stocke newest first)
    bytes = approxBytesOf(arr);
  }
  return arr;
}

/** Upsert avec sauvegarde robuste : compaction + purge si quota */
export function safeUpsertAnalysis(userId:string, incoming:Analysis): { ok: boolean; compacted: boolean; trimmed: boolean } {
  const arr = listAnalyses(userId);
  const liteIncoming = lighten(incoming);
  const idx = arr.findIndex(x=>x.id===liteIncoming.id);
  if (idx>=0) arr[idx] = { ...arr[idx], ...liteIncoming };
  else arr.unshift(liteIncoming);

  // 1) tentative simple
  try {
    saveAnalyses(userId, arr);
    return { ok:true, compacted:false, trimmed:false };
  } catch {}

  // 2) compaction stricte de TOUT (au cas où d’anciens items gardent des champs inutiles)
  const compacted = arr.map(lighten);
  try {
    saveAnalyses(userId, compacted);
    return { ok:true, compacted:true, trimmed:false };
  } catch {}

  // 3) purge FIFO jusqu’à rentrer sous le seuil
  const trimmed = trimUntilFits(userId, compacted);
  try {
    saveAnalyses(userId, trimmed);
    return { ok:true, compacted:true, trimmed:true };
  } catch (e) {
    console.error('Impossible de sauver même après trim:', e);
    return { ok:false, compacted:true, trimmed:true };
  }
}

export function deleteAnalyses(userId:string, ids:string[]){
  const arr = listAnalyses(userId).filter(x=>!ids.includes(x.id));
  saveAnalyses(userId, arr);
}

export function nextName(userId:string): string {
  const arr = listAnalyses(userId);
  const nums = arr.map(a => {
    const m = a.name.match(/(\d+)/g);
    return m ? parseInt(m[m.length-1],10) : 0;
  });
  const n = (nums.length? Math.max(...nums):0) + 1;
  return `Feuille ${String(n).padStart(3,'0')}`;
}

/* petit util */
export function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }
