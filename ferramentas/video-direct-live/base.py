# Bancada das telas da live (base de 19/10/2026, adaptada em 05/11/2026 para o DESEJO live-primeiro):
# telas REAIS (moviki-app e moviki do GitHub) com Firebase de mentira (fs2), robo de mentira e
# camera = quadros de um clipe da galeria. Loja ficticia: Atelier Vinha (a mesma da loja de amostra).
import asyncio, json, os, sys, time, threading, http.server, socketserver, datetime, subprocess, urllib.parse
sys.path.insert(0, '/home/claude/prod'); sys.path.insert(0, '/home/claude/ugc')
from stubs import APP, CHECK, AUTH, ST
from fs2 import FS2 as FS
from playwright.async_api import async_playwright

W0 = '/home/claude/w'
APPR, SITER = W0 + '/retrato', W0 + '/site'
CACHE = W0 + '/cache'
RAMO = os.environ.get('RAMO', '')   # vazio = moda (Atelier Vinha); senao le ramos/<RAMO>.py
CAMD = W0 + ('/cam-' + RAMO if RAMO else '/cam'); FOTOS = W0 + ('/fotos-' + RAMO if RAMO else '/fotos')
os.makedirs(CACHE, exist_ok=True)
CAMF = sorted(f for f in os.listdir(CAMD) if f.endswith('.jpg'))
FD = '/usr/share/fonts/truetype/google-fonts/'
FONTCSS = ''.join("@font-face{font-family:'Poppins';font-weight:%s;font-style:normal;src:url(/__font/Poppins-%s.ttf) format('truetype');}" % (w, n)
                  for n, w in [('Regular', 400), ('Medium', 500), ('Bold', 600), ('Bold', 700), ('Bold', 800)])

def buscar(dom, path):
    dest = os.path.join(CACHE, dom, path.lstrip('/'))
    if not os.path.exists(dest):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        r = subprocess.run(['curl', '-sS', '-f', '-m', '20', '-o', dest, 'https://%s%s' % (dom, path)], capture_output=True)
        if r.returncode:
            try: os.remove(dest)
            except Exception: pass
            return None
    return dest

def servir(root, porta, dom):
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(s, *a, **k): super().__init__(*a, directory=root, **k)
        def log_message(s, *a): pass
        def do_GET(s):
            p = urllib.parse.urlparse(s.path).path
            if p.startswith('/live/'): s.path = '/live.html'; return super().do_GET()
            loc = os.path.join(root, p.lstrip('/'))
            if p != '/' and not os.path.exists(loc):
                f = buscar(dom, p)
                if f:
                    b = open(f, 'rb').read(); s.send_response(200)
                    s.send_header('Content-Type', s.guess_type(f)); s.send_header('Content-Length', str(len(b))); s.end_headers(); s.wfile.write(b); return
            return super().do_GET()
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', porta), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
PA = int(os.environ.get('PA', '8871')); PS = PA + 1
servir(APPR, PA, 'app.moviki.com.br'); servir(SITER, PS, 'www.moviki.com.br')

now = int(time.time() * 1000); dia = 86400000
HOJE = (datetime.datetime.utcnow() - datetime.timedelta(hours=3)).strftime('%Y-%m-%d')
CFG = {'nome': 'Atelier Vinha', 'slug': 'ateliervinha', 'segmento': 'moda', 'recado': 'Moda feminina com curadoria', 'cor': '#8e2a4f',
       'categoria': 'Novidades', 'titulo': 'Estampas novas de verão',
       'produtos': [['Blusa floral de viscose', '129,90', '99,90', 'blusa.jpg'], ['Vestido chemise', '189,90', None, 'chemise.jpg'],
                    ['Calça pantalona', '159,90', None, 'pantalona.jpg'], ['Bolsa de couro', '149,90', None, 'bolsa.jpg']]}
