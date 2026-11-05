# Cenas da LIVE do DESEJO live-primeiro (05/11/2026): live publica e estudio reais, Firebase de mentira.
# uso: python3 rec_live.py <pasta_video> [cena,cena...]   (cenas: G,1..9)
import asyncio, sys, os, json, subprocess, time
sys.path.insert(0, '/home/claude/w/motor')
import base
from base import *
AQ = sys.argv[1]; SO = sys.argv[2].split(',') if len(sys.argv) > 2 else []
R = AQ + '/rec/'
LEAD, TAIL = 0.25, 0.45
def nq(k):
    a = AQ + '/audio/%s.mp3' % k
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a]).decode())
    return int(round((LEAD + d + TAIL) * 30)) + 3
def agora(): return int(time.time() * 1000)
FIM = agora() + 9 * 60000 + 41000
def oferta(vend=2, res=0, est=8):
    return {'nome': P0, 'precoDe': PROD[0][1], 'precoPor': PROD[0][2], 'fimEm': FIM, 'estoque': est, 'vendidos': vend,
            'reservas': [agora() + (6 + k) * 60000 for k in range(res)]}
CHAT0 = [(2, 'Carla', TXT['chat0'][0], 'msg', 40000), (3, 'Bia', TXT['chat0'][1], 'msg', 20000)]

async def pub(br, fake=None, vw=390, vh=844, dsf=2, espera=5):
    ctx, pg, er = await ctxNovo(br, fake or fakeComprador(chat=CHAT0), roboComprador, vw, vh, dsf)
    await pg.goto('http://127.0.0.1:%d/live/%s' % (PS, CFG['slug']))
    if espera: await asyncio.sleep(espera)
    await pg.evaluate("setInterval(()=>{const d=window.__FAKE.docs['live_sessoes/AV0000000001']; if(d){d.pulsoMs=Date.now(); d.pulsoEm={__ms:Date.now()}; window.__fsRefresh&&window.__fsRefresh();}},8000)")
    return ctx, pg, er

async def G(br):   # gancho: live em tela cheia 9:16, chat chegando
    ctx, pg, er = await pub(br, vw=432, vh=768, dsf=2.5)
    cdp = await ctx.new_cdp_session(pg)
    ev = {18: lambda: empurra(pg, (4, 'Dani', TXT['g'][0])), 60: lambda: empurra(pg, (5, 'Lu', TXT['g'][1], 'quero')),
          105: lambda: empurra(pg, (6, 'Rose', TXT['g'][2]))}
    await gravar(pg, cdp, nq('gancho'), ev, R + 'G/', cam0=60); await ctx.close(); return er

async def c1(br):  # a cliente toca no link e a live abre, sem baixar nada
    ctx, pg, er = await ctxNovo(br, fakeComprador(chat=CHAT0), roboComprador, 390, 844, 2)
    cdp = await ctx.new_cdp_session(pg)
    async def abre():
        await pg.goto('http://127.0.0.1:%d/live/%s' % (PS, CFG['slug']), wait_until='commit')
    await abre(); await asyncio.sleep(0.15)
    ev = {150: lambda: realce(pg, '#pillVivo'), 205: lambda: realce(pg, '', False)}
    await gravar(pg, cdp, nq(1), ev, R + 'c1/', cam0=200); await ctx.close(); return er

async def c2(br):  # produto fixado com foto, preco e desconto
    ctx, pg, er = await pub(br)
    cdp = await ctx.new_cdp_session(pg)
    ev = {20: lambda: realce(pg, '#cardFixo'), 175: lambda: realce(pg, '', False)}
    await gravar(pg, cdp, nq(2), ev, R + 'c2/', cam0=120); await ctx.close(); return er

async def c3(br):  # pergunta no chat, resposta da loja para todos
    ctx, pg, er = await pub(br)
    cdp = await ctx.new_cdp_session(pg)
    async def rl():
        await pg.evaluate("(()=>{document.querySelectorAll('.__rl').forEach(e=>e.classList.remove('__rl')); const m=[...document.querySelectorAll('#chat .msg.dono, #pilha .msg.dono, .msg.dono')].pop(); m&&m.classList.add('__rl');})()")
    ev = {8: lambda: empurra(pg, (7, 'Carla', TXT['pergunta'])), 55: lambda: empurra(pg, (8, CFG['nome'], TXT['resposta'], 'dono')), 62: rl}
    await gravar(pg, cdp, nq(3), ev, R + 'c3/', cam0=240); await ctx.close(); return er

async def c4(br):  # toque em Comprar, quantidade e como receber
    ctx, pg, er = await pub(br)
    cdp = await ctx.new_cdp_session(pg)
    ev = {18: lambda: toque(pg, '#cardFixo [data-comprar]'), 75: lambda: toque(pg, '#ckMais'),
          110: lambda: rolar(pg, '.ckEnt'), 118: lambda: realce(pg, '.ckEnt'), 150: lambda: toque(pg, '#ckEntRet input')}
    await gravar(pg, cdp, nq(4), ev, R + 'c4/', cam0=300); await ctx.close(); return er

