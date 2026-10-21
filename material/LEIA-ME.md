# Material de apoio do parceiro

Aba "Material de apoio" do `parceiro.html` (desde 2026-09-11-material).
O painel lê `catalogo.json` e monta a aba sozinho. **Anexar material nunca
mexe no `parceiro.html`.**

## Pastas
- `panfletos/` — arte cheia para imprimir (JPG). Se tiver espaço de QR, o QR do parceiro é desenhado por cima no navegador dele.
- `feed/` — 1080x1350 (4:5) e 1080x1080 (1:1), JPG qualidade 88.
- `stories/` — 1080x1920 (9:16), JPG qualidade 88.
- **Vídeo NÃO mora mais aqui (desde 30/09/2026, P46).** MP4 H.264 vai para o Firebase Storage, pasta `material/` do balde `moviki-app.firebasestorage.app`, com o mesmo nome. No catálogo, `arquivo` é a URL `https://firebasestorage.googleapis.com/v0/b/moviki-app.firebasestorage.app/o/material%2F<nome>.mp4?alt=media`. Só a capa WebP continua no repositório.
- `capas/` — WebP de 320 px de largura, qualidade 64. É o que a grade carrega. Toda imagem e todo vídeo têm capa.

## Campos de um item no catalogo.json
| campo | uso |
|---|---|
| `id` | único, só letras, números e hífen |
| `tipo` | `panfleto` · `feed` · `story` · `video` · `texto` |
| `titulo`, `formato`, `peso`, `duracao` | textos do cartão |
| `arquivo` | caminho `material/...` ou URL `https://` |
| `capa` | caminho da capa WebP |
| `w`, `h` | tamanho da arte (dá a proporção da capa) |
| `legenda` | legenda sugerida; `{link}` vira o link do parceiro; `{link_fundador}` vira `moviki.com.br/f/apelido` (Lote Fundador, desde 01/10/2026) |
| `dica` | frase curta embaixo da prévia |
| `qr` | `{x, y, l}` em pixels da arte: canto e lado do quadrado do QR. `fundo` opcional pinta o quadrado antes |
| `texto` | `{x, y, w, cor}`: centro, topo e largura do endereço escrito embaixo do QR |
| `destaque` | cartão largo no topo |
| `novo` | etiqueta NOVO |
| `qrDestino` | `"fundador"`: o QR do panfleto leva para `moviki.com.br/f/apelido?canal=qr` (Lote Fundador) em vez do `/v/`. Sem o campo `texto`: o endereço escrito embaixo do QR é sempre o do `/v/` |
| `valido_ate` | `AAAA-MM-DD`. No dia seguinte a peça some do Material de apoio, do cartão do evento e do robô social (desde 01/10/2026) |
| `a_partir_de` | `AAAA-MM-DD`. Peça de época: antes do dia ela não aparece no Material de apoio, no cartão do evento nem no robô social (desde 01/10/2026; vídeos de Natal da Onda 3 = 20/11). A prévia `?evento=<id>` mostra mesmo antes |
| `texto` (tipo texto) | mensagem pronta; aceita `{link}`, `{verificacao}` e `{meu_nome}` |

Toda vez que o catálogo muda, **trocar o `versao`** — é isso que reacende o
"NOVO" no menu de todos os parceiros.

## Eventos (desde 01/10/2026)
Campo `eventos` no topo do `catalogo.json`. Cada evento vira um **cartão** no painel do parceiro (Divulgação, atalho na Visão geral e Área do criador) só entre `inicio` e `fim` (dias de Brasília). Fora do prazo, o cartão some sozinho. As peças continuam também no Material de apoio.

| campo | uso |
|---|---|
| `id` | letras minúsculas, números e hífen |
| `titulo`, `sub` | título e frase do cartão |
| `inicio`, `fim` | `AAAA-MM-DD` |
| `cor` | `#rrggbb` |
| `link` | `fundador` (link `/f/` e `/fc/`) ou `parceiro` (link `/p/` e `/c/`) |
| `ancora` | opcional: id de um cartão que já existe no painel (o Lote Fundador usa `fundCard`); as peças entram dentro dele |
| `mensagem` | texto do botão "Mandar no WhatsApp", com `{link}` |
| `itens` | ids das peças do evento (precisam existir em `itens`) |

