export type Analysis = {
  id: string;
  name: string;
  createdAt: string;      // ISO
  threshold: number;
  percent: number;
  images: {
    masked?: string;
    thr_mask?: string;
    heatmap?: string;
    annotated?: string;
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

export function upsertAnalysis(userId:string, a:Analysis){
  const arr = listAnalyses(userId);
  const idx = arr.findIndex(x=>x.id===a.id);
  if(idx>=0) arr[idx]=a; else arr.unshift(a); // newest first
  saveAnalyses(userId, arr);
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