async def c5(br):  # Pix na hora, direto na conta da loja
    ctx, pg, er = await pub(br)
    await pg.evaluate("(()=>{const e=document.querySelector('#cardFixo [data-comprar]'); e&&e.click();})()"); await asyncio.sleep(1.5)
    await pg.click('#ckMais'); await asyncio.sleep(0.3)
    await pg.fill('#ckNome', 'Ana Souza'); await pg.fill('#ckWpp', '(41) 99999-0000'); await pg.fill('#ckCpf', '529.982.247-25')
    try:
        await pg.check('#ckMostrar')
    except Exception: pass
    try:
        await pg.check('#ckAceite')
    except Exception: pass
    await asyncio.sleep(0.4); await pg.click('#ckGerar'); await asyncio.sleep(2)
    await rolar(pg, '#ckQr')
    cdp = await ctx.new_cdp_session(pg)
    ev = {12: lambda: realce(pg, '#ckQr'), 95: lambda: realce(pg, '', False), 100: lambda: toque(pg, '#ckCopiar')}
    await gravar(pg, cdp, nq(5), ev, R + 'c5/', cam0=360); await ctx.close(); return er

async def c6(br):  # oferta relampago com contagem e estoque
    ctx, pg, er = await pub(br, fakeComprador({'oferta': oferta()}, chat=CHAT0))
    cdp = await ctx.new_cdp_session(pg)
    async def push(o):
        await pg.evaluate("(o)=>{const p='negocios/AV0000000001/estado/live'; const d=Object.assign({},window.__FAKE.docs[p]||{}); d.oferta=o; window.__fsAdd(p,d);}", o)
    ev = {15: lambda: realce(pg, '#cardFixo'), 70: lambda: push(oferta(3)), 95: lambda: empurra(pg, (9, 'Lu', TXT['garanti'], 'quero')),
          130: lambda: push(oferta(4)), 150: lambda: realce(pg, '#faixaOferta'), 205: lambda: realce(pg, '', False)}
    await gravar(pg, cdp, nq(6), ev, R + 'c6/', cam0=420); await ctx.close(); return er

async def c7(br):  # lado da loja: so o celular, Entrar ao vivo, pedido chega
    ctx, pg, er = await ctxNovo(br, fakeEstudio(), roboEst, 390, 844, 2)
    await pg.goto('http://127.0.0.1:%d/live.html' % PA)
    await pg.wait_for_selector('#stPronto:not(.escondido)', timeout=25000); await asyncio.sleep(1.5)
    await pg.click('#btnCamera'); await asyncio.sleep(2)
    await rolar(pg, '#btnIniciar')
    cdp = await ctx.new_cdp_session(pg)
    async def entra():
        await toque(pg, '#btnIniciar')
    async def ativa():
        await pg.evaluate("window.__FAKE.docs['live_sessoes/AV0000000001']={ativa:true,sessaoId:'s1'}")
    async def esc():
        await pg.keyboard.press('Escape')
    async def chega():
        d = ped(14, 'conferindo', 'Ana Souza', P0, 2, round(2 * num(PROD[0][2] or PROD[0][1]), 2), 0); d['criadoEm'] = {'__ms': agora()}
        await pg.evaluate('([p,d])=>window.__fsAdd(p,d)', ['pedidos/P14', d])
    ev = {15: lambda: realce(pg, '#btnIniciar'), 55: entra, 58: lambda: realce(pg, '', False), 62: ativa, 120: esc, 160: chega, 185: lambda: realce(pg, '#paValor')}
    await gravar(pg, cdp, nq(7), ev, R + 'c7/', cam0=480); await ctx.close(); return er

async def c8(br):  # ensaio que ninguem ve
    base.ENSAIO['pode'] = True
    ctx, pg, er = await ctxNovo(br, fakeEstudio(), roboEst, 390, 844, 2)
    await pg.goto('http://127.0.0.1:%d/live.html' % PA)
    await pg.wait_for_selector('#stPronto:not(.escondido)', timeout=25000); await asyncio.sleep(1.5)
    await pg.click('#btnCamera'); await asyncio.sleep(2)
    await rolar(pg, '#btnEnsaio')
    cdp = await ctx.new_cdp_session(pg)
    ev = {12: lambda: realce(pg, '#btnEnsaio'), 70: lambda: toque(pg, '#btnEnsaio', clicar=False)}
    await gravar(pg, cdp, nq(8), ev, R + 'c8/', cam0=540); await ctx.close(); base.ENSAIO['pode'] = False; return er

async def c9(br):  # + Seguir: avisada quando a loja entra ao vivo
    ctx, pg, er = await pub(br)
    cdp = await ctx.new_cdp_session(pg)
    ev = {10: lambda: realce(pg, '#btnSeguir'), 45: lambda: realce(pg, '', False), 48: lambda: toque(pg, '#btnSeguir')}
    await gravar(pg, cdp, nq(9), ev, R + 'c9/', cam0=20); await ctx.close(); return er

CENAS = {'G': G, '1': c1, '2': c2, '3': c3, '4': c4, '5': c5, '6': c6, '7': c7, '8': c8, '9': c9}
async def main():
    async with async_playwright() as p:
        br = await navegador(p)
        for k, fn in CENAS.items():
            if SO and k not in SO: continue
            print('cena', k, flush=True)
            try:
                er = await fn(br)
                if er: print('  erros', er[:4])
            except Exception as e:
                print('  FALHOU', str(e)[:300])
        await br.close()
asyncio.run(main())
