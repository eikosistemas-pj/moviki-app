# Capa/miniatura 1080x1920 do vídeo do direct "live primeiro" (05/11/2026)
# uso: python3 capa_live.py <pasta_video> <saida.jpg>
# fundo = quadro da live pública (rec/G), faixa escura no alto, título grande com a palavra em âmbar, selo e logo.
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
A, OUT = sys.argv[1], sys.argv[2]
FD = '/usr/share/fonts/truetype/google-fonts/'
W, H = 1080, 1920
fs = sorted(f for f in os.listdir(A + '/rec/G') if f.endswith('.jpg'))
bg = Image.open(A + '/rec/G/' + fs[int(len(fs) * 0.55)]).convert('RGB').resize((W, H), Image.LANCZOS).convert('RGBA')
g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
for y in range(0, 900):
    a = int(215 * (1 - y / 900) ** 1.4); d.line([(0, y), (W, y)], fill=(8, 10, 20, a))
bg.alpha_composite(g)
d = ImageDraw.Draw(bg)
F1 = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 104); F2 = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 66); FS = ImageFont.truetype(FD + 'Poppins-Bold.ttf', 30)
def centro(t, y, f, cor):
    w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 3, y + 5), t, font=f, fill=(0, 0, 0, 170)); d.text(((W - w) / 2, y), t, font=f, fill=cor)
centro('Sua loja', 250, F1, (255, 255, 255, 255))
centro('AO VIVO', 365, F1, (255, 196, 74, 255))
centro('sem precisar', 510, F2, (255, 255, 255, 255))
centro('de seguidores', 590, F2, (255, 255, 255, 255))
logo = Image.open(os.environ.get('LOGO', '/home/claude/moviki-app/logo.png')).convert('RGBA')
lw = 300; logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
bg.alpha_composite(logo, ((W - lw) // 2, 120))
t = 'LOJA DE EXEMPLO'; w = int(d.textlength(t, font=FS)) + 50
d.rounded_rectangle([(W - w) / 2, 700, (W + w) / 2, 752], 26, fill=(20, 14, 18, 215), outline=(255, 255, 255, 120), width=2)
d.text(((W - w) / 2 + 25, 708), t, font=FS, fill=(255, 255, 255, 240))
bg.convert('RGB').save(OUT, quality=90)
print(OUT)
