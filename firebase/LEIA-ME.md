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

## Ponto que ficou em aberto

Em `firestore.rules`, dentro de `negocios/{uid}`, existe um curinga:

```
match /{documento=**} {
  allow read: if true;
```

Hoje ele não expõe nada indevido: as quatro subcoleções que existem embaixo
de `negocios` (`estado`, `livechat`, `livepresenca`, `resumo`) são públicas
por natureza — é a live, o chat da live, quem está assistindo e o resumo de
avaliações.

O risco é futuro: esse curinga **falha aberto**. No dia em que alguém criar
uma subcoleção nova embaixo de `negocios` — por exemplo a lista de clientes
ou de pedidos de um lojista — ela nasce legível por qualquer pessoa do mundo,
sem ninguém mudar uma linha de regra e sem nenhum aviso.

Trocar por uma lista explícita das quatro subcoleções públicas resolve. É
mudança de comportamento e precisa de teste, então está separada deste
pacote.
