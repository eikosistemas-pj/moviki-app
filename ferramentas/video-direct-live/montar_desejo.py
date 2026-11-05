# Monta o reel DESEJO (03/11/2026): gancho do Kairogen acelerado + passeio rápido pela página
# da loja de amostra num cartão de celular que desliza entre as cenas + cartão final da marca.
# Texto grande no alto (a fala, com a palavra-chave em destaque), selo "Loja de exemplo",
# trilha de fundo com abaixamento sob a voz. 1080x1920, 30 fps.
# uso: python3 montar_desejo.py <pasta_do_video> [--comente]
#   --comente: acrescenta o cartão 'Comente <PALAVRA>' (roteiro.chamada) e grava <k>-comente.mp4 (versão do Instagram, ManyChat)
# A pasta tem: roteiro.json, gancho.mp4, audio/{gancho,1..N,fim,sfx,trilha}.mp3, grav/c<n>/ (rec_desejo.py)
import json, math, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQ = os.path.abspath(sys.argv[1]); R = json.load(open(AQ + '/roteiro.json')); K = R['k']
COMENTE = '--comente' in sys.argv[2:] and bool(R.get('chamada'))
if COMENTE: K = K + '-comente'
W, H, FPS = 1080, 1920, 30
FD = '/usr/share/fonts/truetype/google-fonts/'
FT = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 60)
FB = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 88)
FS = ImageFont.truetype(FD + 'Poppins-Medium.ttf', 44)
FSELO = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 25)
FP = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 150)
LOGO_PNG = os.environ.get('LOGO', '/home/claude/moviki-app/logo.png')
LEAD = 0.25
AMBAR = (255, 196, 74, 255)
COR = tuple(int(R.get('cor', '#8e2a4f')[i:i + 2], 16) for i in (1, 3, 5))

def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def ease_out(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3
def back(x):
    x = max(0.0, min(1.0, x)); c = 1.4; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

# ---------- texto do alto (fala com palavra-chave em destaque) ----------
d0 = ImageDraw.Draw(Image.new('RGB', (10, 10)))
def tw(t, f=None): return d0.textlength(t, font=f or FT)
def linhas(txt, maxw=960):
    ps = txt.split(); ls = []; cur = ''
    for p in ps:
        t = (cur + ' ' + p).strip()
        if tw(t) <= maxw or not cur: cur = t
        else: ls.append(cur); cur = p
    if cur: ls.append(cur)
    if len(ls) == 2 and len(ls[1].split()) == 1 and len(ls[0].split()) > 2:  # evita viúva
        a = ls[0].split(); ls = [' '.join(a[:-1]), a[-1] + ' ' + ls[1]]
    return ls
def marcas(txt, dest):
    """índices de caractere que ficam em destaque"""
    on = [False] * len(txt)
    for d in dest or []:
        for m in re.finditer(re.escape(d), txt):
            for i in range(m.start(), m.end()): on[i] = True
    return on
def bloco_texto(txt, dest):
    global FT
    for tam in (60, 54, 50):
        FT = ImageFont.truetype(FD + 'Poppins-Bold.ttf', tam); ls = linhas(txt)
        if len(ls) <= 2: break
    lh = int(tam * 1.27)
    img = Image.new('RGBA', (W, lh * len(ls) + 40), (0, 0, 0, 0)); dd = ImageDraw.Draw(img)
    sombra = Image.new('RGBA', img.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
    on = marcas(txt, dest); pos = 0; y = 14
    for l in ls:
        i0 = txt.find(l, pos); pos = i0 + len(l)
        x = (W - tw(l)) / 2
        ds.text((x, y + 4), l, font=FT, fill=(0, 0, 0, 230), stroke_width=6, stroke_fill=(0, 0, 0, 200))
        for j, ch in enumerate(l):
            cor = AMBAR if (i0 >= 0 and on[i0 + j]) else (255, 255, 255, 255)
            dd.text((x, y), ch, font=FT, fill=cor); x += tw(ch)
        y += lh
    sombra = sombra.filter(ImageFilter.GaussianBlur(9))
    sombra.alpha_composite(img); return sombra

# ---------- peças fixas ----------
G = R['gancho']; GF = AQ + '/mont/gancho'; os.makedirs(GF, exist_ok=True)
if not os.path.exists(GF + '/g0001.jpg'):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(G['ini']), '-to', str(G['fim']), '-i', AQ + '/' + G['clip'],
                    '-vf', f"setpts=PTS/{G['vel']},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}", '-q:v', '2', GF + '/g%04d.jpg'], check=True)
