/* ==========================================================================
   MOVIKI — Registro de Segmentação do Quiz de Onboarding
   Caminho no repo: moviki-app/quiz/quiz-segmentos.js   (pasta NOVA, isolada)

   ORGANIZAÇÃO NO GITHUB (Eiko, 20/08/2026: "bem separado, não mexer em nada
   da estrutura, só o finalzinho direcionando pro lugar certo"):

     moviki-app/
       index.html            ← NÃO TOCA (só recebe, no futuro, 1 linha:
                                <script src="quiz/quiz-segmentos.js"></script>
                                antes do script do quiz)
       icones/                ← NÃO TOCA — ícones antigos ficam onde estão
         qz-foodtruck.png, qz-pizzaria.png, qz-lanches.png, qz-feira.png,
         qz-itinerante.png (reaproveitados, ver subtipos abaixo)
       quiz/                  ← PASTA NOVA, tudo desta etapa mora aqui
         quiz-segmentos.js    ← este arquivo
         icones/               ← ícones NOVOS gerados nesta etapa
           alimentacao.png, hortifruti.png, bebidas.png, moda.png,
           artesanato.png, servicos.png  (ícones de macro-segmento)
           pratofeito.png, cafeteria.png, pipoca.png, suco.png,
           aguacoco.png, roupas.png, calcados.png, acessorios.png,
           decoracao.png, bijuteriaartesanal.png, manufaturados.png
           (ícones de sub-tipo que não existiam)

   OBJETIVO
   Fonte única de verdade dos macro-segmentos e sub-tipos do quiz. O motor do
   quiz (mostrarTela/mqzEscolherTipo etc., em index.html) passa a MONTAR os
   cards do Nível 1 e Nível 2 lendo este array — nada de HTML fixo por tipo.
   Pra acrescentar um macro-nicho novo no futuro (ex.: Serviços, quando for
   desenhado), edita SÓ este arquivo — não mexe no motor nem no HTML.

   STATUS DOS ÍCONES NOVOS (20/08/2026) — gerados em estilo 3D glossy sticker
   igual aos qz-*.png existentes, fundo em cor chapada (magenta/azul/verde)
   pronta pra remoção de fundo (fica transparente) antes de subir pro repo:
     PRONTO (gerado, falta só remover fundo): alimentacao, hortifruti,
       bebidas, moda, artesanato, servicos, pratofeito, cafeteria, pipoca,
       suco, aguacoco, roupas, calcados
     PENDENTE (créditos de geração de imagem acabaram): acessorios,
       decoracao, bijuteriaartesanal, manufaturados
   Enquanto o arquivo .png de um subtipo/macro não existir em quiz/icones/,
   o <img onerror="..."> já usado no quiz cai automaticamente no emoji do
   campo `emoji` abaixo — nada quebra.

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
       - 'proprio' → precisa de UI/schema dedicados (variações de produto:
         tamanho, borda, adicionais, itens montáveis). moldeId aponta pro
         molde a ser implementado. ENQUANTO o molde próprio não existir,
         cardapioExemplo abaixo é usado como fallback (mesmo comportamento
         simples de hoje) — assim o registro pode ir pro ar sem bloquear
         na Fase 2 (moldes complexos: pizzaria, hamburgueria, pratofeito,
         cafeteria).
     moldeId:        id do molde próprio (null quando molde:'simples')
     cardapioExemplo: seed inicial gravado em negocios/{uid}.cardapio na
                       criação da conta (substitui TEMPLATES_CARDAPIO atual)
   }
   ========================================================================== */

