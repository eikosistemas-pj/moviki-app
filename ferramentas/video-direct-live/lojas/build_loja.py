# Monta uma loja de amostra local para gravar (05/11/2026): python3 build_loja.py <modulo> <pasta_web>
# copia a página da loja (web/av/index.html) trocando os dados de mentira pelos do módulo.
import json, re, sys, importlib, os
sys.path.insert(0, '/home/claude/w/ldp')
L = importlib.import_module(sys.argv[1]); D = sys.argv[2]
html = open('/home/claude/web/av/index.html').read()
s = json.dumps(L.fake(), ensure_ascii=False)
html = re.sub(r'window\.__FAKE=\{.*?\};\n', lambda m: 'window.__FAKE=' + s + ';\n', html, count=1, flags=re.S)
nome = L.negocio()['nome']
html = html.replace('<title>Atelier Vinha · amostra</title>', '<title>%s · amostra</title>' % nome).replace("let slug='ateliervinha';", "let slug='%s';" % L.SLUG)
open(D + '/index.html', 'w').write(html)
for f in ['fb-app-check.js', 'fb-app.js', 'fb-firestore.js']:
    open(D + '/' + f, 'w').write(open('/home/claude/web/av/' + f).read())
print('ok', html.count('Atelier Vinha'), html.count('ateliervinha'))
