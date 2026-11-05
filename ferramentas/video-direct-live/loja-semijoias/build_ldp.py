# Monta a Lua de Prata local (05/11/2026) a partir do loja_semijoias.py do Project, com fotos locais em img/
import json, re, time, datetime, sys
sys.path.insert(0, '/home/claude/w/ldp')
import loja_semijoias as L
html = open('/home/claude/web/av/index.html').read()
fk = L.fake()
s = json.dumps(fk, ensure_ascii=False)
html = re.sub(r'window\.__FAKE=\{.*?\};\n', lambda m: 'window.__FAKE=' + s + ';\n', html, count=1, flags=re.S)
html = html.replace('<title>Atelier Vinha · amostra</title>', '<title>Lua de Prata · amostra</title>').replace("let slug='ateliervinha';", "let slug='luadeprata';")
open('/home/claude/web/ldp/index.html', 'w').write(html)
for f in ['fb-app-check.js', 'fb-app.js', 'fb-firestore.js']:
    open('/home/claude/web/ldp/' + f, 'w').write(open('/home/claude/web/av/' + f).read())
print('ok', len(html), html.count('luadeprata'), html.count('ateliervinha'), html.count('Atelier Vinha'))
