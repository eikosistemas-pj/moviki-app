# Jacarandá Bolsas — loja de amostra de bolsas (05/11/2026)
Montada no molde da Lua de Prata. Só existe dentro do motor: nunca em produção.

- Página: copiar `amostra/atelier-vinha/` (branch amostra/cafe-aurora do moviki) para `web/jb/`, trocar o `window.__FAKE` pelo `fake()` do `loja_bolsas.py`, `<title>` e `let slug='jacarandabolsas'`. Fotos em `web/jb/img/` (900x900; capa 1600x900; logo.png circular).
- Fotos (CDN do Kairogen, `https://cdn.kairogen.ai/gallery/images/6a85cb71af7328d006a48d4c/<id>.jpg`):
  - p-tote 37d3b9a8-c97f-47a5-81ff-ec551d7a37b1 · p-ombro d4bc4d4c-18d6-40f1-81e3-9cafaae9e1e5 · p-saco bc3bea1e-0e6b-4846-93e3-dc749033b4b1
  - p-vinho b73aa2a4-2a9b-4f8c-b2a8-025746b71795 · p-transversal e08df66e-a4fa-4055-9ef0-ab53f3d6ec85 · p-palha ac2e3878-5824-47e4-84ed-1e1aab77a75b
  - p-carteira e679c92f-7f9c-4094-987f-c7b8ad1faa26 · p-mochila 0f0dd673-3294-4cef-965f-7bbaaa2990e0 · p-clutch 49c22ad5-d321-45fd-a349-170f48faeced
  - capa 9adfb670-144e-4f3e-843c-f4f3eaa72c53 · logo 6ded4b56-4844-4286-a79b-c21bba90639a
  - (bolsa matelassê com corrente a2651ddc... ficou de fora: lembra marca famosa)
- Câmera da live (Wan 3.0, 7 s, 33 créditos): `https://cdn.kairogen.ai/gallery/videos/6a85cb71af7328d006a48d4c/8374d3d1-1c95-4116-ad75-cb67cd9c718f.mp4` — também é o capaVideo da página (WebM para gravar).
- Foto do produto fixado (tote.jpg 300x300): recorte do quadro 1,6 s da câmera, caixa (20,330)-(600,910) em 720x1280.
- Vídeo pronto: Firebase Storage `material/live-bolsas.mp4` (81 s, 21.142.594 bytes, carimbo 5dd3, sha256 b734224565053327a1a5cd1dfbe9c709cb270d815d926fcaca8a689e34ffba63).
- O sfx.mp3 do DESEJO (6aea7832...) deu 404 no CDN em 05/11: foi sintetizado com ffmpeg (3 senos 1568/2093/2637 Hz com eco). Trilha: `moviki-assistente-social/assets/musica/bossa-moderna.mp3`.