gq = sorted(x for x in os.listdir(GF) if x.endswith('.jpg')); TG = len(gq) / FPS
ult = Image.open(GF + '/' + gq[-1]).convert('RGB')
FUNDO = ult.filter(ImageFilter.GaussianBlur(42))
FUNDO = Image.blend(FUNDO, Image.new('RGB', (W, H), (14, 8, 12)), 0.58).convert('RGBA')
luz = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dl = ImageDraw.Draw(luz)
for r_ in range(0, 620, 8):
    a = int(60 * (1 - r_ / 620)); dl.ellipse([W / 2 - 160 - r_, 1050 - r_, W / 2 + 160 + r_, 1250 + r_], outline=COR + (a,), width=8)
FUNDO.alpha_composite(luz.filter(ImageFilter.GaussianBlur(40)))

CW, CH, CX, CY, RAD = 792, 1408, 144, 372, 46
class Card:
    def __init__(s, cw, ch, cy):
        s.cw, s.ch, s.cy = cw, ch, cy; s.cx = (W - cw) // 2; s.ccx, s.ccy = s.cx + cw / 2, cy + ch / 2
        s.mask = Image.new('L', (cw, ch), 0); ImageDraw.Draw(s.mask).rounded_rectangle([0, 0, cw - 1, ch - 1], RAD, fill=255)
        s.somb = Image.new('RGBA', (cw + 120, ch + 120), (0, 0, 0, 0))
        ImageDraw.Draw(s.somb).rounded_rectangle([60, 74, 60 + cw, 74 + ch], RAD + 6, fill=(0, 0, 0, 180)); s.somb = s.somb.filter(ImageFilter.GaussianBlur(26))
        s.aro = Image.new('RGBA', (cw + 10, ch + 10), (0, 0, 0, 0))
        ImageDraw.Draw(s.aro).rounded_rectangle([0, 0, cw + 9, ch + 9], RAD + 5, fill=(255, 255, 255, 70))
CARD = Card(CW, CH, CY)
def card_alto(ratio):  # tela mais alta que 9:16 (ex.: a live, 540x1168): mesma altura útil, mais estreita
    ch = 1480; cw = int(round(ch * ratio / 2) * 2); return Card(cw, ch, 350)

def selo_img():
    t = R.get('selo', 'Loja de exemplo').upper(); w = int(tw(t, FSELO)) + 48; h = 48
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], h // 2, fill=(20, 14, 18, 215), outline=(255, 255, 255, 120), width=2)
    d.text((24, 8), t, font=FSELO, fill=(255, 255, 255, 240)); return im
SELO = selo_img()

def cartao(tela, cx, cy, esc=1.0, ang=0.0, alfa=1.0, card=None):
    """devolve camada RGBA com o celular centrado em (cx, cy)"""
    k = card or CARD; cw, ch = k.cw, k.ch
    t2 = tela if tela.size == (cw, ch) else tela.resize((cw, ch), Image.LANCZOS)
    pec = Image.new('RGBA', (cw + 120, ch + 120), (0, 0, 0, 0))
    pec.alpha_composite(k.somb); pec.alpha_composite(k.aro, (55, 55))
    corpo = t2.convert('RGBA'); corpo.putalpha(k.mask); pec.alpha_composite(corpo, (60, 60))
    if esc != 1.0 or ang:
        pec = pec.resize((int(pec.width * esc), int(pec.height * esc)), Image.BICUBIC)
        if ang: pec = pec.rotate(ang, resample=Image.BICUBIC, expand=True)
    if alfa < 1: pec.putalpha(pec.getchannel('A').point(lambda v: int(v * alfa)))
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0)); cam.alpha_composite(pec, (int(cx - pec.width / 2), int(cy - pec.height / 2)))
    return cam