TXT = {'g': ['Tem no M? 🙏', 'Quero essa!', 'Amei a estampa ❤️'], 'chat0': ['Boa noite! Cheguei 👋', 'Que linda essa blusa 😍'],
       'pergunta': 'Tem no M?', 'resposta': 'Tem sim! P, M e G 😊', 'garanti': 'Garanti a minha!'}
if RAMO:
    exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ramos', RAMO + '.py')).read())
def num(v): return float(str(v).replace('.', '').replace(',', '.'))
PROD = CFG['produtos']; P0 = PROD[0][0]
NEG = {'nome': CFG['nome'], 'slug': CFG['slug'], 'whatsapp': '41900000000', 'segmento': CFG['segmento'], 'segmentoMacro': 'varejo',
       'recado': CFG['recado'], 'cor': CFG['cor'], 'status': 'aberto', 'lat': -25.4284, 'lng': -49.2733,
       'endereco': 'Rua Exemplo, 100 - Centro - Curitiba/PR', 'horario': 'Seg a Sáb 9h às 19h',
       'cardapio': [{'categoria': CFG['categoria'], 'produtos': [{'nome': p[0], 'preco': p[1], 'sku': 'p%d' % (i + 1)} for i, p in enumerate(PROD)]}],
       'promocoes': [], 'eventos': [], 'fotos': [], 'videos': []}
FT = 'https://firebasestorage.googleapis.com/__foto/'
SAC = []
for p in PROD:
    it = {'nome': p[0], 'preco': p[1], 'foto': FT + p[3]}
    if p[2]: it['precoLive'] = p[2]
    SAC.append(it)
ASS = {'ativo': True, 'plano': 'enterprise', 'periodo': 'mensal', 'vence_em': {'__ms': now + 40 * dia}}
USER = {'uid': 'AV0000000001', 'email': 'loja@exemplo.com', 'emailVerified': True, 'displayName': CFG['nome']}
def ped(i, st, nome, item, q, total, mins, **x):
    d = {'lojistaUid': 'AV0000000001', 'status': st, 'modo': 'pix', 'total': total, 'numero': i, 'dia': HOJE, 'origem': 'live',
         'itens': [{'nome': item, 'qtd': q, 'q': q, 'preco': round(total / q, 2)}], 'produto': item, 'qtd': q,
         'comprador': {'nome': nome, 'whatsapp': '41999990000'}, 'entrega': {'tipo': 'retirada'},
         'criadoEm': {'__ms': now - mins * 60000}, 'codigo': '4821'}
    d.update(x); return d
def msg(i, nome, texto, tipo='msg', ago=0):
    return ('negocios/AV0000000001/livechat/m%d' % i, {'nome': nome, 'texto': texto, 'tipo': tipo, 'criadoEm': {'__ms': now - ago}})

