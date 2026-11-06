# Monta as alterações dos 2 PRs do kit do feed (05/11/2026): catálogo do Material de apoio e grade do robô.
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from kit_ramos import RAMOS, legenda_material, legenda_grade, chamada
from PIL import Image
E = '/home/claude/entrega/kit'; CAPAS = '/home/claude/entrega/direct'
APP = '/tmp/mvapp-main'; SOC = '/tmp/mvsocial'
URL = 'https://firebasestorage.googleapis.com/v0/b/moviki-app.firebasestorage.app/o/material%2F{}.mp4?alt=media'
REG = [json.loads(l) for l in open('/home/claude/protecao/registro.jsonl') if l.strip()]
def marca(i):
    m = [r for r in REG if r['id'] == i]; return m[-1]['marca'] if m else ''
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())
def mmss(s): s = int(round(s)); return '%d:%02d' % (s // 60, s % 60)
def mb(p): return ('%.1f MB' % (os.path.getsize(p) / 1e6)).replace('.', ',')

itens_app, itens_soc, linhas = [], [], []
for k in RAMOS:
    r = k['r']; a = 'reel-%s-ao-vivo' % r; c = a + '-comente'
    fa, fc = E + '/' + a + '.mp4', E + '/' + c + '.mp4'
    if not (os.path.exists(fa) and os.path.exists(fc)): print('falta', r); continue
    capa = Image.open(CAPAS + '/capa-live-%s.jpg' % r).convert('RGB')
    capa.resize((480, 853), Image.LANCZOS).save(APP + '/material/capas/%s.webp' % a, 'WEBP', quality=82)
    capa.save(SOC + '/conteudo/acervo-capas/%s.jpg' % c, quality=88)
    d = dur(fa)
    itens_app.append({'id': 'video-%s-ao-vivo' % r, 'tipo': 'video', 'titulo': k['gancho'], 'formato': 'Reels 9:16',
                      'duracao': mmss(d), 'peso': mb(fa), 'arquivo': URL.format(a), 'capa': 'material/capas/%s.webp' % a,
                      'w': 1080, 'h': 1920, 'novo': True, 'legenda': legenda_material(k),
                      'dica': 'Poste como Reels (%s passa do limite do Story). Na legenda, deixe o seu link e o #publi.' % mmss(d).replace(':', 'min'),
                      'categoria': k['cat'], 'ramo': r})
    itens_soc.append({'id': c, 'formato': 'reel', 'pilar': 'ramo', 'ramo': r, 'titulo': k['gancho'], 'video': URL.format(c),
                      'capa': 'https://raw.githubusercontent.com/eikosistemas-pj/moviki-assistente-social/main/conteudo/acervo-capas/%s.jpg' % c,
                      'legenda': legenda_grade(k), 'chamada': chamada(k), 'cartela': False, 'tipo_pauta': 'conversao',
                      'canais': ['instagram'], 'vende_live': True, 'dias': k['dias'], 'a_partir_de': '2026-11-06',
                      'valido_ate': '2027-01-31', 'reconferir_em': '2027-01-15', 'repetir_apos_dias': 7, 'marca': marca(c),
                      'obs': 'Ramo %s (05/11/2026). Mesmo vídeo do direct (live-%s, loja de exemplo) com o fim trocado (sem "toca em Começar agora grátis") e a cartela falada "Comenta %s" colada. Só Instagram: a palavra %s dispara "Comente %s" do ManyChat, que não está no Facebook. Cartela LIVE desligada. Vídeo no Firebase Storage material/ (subido pelo Paulo).' % (r, r, k['pal'], k['pal'], k['pal'])})
    linhas.append((r, a, marca(a), mb(fa), mmss(d), c, marca(c), mb(fc), mmss(dur(fc))))

# catálogo: insere antes do fim da lista de itens, preservando CRLF
p = APP + '/material/catalogo.json'; t = open(p, 'rb').read().decode('utf-8')
fim = '    }\r\n  ],\r\n  "categorias"'
assert t.count(fim) == 1
bloco = ',\r\n'.join('    ' + json.dumps(i, ensure_ascii=False, indent=2).replace('\n', '\r\n    ') for i in itens_app)
t = t.replace(fim, '    },\r\n' + bloco + '\r\n  ],\r\n  "categorias"')
v0 = json.loads(t)['versao']; t = t.replace('"versao": "%s"' % v0, '"versao": "2026-11-05-reels-ramos"', 1)
open(p, 'wb').write(t.encode('utf-8')); json.loads(t)

# grade: mesmo formato (indent 1, LF)
import re
g = SOC + '/conteudo/grade.json'; t = open(g).read(); v0 = json.loads(t)['versao']
def item_txt(it):
    o = json.dumps(it, ensure_ascii=False, indent=1)
    o = re.sub(r'\[\n\s+((?:"[^"\n]*"|[0-9.]+)(?:,\n\s+(?:"[^"\n]*"|[0-9.]+))*)\n\s+\]', lambda m: '[' + ', '.join(x.strip() for x in m.group(1).split(',\n')) + ']', o)
    return '\n'.join('  ' + l for l in o.split('\n'))
assert t.endswith('  }\n ]\n}\n')
t = t[:-len(' ]\n}\n')].rstrip('\n') + ',\n' + ',\n'.join(item_txt(i) for i in itens_soc) + '\n ]\n}\n'
t = t.replace('"versao": "%s"' % v0, '"versao": "2026-11-05-reels-ramos"', 1); json.loads(t)
open(g, 'w').write(t)
for l in linhas: print(*l)