# ---------- linha do tempo ----------
segs = []; audios = []; textos = []   # textos: (ini, fim, txt, destaque)
audios.append((AQ + '/audio/sfx.mp3', 0.0, 0.45))
gv = dur(AQ + '/audio/gancho.mp3'); g0 = 0.35
audios.append((AQ + '/audio/gancho.mp3', g0, 1.0)); textos.append((g0 - 0.1, TG, G['texto'], G.get('destaque')))
segs.append(('gancho', TG, None)); t = TG
def prep_clipe(c, cdir, d):
    os.makedirs(cdir, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-i', AQ + '/' + c['clip'], '-t', f'{d:.3f}', '-vf', f'fps={FPS}', '-q:v', '2', cdir + '/q%05d.jpg'], check=True)
    fs = sorted(x for x in os.listdir(cdir) if x.endswith('.jpg'))
    w0, h0 = Image.open(cdir + '/' + fs[0]).size
    meta = {'dur': d, 'quadros': [{'f': f, 't': j / FPS} for j, f in enumerate(fs)], 'ratio': w0 / h0}
    json.dump(meta, open(cdir + '/meta.json', 'w')); return meta
for i, c in enumerate(R['cenas']):
    cdir = f'{AQ}/grav/c{i+1}'; a = AQ + f'/audio/{i+1}.mp3'; ad = dur(a)
    meta = prep_clipe(c, cdir, LEAD + ad + 0.45) if c.get('clip') else json.load(open(cdir + '/meta.json'))
    meta['card'] = card_alto(meta['ratio']) if c.get('clip') else CARD
    audios.append((a, t + LEAD, 1.0)); textos.append((t + 0.05, t + meta['dur'], c.get('tela', c['texto']), c.get('destaque')))
    segs.append(('cena', meta['dur'], (cdir, meta))); t += meta['dur']
fd = dur(AQ + '/audio/fim.mp3'); FIMD = 0.45 + fd + 0.7
audios.append((AQ + '/audio/fim.mp3', t + 0.45, 1.0))
segs.append(('fim', FIMD, None)); TOTAL = t + FIMD
if COMENTE:
    cv = AQ + '/audio/' + R['chamada'].get('voz', 'chamada.mp3'); cvd = dur(cv); CTAD = 0.3 + cvd + 1.0
    audios.append((cv, TOTAL + 0.3, 1.0)); segs.append(('cta', CTAD, None)); TOTAL += CTAD
seg_ini = []; acc = 0
for s in segs: seg_ini.append(acc); acc += s[1]

cache = {}
def tela_de(cdir, meta, lt):
    k_ = meta.get('card') or CARD
    q = meta['quadros']; f = q[0]['f']
    for x in q:
        if x['t'] <= lt: f = x['f']
        else: break
    k = cdir + f
    if k not in cache:
        if len(cache) > 8: cache.clear()
        cache[k] = Image.open(os.path.join(cdir, f)).convert('RGB').resize((k_.cw, k_.ch), Image.LANCZOS)
    return cache[k]

LOGO = Image.open(LOGO_PNG).convert('RGBA'); lw = 470
LOGO = LOGO.resize((lw, round(LOGO.height * lw / LOGO.width)), Image.LANCZOS)
def tela_fim(p):
    img = Image.new('RGBA', (W, H), (7, 17, 30, 255)); g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dg = ImageDraw.Draw(g)
    for r_ in range(0, 700, 6):
        a = int(42 * (1 - r_ / 700)); dg.ellipse([W / 2 - 300 - r_, 560 - r_, W / 2 + 300 + r_, 1160 + r_], outline=(29, 111, 232, a), width=6)
    img.alpha_composite(g.filter(ImageFilter.GaussianBlur(30)))
    e = ease_out(p / 0.55); lg = LOGO.copy(); lg.putalpha(lg.getchannel('A').point(lambda v: int(v * e)))
    img.alpha_composite(lg, (int(W / 2 - LOGO.width / 2), int(600 - 40 * (1 - e))))
    d = ImageDraw.Draw(img); y = 860
    for j, l in enumerate(R['fim']['titulo']):
        e2 = ease_out((p - 0.25 - 0.18 * j) / 0.45)
        d.text(((W - d.textlength(l, font=FB)) / 2, y + 30 * (1 - e2)), l, font=FB, fill=(255, 255, 255, int(255 * e2))); y += 112
    e3 = ease_out((p - 0.9) / 0.5); sub = R['fim']['sub']
    d.text(((W - d.textlength(sub, font=FS)) / 2, y + 36), sub, font=FS, fill=(140, 200, 255, int(255 * e3)))
    return img

def balao(d, cx, cy, s, cor):
    w, h = 120 * s, 92 * s
    d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 26 * s, fill=cor)
    d.polygon([(cx - w * 0.22, cy + h / 2 - 2), (cx - w * 0.38, cy + h / 2 + 30 * s), (cx - w * 0.02, cy + h / 2 - 2)], fill=cor)
    for k in (-1, 0, 1): d.ellipse([cx + k * 30 * s - 9 * s, cy - 9 * s, cx + k * 30 * s + 9 * s, cy + 9 * s], fill=(7, 17, 30, 255))
