/*!
 * MOVIKI ramos.js | versao 2026-10-12-ramos2 | repo: moviki-app
 * Endereço público: https://app.moviki.com.br/ramos.js
 *
 * CATÁLOGO ÚNICO DE RAMOS (12/10/2026)
 * Uma lista oficial dos ramos do Moviki. Quem fala de ramo lê daqui:
 *   - painel do dono (eikoadm01.html): seletor de ramo do crachá com QR;
 *   - página de verificação /v/ (moviki/v.html, carrega este arquivo do app):
 *     manda o cadastro já com o ramo e o "entender melhor" para a live do ramo;
 *   - painel do lojista (index.html): o cadastro que chega com ?criar=1&ramo=
 *     abre no formulário com o ramo marcado (antes do mapa antigo RAMO_QUIZ).
 *
 * CAMPOS DE CADA RAMO
 *   k   chave PERMANENTE. Vai na URL e no QR impresso: nunca muda nem é
 *       reaproveitada. O nome exibido pode mudar; a chave, não.
 *   n   nome exibido no seletor.
 *   g   grupo do seletor (ver GRUPOS).
 *   q   subtipo do quiz (quiz/quiz-segmentos.js) que a chave marca sozinha.
 *   d   1 = existe página própria na /aovivo (live de exemplo do ramo).
 *       Sem d, o "entender melhor" da /v/ vai para a página geral.
 *   m   categoria do Material de apoio (material/catalogo.json) do ramo.
 *   a   apelidos: grafias antigas ou de fora (ManyChat, anúncio) que
 *       apontam para a mesma chave.
 *   r   aviso de produto para ramo com regra própria (ex.: medicamento).
 *
 * RAMO NOVO = uma entrada nova aqui. Antes de entregar, rodar o conferidor
 * (Project: claude/ramos/conferir_ramos.py): ele confere chave única, subtipo
 * do quiz existente e página da /aovivo para todo ramo com d:1.
 *
 * Arquivo estático, sem banco e sem nada do usuário: o seletor só monta link.
 */
