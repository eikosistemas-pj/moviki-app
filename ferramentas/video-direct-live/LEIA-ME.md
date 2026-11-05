# Vídeo do direct — "a live primeiro" (modelo aprovado pelo Paulo em 05/11/2026)

Ferramenta de produção, não vai para produção. Mora só nesta branch (`ferramentas/video-direct-live`) do moviki-app.
Nunca abrir PR desta branch para a main.

## O vídeo (ordem aprovada)
1. Gancho (live pública de verdade, tela cheia): "Imagina a sua loja ao vivo, vendendo pra sua própria clientela."
2. Sem seguidores: link no WhatsApp, entra sem baixar nada.
3. Produto fixado (foto, preço, desconto da live).
4. Chat: pergunta e a loja responde para todos.
5. Comprar, quantidade, como receber.
6. Pix na hora, direto na conta da loja, sem comissão por venda (2 peças = R$ 199,80, igual ao aviso da cena 8).
7. Oferta relâmpago com contagem e "Restam N".
8. Estúdio: só o celular, "Entrar ao vivo", aviso do pedido pago na tela.
9. Ensaio que ninguém vê.
10. Quem segue a loja é avisado (folha "Me avise da próxima live").
11. SÓ AGORA a página da loja: catálogo e foto de cada peça.
12. Sacola, entrega ou reserva, Pix.
13. Fim: "Trinta dias grátis, sem cartão. Toca em Começar agora grátis, aqui embaixo, e a sua primeira live pode ser hoje."
    O botão do ManyChat logo abaixo do vídeo se chama exatamente "Começar agora grátis" (único botão).

Legenda/regra: Pix e oferta relâmpago dentro da live são do plano Enterprise (dizer na legenda quando o vídeo for para feed). Selo "Loja de exemplo". Nada de "trial", nada de promessa de venda.

## Vozes (Malu fhtZMBwha5du5OxuvexO) — reaproveitar em todos os ramos (custo 0)
Baixar: https://cdn.kairogen.ai/audio-generations/6a85cb71af7328d006a48d4c/<id>/speech.mp3
- gancho 6aebf28ed4c0926a31c92655
- 1 6aebf28f8f9fea8ee18c817b | 2 6aebf2918f9fea8ee18c81ae | 3 6aebf292d4c0926a31c926a3
- 4 6aebf2938f9fea8ee18c81de | 5 6aebf2948f9fea8ee18c8214 | 6 6aebf295d4c0926a31c926e2
- 7 6aebf296d4c0926a31c9270f | 8 6aebf36c8f9fea8ee18c8ae8 | 9 6aebf3708f9fea8ee18c8ba5
- 10 6aebf375d4c0926a31c93090 (fala "peça": em ramo de comida gerar fala nova com "produto", 1 crédito)
- 11 6aebf37a8f9fea8ee18c8c66
- fim 6aebf97c8f9fea8ee18cd6d5
sfx e trilha: os mesmos do DESEJO de moda (skill desejo-ramo).

## Peças por ramo
- Câmera da live: clipe LIMPO 9:16 da vendedora do ramo (sem telas por cima), ~10 s. Os mp4 de moviki/ramos/ NÃO servem (já têm a interface da live). Procurar no acervo do Kairogen; se não houver, gerar 1 (~20 créditos, Veo 3.1 Lite 8 s 720p). Virar quadros 720x1280 em <W0>/cam (a0001.. e b.. em vai e volta).
- Foto do produto fixado: recorte de um quadro da câmera (custo 0).
- Loja de amostra do ramo (cenas 11 e 12): gravação da página da loja (rec_desejo.py da skill desejo-ramo). Sem loja: skill loja-amostra-ramo (~35 a 40 créditos de foto).
- Texto do chat e produtos em base.py (CFG, produtos) e rec_live.py (CHAT0, falas da cena 3) — trocar pelo ramo.

## Como rodar
- Pastas fixas no código: /home/claude/w (motor, retrato = clone do moviki-app, site = clone do moviki, cache, cam, fotos), /home/claude/prod/stubs.py, /home/claude/ugc/fs2.py. Copie os arquivos desta pasta para esses lugares.
- Playwright + Chromium; fontes Poppins em /usr/share/fonts/truetype/google-fonts/.
- `python3 probe.py` confere as duas telas.
- `python3 rec_live.py <pasta_do_video> G,1,2,3,4,5,6,7,8,9` grava as cenas da live (quadro a quadro).
- `prep_live.py` vira cada cena em mp4 e monta as cenas da loja (ajustar os caminhos A e OLD).
- `python3 montar_desejo.py <pasta_do_video>` monta com o roteiro (ver roteiro-moda.json; gancho = gancho.mp4, ini 0, vel 1; todas as cenas com "clip").
- Carimbo: carimbar.py do Project (claude/protecao-video), trocando os dois "-b:v 3500k" por "-b:v 1900k" na cópia local (nunca subir o carimbar.py para repositório: tem a chave) para ficar abaixo de 25 MB (limite de vídeo no direct do Instagram). cfg de segmentos: cena = duração do gancho, tela = soma das cenas, fim = 60.
- Moda: 81 s, cerca de 21 MB carimbado.
