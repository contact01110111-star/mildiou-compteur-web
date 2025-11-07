'use client';
import { Analysis } from '@/lib/storage';

export default function Sidebar({
  items, selected, onToggle, onToggleAll, onOpen, onDelete, onZip
}:{
  items: Analysis[];
  selected: Set<string>;
  onToggle: (id:string)=>void;
  onToggleAll: ()=>void;
  onOpen: (id:string)=>void;
  onDelete: ()=>void;
  onZip: ()=>void;
}){
  const all = items.length>0 && selected.size===items.length;
  return (
    <aside className="sidebar">
      <div className="topbar">
        <h2 style={{flex:1, margin:0}}>Mes feuilles</h2>
      </div>

      <div className="row" style={{marginBottom:8}}>
        <button className="btn btn-ghost" onClick={onToggleAll}>
          {all ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
        <button className="btn" onClick={onDelete} disabled={selected.size===0}>Supprimer</button>
        <button className="btn btn-accent" onClick={onZip} disabled={selected.size===0}>Télécharger ZIP</button>
      </div>

      <div className="list">
        {items.map(it=>(
          <div key={it.id} className="item">
            <input type="checkbox" checked={selected.has(it.id)} onChange={()=>onToggle(it.id)} />
            {it.thumbnail ? (
              <img className="thumb" src={`data:image/png;base64,${it.thumbnail}`} alt="thumb"/>
            ) : (
              <div className="thumb" style={{background:'#142038', display:'grid', placeItems:'center'}}>🍇</div>
            )}
            <div style={{flex:1, minWidth:0, cursor:'pointer'}} onClick={()=>onOpen(it.id)}>
              <div className="name">{it.name}</div>
              <div className="meta">{new Date(it.createdAt).toLocaleString()} • {it.percent.toFixed(2)}%</div>
            </div>
          </div>
        ))}
        {items.length===0 && <div className="meta" style={{padding:'8px 4px'}}>Aucune analyse enregistrée…</div>}
      </div>
    </aside>
  );
}