(function(){
  'use strict';

  var GRUPOS = [
    { id:'saude',  n:'Saúde e beleza' },
    { id:'moda',   n:'Moda e acessórios' },
    { id:'casa',   n:'Casa, presentes e tecnologia' },
    { id:'comida', n:'Comida e bebida' },
    { id:'servico',n:'Pet, carro e serviços' },
    { id:'arte',   n:'Artesanato' }
  ];

  var LISTA = [
    /* ---- Saúde e beleza ---- */
    { k:'farmacia',   n:'Farmácia / Drogaria',      g:'saude', q:'farmacia',              d:1, m:'farmacia', a:['drogaria'],
      r:'Medicamento não pode ser vendido na live. Fale de dermocosméticos, higiene e beleza.' },
    { k:'cosmeticos', n:'Cosméticos e maquiagem',   g:'saude', q:'perfumariacosmeticos',  d:1, m:'beleza',   a:['beleza','maquiagem'] },
    { k:'perfumaria', n:'Perfumaria',               g:'saude', q:'perfumariacosmeticos',  d:1, m:'beleza',   a:['perfume','perfumes'] },
    { k:'cabelo',     n:'Cabelo e apliques (loja)', g:'saude', q:'barbeariasalao',        d:1, m:'beleza',   a:['apliques'] },
    { k:'barbearia',  n:'Barbearia / Salão',        g:'saude', q:'barbeariasalao',        m:'beleza',        a:['salao'] },
    { k:'estetica',   n:'Estética / Manicure',      g:'saude', q:'estetica',              m:'beleza',        a:['manicure'] },
    { k:'otica',      n:'Ótica',                    g:'saude', q:'otica',                 d:1, m:'otica',    a:['oculos'] },
    { k:'suplementos',n:'Suplementos',              g:'saude', q:'suplementosesportivos', d:1, m:'naturais', a:['whey'],
      r:'Anabolizante e emagrecedor não podem ser vendidos na live.' },
    { k:'naturais',   n:'Produtos naturais / Granel',g:'saude', q:'naturaisvitaminas',    d:1, m:'naturais', a:['granel'],
      r:'Medicamento e emagrecedor não podem ser vendidos na live.' },

    /* ---- Moda e acessórios ---- */
    { k:'moda',           n:'Moda (loja de roupas)', g:'moda', q:'roupas',   d:1, m:'moda',      a:['roupas'] },
    { k:'boutique',       n:'Boutique',              g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'brecho',         n:'Brechó',                g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'moda-masculina', n:'Moda masculina',        g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'moda-fitness',   n:'Moda fitness',          g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'moda-infantil',  n:'Moda infantil',         g:'moda', q:'roupas',   d:1, m:'infantil' },
    { k:'moda-praia',     n:'Moda praia',            g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'lingerie',       n:'Moda íntima',           g:'moda', q:'roupas',   d:1, m:'moda' },
    { k:'calcados',       n:'Calçados',              g:'moda', q:'calcados', d:1, m:'moda',      a:['sapataria'] },
    { k:'esportes',       n:'Esporte e tênis',       g:'moda', q:'esportes', d:1, m:'moda',      a:['esporte'] },
    { k:'semijoias',      n:'Semijoias',             g:'moda', q:'acessorios', d:1, m:'joalheria', a:['joias'] },
    { k:'bijuteria',      n:'Bijuteria e acessórios',g:'moda', q:'acessorios', d:1, m:'moda' },

    /* ---- Casa, presentes e tecnologia ---- */
    { k:'utilidades',         n:'Utilidades do lar',         g:'casa', q:'casa',              d:1, m:'casa' },
    { k:'cama-mesa-banho',    n:'Cama, mesa e banho',        g:'casa', q:'casa',              d:1, m:'casa' },
    { k:'eletroportateis',    n:'Eletroportáteis',           g:'casa', q:'eletronicos',       d:1, m:'eletronicos', a:['eletrodomesticos'] },
    { k:'games',              n:'Games e informática',       g:'casa', q:'eletronicos',       d:1, m:'eletronicos', a:['informatica'] },
    { k:'acessorios-celular', n:'Acessórios de celular',     g:'casa', q:'acessorioscelular', d:1, m:'eletronicos', a:['celular','capinhas'] },
    { k:'relogios',           n:'Relógios e gadgets',        g:'casa', q:'relogiosgadgets',   m:'eletronicos' },
    { k:'presentes',          n:'Presentes',                 g:'casa', q:'presentes',         d:1, m:'casa' },
    { k:'festa',              n:'Artigos de festa',          g:'casa', q:'presentes',         d:1, m:'eventos' },
    { k:'brinquedos',         n:'Brinquedos',                g:'casa', q:'brinquedos',        d:1, m:'infantil' },
    { k:'bebe',               n:'Bebê e enxoval',            g:'casa', q:'bebe',              d:1, m:'infantil',    a:['enxoval'] },
    { k:'floricultura',       n:'Floricultura',              g:'casa', q:'floricultura',      d:1, a:['flores'] },
    { k:'papelaria',          n:'Papelaria / Livraria',      g:'casa', q:'livrariapapelaria', m:'papelaria',   a:['livraria'] },

    /* ---- Comida e bebida ---- */
    { k:'padaria',     n:'Padaria',                    g:'comida', q:'padaria',    d:1, m:'alimentacao', a:['panificadora'] },
    { k:'confeitaria', n:'Confeitaria / Bolos',        g:'comida', q:'padaria',    d:1, m:'alimentacao', a:['doceria','bolos'] },
    { k:'chocolateria',n:'Chocolateria',               g:'comida', q:'padaria',    d:1, m:'alimentacao' },
    { k:'acai',        n:'Açaí / Sorveteria',          g:'comida', q:'sorvete',    d:1, m:'alimentacao', a:['sorveteria','sorvete'] },
    { k:'acougue',     n:'Açougue / Casa de carnes',   g:'comida', q:'acougue',    d:1, m:'alimentacao' },
    { k:'sertanejos',  n:'Produtos sertanejos / Casa do Norte', g:'comida', q:'acougue', d:1, m:'alimentacao',
      a:['sertanejo','casa-do-norte','casa-nordestina','produtos-regionais','regionais','nordestinos'],
      r:'Carne e queijo: venda no bairro, com retirada no balcão ou entrega local (sem envio para outra cidade).' },
    { k:'emporio',     n:'Empório / Frios',            g:'comida', q:'acougue',    d:1, m:'alimentacao' },
    { k:'foodtruck',   n:'Hamburgueria / Food truck',  g:'comida', q:'foodtruck',  m:'alimentacao', a:['hamburgueria','food-truck'] },
    { k:'pizzaria',    n:'Pizzaria',                   g:'comida', q:'pizzaria',   m:'alimentacao' },
    { k:'sushi',       n:'Sushi / Japonesa',           g:'comida', q:'sushi',      m:'alimentacao' },
    { k:'lanches',     n:'Pastel / Lanche de rua',     g:'comida', q:'lanches',    m:'alimentacao', a:['pastelaria'] },
    { k:'marmita',     n:'Prato feito / Marmita',      g:'comida', q:'pratofeito', m:'alimentacao', a:['marmitex','pratofeito'] },
    { k:'doces',       n:'Pipoca / Doces',             g:'comida', q:'pipoca',     m:'alimentacao', a:['pipoca'] },
    { k:'feira',       n:'Feira / Hortifrúti',         g:'comida', q:'feira',      m:'feira',       a:['hortifruti','verduras'] },
    { k:'sucos',       n:'Sucos e vitaminas',          g:'comida', q:'suco',       m:'alimentacao' },
    { k:'cafeteria',   n:'Cafeteria',                  g:'comida', q:'cafeteria',  m:'alimentacao', a:['cafe'] },
    { k:'bebidas',     n:'Água de coco / Bebidas',     g:'comida', q:'aguacoco',   m:'alimentacao', a:['aguadecoco'] },
    { k:'bar',         n:'Bar móvel / Chopp',          g:'comida', q:'barmovel',   m:'alimentacao', a:['chopp','drinks'] },

    /* ---- Pet, carro e serviços ---- */
    { k:'pet',        n:'Pet shop (loja)',          g:'servico', q:'lojapet',          d:1, m:'pet',        a:['petshop'] },
    { k:'banho-tosa', n:'Banho e tosa / Pet móvel', g:'servico', q:'petshop',          m:'pet' },
    { k:'autopecas',  n:'Autopeças / Motopeças',    g:'servico', q:'autopecas',        d:1, m:'automotivo', a:['motopecas'] },
    { k:'lava-jato',  n:'Lava-jato / Lavagem',      g:'servico', q:'lavagemcarro',     m:'automotivo', a:['lavagem','lavajato'] },
    { k:'chaveiro',   n:'Chaveiro / Conserto rápido',g:'servico', q:'chaveiroconserto', m:'servicos',   a:['conserto'] },

    /* ---- Artesanato ---- */
    { k:'decoracao',   n:'Decoração',            g:'arte', q:'decoracao',          m:'artesanato' },
    { k:'artesanal',   n:'Bijuteria artesanal',  g:'arte', q:'bijuteriaartesanal', m:'artesanato' },
    { k:'artesanato',  n:'Outros artesanatos',   g:'arte', q:'manufaturados',      m:'artesanato' }
  ];

  var POR = {};
  LISTA.forEach(function(e){ POR[e.k] = e; });
  LISTA.forEach(function(e){ (e.a || []).forEach(function(x){ if(!POR[x]) POR[x] = e; }); });

  /* Normaliza o que vem da URL: minúsculas, sem acento, só [a-z0-9-],
     sem o prefixo de anúncio (shopping-pet -> pet). Nunca devolve HTML. */
  function limpar(v){
    var s = String(v == null ? '' : v).toLowerCase().slice(0, 60);
    try{ s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }catch(_){}
    s = s.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    return s.replace(/^(shopping|comercio)-/, '');
  }

  /* Chave exata ou apelido exato. Sem casamento por pedaço de palavra:
     isso é do anúncio (utm_content), que o painel continua tratando. */
  function achar(v){
    var s = limpar(v);
    return (s && POR.hasOwnProperty(s)) ? POR[s] : null;
  }

  window.MOVIKI_RAMOS = {
    versao: '2026-10-12-ramos2',   /* 12/10 (manhã): + sertanejos, página da /aovivo publicada no mesmo dia */
    grupos: GRUPOS,
    lista: LISTA,
    achar: achar,
    limpar: limpar
  };
})();
