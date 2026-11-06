# Monta as pastas das versões do feed a partir da pasta do vídeo do direct (05/11/2026).
#   reel-<ramo>-ao-vivo         -> Material de apoio do parceiro: fim "30 dias grátis · sem cartão", sem "toca em Começar agora grátis"
#   reel-<ramo>-ao-vivo-comente -> grade do robô (só Instagram): o mesmo + cartela falada "Comenta <PALAVRA>" (ManyChat)
# uso: python3 variantes.py <pasta_direct> <ramo> <PALAVRA> <voz_chamada.mp3> "<sub linha 1>" "<sub linha 2>"
import json, os, shutil, subprocess, sys
D = os.path.abspath(sys.argv[1]); RAMO, PAL, VOZ, S1, S2 = sys.argv[2:7]
FIMFEED = '/home/claude/desejo/vozes/chamada/fimfeed.mp3'
O = D + '-feed'
os.makedirs(O + '/saida', exist_ok=True)
for n in os.listdir(D):
    if n in ('audio', 'roteiro.json', 'saida', 'mont', 'cfg_carimbo.json') or n.startswith('rec'): continue
    if not os.path.exists(O + '/' + n): os.symlink(D + '/' + n, O + '/' + n)
if os.path.exists(O + '/audio'): shutil.rmtree(O + '/audio')
shutil.copytree(D + '/audio', O + '/audio')
shutil.copy(FIMFEED, O + '/audio/fim.mp3'); shutil.copy(VOZ, O + '/audio/chamada.mp3')
R = json.load(open(D + '/roteiro.json'))
R['k'] = 'reel-%s-ao-vivo' % RAMO
R['fim'] = {'titulo': ['Sua loja ao vivo', 'começa hoje.'], 'sub': '30 dias grátis · sem cartão'}
R['chamada'] = {'voz': 'chamada.mp3', 'palavra': PAL, 'linha1': 'Comente', 'sub': [S1, S2]}
json.dump(R, open(O + '/roteiro.json', 'w'), ensure_ascii=False, indent=1)
def dur(a): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a]).decode())
# carimbo: gancho = cena; da 1ª tela até o fim = tela; o resto (fim e cartela) = fim
c0 = json.load(open(D + '/cfg_carimbo.json'))['segmentos'][0]['dur']
tot = dur(D + '/saida/' + json.load(open(D + '/roteiro.json'))['k'] + '.mp4')
fimd = 0.45 + dur(D + '/audio/fim.mp3') + 0.7
cfg = {'segmentos': [{'tipo': 'cena', 'dur': c0}, {'tipo': 'tela', 'dur': round(tot - c0 - fimd, 2)}, {'tipo': 'fim', 'dur': 60}]}
json.dump(cfg, open(O + '/cfg_carimbo.json', 'w'))
print(O, cfg)