def tela_cta(p):
    C = R['chamada']; img = Image.new('RGBA', (W, H), (7, 17, 30, 255)); g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dg = ImageDraw.Draw(g)
    for r_ in range(0, 700, 6):
        a = int(42 * (1 - r_ / 700)); dg.ellipse([W / 2 - 300 - r_, 560 - r_, W / 2 + 300 + r_, 1160 + r_], outline=(29, 111, 232, a), width=6)
    img.alpha_composite(g.filter(ImageFilter.GaussianBlur(30))); d = ImageDraw.Draw(img)
    e = ease_out(p / 0.35); s = 0.6 + 0.4 * back(p / 0.5)
    pul = 1 + 0.06 * max(0, math.sin(2 * math.pi * (p - 0.6) / 1.1)) if p > 0.6 else 1
    balao(d, W / 2, 470 - 20 * (1 - e) + 10 * math.sin(2 * math.pi * p / 1.4), 1.3 * s, (255, 196, 74, int(255 * e)))
    l1 = C.get('linha1', 'Comente'); d.text(((W - d.textlength(l1, font=FB)) / 2, 640), l1, font=FB, fill=(255, 255, 255, int(255 * e)))
    pal = C['palavra']; pw = d.textlength(pal, font=FP); bw, bh = (pw + 120) * s * pul, 210 * s * pul
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dc = ImageDraw.Draw(cam)
    dc.rounded_rectangle([W / 2 - bw / 2, 900 - bh / 2, W / 2 + bw / 2, 900 + bh / 2], int(40 * s), fill=(255, 196, 74, 255))
    img.alpha_composite(cam)
    tx = Image.new('RGBA', (int(pw + 40), 220), (0, 0, 0, 0)); ImageDraw.Draw(tx).text((20, 0), pal, font=FP, fill=(20, 14, 18, 255))
    tx = tx.resize((max(1, int(tx.width * s * pul)), max(1, int(tx.height * s * pul))), Image.BICUBIC)
    img.alpha_composite(tx, (int(W / 2 - tx.width / 2), int(900 - tx.height / 2 - 18 * s)))
    e3 = ease_out((p - 0.5) / 0.4); d = ImageDraw.Draw(img)
    for j, l in enumerate(C.get('sub', [])):
        d.text(((W - d.textlength(l, font=FS)) / 2, 1080 + 62 * j), l, font=FS, fill=(140, 200, 255, int(255 * e3)))
    return img

tcache = {}
def texto_em(tt):
    for a, b, x, dd in textos:
        if a <= tt < b:
            k = x
            if k not in tcache: tcache[k] = bloco_texto(x, dd)
            return tcache[k], tt - a
    return None, 0

