# Gravador do formato DESEJO (03/11/2026): página da loja de amostra servida localmente
# (branch amostra/* do repo moviki + raiz do site), celular 450x800 @2x, screencast CDP por cena.
# uso: python3 rec_desejo.py <pasta_video> <url_pagina> <modulo_cenas>
import asyncio, importlib, json, os, sys, time, base64, shutil, subprocess
from playwright.async_api import async_playwright
AQ = os.path.abspath(sys.argv[1]); URL = sys.argv[2]; CEN = importlib.import_module(sys.argv[3])
VW, VH, DSF = 450, 800, 2
LEAD, TAIL = 0.25, 0.35
WEBM = os.environ.get('CAPA_WEBM', '')
TOQUE = r"""(()=>{ if(window.__tq) return; window.__tq=1;
 const css='#__dot{position:fixed;left:0;top:0;z-index:2147483646;pointer-events:none;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,255,255,.6);border:2px solid rgba(20,20,20,.35);box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;will-change:transform}'+
  '.__rip{position:fixed;z-index:2147483645;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid #fff;animation:__r .5s ease-out forwards}'+
  '@keyframes __r{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}'+
  '.__real{position:fixed;z-index:2147483644;pointer-events:none;border:3px solid #ffb23f;border-radius:14px;box-shadow:0 0 0 4px rgba(255,154,31,.22),0 0 22px rgba(255,154,31,.55);animation:__rp 1s ease-in-out infinite;transition:opacity .3s}'+
  '@keyframes __rp{50%{box-shadow:0 0 0 8px rgba(255,154,31,.14),0 0 30px rgba(255,154,31,.7)}}'+
  '.mv-rv,.mv-img{opacity:1!important;transform:none!important;filter:none!important} #mvAvisoMed{display:none!important}';
 function mk(){ if(!document.body||document.getElementById('__dot')) return; const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
   const d=document.createElement('div'); d.id='__dot'; document.body.appendChild(d); }
 document.addEventListener('DOMContentLoaded',mk); setInterval(mk,300);
 window.__mov=(x,y,ms)=>{ mk(); const d=document.getElementById('__dot'); d.style.opacity='1'; d.style.transition='opacity .2s, transform '+ms+'ms cubic-bezier(.45,.05,.25,1)'; d.style.transform='translate('+x+'px,'+y+'px)'; };
 window.__some=()=>{ const d=document.getElementById('__dot'); if(d) d.style.opacity='0'; };
 window.__rip=(x,y)=>{ const r=document.createElement('div'); r.className='__rip'; r.style.left=x+'px'; r.style.top=y+'px'; document.body.appendChild(r); setTimeout(()=>r.remove(),600); };
 window.__realce=(x,y,w,h,ms)=>{ const r=document.createElement('div'); r.className='__real'; const p=5; r.style.left=(x-p)+'px'; r.style.top=(y-p)+'px'; r.style.width=(w+2*p)+'px'; r.style.height=(h+2*p)+'px'; document.body.appendChild(r); setTimeout(()=>{ r.style.opacity='0'; setTimeout(()=>r.remove(),320); }, ms||1600); };
})();"""