CAMJS = """(()=>{let cur=null; window.__camTotal=%d;
 const carrega=async(i)=>{const im=new Image(); im.src='/__camf/'+i; try{await im.decode();}catch(_){} return im;};
 if(window.__camTotal) carrega(0).then(im=>{cur=im;});
 function canvas(){const cv=document.createElement('canvas');cv.width=720;cv.height=1280;const x=cv.getContext('2d');
  function des(){x.fillStyle='#222';x.fillRect(0,0,720,1280); if(cur&&cur.naturalWidth){const r=Math.max(720/cur.naturalWidth,1280/cur.naturalHeight);const w=cur.naturalWidth*r,h=cur.naturalHeight*r;x.drawImage(cur,(720-w)/2,(1280-h)/2,w,h);} requestAnimationFrame(des);}
  des();return cv;}
 window.__setT=async(n)=>{ if(!window.__camTotal) return; cur=await carrega(n%%window.__camTotal);
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const vs=[...document.querySelectorAll('video')].filter(v=>v.srcObject);
   if(vs.length) await Promise.race([Promise.all(vs.map(v=>new Promise(r=>v.requestVideoFrameCallback(()=>r())))), new Promise(r=>setTimeout(r,150))]); };
 navigator.mediaDevices.getUserMedia=async()=>canvas().captureStream(30);
 window.RTCPeerConnection=class{constructor(){this.iceGatheringState='complete';this.connectionState='new';this._s=[];this.localDescription=null;}
  addTransceiver(t){this._s.push({track:(typeof t==='object'?t:null),getParameters:()=>({encodings:[{}]}),setParameters:async()=>{},replaceTrack:async()=>{}});}
  getSenders(){return this._s;} addEventListener(){} close(){}
  async createOffer(){return {type:'offer',sdp:'v=0'};} async setLocalDescription(x){this.localDescription=x;}
  async setRemoteDescription(){setTimeout(()=>{ if(this.ontrack){const tr=canvas().captureStream(30).getVideoTracks()[0]; this.ontrack({track:tr,streams:[]});}
   this.connectionState='connected';this.onconnectionstatechange&&this.onconnectionstatechange();},60);}};
 try{Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>({release(){}})},configurable:true});}catch(_){}
 try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}},configurable:true});}catch(_){}
 window.confirm=(t)=>{window.__conf=t; return true;};
})();""" % len(CAMF)
CSSLIMPA = ("#mvAvisoMed,#mvBoasVindas,.mvTutBox,.lvAulaBox,#bannerVerif,.mvAvisoMed{display:none!important} .mv-rv,.mv-img{opacity:1!important;transform:none!important;filter:none!important} *{caret-color:transparent!important} #btnSom{display:none!important}"
            ".__tq{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.45);border:3px solid #fff;z-index:2147483647;pointer-events:none;animation:__tq 0.9s ease-out forwards}"
            "@keyframes __tq{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.6);opacity:0}}"
            ".__rl{outline:3px solid #ffb23f!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgba(255,178,63,.25),0 0 22px rgba(255,154,31,.65)!important;border-radius:10px}")
HEX = '0123456789abcdef0123456789abcdef'
WHEP = 'https://customer-x0.cloudflarestream.com/' + HEX + '/webRTC/play'
COPIA = ('00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540599.905802BR59' + ('%02d' % len(CFG['nome'])) + CFG['nome'].upper() + '6008CURITIBA62070503***6304A1B2')

