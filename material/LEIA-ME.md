# Material de apoio do parceiro

Aba "Material de apoio" do `parceiro.html` (desde 2026-09-11-material).
O painel lê `catalogo.json` e monta a aba sozinho. **Anexar material nunca
mexe no `parceiro.html`.**

## Pastas
- `panfletos/` — arte cheia para imprimir (JPG). Se tiver espaço de QR, o QR do parceiro é desenhado por cima no navegador dele.
- `feed/` — 1080x1350 (4:5) e 1080x1080 (1:1), JPG qualidade 88.
- `stories/` — 1080x1920 (9:16), JPG qualidade 88.
- `videos/` — MP4 H.264, até 20 MB (limite de upload do GitHub web é 25 MB). Maior que isso: anexo de Release do GitHub e `arquivo` com a URL https.
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
| `legenda` | legenda sugerida; `{link}` vira o link do parceiro |
| `dica` | frase curta embaixo da prévia |
| `qr` | `{x, y, l}` em pixels da arte: canto e lado do quadrado do QR. `fundo` opcional pinta o quadrado antes |
| `texto` | `{x, y, w, cor}`: centro, topo e largura do endereço escrito embaixo do QR |
| `destaque` | cartão largo no topo |
| `novo` | etiqueta NOVO |
| `texto` (tipo texto) | mensagem pronta; aceita `{link}`, `{verificacao}` e `{meu_nome}` |

Toda vez que o catálogo muda, **trocar o `versao`** — é isso que reacende o
"NOVO" no menu de todos os parceiros.

## Regras de conteúdo
- Toda legenda começa com `#publi` (Guia CONAR 2026: conteúdo comissionado é publicidade).
- Nunca prometer ganho, venda, "garantido", "sem risco". O Moviki entrega ser encontrado.
- Nunca "trial": "teste grátis" ou "plano Básico".
- Baixar e enviar obedecem às mesmas portas do link: aprovado, aulas concluídas, compromisso aceito.
