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

   OBJETIVO
   Fonte única de verdade dos macro-segmentos e sub-tipos do quiz. O motor do
   quiz (mostrarTela/mqzEscolherTipo etc., em index.html) passa a MONTAR os
   cards do Nível 1 e Nível 2 lendo este array — nada de HTML fixo por tipo.
   Pra acrescentar um macro-nicho novo no futuro, edita SÓ este arquivo — não
   mexe no motor nem no HTML.

   STATUS DOS ÍCONES (20/08/2026) — TODOS os 31 ícones no mesmo padrão
   visual (3D, fundo transparente, 256×256, sombra neutra): os 26 da rodada 3
   (Serviços ativado + Floricultura + Bar Móvel + macro Tecnologia) MAIS os 5
   da rodada 4, que substituíram os últimos ícones com fundo próprio
   (legado). Nenhum pendente.

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
         (categoria + produtos:[{nome,preco,acabando}]), sem campos extras.
         Serve tanto pra PRODUTO quanto pra SERVIÇO com preço fixo (lista de
         serviços = mesma estrutura de categoria+item+preço).
       - 'proprio' → precisa de UI/schema dedicados (variações de produto:
         tamanho, borda, adicionais, itens montáveis). moldeId aponta pro
         molde a ser implementado. ENQUANTO o molde próprio não existir,
         cardapioExemplo abaixo é usado como fallback (mesmo comportamento
         simples de hoje) — assim o registro pode ir pro ar sem bloquear
         na Fase 2 (moldes complexos: pizzaria, hamburgueria, pratofeito,
         cafeteria).
     moldeId:        id do molde próprio (null quando molde:'simples')
     cardapioExemplo: seed inicial gravado em negocios/{uid}.cardapio na
                       criação da conta (substitui TEMPLATES_CARDAPIO atual).
                       produtos: [{ nome, preco, acabando, foto }]
                       foto (DECIDIDO 20/08/2026, Eiko): string|null — UMA
                       foto por produto no molde 'simples' (o editor atual em
                       index.html permite 3 fotos/produto; no simples fica só
                       1, pra manter leve). AINDA NÃO IMPLEMENTADO no editor
                       real nem nas regras do Firestore — index.html continua
                       usando o fluxo de 3 fotos (_fotos[]) até essa decisão
                       ser desenvolvida. Ver pendência correspondente.
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
            { nome: 'X-Burger Tradicional', preco: '24,90', acabando: false }
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
            { nome: 'Pizza de Calabresa', preco: '35,00', acabando: false }
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
            { nome: 'Pastel de Carne Especial', preco: '10,00', acabando: false }
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
            { nome: 'Marmita Média (arroz, feijão, proteína e salada)', preco: '18,00', acabando: false }
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
            { nome: 'Pipoca Salgada (P)', preco: '8,00', acabando: false }
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
            { nome: 'Alface Crespa (Maço)', preco: '3,50', acabando: false }
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
          { categoria: '🌸 Flores e Plantas', produtos: [
            { nome: 'Buquê de Flores Sortidas', preco: '35,00', acabando: false },
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
            { nome: 'Cascão 2 Bolas', preco: '12,00', acabando: false }
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
            { nome: 'Suco de Laranja (500ml)', preco: '9,00', acabando: false }
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
            { nome: 'Café Expresso', preco: '6,00', acabando: false }
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
            { nome: 'Água de Coco Gelada (300ml)', preco: '8,00', acabando: false }
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
          { categoria: '🍺 Chopp e Drinks', produtos: [
            { nome: 'Chopp (Copo 300ml)', preco: '10,00', acabando: false },
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
          { categoria: '👕 Roupas', produtos: [
            { nome: 'Camiseta Estampada', preco: '25,00', acabando: false }
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
          { categoria: '👟 Calçados', produtos: [
            { nome: 'Tênis Casual', preco: '60,00', acabando: false }
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
          { categoria: '💍 Acessórios', produtos: [
            { nome: 'Colar Folheado', preco: '18,00', acabando: false }
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
          { categoria: '🏺 Decoração', produtos: [
            { nome: 'Vaso de Cerâmica Pequeno', preco: '30,00', acabando: false }
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
          { categoria: '📿 Bijuteria Artesanal', produtos: [
            { nome: 'Pulseira Trançada', preco: '15,00', acabando: false }
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
            { nome: 'Produto Artesanal', preco: '20,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'servicos',
    label: 'Serviços',
    emoji: '🛠️',
    icone: 'quiz/icones/servicos.png',
    subtipos: [
      {
        id: 'petshop',
        label: 'Petshop Móvel / Banho e Tosa',
        emoji: '🐶',
        icone: 'quiz/icones/petshop.png',
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🐶 Banho e Tosa', produtos: [
            { nome: 'Banho Completo (Pequeno Porte)', preco: '40,00', acabando: false },
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
            { nome: 'Corte Masculino', preco: '35,00', acabando: false },
            { nome: 'Barba', preco: '20,00', acabando: false }
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
            { nome: 'Manicure Simples', preco: '25,00', acabando: false },
            { nome: 'Pedicure Simples', preco: '25,00', acabando: false }
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
          { categoria: '🚗 Lavagem', produtos: [
            { nome: 'Lavagem Simples', preco: '30,00', acabando: false },
            { nome: 'Lavagem Completa + Cera', preco: '60,00', acabando: false }
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
          { categoria: '📱 Acessórios', produtos: [
            { nome: 'Capinha de Celular', preco: '20,00', acabando: false },
            { nome: 'Película de Vidro', preco: '15,00', acabando: false }
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
            { nome: 'Relógio Smartwatch', preco: '80,00', acabando: false },
            { nome: 'Power Bank 10000mAh', preco: '50,00', acabando: false }
          ] }
        ]
      }
    ]
  }

];