class R:
    def __init__(s, pg): s.pg = pg; s.erros = []
    async def caixa(s, js):
        return await s.pg.evaluate("(s)=>{const e=eval(s); if(!e) return null; const b=e.getBoundingClientRect(); return [b.left,b.top,b.width,b.height];}", js)
    async def mover(s, js, ms=450):
        b = await s.caixa(js)
        if not b: s.erros.append('sem alvo: ' + js[:70]); return None
        x, y = b[0] + b[2] / 2, b[1] + b[3] / 2
        await s.pg.evaluate('([x,y,ms])=>window.__mov(x,y,ms)', [x, y, ms]); await asyncio.sleep(ms / 1000); return x, y
    async def tocar(s, js, acao=None, ms=450):
        p = await s.mover(js, ms)
        if p: await s.pg.evaluate('([x,y])=>window.__rip(x,y)', list(p)); await asyncio.sleep(0.12)
        try: await s.pg.evaluate(acao or ('(' + js + ').click()'))
        except Exception as e: s.erros.append('acao: ' + str(e)[:80])
        await asyncio.sleep(0.25)
    async def realce(s, js, ms=1600):
        b = await s.caixa(js)
        if b: await s.pg.evaluate('([x,y,w,h,ms])=>window.__realce(x,y,w,h,ms)', b + [ms])
    async def some(s): await s.pg.evaluate('window.__some()')
    async def rolar(s, js, bloco='center', ms=650):
        await s.pg.evaluate("([s,b])=>{const e=eval(s); if(e) e.scrollIntoView({behavior:'smooth',block:b});}", [js, bloco]); await asyncio.sleep(ms / 1000)
    async def ev(s, js):
        try: await s.pg.evaluate(js)
        except Exception as e: s.erros.append('ev: ' + str(e)[:80])
    async def gravar(s, dur, acao, cdir):
        shutil.rmtree(cdir, ignore_errors=True); os.makedirs(cdir)
        cdp = await s.pg.context.new_cdp_session(s.pg); qs = []; n = [0]
        async def ack(sid):
            try: await cdp.send('Page.screencastFrameAck', {'sessionId': sid})
            except Exception: pass
        def on_frame(f):
            nome = 'q%05d.jpg' % n[0]; n[0] += 1
            open(os.path.join(cdir, nome), 'wb').write(base64.b64decode(f['data'])); qs.append({'f': nome, 't': f['metadata']['timestamp']})
            asyncio.ensure_future(ack(f['sessionId']))
        cdp.on('Page.screencastFrame', on_frame)
        shot = await cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 92})
        open(os.path.join(cdir, 'q_ini.jpg'), 'wb').write(base64.b64decode(shot['data']))
        t0 = time.time()
        await cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 90, 'maxWidth': 900, 'maxHeight': 1600, 'everyNthFrame': 1})
        fim = [None]
        async def roda():
            try: await acao()
            except Exception as e: s.erros.append(str(e).split('\n')[0]); print('  [acao falhou]', str(e).split('\n')[0])
            fim[0] = time.time()
        task = asyncio.ensure_future(roda()); await asyncio.sleep(dur); await task
        alvo = max(t0 + dur, fim[0] + 0.2)
        while time.time() < alvo: await asyncio.sleep(0.03)
        await asyncio.sleep(0.08); await cdp.send('Page.stopScreencast'); await asyncio.sleep(0.2)
        try: await cdp.detach()
        except Exception: pass
        meta = {'dur': alvo - t0, 'quadros': [{'f': 'q_ini.jpg', 't': 0}] + [{'f': q['f'], 't': max(0, q['t'] - t0)} for q in qs]}
        json.dump(meta, open(os.path.join(cdir, 'meta.json'), 'w')); return alvo - t0

def dur_mp3(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode().strip())

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--lang=pt-BR', '--autoplay-policy=no-user-gesture-required'])
        ctx = await br.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=DSF, is_mobile=True, has_touch=True, locale='pt-BR', timezone_id='America/Sao_Paulo')
        await ctx.grant_permissions(['notifications'], origin='http://127.0.0.1:8840')
        await ctx.add_init_script('try{localStorage.setItem("mv_medicao","nao");}catch(e){} try{Object.defineProperty(Notification,"permission",{get:()=>"default"})}catch(e){}')
        await ctx.add_init_script(TOQUE)
        if WEBM:
            async def capa(route): await route.fulfill(path=WEBM, content_type='video/webm')
            await ctx.route(lambda u: u.startswith('https://cdn.kairogen.ai/') and u.endswith('.mp4'), capa)
        pg = await ctx.new_page(); erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        await pg.goto(URL); await pg.wait_for_timeout(4500)
        r = R(pg)
        so = [int(x) for x in os.environ.get('SO', '').split(',') if x]
        for i, c in enumerate(CEN.CENAS):
            d = LEAD + dur_mp3(f'{AQ}/audio/{i+1}.mp3') + TAIL
            if so and (i + 1) not in so: continue
            real = await r.gravar(d, lambda c=c: c(r), f'{AQ}/grav/c{i+1}')
            print('cena', i + 1, 'planejada %.2f gravada %.2f' % (d, real), flush=True)
        await br.close()
        print(json.dumps({'erros_pagina': erros[:10], 'erros_acao': r.erros}, ensure_ascii=False))
asyncio.run(main())
