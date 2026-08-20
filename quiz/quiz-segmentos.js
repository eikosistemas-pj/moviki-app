/* ==========================================================================
   MOVIKI — Registro de Segmentação do Quiz de Onboarding
   Caminho no repo: moviki-app/quiz/quiz-segmentos.js   (pasta NOVA, isolada)

   ORGANIZAÇÃO NO GITHUB (Eiko, 20/08/2026: "bem separado, não mexer em nada
   da estrutura, só o finalzinho direcionando pro lugar certo"):

     moviki-app/
       index.html            ← NÃO TOCA (só recebe, no futuro, 1 linha:
                                <script src="quiz/quiz-segmentos.js"></script>
                                antes do script do quiz)
       icones/                ← NÃO TOCA — ícones antigos legados que NÃO
         foram substituídos ficam aqui (nenhum no momento; os 5 que tinham
         fundo próprio — qz-foodtruck/qz-pizzaria/qz-lanches/qz-feira/
         qz-itinerante — foram substituídos em 20/08/2026, ver quiz/icones/)
       quiz/                  ← PASTA NOVA, tudo desta etapa mora aqui
         quiz-segmentos.js    ← este arquivo
         icones/               ← TODOS os 31 ícones do quiz vivem aqui,
           todos no MESMO padrão visual (fundo transparente, objeto 3D
           flutuando + sombra neutra)
           alimentacao.png, hortifruti.png, bebidas.png, moda.png,
           artesanato.png, servicos.png, tecnologia.png (ícones de macro-segmento)
           pratofeito.png, cafeteria.png, pipoca.png, suco.png,
           aguacoco.png, roupas.png, calcados.png, acessorios.png,
           decoracao.png, bijuteriaartesanal.png, manufaturados.png,
           floricultura.png, barmovel.png, petshop.png, barbeariasalao.png,
           estetica.png, lavagemcarro.png, acessorioscelular.png,
           relogiosgadgets.png (ícones de sub-tipo, rodada 3)
           foodtruck.png, pizzaria.png, lanches.png, feira.png, sorvete.png
           (rodada 4, 20/08/2026 — substituem os 5 legados com fundo próprio,
           mesmo padrão visual dos demais; "lanches" trocou o conteúdo pra
           pastel frito, mais fiel ao rótulo "Pastelaria/Lanches de Rua")
           perfumaria.png, chaveiro.png, papelaria.png (rodada 8, 20/08/2026
           — 3 subtipos novos, ver ESTRUTURA/árvore abaixo); servicos.png
           também foi SUBSTITUÍDO nesta rodada (mesmo nome de arquivo, brilho
           especular corrigido)

   OBJETIVO
   Fonte única de verdade dos macro-segmentos e sub-tipos do quiz. O motor do
   quiz (mostrarTela/mqzEscolherTipo etc., em index.html) passa a MONTAR os
   cards do Nível 1 e Nível 2 lendo este array — nada de HTML fixo por tipo.
   Pra acrescentar um macro-nicho novo no futuro, edita SÓ este arquivo — não
   mexe no motor nem no HTML.

   STATUS DOS ÍCONES (20/08/2026, atualizado rodada 8) — 34 ícones no total,
   mesmo padrão visual (3D glossy, fundo transparente, 256×256, sombra
   sintética neutra): os 26 da rodada 3 + os 5 da rodada 4 (substituíram
   legados com fundo próprio) + os 3 NOVOS desta rodada (perfumaria.png,
   chaveiro.png, papelaria.png, pipeline Kairogen flux-2-klein-9b + chroma
   key/despill em Python, mesmo processo documentado no doc-mãe).
   RESOLVIDO nesta rodada: 'servicos.png' foi regenerado — o brilho
   especular que faltava (reclamação original do Eiko) agora está presente
   (destaque branco compacto no canto superior esquerdo da chave de boca +
   reflexos nos dentes da engrenagem, mesmo padrão de 'alimentacao.png').
   Achado novo (não corrigido nesta rodada, fora de escopo): o padrão visual
   dos 31 ícones anteriores NÃO é 100% uniforme — pelo menos `alimentacao.png`,
   `bebidas.png` e `petshop.png` têm um contorno branco "sticker" (die-cut) que
   a maioria dos outros (ex.: `moda.png`, `artesanato.png`, `pizzaria.png`) não
   tem; e `tecnologia.png` aparenta ainda ter um fundo colorido sólido por trás
   do objeto, não transparente — parece não ter passado pelo chroma key. Os 3
   ícones novos desta rodada seguiram o padrão majoritário (sem contorno,
   fundo 100% transparente).

   CARDÁPIOS — 20/08/2026: TODOS os 24 subtipos foram revisados pra ter pelo
   menos 2 categorias de exemplo (antes a maioria tinha só 1) — objetivo é
   mostrar na prática, já no seed, que o lojista pode organizar por categoria
   (ex.: "Lavagem" separado de "Polimento", com "Combos" reunindo os dois) e
   que ele tem total liberdade pra criar categorias próprias além dessas.
   Cada subtipo também ganhou pelo menos 1 item com `descricao` preenchida,
   como exemplo de uso do campo novo (ver ESTRUTURA abaixo).

   QUANTIDADE DE CATEGORIAS/ITENS — SEM LIMITE PRÁTICO (confirmado no código,
   20/08/2026): nem o editor (`index.html`, `adicionarCategoria`/`novaProdRow`)
   nem a página pública (`404.html` do repo `moviki`, `gradeCategorias`/
   `abrirCategoria`) impõem limite de quantidade — o lojista cadastra quantas
   categorias e itens quiser. O único teto existente é técnico, nas regras do
   Firestore (`regras fire base`, função `negocioValido`): `cardapio.size() <= 60`
   — isto é, até 60 CATEGORIAS por negócio (não 60 produtos; dentro de cada
   categoria os itens não têm limite nenhum). 60 categorias é uma folga gigante
   pra qualquer negócio itinerante real — na prática, não é um limite que
   alguém vai esbarrar. Não implementei nenhuma mudança aqui porque não havia
   nada pra destravar.

   IMAGENS — já chegam na página pública (confirmado no código, 20/08/2026):
   até 3 fotos por produto/serviço (`_fotos[]` no editor, `p.fotos` na página
   pública em `404.html`), incluindo os 4 subtipos de Serviços — a estrutura
   de produto é a mesma pra produto físico e pra serviço, então "pelo menos 1
   imagem por serviço" já é suportado hoje (até 3, na verdade). Fica atrás do
   plano Premium/trial (`estadoFotos()` no editor, `liberaFotos()` na página
   pública) — igual à galeria do negócio e às capas de categoria/promoção.

   DESCRIÇÃO — implementada nesta sessão (20/08/2026), fechando o pedido do
   Eiko: campo `descricao` novo em cada produto/serviço, opcional, até 280
   caracteres. Fluxo completo:
     1. Editor (`index.html`): textarea "Descrição (opcional)" em cada linha
        de produto (`novaProdRow`/`lerCardapio`) — sem gate de plano, todo
        mundo pode escrever.
     2. Página pública (`404.html`, repo `moviki`): `produtoHtml()` renderiza
        `p.descricao` (com `esc()`, mesma proteção XSS do resto do site) tanto
        no card com foto quanto no card sem foto.
     3. Firestore: nenhuma mudança de regra necessária — `negocioValido()` não
        valida o formato interno de cada categoria/produto (só o tamanho da
        lista de categorias), então o campo novo passa livre.
   Arquivos entregues nesta sessão: `index.html` (moviki-app) e `404.html`
   (moviki) atualizados — Paulo precisa subir os dois manualmente (escrita
   direta no GitHub segue bloqueada, bug #76248).

   ESTRUTURA
   MOVIKI_SEGMENTOS = [ macro, macro, ... ]
   macro = {
     id:      string único do macro-segmento (nunca reaproveitar id antigo)
     label:   texto exibido na Pergunta 1
     emoji:   fallback caso o ícone .png não carregue ou não exista ainda
     icone:   caminho do arquivo .png
     subtipos: [ subtipo, subtipo, ... ]
   }
   subtipo = {
     id:       string única DENTRO do macro (valor salvo em negocios/{uid}.template)
     label:    texto exibido na Pergunta 2
     emoji:    fallback do ícone
     icone:    caminho do arquivo .png
     molde:    'simples' | 'proprio'
       - 'simples' → reaproveita o formato atual de cardápio
         (categoria + produtos:[{nome,preco,acabando,descricao?,fotos?}]), sem
         campos extras de variação. Serve tanto pra PRODUTO quanto pra
         SERVIÇO com preço fixo (lista de serviços = mesma estrutura de
         categoria+item+preço) — inclusive quando o preço varia por
         porte/tamanho: nesse caso a variação vira múltiplas LINHAS na mesma
         categoria (ex.: "Banho Porte Pequeno" / "Banho Porte Grande"), não um
         campo de variação dedicado. Decisão registrada e justificada no doc
         `claude/moviki-quiz-arvore-segmentacao.md` (seção CARDÁPIO DE
         SERVIÇOS): o cardápio Moviki é vitrine pública sem carrinho/checkout,
         então uma UI de variação não teria função de cálculo nenhuma.
       - 'proprio' → precisa de UI/schema dedicados (variações de produto:
         tamanho, borda, adicionais, itens montáveis — casos de MONTAGEM/
         COMBINAÇÃO de item, não só variação de preço). moldeId aponta pro
         molde a ser implementado. ENQUANTO o molde próprio não existir,
         cardapioExemplo abaixo é usado como fallback (mesmo comportamento
         simples de hoje) — assim o registro pode ir pro ar sem bloquear
         na Fase 2 (moldes complexos: pizzaria, hamburgueria, pratofeito,
         cafeteria).
     moldeId:        id do molde próprio (null quando molde:'simples')
     cardapioExemplo: seed inicial gravado em negocios/{uid}.cardapio na
                       criação da conta (substitui TEMPLATES_CARDAPIO atual).
                       Cada subtipo tem PELO MENOS 2 categorias de exemplo
                       (20/08/2026) — pra deixar claro, já no primeiro
                       contato, que o lojista pode (e deve) organizar por
                       categoria, e que pode criar quantas categorias/itens
                       quiser além dessas (sem limite prático, ver nota
                       acima). produtos: [{ nome, preco, acabando, descricao?,
                       foto? }]
                       descricao (IMPLEMENTADO 20/08/2026): string opcional,
                       até 280 caracteres — texto livre pro lojista explicar
                       o que tem no produto/serviço além do nome. Já
                       funciona ponta a ponta (editor → Firestore → página
                       pública), ver nota DESCRIÇÃO acima.
                       foto (DECIDIDO 20/08/2026, Eiko, AINDA NÃO
                       IMPLEMENTADO): string|null — UMA foto por produto no
                       molde 'simples' (o editor atual em index.html permite
                       3 fotos/produto via `_fotos[]`; no simples ficaria só
                       1, pra manter leve). Diferente de `descricao`, esse
                       campo ainda não tem trabalho de implementação feito —
                       fica pendente separado (ver pendências do doc-mãe).
   }
   ========================================================================== */