- **Peça de oferta** (preço, prazo, vaga) leva `valido_ate`: no dia seguinte ela some do Material de apoio, do cartão e do robô social. Divulgar oferta que acabou é propaganda enganosa.
- Peça só de época (sem preço) pode ficar sem `valido_ate`. Se a cena é de uma data (árvore de Natal, Réveillon), use `a_partir_de` e `valido_ate` para ela aparecer só na época.
- Conferir antes de entrar no ar: `app.moviki.com.br/parceiro.html?evento=<id>` mostra o cartão fora do prazo, marcado "prévia". O painel do dono lista os eventos em Atalhos do dono.
- Evento novo = só o catálogo (e as artes). O `parceiro.html` não muda.
- **4º botão do Material de apoio (desde 21/10/2026):** evento com `botao` ganha um botão no topo do Material de apoio, ao lado dos 3 fixos (abaixo de "Panfletos com o seu QR"), só entre `inicio` e `fim`. Ele abre todas as peças do evento num lugar só. `botao`: `nome`, `sub`, `icone` (1 caractere), `fundo`, `borda`, `texto` (cores só em `#hex`). A borda pisca (menos para quem pede movimento reduzido). Black Friday = fundo `#0b0b0d`, borda `#d4af37`; Natal = fundo vermelho escuro e borda dourada.
- **`so_evento`: "<id do evento>"** na peça = ela aparece só no botão do evento, não no ramo nem em "Para qualquer negócio".

## Regras de conteúdo
- Toda legenda começa com `#publi` (Guia CONAR 2026: conteúdo comissionado é publicidade).
- Nunca prometer ganho, venda, "garantido", "sem risco". O Moviki entrega ser encontrado.
- Nunca "trial": "teste grátis" ou "plano Básico".
- Baixar e enviar obedecem às mesmas portas do link: aprovado, aulas concluídas, compromisso aceito.

## As redes oficiais também usam estas peças (desde 22/09/2026)
O robô social (`moviki-assistente-social`) lê este `catalogo.json` ao vivo e
publica na página oficial do Moviki, sem repetir até girar o catálogo:

| Tipo no catálogo | Vira | Condição |
|---|---|---|
| `feed` | post de feed | proporção de 4:5 a 1,91:1 |
| `story` | story (sem legenda) | 9:16 |
| `video` | reel | 9:16 e de 3 a 90 s |

- A **arte vai como está**. A **legenda** é convertida sozinha: sai o `#publi`
  e `Comece pelo meu link: {link}` vira o link da bio (Instagram) ou
  `moviki.com.br` (Facebook).
- Peça com **texto de parceiro impresso na arte ou falado no vídeo** ("link
  deste parceiro", "enviado por este parceiro", "fale comigo pelo link")
  **não pode** ir para a página oficial: o id entra em `MATERIAL_EXCLUIR` no
  robô (`src/config.py` ou secret do GitHub). Hoje estão lá:
  - feed: `feed-na-hora-foodtruck`, `feed-quem-se-move`, `feed-quem-se-move-2`,
    `feed-tudo-em-um-lugar`, `feed-na-hora-cidade`, `quadrado-na-hora`,
    `quadrado-zero-comissao`;
  - story: `story-na-hora`, `story-tudo-em-um-lugar`, `story-quem-se-move`;
  - vídeo: `video-cada-negocio`, `video-live-parceiro`, `video-live-parceiro-4x5`,
    `video-parceiro-chama-parceiro`.
- Categoria `recrutar` não vai para a página oficial.
- `{link_fundador}` na página oficial vira `moviki.com.br/fundador`. Qualquer outro marcador entre chaves que o robô não conheça descarta a peça (01/10/2026).

## Vídeos no Firebase Storage (P46, 30/09/2026)

- **Por quê:** 27 vídeos somavam 420 MB dentro do Git. Cada vídeo novo engordava o repositório para sempre (o histórico guarda tudo) e cada deploy da Vercel carregava o peso.
- **Onde:** `gs://moviki-app.firebasestorage.app/material/<nome>.mp4`. Leitura pública pela regra `match /material/{arquivo=**}` do `firebase/storage.rules`; escrita só pelo console do Firebase ou pelo Cloud Shell.
- **CORS do balde:** liberado para `GET`/`HEAD`. É o que permite ao painel baixar o vídeo como arquivo e ao celular abrir o "Postar agora" com o vídeo junto. Sem CORS o vídeo toca, mas o compartilhar falha.
- **Vídeo novo:**
  1. subir o `.mp4` no console do Firebase: Storage → pasta `material` → Enviar arquivo;
  2. no `catalogo.json`, `arquivo` com a URL acima;
  3. capa WebP em `material/capas/`, como sempre.
- **Nunca** trocar o conteúdo de um vídeo mantendo o mesmo nome: versão nova ganha nome novo (`-2`, `-3`). O navegador e o robô guardam cópia pelo endereço.
- **Nunca** vídeo de lojista nesta pasta: vídeo de lojista (Vitrine em vídeo) mora só no Cloudflare Stream.