# ---------- render ----------
os.makedirs(AQ + '/saida', exist_ok=True); os.makedirs(AQ + '/mont', exist_ok=True)
MUDO = AQ + '/mont/mudo.mp4'; SAI = f'{AQ}/saida/{K}.mp4'
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', MUDO], stdin=subprocess.PIPE)
N = int(math.ceil(TOTAL * FPS)); SL = 0.32; ZIN = 0.5
for n in range(N):
    tt = n / FPS
    si = max(i for i, a in enumerate(seg_ini) if a <= tt + 1e-9); tipo, sd, dados = segs[si]; lt = tt - seg_ini[si]
    flut = 5 * math.sin(2 * math.pi * tt / 3.2)
    if tipo == 'gancho':
        gi = min(len(gq) - 1, int(lt * FPS)); img = Image.open(GF + '/' + gq[gi]).convert('RGBA')
    elif tipo == 'cena':
        cdir, meta = dados; tela = tela_de(cdir, meta, lt); K_ = meta['card']; CCX, CCY = K_.ccx, K_.ccy
        img = FUNDO.copy()
        if si == 1 and lt < ZIN:
            # entrada: o gancho cresce e some, o celular vem de perto
            e = ease(lt / ZIN)
            g = Image.open(GF + '/' + gq[-1]).convert('RGBA'); gs = 1 + 0.18 * e
            g = g.resize((int(W * gs), int(H * gs)), Image.BICUBIC).crop((int((W * gs - W) / 2), int((H * gs - H) / 2), int((W * gs - W) / 2) + W, int((H * gs - H) / 2) + H))
            img = Image.blend(g, img, e)
            img.alpha_composite(cartao(tela, CCX, CCY + flut, 1.28 - 0.28 * back(lt / ZIN), 0, e, K_))
        elif si > 1 and lt < SL:
            e = ease(lt / SL); pdir, pmeta = segs[si - 1][2]
            velha = tela_de(pdir, pmeta, 999); KV = pmeta['card']
            img.alpha_composite(cartao(velha, KV.ccx - 1150 * e, KV.ccy + flut, 1 - 0.08 * e, 7 * e, 1 - 0.3 * e, KV))
            img.alpha_composite(cartao(tela, CCX + 1150 * (1 - e), CCY + flut, 0.92 + 0.08 * e, -7 * (1 - e), 1.0, K_))
        else:
            pz = (lt - (ZIN if si == 1 else SL)) / 0.4
            esc = 1.0 + 0.035 * (1 - ease_out(pz)) if pz < 1 else 1.0
            img.alpha_composite(cartao(tela, CCX, CCY + flut, esc, 0, 1.0, K_))
        img.alpha_composite(SELO, (int(W / 2 - SELO.width / 2), K_.cy - SELO.height // 2 + int(flut)))
    elif tipo == 'cta':
        img = tela_cta(lt)
        if lt < 0.3: img = Image.blend(tela_fim(99), img, ease(lt / 0.3))
    else:
        img = tela_fim(lt)
        if lt < 0.5:
            pdir, pmeta = segs[si - 1][2]; e = ease(lt / 0.5); KV = pmeta['card']
            base = FUNDO.copy(); base.alpha_composite(cartao(tela_de(pdir, pmeta, 999), KV.ccx, KV.ccy, 1 - 0.25 * e, 0, 1 - e, KV))
            img = Image.blend(base, img, e)
    tx, tl = texto_em(tt)
    if tx is not None:
        e = ease_out(tl / 0.22); y = 150 if tipo != 'gancho' else 405   # gancho: abaixo da faixa do selo do carimbo (292 a 392)
        if e < 1:
            s = 0.88 + 0.12 * e; t2 = tx.resize((int(tx.width * s), int(tx.height * s)), Image.BICUBIC)
            t2.putalpha(t2.getchannel('A').point(lambda v: int(v * e)))
            img.alpha_composite(t2, (int(W / 2 - t2.width / 2), int(y + (tx.height - t2.height) / 2)))
        else: img.alpha_composite(tx, (0, y))
    ff.stdin.write(img.convert('RGB').tobytes())
ff.stdin.close(); ff.wait()

# ---------- áudio: vozes + efeito; trilha de fundo abaixa sob a voz ----------
args = ['ffmpeg', '-v', 'error', '-y', '-i', MUDO]; filt = []
for i, (f, ini, vol) in enumerate(audios):
    args += ['-i', f]; ms = int(ini * 1000)
    extra = ',afade=t=out:st=2.5:d=1.2' if f.endswith('sfx.mp3') else ''
    filt.append(f'[{i+1}:a]aresample=48000,volume={vol}{extra},adelay={ms}|{ms}[a{i}]')
nv = len(audios); args += ['-stream_loop', '-1', '-i', AQ + '/audio/trilha.mp3']
filt.append(''.join(f'[a{i}]' for i in range(nv)) + f'amix=inputs={nv}:normalize=0:duration=longest,apad,atrim=0:{TOTAL:.3f},asplit=2[voz][sc]')
filt.append(f'[{nv+1}:a]aresample=48000,highpass=f=70,lowpass=f=7000,volume=0.30,atrim=0:{TOTAL:.3f},afade=t=out:st={TOTAL-1.2:.3f}:d=1.2[tr]')
filt.append('[tr][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[trd]')
filt.append('[voz][trd]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]')
args += ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', SAI]
subprocess.run(args, check=True)
print(K, 'ok', round(TOTAL, 2), 's')