window.MOVIKI_SEGMENTOS = [

  {
    id: 'alimentacao',
    label: 'Alimentação',
    emoji: '🍔',
    icone: 'quiz/icones/alimentacao.png', // PRONTO (falta remover fundo)
    subtipos: [
      {
        id: 'foodtruck',
        label: 'Hamburgueria / Food Truck',
        emoji: '🍔',
        icone: 'icones/qz-foodtruck.png', // legado, reaproveitado sem mudança
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
        icone: 'icones/qz-pizzaria.png', // legado, reaproveitado sem mudança
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
        icone: 'icones/qz-lanches.png', // legado, reaproveitado sem mudança
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
        icone: 'quiz/icones/pratofeito.png', // PRONTO (falta remover fundo)
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
        icone: 'quiz/icones/pipoca.png', // PRONTO (falta remover fundo)
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
    icone: 'quiz/icones/hortifruti.png', // PRONTO (falta remover fundo)
    subtipos: [
      {
        id: 'feira',
        label: 'Verduras, Legumes e Frutas',
        emoji: '🥬',
        icone: 'icones/qz-feira.png', // legado, reaproveitado sem mudança
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🥬 Verduras e Legumes', produtos: [
            { nome: 'Tomate Italiano (KG)', preco: '7,90', acabando: false },
            { nome: 'Alface Crespa (Maço)', preco: '3,50', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'bebidas',
    label: 'Bebidas',
    emoji: '🥤',
    icone: 'quiz/icones/bebidas.png', // PRONTO (falta remover fundo)
    subtipos: [
      {
        id: 'sorvete',
        label: 'Sorvete / Picolé / Açaí',
        emoji: '🍦',
        icone: 'icones/qz-itinerante.png', // legado, reaproveitado sem mudança
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
        icone: 'quiz/icones/suco.png', // PRONTO (falta remover fundo)
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
        icone: 'quiz/icones/cafeteria.png', // PRONTO (falta remover fundo)
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
        icone: 'quiz/icones/aguacoco.png', // PRONTO (falta remover fundo)
        molde: 'simples',
        moldeId: null,
        cardapioExemplo: [
          { categoria: '🥥 Água de Coco', produtos: [
            { nome: 'Água de Coco Gelada (300ml)', preco: '8,00', acabando: false }
          ] }
        ]
      }
    ]
  },

  {
    id: 'moda',
    label: 'Moda / Brechó',
    emoji: '👕',
    icone: 'quiz/icones/moda.png', // PRONTO (falta remover fundo)
    subtipos: [
      {
        id: 'roupas',
        label: 'Roupas',
        emoji: '👕',
        icone: 'quiz/icones/roupas.png', // PRONTO (falta remover fundo)
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
        icone: 'quiz/icones/calcados.png', // PRONTO (falta remover fundo)
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
        icone: 'quiz/icones/acessorios.png', // PENDENTE — créditos acabaram, ainda não gerado
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
    icone: 'quiz/icones/artesanato.png', // PRONTO (falta remover fundo)
    subtipos: [
      {
        id: 'decoracao',
        label: 'Decoração / Utilidades',
        emoji: '🏺',
        icone: 'quiz/icones/decoracao.png', // PENDENTE — créditos acabaram, ainda não gerado
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
        icone: 'quiz/icones/bijuteriaartesanal.png', // PENDENTE — créditos acabaram, ainda não gerado
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
        icone: 'quiz/icones/manufaturados.png', // PENDENTE — créditos acabaram, ainda não gerado
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

  /* RESERVADO — macro-nicho futuro (Eiko, 20/08/2026): "Serviços" vai abranger
     muita coisa (ex.: manutenção, beleza, montagem) e precisa de molde
     próprio de cardápio (provavelmente lista de serviços com preço/duração,
     não "produto"). Fica com subtipos vazio até ser desenhado — quando for
     a hora, entra aqui como qualquer outro macro, sem mexer no motor. Ícone
     do macro já está pronto (falta só remover fundo) pra quando for ativado. */
  {
    id: 'servicos',
    label: 'Serviços',
    emoji: '🛠️',
    icone: 'quiz/icones/servicos.png', // PRONTO (falta remover fundo)
    reservado: true,
    subtipos: []
  }

];
