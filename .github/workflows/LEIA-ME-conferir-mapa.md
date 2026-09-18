# Conferidor de sincronia do mapa

## O que faz

Todo dia às 08:00 (horário de Brasília) confere se o `CLAUDE.md` e as duas
cadeiras transversais (`gabinete` e `guarda`) estão **idênticos** em todos os
repositórios do Moviki:

| Arquivo | Onde é conferido |
|---|---|
| `CLAUDE.md` | 6 repositórios (os 5 de código + `moviki-vault`) |
| `.claude/skills/gabinete/SKILL.md` | 5 repositórios de código |
| `.claude/skills/guarda/SKILL.md` | 5 repositórios de código |

Se alguma cópia estiver diferente ou faltando, o workflow **abre uma issue**
aqui no `moviki-app` dizendo exatamente qual repositório está fora do padrão.
Quando as cópias voltam a bater, ele **fecha a issue sozinho**.

Só existe uma issue: se a divergência continuar, ele comenta na mesma em vez
de criar uma nova por dia.

## Por que existe

O `CLAUDE.md` registra **três divergências em 17/09/2026**, todas pelo mesmo
motivo: uma cópia foi atualizada e as outras "ficaram para depois". "Depois"
não aconteceu. A conferência tinha virado a primeira tarefa do Gabinete em
toda sessão — ou seja, dependia de alguém lembrar.

Agora não depende mais.

## Falta um passo: criar o segredo `MAPA_TOKEN`

Enquanto esse segredo não existir, o workflow **roda mas não confere nada** —
ele avisa que está faltando e passa. Não quebra nada, só não protege.

O motivo é técnico: o token automático do GitHub Actions só alcança o
repositório onde o workflow roda. Para ler os outros cinco — e o
`moviki-vault`, que é **privado** — precisa de um token seu.

### Como criar (uma vez só, 2 minutos)

1. Abra <https://github.com/settings/personal-access-tokens/new>
   (Settings → Developer settings → Personal access tokens → Fine-grained)
2. **Token name:** `conferir-mapa`
3. **Expiration:** 1 ano (anote para renovar; quando vencer, o workflow volta
   a avisar que o segredo está faltando)
4. **Repository access:** *Only select repositories* → selecione os **seis**:
   `moviki`, `moviki-robo`, `moviki-app`, `moviki-ai`,
   `moviki-assistente-social`, `moviki-vault`
5. **Permissions** → *Repository permissions* → **Contents: Read-only**.
   Só isso. Nada de escrita.
6. Clique em **Generate token** e copie o valor.
7. Vá em
   <https://github.com/eikosistemas-pj/moviki-app/settings/secrets/actions/new>
   **Name:** `MAPA_TOKEN` · **Secret:** cole o token · **Add secret**

O token é de **leitura apenas**: mesmo que vaze, não dá para alterar nada com
ele. E ele nunca aparece em log — o GitHub mascara segredos na saída.

## Como rodar na mão

<https://github.com/eikosistemas-pj/moviki-app/actions/workflows/conferir-mapa.yml>
→ botão **Run workflow**.

## Quando o aviso aparecer, o que fazer

A issue mostra o hash e o tamanho de cada cópia. A versão que aparece na
**maioria** dos repositórios é tratada como a correta; a divergente é a que
precisa ser corrigida.

Copie a versão boa por cima da divergente **no mesmo ciclo**. É literalmente
a regra do topo do `CLAUDE.md`.

Atenção ao `moviki-vault`: ele se atualiza pelo `.bat`
**SincronizarVaultMoviki** no computador do Paulo, não por Pull Request.
Se a divergência for só nele, o caminho normal é rodar o `.bat` — não abrir
PR no vault, que pode conflitar com a próxima sincronização.

## Custo

`moviki-app` é público, então Actions não consome a franquia mensal. São ~8
chamadas de API por execução, uma vez por dia.