window.MOVIKI_SEGMENTOS = [

  {
    id: 'alimentacao',
    label: 'Alimentação',
    emoji: '🍔',
    icone: 'quiz/icones/alimentacao.png',
    subtipos: [
      {
        id: 'foodtruck',
        label: 'Hamburgueria / Food Truck',
        emoji: '🍔',
        icone: 'quiz/icones/foodtruck.png', // v2: padronizado (fundo transparente), substitui o legado 'icones/qz-foodtruck.png'
        molde: 'proprio',
        moldeId: 'hamburgueria', // TODO Fase 2: tamanho do combo, ponto da carne, adicionais
        cardapioExemplo: [
          { categoria: '🍔 Burgers Artesanais', produtos: [
            { nome: 'X-Burger Tradicional', preco: '24,90', acabando: false, descricao: 'Pão brioche, blend 150g, queijo cheddar, alface, tomate e molho da casa.' }
          ] },
          { categoria: '🥤 Bebidas', produtos: [
            { nome: 'Refrigerante Lata', preco: '6,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'pizzaria',
        label: 'Pizzaria',
        emoji: '🍕',
        icone: 'quiz/icones/pizzaria.png', // v2: padronizado (fundo transparente), substitui o legado 'icones/qz-pizzaria.png'
        molde: 'proprio',
        moldeId: 'pizzaria', // TODO Fase 2: tamanho (P/M/G), borda, meio a meio
        cardapioExemplo: [
          { categoria: '🍕 Pizzas Salgadas', produtos: [
            { nome: 'Pizza de Calabresa', preco: '35,00', acabando: false, descricao: 'Molho de tomate, calabresa fatiada, cebola e orégano.' }
          ] },
          { categoria: '🥤 Bebidas', produtos: [
            { nome: 'Refrigerante Lata', preco: '6,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'lanches',
        label: 'Pastelaria / Lanches de Rua',
        emoji: '🍢',
        icone: 'quiz/icones/lanches.png', // v2: padronizado (fundo transparente) + conteúdo trocado pra pastel frito (mais representativo de "Pastelaria/Lanches de Rua"), substitui o legado 'icones/qz-lanches.png'
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🍢 Pastéis Fritos na Hora', produtos: [
            { nome: 'Pastel de Carne Especial', preco: '10,00', acabando: false, descricao: 'Massa fina crocante, recheio generoso de carne moída temperada.' }
          ] },
          { categoria: '🥤 Bebidas', produtos: [
            { nome: 'Caldo de Cana (500ml)', preco: '7,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'pratofeito',
        label: 'Prato Feito / Marmitex',
        emoji: '🍱',
        icone: 'quiz/icones/pratofeito.png',
        molde: 'proprio',
        moldeId: 'pratofeito', // TODO Fase 2: cliente monta o prato (proteína/arroz/feijão/salada, cada item com preço ou incluso)
        cardapioExemplo: [
          { categoria: '🍱 Marmitas', produtos: [
            { nome: 'Marmita Média (arroz, feijão, proteína e salada)', preco: '18,00', acabando: false, descricao: 'Serve 1 pessoa. Proteína do dia — pergunte as opções disponíveis.' }
          ] },
          { categoria: '🥤 Bebidas', produtos: [
            { nome: 'Suco Natural (400ml)', preco: '7,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'pipoca',
        label: 'Pipoca / Doces e Guloseimas',
        emoji: '🍿',
        icone: 'quiz/icones/pipoca.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🍿 Pipocas', produtos: [
            { nome: 'Pipoca Salgada (P)', preco: '8,00', acabando: false, descricao: 'Pipoca soltinha, feita na hora.' }
          ] },
          { categoria: '🍬 Doces', produtos: [
            { nome: 'Algodão Doce', preco: '10,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'hortifruti',
    label: 'Hortifrúti / Feira',
    emoji: '🥬',
    icone: 'quiz/icones/hortifruti.png',
    subtipos: [
      {
        id: 'feira',
        label: 'Verduras, Legumes e Frutas',
        emoji: '🥬',
        icone: 'quiz/icones/feira.png', // v2: padronizado (fundo transparente), substitui o legado 'icones/qz-feira.png'
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🥬 Verduras e Legumes', produtos: [
            { nome: 'Tomate Italiano (KG)', preco: '7,90', acabando: false },
            { nome: 'Alface Crespa (Maço)', preco: '3,50', acabando: false, descricao: 'Colhida no dia, direto do produtor.' }
          ] },
          { categoria: '🍎 Frutas', produtos: [
            { nome: 'Banana Prata (KG)', preco: '5,90', acabando: false }
          ] }
        ]
      },
      {
        id: 'floricultura',
        label: 'Floricultura / Plantas e Mudas',
        emoji: '🌸',
        icone: 'quiz/icones/floricultura.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🌸 Flores', produtos: [
            { nome: 'Buquê de Flores Sortidas', preco: '35,00', acabando: false, descricao: 'Flores da estação, embrulho simples incluso.' }
          ] },
          { categoria: '🌱 Mudas e Plantas', produtos: [
            { nome: 'Muda de Planta Ornamental', preco: '15,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'bebidas',
    label: 'Bebidas',
    emoji: '🥤',
    icone: 'quiz/icones/bebidas.png',
    subtipos: [
      {
        id: 'sorvete',
        label: 'Sorvete / Picolé / Açaí',
        emoji: '🍦',
        icone: 'quiz/icones/sorvete.png', // v2: padronizado (fundo transparente) + renomeado pra bater com o id do subtipo, substitui o legado 'icones/qz-itinerante.png'
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🍦 Sorvetes e Picolés', produtos: [
            { nome: 'Cascão 2 Bolas', preco: '12,00', acabando: false, descricao: 'Casquinha crocante, escolha 2 sabores.' }
          ] },
          { categoria: '🍨 Açaí', produtos: [
            { nome: 'Açaí 500ml', preco: '18,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'suco',
        label: 'Suco / Vitamina Natural',
        emoji: '🧃',
        icone: 'quiz/icones/suco.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🧃 Sucos Naturais', produtos: [
            { nome: 'Suco de Laranja (500ml)', preco: '9,00', acabando: false, descricao: 'Laranja espremida na hora, sem adição de açúcar.' }
          ] },
          { categoria: '🥛 Vitaminas', produtos: [
            { nome: 'Vitamina de Banana (500ml)', preco: '11,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'cafeteria',
        label: 'Café / Cafeteria Móvel',
        emoji: '☕',
        icone: 'quiz/icones/cafeteria.png',
        molde: 'proprio',
        moldeId: 'cafeteria', // TODO Fase 2: tipo de café + açúcar/adoçante/sem açúcar + tamanho
        cardapioExemplo: [
          { categoria: '☕ Cafés', produtos: [
            { nome: 'Café Expresso', preco: '6,00', acabando: false, descricao: 'Grão selecionado, moído na hora.' }
          ] },
          { categoria: '🥐 Acompanhamentos', produtos: [
            { nome: 'Pão de Queijo (unidade)', preco: '5,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'aguacoco',
        label: 'Água de Coco / Outras Bebidas',
        emoji: '🥥',
        icone: 'quiz/icones/aguacoco.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🥥 Água de Coco', produtos: [
            { nome: 'Água de Coco Gelada (300ml)', preco: '8,00', acabando: false, descricao: 'Coco geladinho, aberto na hora.' }
          ] },
          { categoria: '🥤 Outras Bebidas Geladas', produtos: [
            { nome: 'Limonada Suíça (500ml)', preco: '9,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'barmovel',
        label: 'Bar Móvel / Chopp / Drinks',
        emoji: '🍺',
        icone: 'quiz/icones/barmovel.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🍺 Chopp', produtos: [
            { nome: 'Chopp (Copo 300ml)', preco: '10,00', acabando: false, descricao: 'Chopp pilsen gelado, servido na hora.' }
          ] },
          { categoria: '🍹 Drinks', produtos: [
            { nome: 'Caipirinha', preco: '18,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'moda',
    label: 'Moda / Brechó',
    emoji: '👕',
    icone: 'quiz/icones/moda.png',
    subtipos: [
      {
        id: 'roupas',
        label: 'Roupas',
        emoji: '👕',
        icone: 'quiz/icones/roupas.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '👕 Camisetas e Blusas', produtos: [
            { nome: 'Camiseta Estampada', preco: '25,00', acabando: false, descricao: 'Tamanhos P ao GG — pergunte a disponibilidade.' }
          ] },
          { categoria: '👖 Calças e Shorts', produtos: [
            { nome: 'Calça Jeans', preco: '70,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'calcados',
        label: 'Calçados',
        emoji: '👟',
        icone: 'quiz/icones/calcados.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '👟 Tênis', produtos: [
            { nome: 'Tênis Casual', preco: '60,00', acabando: false, descricao: 'Numeração 34 a 43 — pergunte a disponibilidade.' }
          ] },
          { categoria: '👡 Sandálias e Chinelos', produtos: [
            { nome: 'Chinelo de Dedo', preco: '20,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'acessorios',
        label: 'Acessórios / Bijuterias',
        emoji: '💍',
        icone: 'quiz/icones/acessorios.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '💍 Bijuterias', produtos: [
            { nome: 'Colar Folheado', preco: '18,00', acabando: false, descricao: 'Folheado a ouro, não escurece com facilidade.' }
          ] },
          { categoria: '👜 Bolsas', produtos: [
            { nome: 'Bolsa Transversal', preco: '45,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'artesanato',
    label: 'Artesanato',
    emoji: '🎨',
    icone: 'quiz/icones/artesanato.png',
    subtipos: [
      {
        id: 'decoracao',
        label: 'Decoração / Utilidades',
        emoji: '🏺',
        icone: 'quiz/icones/decoracao.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🏺 Vasos e Utilidades', produtos: [
            { nome: 'Vaso de Cerâmica Pequeno', preco: '30,00', acabando: false, descricao: 'Peça feita à mão, pode variar levemente entre unidades.' }
          ] },
          { categoria: '🖼️ Quadros e Enfeites', produtos: [
            { nome: 'Quadro Decorativo Pequeno', preco: '40,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'bijuteriaartesanal',
        label: 'Bijuteria Artesanal',
        emoji: '📿',
        icone: 'quiz/icones/bijuteriaartesanal.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '📿 Pulseiras e Colares', produtos: [
            { nome: 'Pulseira Trançada', preco: '15,00', acabando: false, descricao: 'Feita à mão, cores sob encomenda.' }
          ] },
          { categoria: '💍 Anéis e Brincos', produtos: [
            { nome: 'Anel Artesanal', preco: '20,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'manufaturados',
        label: 'Outros Manufaturados',
        emoji: '🧵',
        icone: 'quiz/icones/manufaturados.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🧵 Produtos', produtos: [
            { nome: 'Produto Artesanal', preco: '20,00', acabando: false, descricao: 'Descreva aqui o material, tamanho e detalhes do seu produto.' }
          ] },
          { categoria: '🎁 Personalizados', produtos: [
            { nome: 'Item Personalizado sob Encomenda', preco: '35,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'servicos',
    label: 'Serviços',
    emoji: '🛠️',
    icone: 'quiz/icones/servicos.png', // REGENERADO 20/08/2026 — brilho especular corrigido (ver header do arquivo)
    // DECISÃO 20/08/2026 (Eiko pediu análise, não pergunta binária): os 4 subtipos abaixo
    // ficam 'simples' (não viram 'proprio'). Cardápio Moviki é vitrine pública sem
    // carrinho/checkout (cliente vê preço e chama no WhatsApp, não "seleciona variação
    // e compra" dentro do app) — então uma UI de variação não teria função de cálculo
    // nenhuma, só duplicaria o que 'simples' já resolve: múltiplas linhas na mesma
    // categoria, uma por variação de preço (porte do pet, tamanho do veículo, combo de
    // serviços). É o mesmo padrão que Barbearia já usava (Corte / Barba como itens
    // separados). Custo de fazer 'proprio' aqui: UI nova no editor + schema novo +
    // revisão de regras Firestore, pra um resultado que o cliente final vê exatamente
    // igual (nome + preço). Os 4 seeds abaixo mostram esse padrão (por porte/tamanho e
    // por combo) e agora também usam 2+ categorias (ex.: Lavagem separado de Polimento,
    // com Combos reunindo os dois), servindo de exemplo pro lojista organizar o próprio
    // cardápio — sem limite de quantas categorias/itens ele adicionar depois.
    subtipos: [
      {
        id: 'petshop',
        label: 'Petshop Móvel / Banho e Tosa',
        emoji: '🐶',
        icone: 'quiz/icones/petshop.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🐶 Banho', produtos: [
            { nome: 'Banho (Porte Pequeno)', preco: '35,00', acabando: false, descricao: 'Até 10kg. Inclui secagem e escovação.' },
            { nome: 'Banho (Porte Médio)', preco: '45,00', acabando: false },
            { nome: 'Banho (Porte Grande)', preco: '60,00', acabando: false }
          ] },
          { categoria: '✂️ Tosa', produtos: [
            { nome: 'Tosa Higiênica', preco: '25,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'barbeariasalao',
        label: 'Barbearia / Salão Móvel',
        emoji: '💈',
        icone: 'quiz/icones/barbeariasalao.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '💈 Cortes', produtos: [
            { nome: 'Corte Masculino', preco: '35,00', acabando: false, descricao: 'Corte na máquina ou tesoura, com acabamento.' },
            { nome: 'Barba', preco: '20,00', acabando: false },
            { nome: 'Corte + Barba', preco: '50,00', acabando: false }
          ] },
          { categoria: '🎨 Coloração e Química', produtos: [
            { nome: 'Coloração Simples', preco: '60,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'estetica',
        label: 'Estética / Manicure Móvel',
        emoji: '💅',
        icone: 'quiz/icones/estetica.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '💅 Unhas', produtos: [
            { nome: 'Manicure Simples', preco: '25,00', acabando: false, descricao: 'Corte, lixamento e esmaltação simples.' },
            { nome: 'Pedicure Simples', preco: '25,00', acabando: false },
            { nome: 'Manicure + Pedicure', preco: '45,00', acabando: false }
          ] },
          { categoria: '💇 Sobrancelhas e Depilação', produtos: [
            { nome: 'Design de Sobrancelha', preco: '20,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'lavagemcarro',
        label: 'Lavagem de Carro Móvel',
        emoji: '🚗',
        icone: 'quiz/icones/lavagemcarro.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🚗 Lavagem Simples', produtos: [
            { nome: 'Lavagem Simples (Carro Pequeno/Hatch)', preco: '30,00', acabando: false, descricao: 'Lavagem externa completa, sem cera.' },
            { nome: 'Lavagem Simples (SUV/Caminhonete)', preco: '45,00', acabando: false }
          ] },
          { categoria: '✨ Lavagem Completa + Cera', produtos: [
            { nome: 'Completa + Cera (Carro Pequeno/Hatch)', preco: '60,00', acabando: false },
            { nome: 'Completa + Cera (SUV/Caminhonete)', preco: '80,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'chaveiroconserto',
        label: 'Chaveiro / Conserto Rápido',
        emoji: '🔑',
        icone: 'quiz/icones/chaveiro.png', // NOVO, 20/08/2026 — gerado nesta rodada
        molde: 'simples',
        moldeId: null,
        // NOVO SUBTIPO (20/08/2026, Eiko aprovou): chaveiro/sapateiro/conserto rápido
        // ambulante — serviço itinerante clássico no Brasil, mesmo padrão dos outros
        // 4 de Serviços (preço fixo por item, sem carrinho/checkout).
        cardapioExemplo: [
          { categoria: '🔑 Chaves', produtos: [
            { nome: 'Cópia de Chave Simples', preco: '12,00', acabando: false, descricao: 'Chaves comuns (Yale, tetra). Traga a chave original.' },
            { nome: 'Cópia de Chave Tetra/Alta Segurança', preco: '25,00', acabando: false }
          ] },
          { categoria: '🧰 Consertos Rápidos', produtos: [
            { nome: 'Troca de Zíper', preco: '20,00', acabando: false },
            { nome: 'Ajuste de Fecho/Fivela', preco: '15,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'belezaperfumaria',
    label: 'Beleza & Perfumaria',
    emoji: '💄',
    icone: 'quiz/icones/perfumaria.png',
    // NOVO MACRO (20/08/2026, Eiko aprovou): venda de cosméticos/perfumes — é VAREJO
    // (o lojista vende o produto), diferente dos subtipos de estética/barbearia em
    // Serviços (que PRESTAM um serviço). Por ora só 1 subtipo — mesmo padrão que
    // Hortifrúti teve no começo (ver doc-mãe) antes de ganhar Floricultura. O motor
    // do quiz pula a tela de Nível 2 automaticamente quando um macro tem só 1
    // subtipo (evita pedir pro lojista "escolher" entre uma única opção).
    subtipos: [
      {
        id: 'perfumariacosmeticos',
        label: 'Perfumaria / Cosméticos',
        emoji: '💄',
        icone: 'quiz/icones/perfumaria.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '💐 Perfumes', produtos: [
            { nome: 'Perfume Importado (contratipo) 100ml', preco: '45,00', acabando: false, descricao: 'Alta fixação. Pergunte a fragrância disponível.' },
            { nome: 'Perfume Nacional 50ml', preco: '25,00', acabando: false }
          ] },
          { categoria: '💅 Maquiagem e Cuidados', produtos: [
            { nome: 'Batom Matte', preco: '18,00', acabando: false },
            { nome: 'Kit Skincare Básico', preco: '35,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'papelarialivraria',
    label: 'Papelaria & Livraria',
    emoji: '📚',
    icone: 'quiz/icones/papelaria.png',
    // NOVO MACRO (20/08/2026, Eiko aprovou): livros/papelaria de rua — camelô de
    // livros, banca de revista, material escolar avulso. Por ora só 1 subtipo,
    // mesmo raciocínio de Beleza & Perfumaria acima (nível 2 pulado automaticamente).
    subtipos: [
      {
        id: 'livrariapapelaria',
        label: 'Livraria / Papelaria de Rua',
        emoji: '📚',
        icone: 'quiz/icones/papelaria.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '📖 Livros', produtos: [
            { nome: 'Livro Usado (Literatura)', preco: '15,00', acabando: false, descricao: 'Estado de conservação varia — pergunte o título disponível.' },
            { nome: 'Livro Infantil', preco: '20,00', acabando: false }
          ] },
          { categoria: '✏️ Papelaria', produtos: [
            { nome: 'Caderno Universitário', preco: '18,00', acabando: false },
            { nome: 'Kit Canetas Coloridas', preco: '12,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'tecnologia',
    label: 'Tecnologia / Acessórios',
    emoji: '📱',
    icone: 'quiz/icones/tecnologia.png',
    subtipos: [
      {
        id: 'acessorioscelular',
        label: 'Acessórios de Celular',
        emoji: '🔌',
        icone: 'quiz/icones/acessorioscelular.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '📱 Capinhas e Películas', produtos: [
            { nome: 'Capinha de Celular', preco: '20,00', acabando: false, descricao: 'Pergunte os modelos disponíveis em estoque.' },
            { nome: 'Película de Vidro', preco: '15,00', acabando: false }
          ] },
          { categoria: '🔋 Carregadores e Cabos', produtos: [
            { nome: 'Cabo USB-C', preco: '18,00', acabando: false }
          ] }
        ]
      },
      {
        id: 'relogiosgadgets',
        label: 'Relógios e Gadgets',
        emoji: '⌚',
        icone: 'quiz/icones/relogiosgadgets.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '⌚ Relógios e Gadgets', produtos: [
            { nome: 'Relógio Smartwatch', preco: '80,00', acabando: false, descricao: 'Compatível com Android e iPhone.' },
            { nome: 'Power Bank 10000mAh', preco: '50,00', acabando: false }
          ] },
          { categoria: '🎧 Fones e Áudio', produtos: [
            { nome: 'Fone Bluetooth', preco: '45,00', acabando: false }
          ] }
        ]
      }
    ]
  }

];