async def ctxNovo(br, fake, robo, vw, vh, dsf, mobile=True):
    ctx = await br.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=dsf, is_mobile=mobile, has_touch=mobile,
                               locale='pt-BR', timezone_id='America/Sao_Paulo', bypass_csp=True)
    await ctx.add_init_script('window.__FAKE=' + json.dumps(fake) + ';window.__FAKE.user&&(window.__FAKE.user.getIdToken=async()=>"tok");try{localStorage.setItem("mv_medicao","nao");localStorage.setItem("moviki_onb_AV0000000001","1");localStorage.setItem("mv_live_nome","Ana");}catch(e){} window.print=()=>{};')
    await ctx.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%s;document.head.appendChild(s);});window.mvI=window.mvI||function(img,e){var s=document.createElement('span');s.textContent=e;img.replaceWith(s);};" % json.dumps(CSSLIMPA))
    await ctx.add_init_script(CAMJS)
    pg = await ctx.new_page(); erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    CORS = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST'}
    async def rota(route):
        req = route.request; u = req.url
        if 'gstatic.com/firebasejs' in u:
            n = u.split('/')[-1]
            b = {'firebase-app.js': APP, 'firebase-app-check.js': CHECK, 'firebase-auth.js': AUTH, 'firebase-firestore.js': FS, 'firebase-storage.js': ST}.get(n, 'export {}')
            return await route.fulfill(status=200, content_type='application/javascript', body=b)
        if 'fonts.googleapis.com' in u: return await route.fulfill(status=200, content_type='text/css', body=FONTCSS)
        if '/__font/' in u:
            f = FD + u.split('/__font/')[1]
            if not os.path.exists(f): f = FD + 'Poppins-Bold.ttf'
            return await route.fulfill(status=200, content_type='font/ttf', body=open(f, 'rb').read())
        if '/__camf/' in u:
            i = int(u.split('/__camf/')[1]) % max(1, len(CAMF))
            return await route.fulfill(status=200, content_type='image/jpeg', body=open(os.path.join(CAMD, CAMF[i]), 'rb').read())
        if '/__foto/' in u:
            return await route.fulfill(status=200, content_type='image/jpeg', headers={'access-control-allow-origin': '*'}, body=open(FOTOS + '/' + u.split('/__foto/')[1].split('?')[0], 'rb').read())
        if req.method == 'OPTIONS': return await route.fulfill(status=204, headers=CORS)
        if 'moviki.com.br/api/live' in u:
            b = json.loads(req.post_data or '{}'); a = b.get('acao'); j = {'ok': True}
            if a == 'nivel': j = {'ok': True, 'nivel': 'enterprise', 'limiteMin': 180, 'sacolaMax': 20}
            if a == 'iniciar': j = {'ok': True, 'whip': 'https://customer-x0.cloudflarestream.com/' + HEX + '/webRTC/publish', 'whep': WHEP, 'limiteMin': 180, 'sessaoId': 's1'}
            return await route.fulfill(status=200, content_type='application/json', headers=CORS, body=json.dumps(j))
        if 'moviki-robo' in u or 'moviki-ai' in u or 'moviki.com.br/api' in u:
            try: b = json.loads(req.post_data or '{}')
            except Exception: b = {}
            return await route.fulfill(status=200, content_type='application/json', headers=CORS, body=json.dumps(robo(b.get('acao'), b)))
        if 'cloudflarestream.com' in u: return await route.fulfill(status=201, content_type='application/sdp', headers=CORS, body='v=0\r\n')
        if u.startswith('http://127.0.0.1'): return await route.continue_()
        for dom in ('app.moviki.com.br', 'www.moviki.com.br', 'moviki.com.br'):
            if u.startswith('https://' + dom + '/') and req.resource_type in ('image', 'font', 'stylesheet', 'script', 'media'):
                pth = urllib.parse.urlparse(u).path
                root = APPR if dom.startswith('app') else SITER
                loc = os.path.join(root, pth.lstrip('/'))
                f = loc if os.path.exists(loc) else buscar('app.moviki.com.br' if dom.startswith('app') else 'www.moviki.com.br', pth)
                if f: return await route.fulfill(status=200, path=f)
        return await route.abort()
    await pg.route('**/*', rota)
    return ctx, pg, erros

ENSAIO = {'pode': False, 'restamHoje': 5, 'maxDia': 5, 'maxMin': 10}
def roboEst(a, b):
    if a == 'loja_estado': return {'ok': True, 'temConta': False}
    if a == 'live_saldo': return {'ok': True, 'nivel': 'enterprise', 'periodo': 'mensal', 'maxEspectadores': 100, 'tetoMin': 0, 'ensaio': dict(ENSAIO)}
    return {'ok': True}
ESTADO = {'pago': False, 'esgotado': False}
def roboComprador(a, b):
    if a == 'compra_criar':
        preco = num(PROD[0][2] or PROD[0][1]); q = int(b.get('qtd') or 1)
        return {'ok': True, 'pedidoId': 'PEDX12345678', 'chave': 'k1', 'produto': P0, 'qtd': q, 'total': round(preco * q, 2), 'modo': 'pix', 'numero': 14,
                'validoAte': int(time.time() * 1000) + 30 * 60000, 'entrega': {'tipo': 'retirada'},
                'pix': {'copiaCola': (COPIA if q == 1 else COPIA.replace('540599.90', '5406' + ('%.2f' % round(preco * q, 2)))), 'imagem': '', 'recebedor': {'nome': CFG['nome'], 'documento': '***.456.789-**'}}}
    if a == 'compra_status': return {'ok': True, 'status': 'pago' if ESTADO['pago'] else 'aguardando', 'modo': 'pix'}
    return {'ok': True}

