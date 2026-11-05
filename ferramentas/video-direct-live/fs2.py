from stubs import FS
# FS com escuta viva: guarda os listeners, ordena por orderBy e expoe
# window.__fsAdd(path, doc) para empurrar documentos durante a gravacao.
FS2 = FS.replace("""export function onSnapshot(q,next,err){
  if(q.cons===undefined && !q.col){ setTimeout(()=>{ next(snap(q.path)); },10); return ()=>{}; }
  const fire=()=>{ const r=rodar(q); next({docs:r,size:r.length,empty:!r.length,forEach:(fn)=>r.forEach(fn),docChanges:()=>r.map(d=>({type:'added',doc:d}))}); };
  setTimeout(fire,10); return ()=>{};
}""", """const __L=new Set();
window.__fsAdd=(p,d)=>{ F().docs[p]=d; __L.forEach(f=>{try{f()}catch(e){console.error(e)}}); };
window.__fsRefresh=()=>__L.forEach(f=>{try{f()}catch(e){}});
export function onSnapshot(q,next,err){
  let vistos=new Set();
  const fire=(q.cons===undefined && !q.col) ? ()=>next(snap(q.path)) : ()=>{ const r=rodar(q);
    const ch=r.filter(d=>!vistos.has(d.id)).map(d=>({type:'added',doc:d})); r.forEach(d=>vistos.add(d.id));
    next({docs:r,size:r.length,empty:!r.length,forEach:(fn)=>r.forEach(fn),docChanges:()=>ch}); };
  setTimeout(fire,10); __L.add(fire); return ()=>__L.delete(fire);
}""")
assert FS2 != FS
FS2 = FS2.replace("""    if(ok)out.push({id:p.slice(pre.length), exists:()=>true, data:()=>CL(d)}); }
  return out;""", """    if(ok)out.push({id:p.slice(pre.length), exists:()=>true, data:()=>CL(d), __d:d}); }
  const o=(q.cons||[]).find(c=>c.t==='order');
  if(o){ const v=x=>{const y=x.__d[o.f]; return y&&typeof y==='object'&&y.__ms!=null?y.__ms:(y||0);}; out.sort((a,b)=>o.d==='desc'?v(b)-v(a):v(a)-v(b)); }
  return out;""")
assert '__d:d' in FS2
