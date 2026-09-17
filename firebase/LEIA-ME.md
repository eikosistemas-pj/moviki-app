# Regras do Firebase — cópia oficial

Este é o **texto exato** das regras que estão publicadas no console do Firebase
do projeto `moviki-app`, conferido byte a byte em 17/09/2026.

| Arquivo | O que governa |
|---|---|
| `firestore.rules` | Quem pode ler e gravar em cada coleção do banco |
| `storage.rules` | Quem pode enviar e baixar arquivo (anexos, logos, fotos) |

## Por que este arquivo existe

Até hoje as regras viviam **só dentro do console do Firebase**. Isso significava:

- ninguém conseguia revisar antes de valer;
- não havia histórico — não dava para saber o que mudou, quando, nem por quê;
- uma alteração por engano no console era invisível e não tinha como voltar.

São as regras que decidem quem lê os dados dos lojistas. É o controle de
segurança mais importante do sistema, e era o único que ficava fora do
repositório.

## Como trabalhar com isso a partir de agora

1. Mudança de regra vem para cá primeiro, em Pull Request, como qualquer
   outra alteração.
2. Depois de aprovada, o texto é publicado no console do Firebase.
3. Console e repositório precisam continuar iguais. Se divergirem, o console
   é o que está valendo de verdade — e o repositório precisa ser corrigido
   para refletir isso, nunca o contrário.

> **Atenção:** guardar o arquivo aqui **não publica nada**. Publicar continua
> sendo um passo manual no console do Firebase. Este repositório é a memória
> e a revisão; o console é o que está no ar.

## Testes

`testes/` tem testes automaticos das regras, rodando contra o emulador oficial
do Firebase — o mesmo motor que vale em producao.

```
cd firebase/testes && npm install && npm run teste
```

Eles travam, um por um, cada acesso que precisa continuar funcionando (a live,
a moderacao do chat, apagar avaliacao, o save do painel) e cada acesso que
precisa continuar barrado. Regra de seguranca sem teste e so um texto que
alguem leu uma vez.

## O curinga foi removido (17/09/2026)

Existia dentro de `negocios/{uid}` um `match /{documento=**}` com
`allow read: if true`. Ele fazia tres coisas, duas delas indesejadas:

1. **Sustentava escrita legitima** — encerrar live, moderar chat, apagar
   avaliacao, limpar presenca. Isso foi reescrito subcolecao por subcolecao;
   o comportamento e o mesmo, agora dito em voz alta.

2. **Anulava o `negocioValido()`.** Regra do Firestore e aditiva e nao tem
   "deny": como o curinga tambem alcancava o documento do negocio, bastava
   ele permitir para o `hasOnly` deixar de valer. Conferido no emulador: o
   lojista gravava campo inventado, nome vazio e cor em formato invalido.
   Sem o curinga, a lista volta a valer de verdade.

3. **Deixava publico todo documento de `estado/`** — inclusive
   `estado/liveAceite`, que guarda o **e-mail do lojista**. Agora so
   `estado/live` e `estado/liveSessao` sao publicos, que e do que a pagina
   da live precisa.

E, daqui para frente, subcolecao nova embaixo de `negocios/{uid}` nasce
**negada**, nao publica. Quem criar e obrigado a decidir, na hora, quem le.