import random as _rnd
_PL = {'n': None}
def plateia():   # 05/11/2026 (Paulo): o número de espectadores não pode repetir; começa entre 28 e 46 e cresce a cada cena
    _PL['n'] = _rnd.randint(28, 46) if _PL['n'] is None else _PL['n'] + _rnd.randint(2, 7)
    return _PL['n']
FLUTUA = """setInterval(()=>{try{const p='negocios/AV0000000001/estado/live'; const d=Object.assign({},window.__FAKE.docs[p]||{});
 d.assistindo=Math.max(5,(d.assistindo||30)+[-1,0,1,1,2,3][Math.floor(Math.random()*6)]); window.__fsAdd(p,d);}catch(e){}},5000)"""
def fakeComprador(extra_live=None, chat=None, assist=None):
    assist = assist or plateia()
    im = int(time.time() * 1000)
    live = {'titulo': CFG['titulo'], 'sacola': SAC, 'fixado': {'nome': P0}, 'assistindo': assist}
    if extra_live: live.update(extra_live)
    docs = {'slugs/' + CFG['slug']: {'uid': 'AV0000000001'}, 'negocios/AV0000000001': NEG, 'assinaturas/AV0000000001': ASS,
            'negocios/AV0000000001/estado/live': live,
            'live_sessoes/AV0000000001': {'ativa': True, 'whep': WHEP, 'pulsoEm': {'__ms': im}, 'pulsoMs': im, 'sessaoId': 's1', 'maxEspectadores': 0, 'inicioMs': im - 600000},
            'checkout_publico/AV0000000001': {'ativo': True, 'modo': 'pix', 'minimo': 5, 'entrega': 'ambos', 'bairros': [{'nome': 'Centro', 'taxa': 5}, {'nome': 'Batel', 'taxa': 7}]},
            'configuracoes/liveTermos': {}}
    for i in range(assist): docs['negocios/AV0000000001/livepresenca/v%d' % i] = {'em': {'__ms': im + 3600000}}
    for m in (chat or []):
        p, d = msg(*m); docs[p] = d
    return {'user': None, 'writes': [], 'docs': docs}
def fakeEstudio(extra_live=None, extra_docs=None, assist=23):
    live = {'titulo': CFG['titulo'], 'sacola': SAC, 'fixado': {'nome': P0}}
    if extra_live: live.update(extra_live)
    f = {'user': USER, 'writes': [], 'docs': {
        'negocios/AV0000000001': NEG, 'negocios/AV0000000001/estado/live': live,
        'negocios/AV0000000001/estado/liveAceite': {'versao': '1.0'},
        'negocios/AV0000000001/estado/liveaulas': {'vistas': ['mod-live-abertura', 'mod-live-regras', 'mod-live-primeira'], 'em': ''},
        'configuracoes/liveTermos': {}, 'live_sessoes/AV0000000001': {'ativa': False}, 'assinaturas/AV0000000001': ASS}}
    f['docs'].update(dict([msg(1, 'Juliana', 'Boa noite! Cheguei', ago=30000)]))
    for i in range(assist): f['docs']['negocios/AV0000000001/livepresenca/v%d' % i] = {'em': {'__ms': now + 3600000}}
    if extra_docs: f['docs'].update(extra_docs)
    return f

async def toque(pg, sel, clicar=True):
    b = await pg.evaluate("""(s)=>{const e=document.querySelector(s); if(!e) return null; e.scrollIntoViewIfNeeded&&e.scrollIntoViewIfNeeded();
        const r=e.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2;
        const t=document.createElement('div'); t.className='__tq'; t.style.left=x+'px'; t.style.top=y+'px'; document.body.appendChild(t);
        setTimeout(()=>t.remove(),4000); return [x,y];}""", sel)
    if b is None: print('  toque: nao achou', sel)
    if clicar and b is not None:
        await pg.evaluate("(s)=>{const e=document.querySelector(s); e&&e.click();}", sel)
    return b
