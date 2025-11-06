'use client';
export default function ProgressBar({value}:{value:number}){
  return (
    <div className="card" style={{padding:12}}>
      <div style={{height:12, background:'#1f2937', borderRadius:8, overflow:'hidden'}}>
        <div style={{height:'100%', width: `${Math.min(100, Math.max(0,value))}%`, background:'#22c55e', transition:'width .25s'}}/>
      </div>
      <div style={{marginTop:8, color:'#94a3b8'}}>{Math.round(value)}%</div>
    </div>
  );
}
