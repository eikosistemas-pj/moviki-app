# prepara os clipes do vídeo do direct "live primeiro" de um ramo (05/11/2026)
# uso: python3 prep_ramo.py <pasta_video>   (a pasta tem rec/G, rec/c1..c9 da bancada da live e loja/grav/c1,c2 da página da loja)
# c10 = página da loja (topo + catálogo); c11 = sacola, entrega ou reserva, Pix. Cada um ajustado ao tempo da fala (0,25 + fala + 0,45).
import json, os, subprocess, sys
A = os.path.abspath(sys.argv[1]); L = A + '/loja/grav'
def run(a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
def seq(d, out):
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', d + '/%04d.jpg', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
seq(A + '/rec/G', A + '/gancho.mp4')
for i in range(1, 10): seq(f'{A}/rec/c{i}', f'{A}/c{i}.mp4')
def velho(c, out):  # quadros com tempo variável -> 30 fps constantes
    m = json.load(open(f'{L}/{c}/meta.json')); q = m['quadros']; li = []
    for j, x in enumerate(q):
        fim = q[j + 1]['t'] if j + 1 < len(q) else m['dur']
        li.append(f"file '{L}/{c}/{x['f']}'\nduration {max(0.001, fim - x['t']):.4f}")
    li.append(f"file '{L}/{c}/{q[-1]['f']}'")
    open('/tmp/l.txt', 'w').write('\n'.join(li))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', '/tmp/l.txt', '-vf', 'fps=30,scale=450:800', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
def ajusta(src, alvo, out):  # acelera se passou; segura o último quadro se faltou
    d = dur(src); vf = f'setpts=PTS*{alvo / d:.5f}' if d > alvo else f'tpad=stop_mode=clone:stop_duration={alvo - d + 0.1:.3f}'
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', vf + ',fps=30', '-t', f'{alvo:.3f}', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
for k, c in [(10, 'c1'), (11, 'c2')]:
    velho(c, f'/tmp/v{c}.mp4')
    ajusta(f'/tmp/v{c}.mp4', 0.25 + dur(f'{A}/audio/{k}.mp3') + 0.45 + 0.05, f'{A}/c{k}.mp4')
print('ok')
