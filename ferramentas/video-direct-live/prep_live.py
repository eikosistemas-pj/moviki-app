# prepara os clipes do reel LIVE primeiro (05/11/2026)
import json, os, subprocess, sys
A = '/home/claude/desejo/live-moda'; OLD = '/home/claude/desejo/moda/grav'
def run(a): subprocess.run(a, check=True)
def seq(d, out):
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', d + '/%04d.jpg', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
seq(A + '/rec/G', A + '/gancho.mp4')
for i in range(1, 10): seq(f'{A}/rec/c{i}', f'{A}/c{i}.mp4')
def velho(c, out):  # quadros com tempo variável -> 30 fps constantes
    m = json.load(open(f'{OLD}/{c}/meta.json')); q = m['quadros']; L = []
    for j, x in enumerate(q):
        fim = q[j + 1]['t'] if j + 1 < len(q) else m['dur']
        L.append(f"file '{OLD}/{c}/{x['f']}'\nduration {max(0.001, fim - x['t']):.4f}")
    L.append(f"file '{OLD}/{c}/{q[-1]['f']}'")
    open('/tmp/l.txt', 'w').write('\n'.join(L))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', '/tmp/l.txt', '-vf', 'fps=30,scale=450:800', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
for c in ['c1', 'c2', 'c3', 'c4']: velho(c, f'/tmp/v{c}.mp4')
def junta(partes, out):
    ins = []; f = ''
    for k, (p, a, b) in enumerate(partes):
        ins += ['-i', p]; f += f'[{k}:v]trim={a}:{b},setpts=PTS-STARTPTS[v{k}];'
    f += ''.join(f'[v{k}]' for k in range(len(partes))) + f'concat=n={len(partes)}:v=1[o]'
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f, '-map', '[o]', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out])
junta([('/tmp/vc1.mp4', 0, 3.4), ('/tmp/vc2.mp4', 0, 3.1)], A + '/c10.mp4')
junta([('/tmp/vc3.mp4', 0, 3.8), ('/tmp/vc4.mp4', 0.2, 2.8)], A + '/c11.mp4')
print('ok')