async def realce(pg, sel, on=True):
    await pg.evaluate("([s,on])=>{document.querySelectorAll('.__rl').forEach(e=>e.classList.remove('__rl')); if(!on) return; const e=document.querySelector(s); if(e) e.classList.add('__rl');}", [sel, on])
async def digitar(pg, sel, txt):
    await pg.evaluate("([s,t])=>{const e=document.querySelector(s); if(!e) return; e.value=t; e.dispatchEvent(new Event('input',{bubbles:true}));}", [sel, txt])
async def rolar(pg, sel, bloco='center'):
    await pg.evaluate("([s,b])=>{const e=document.querySelector(s); if(e) e.scrollIntoView({block:b});}", [sel, bloco])
async def empurra(pg, m):
    p, d = msg(*m); d = dict(d); d['criadoEm'] = {'__ms': int(time.time() * 1000)}
    await pg.evaluate('([p,d])=>window.__fsAdd(p,d)', [p, d])

async def gravar(pg, cdp, n, eventos, O, taxa=0.15, cam0=0):
    os.makedirs(O, exist_ok=True)
    for f in os.listdir(O):
        if f.endswith('.jpg'): os.remove(O + f)
    await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {'playbackRate': taxa})
    t0 = time.time()
    # 05/11/2026 (pedido do Paulo): sem vai e volta visível. A cena usa só o trecho de ida da câmera (arquivos a*);
    # se a cena for mais longa que a ida inteira, a câmera anda um pouco mais devagar para caber.
    F = max(1, sum(1 for f in CAMF if f.startswith('a')))
    if n <= F: ini = cam0 % (F - n + 1); idx = lambda i: ini + i
    else: idx = lambda i: int(round(i * (F - 1) / max(1, n - 1)))
    for i in range(n):
        await pg.evaluate('(n)=>window.__setT&&window.__setT(n)', idx(i))
        if i in eventos:
            for fn in (eventos[i] if isinstance(eventos[i], list) else [eventos[i]]): await fn()
        await pg.screenshot(path=O + '%04d.jpg' % (i + 1), type='jpeg', quality=90)
    print('  gravou', n, 'quadros em %.1fs' % (time.time() - t0), flush=True)

async def navegador(p):
    return await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required', '--lang=pt-BR'])

async def abrirEstudio(br, fake=None, robo=roboEst, aoVivo=True, aba=None):
    ctx, pg, erros = await ctxNovo(br, fake or fakeEstudio(), robo, 390, 844, 2)
    await pg.goto('http://127.0.0.1:%d/live.html' % PA)
    await pg.wait_for_selector('#stPronto:not(.escondido)', timeout=25000); await asyncio.sleep(1.5)
    await pg.click('#btnCamera'); await asyncio.sleep(2)
    if aoVivo:
        await pg.click('#btnIniciar'); await asyncio.sleep(1)
        await pg.evaluate("window.__FAKE.docs['live_sessoes/AV0000000001']={ativa:true,sessaoId:'s1'}"); await asyncio.sleep(3)
        await pg.keyboard.press('Escape'); await asyncio.sleep(1.2)
    if aba:
        await pg.evaluate("(k)=>{const b=document.querySelector('.aba[data-k=\"'+k+'\"]'); b&&b.click();}", aba)
        await asyncio.sleep(1)
    return ctx, pg, erros

async def abrirPublica(br, fake=None, robo=roboComprador, espera=5):
    ctx, pg, erros = await ctxNovo(br, fake or fakeComprador(), robo, 390, 844, 2)
    await pg.goto('http://127.0.0.1:%d/live/%s' % (PS, CFG['slug'])); await asyncio.sleep(espera)
    await pg.evaluate("setInterval(()=>{const d=window.__FAKE.docs['live_sessoes/AV0000000001']; if(d){d.pulsoMs=Date.now(); d.pulsoEm={__ms:Date.now()}; window.__fsRefresh&&window.__fsRefresh();}},8000)")
    return ctx, pg, erros
