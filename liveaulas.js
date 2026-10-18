/*! MOVIKI liveaulas.js | versao 2026-10-18-balcao | repo: moviki-app
 * 18/10/2026: aula NOVA "Monte o seu balcao de live: celular, segunda tela e ajudante" (mod-live-balcao, WM7kWjl2iSM, 1:44) no grupo "Antes e depois da live", antes do ensaio. Opcional, fora da trava; `em` novo (aviso calmo de aula nova). No celular em pe, linha "Gire o celular para ver a aula em tela cheia" embaixo do palco (as aulas sao 16:9). Antes: 2026-10-17-livecapas.
 * 17/10/2026 (noite): a lista lateral da janela "Aulas da live" ganhou a CAPA de cada aula (mqdefault do YouTube, duracao no canto, visto verde, "Tocando" na que esta no palco), igual a janela de videoaulas do painel; palco maior com a lista de 400 px ao lado. Aula da Lista VIP (mod-pedidos-vip, 6Wa8z0vIJPM) entrou no grupo "Antes e depois da live" (em 2026-10-17: vira aviso de aula nova, nao trava ninguem). Antes: 2026-10-17-livemalu.
 * 17/10/2026: DEZ aulas da live REGRAVADAS com o estudio de hoje (dock, folha, ensaio) e a live publica no padrao TikTok: abertura, regras, primeira, sacolinha, chat, agendar, cupom, fila, dados e cortes. So mudam id e duracao; `em` continua (regravacao nao e aula nova). Ids antigos (apagar do YouTube depois de ver as novas tocando): 1TqgHffAyYU 3WceM12RkWE sngj1eUC7kU 3Fsofzdj0u4 V6WZqQ0s-bY cWG2cWGMrII BQPflIBLNG0 hhooJvRXx2Q 07rQewrYNaI vzZOyzzfYHM. Antes: 2026-10-10-pixaula.
 * 10/10/2026 (noite): mod-live-pix REGRAVADA de novo (23jGUqKMaps, 1:30), com a Central de Pedidos, o Ja paguei e o aviso Recebi. `em` continua 2026-09-15. Antes: 2026-10-10-ensaio.
 * 10/10/2026: aula OPCIONAL do ensaio (mod-live-ensaio, jOIy5NrirQA, 0:44) na biblioteca, grupo "Antes e depois da live", fora da trava. Antes: 2026-09-30-aula09.
 *
 * O MODULO DE AULAS DO MODO LIVE — catalogo e motor, num arquivo so.
 *
 * POR QUE ESTE ARQUIVO EXISTE, E POR QUE SEPARADO
 * As aulas do painel (MOVIKI_TUTORIAIS, no index.html) ensinam a preencher o
 * cadastro. Estas ensinam a TRANSMITIR, e vivem noutro lugar: onze das catorze
 * pertencem a abas do ESTUDIO (live.html), nao do painel. Um catalogo so nao
 * daria conta, e o motor de tutoriais do painel nao alcanca o estudio, que e
 * outro arquivo. Entao o motor mora aqui e os DOIS carregam este script.
 *
 * O QUE ELE FAZ
 *  - guarda o catalogo das catorze aulas, com o id do YouTube de cada uma;
 *  - pinta a biblioteca (a janela "Aulas da live": palco + lista por grupo);
 *  - embute cada aula de ferramenta DENTRO da sua aba do estudio, que e onde
 *    a duvida nasce;
 *  - mede o quanto foi assistido DE VERDADE (90% do video, pela API do
 *    YouTube) — sem isso "assistiu" seria so "clicou", e clicar em catorze
 *    videos leva meio minuto;
 *  - responde se o lojista esta apto a entrar ao vivo.
 *
 * A TRAVA, E O QUE ELA NAO E
 * Exige as TRES aulas de contexto: o que e a live, o que pode e o que nao
 * pode, e a primeira transmissao. 3:40 no total. As onze de ferramenta ficam
 * livres desde o primeiro dia — travar a live por causa da aula de "Cortes
 * para Reels" nao protege nada, e o lojista que clicou em Fazer live esta com
 * a intencao mais quente que vai ter.
 *
 * AULA NOVA NAO RETRANCA NINGUEM. Quem concluiu ganha o carimbo `em` e nunca
 * mais e travado: aula nova vira ALERTA, nunca cadeado. Esta regra ja custou
 * caro no painel do parceiro, onde publicar duas aulas novas passou a exigir
 * dez de quem precisava de oito.
 *
 * NAO DEPENDE DE FIREBASE. Recebe o estado por fora e devolve o que mudou
 * pelo `salvar`. Falha calado: aula nao derruba estudio, e muito menos live.
 */
(function () {
  'use strict';

  /* 28/09/2026: o player e a medicao vem do motor unico /mvaulaplayer.js.
     O painel ja o carrega antes deste arquivo; o estudio (live.html) nao,
     entao ele e buscado aqui, uma vez so. */
  try {
    if (!window.MvAulaPlayer && !document.getElementById('mvAulaPlayerJs')) {
      var _mp = document.createElement('script');
      _mp.id = 'mvAulaPlayerJs'; _mp.src = '/mvaulaplayer.js';
      (document.head || document.documentElement).appendChild(_mp);
    }
  } catch (e) {}

  /* =====================================================================
     1. O CATALOGO
     COMO ATUALIZAR: cole o id do YouTube em id:''. O id sao os 11 caracteres
     depois de "watch?v=" — NAO a URL inteira. Video sem id nao aparece em
     lugar nenhum e nao conta para a trava.
     `sel` e onde o player nasce embutido. O seletor pode ser do ESTUDIO
     (.painelAba[data-aba="..."]) ou do PAINEL (#tab-...): embutir() so procura
     o alvo, e cada pagina acha os seus. Aula sem `sel` aparece so na
     biblioteca.
     `plano` e so rotulo no cartao: a aula do Enterprise aparece para quem e
     Premium, com o selo, porque e ela que explica por que vale subir.
     `em` e o dia em que a aula ENTROU NO CATALOGO. E o que separa "aula nova"
     de "aula que voce nunca abriu": sem ela, quem via as tres do comeco levava
     um alerta dizendo "11 aulas novas" — as onze de ferramenta, que sempre
     estiveram ali e sao referencia opcional. Aula com `em` posterior ao
     carimbo de conclusao do lojista, e so ela, vira alerta.
     `g` e o GRUPO da aula na biblioteca (28/09/2026): comece | durante |
     vender | antes. A biblioteca agrupa por momento de uso, nao por aba.
     Aula nova sem `g` aparece em "Outras aulas", no fim da lista.
     ===================================================================== */
  var CAT = {
    /* as tres que o lojista precisa ver antes da primeira transmissao */
    trava: ['mod-live-abertura', 'mod-live-regras', 'mod-live-primeira'],
    modulos: [
      { n: 'Comece por aqui', g: 'comece', sel: '', v: [
        { k: 'mod-live-abertura', t: 'Live no Moviki: o que é e como funciona',
          d: '1:13', id: 'OyausOc7_jU', em: '2026-09-15' },
        { k: 'mod-live-regras',   t: 'O que pode e o que não pode na live',
          d: '1:05', id: 'qFZYznU40ho', em: '2026-09-15' },
        { k: 'mod-live-primeira', t: 'Sua primeira live: título, câmera e entrar ao vivo',
          d: '1:11', id: 'dlF725JOoRo', em: '2026-09-15' } ]},

      /* 10/10/2026: ENSAIO (P75 B7, live.html 2026-10-07-ensaio). Aula OPCIONAL:
         nao entra na `trava` (as tres de cima continuam sendo as obrigatorias).
         Grupo 'antes' e nao 'comece': o 'comece' se apresenta como "Obrigatorias".
         `sel` vazio: mora so na biblioteca. O botao "Fazer um ensaio" so aparece
         para quem ainda nao fez a primeira live; embutir a aula no estudio
         mostraria para todo mundo uma coisa que a maioria nao pode usar.
         `em` 2026-09-15 DE PROPOSITO: quem ja concluiu as aulas ja fez live e nao
         tem mais o ensaio; um alerta de "aula nova" para essa pessoa seria ruido. */
      /* 18/10/2026: BALCAO DE LIVE. Ideia do Paulo: o lojista acha que faz tudo
         pelo celular (e faz), mas a live rende mais com uma segunda tela com a
         Central de Pedidos e um ajudante. O ponto que quase ninguem sabe: trocar
         de aplicativo no celular que transmite pode parar a camera. Opcional,
         fora da trava; `em` novo. O estudio tem um atalho para ela nas dicas. */
      { n: 'Balcão de live', g: 'antes', sel: '', v: [
        { k: 'mod-live-balcao', t: 'Monte o seu balcão de live: celular, segunda tela e ajudante',
          d: '1:44', id: 'WM7kWjl2iSM', em: '2026-10-18' } ]},

      { n: 'Ensaio', g: 'antes', sel: '', v: [
        { k: 'mod-live-ensaio', t: 'Ensaio: teste a sua live sem ninguém ver',
          d: '0:44', id: 'jOIy5NrirQA', em: '2026-09-15' } ]},

      { n: 'Produtos', g: 'durante', sel: '.painelAba[data-aba="produtos"]', v: [
        { k: 'mod-live-sacolinha', t: 'Sacolinha e produto em destaque',
          d: '1:04', id: 'xEYmT1EfTr4', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Chat', g: 'durante', sel: '.painelAba[data-aba="chat"]', v: [
        { k: 'mod-live-chat', t: 'Chat da live: responder e apagar',
          d: '0:38', id: 'JQhgGh4JdgU', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Agendar', g: 'antes', sel: '.painelAba[data-aba="agendar"]', v: [
        { k: 'mod-live-agendar', t: 'Agendar a próxima live e divulgar o link',
          d: '0:42', id: '3kV3hpkikSM', plano: 'Premium', em: '2026-09-15' } ]},

      /* REGRAVADA em 16/09/2026. A primeira leva ensinava a abrir subconta pelo
         proprio estudio — caminho adiado em 14/09 pela P31. A nova diz o que e
         verdade: o recebimento vem da aba Financeiro do painel, e aqui so se
         liga o Pix na transmissao. O id antigo era 'hhTBM163vK0' e NAO pode
         voltar a catalogo nenhum.
         `em` continua 2026-09-15 DE PROPOSITO: regravacao nao e aula nova, e
         nao pode virar alerta de "aula nova" para quem ja concluiu. */
      /* REGRAVADA de novo em 10/10/2026 (23jGUqKMaps, 1:30): a de 16/09
         (xxulNw7JRhQ) mandava procurar o pedido na aba Vendas, que desde 27/09
         e so um resumo; os pedidos ficam na Central de Pedidos. A nova mostra o
         Financeiro, a compra por cima da live, o "Ja paguei", o aviso "Recebi"
         e a Central. Nem 'xxulNw7JRhQ' nem 'hhTBM163vK0' voltam a catalogo
         nenhum. `em` continua 2026-09-15: regravacao nao e aula nova. */
      { n: 'Receber no Pix', g: 'vender', sel: '.painelAba[data-aba="pix"]', v: [
        { k: 'mod-live-pix', t: 'Como você recebe o dinheiro',
          d: '1:30', id: '23jGUqKMaps', plano: 'Enterprise', em: '2026-09-15' } ]},

      /* PEDIDOS MORAM NO PAINEL, na Central de Pedidos. 27/09/2026: a aula foi
         REGRAVADA para o quadro de colunas e aponta para a aula 2 da Central
         ('Do Pix a entrega'). `sel` vazio: a aba Pedidos ja tem o cartao das
         aulas dela, e a caixa no fim do Financeiro ensinava uma lista que nao
         existe mais. O id antigo 'qx4dFUC9ORs' NAO pode voltar.
         `em` continua 2026-09-15 DE PROPOSITO: regravacao nao e aula nova. */
      { n: 'Pedidos', g: 'vender', sel: '', rot: 'O pedido que vem da live', v: [
        { k: 'mod-live-pedidos', t: 'Do Pix à entrega: o pedido andando no quadro',
          d: '2:09', id: '77kequeuJ6U', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Oferta relâmpago', g: 'durante', sel: '.painelAba[data-aba="oferta"]', v: [
        { k: 'mod-live-oferta', t: 'Oferta relâmpago e estoque ao vivo',
          /* 30/09/2026: regravada com a reserva da oferta (quem gera o Pix segura a
             peca). Regravacao: o 'em' NAO muda, senao vira "aula nova" para quem ja
             estava em dia. Id antigo pbWfLHoKGag so sai do YouTube depois disto no ar. */
          d: '1:55', id: 'L2flcBpTDxw', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Cupom e brinde', g: 'durante', sel: '.painelAba[data-aba="cupom"]', v: [
        { k: 'mod-live-cupom', t: 'Cupom, brinde e "Estou aqui agora"',
          d: '0:57', id: 'pimNiOJsm_4', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Fila de pedidos', g: 'vender', sel: '.painelAba[data-aba="fila"]', v: [
        { k: 'mod-live-fila', t: 'Fila de pedidos',
          d: '0:30', id: 'DmVVBqoUGYM', plano: 'Enterprise', em: '2026-09-15' } ]},

      /* 17/10/2026: LISTA VIP (P84). Mesma chave e mesmo video da aula do
         painel (Pedidos > Lista VIP). E aqui que o lojista pensa em encher a
         sala antes da live. `sel` vazio: no estudio o botao "Avisar a Lista
         VIP" ja leva ao painel. `em` novo: e assunto novo, vira aviso de aula
         nova para quem ja concluiu (nunca cadeado). */
      { n: 'Lista VIP', g: 'antes', sel: '', v: [
        { k: 'mod-pedidos-vip', t: 'Lista VIP: traga quem te segue nas redes para a sua base',
          d: '2:25', id: '6Wa8z0vIJPM', plano: 'Premium', em: '2026-10-17' } ]},

      { n: 'Dados', g: 'antes', sel: '.painelAba[data-aba="dados"]', v: [
        { k: 'mod-live-dados', t: 'Dados ao vivo e o resumo da live',
          d: '0:36', id: 'Zw-vwz9sGqM', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Cortes', g: 'antes', sel: '.painelAba[data-aba="cortes"]', v: [
        { k: 'mod-live-cortes', t: 'Cortes para Reels e Status',
          d: '0:33', id: 'nDoEG-L9A50', plano: 'Enterprise', em: '2026-09-15' } ]},

      /* Esta aba ja tem a aula do painel (mod-cardapio, que ensina a MONTAR o
         cardapio). Esta ensina o cardapio a VENDER, que e outro assunto — as
         duas caixas convivem, com titulos que nao se confundem. */
      { n: 'Cardápio', g: 'vender', sel: '#tab-cardapio', rot: 'Vender pelo cardápio, sem live', v: [
        { k: 'mod-live-cardapio', t: 'Seu cardápio vendendo sozinho',
          d: '1:18', id: '2_ty4YrgZ0I', plano: 'Enterprise', em: '2026-09-15' } ]}
    ]
  };
  window.MOVIKI_LIVEAULAS = CAT;

  /* =====================================================================
     2. ESTADO
     ===================================================================== */
  var est = { vistas: [], em: '' };   // o que veio do banco
  var salvar = function () {};        // quem grava (o painel ou o estudio)
  var noAr = function () { return false; };
  var pronto = false;

  function MOD() { return CAT.modulos || []; }
  function prontos(m) { return (m.v || []).filter(function (v) { return !!v.id; }); }
  function todas() {
    var r = []; MOD().forEach(function (m) { prontos(m).forEach(function (v) { r.push(v); }); });
    return r;
  }
  function achar(k) {
    var r = null; todas().forEach(function (v) { if (v.k === k) r = v; }); return r;
  }
  function viu(k) { return (est.vistas || []).indexOf(k) > -1; }

  /* as chaves da trava que EXISTEM publicadas. Enquanto uma delas nao tiver
     id, nao ha trava nenhuma: o produto nao pode prender o lojista atras de
     um video que ainda nao subiu. */
  function daTrava() {
    return (CAT.trava || []).filter(function (k) { return !!achar(k); });
  }
  function faltam() {
    if (est.em) return [];                       // ja concluiu: nunca mais trava
    return daTrava().filter(function (k) { return !viu(k); }).map(achar);
  }
  function apto() {
    var t = daTrava();
    if (!t.length) return true;                  // trava incompleta = sem trava
    return !!est.em || faltam().length === 0;
  }
  /* Aula que ENTROU NO CATALOGO depois que ele concluiu, e que ele ainda nao
     viu. Vira alerta, nunca cadeado — a regra que faltou no painel do
     parceiro, onde publicar duas aulas novas passou a exigir dez de quem
     precisava de oito.
     Comparar por data, e nao por "nunca abriu", e o que impede o alerta de
     nascer mentindo: no dia do lancamento ninguem tem aula nova, mesmo quem
     so viu as tres do comeco. */
  function novas() {
    if (!est.em) return [];
    var corte = String(est.em).slice(0, 10);
    return todas().filter(function (v) {
      return !viu(v.k) && v.em && String(v.em).slice(0, 10) > corte;
    });
  }

  function marcar(k) {
    if (!achar(k) || viu(k)) return;
    est.vistas = (est.vistas || []).concat([k]);
    var fechou = !est.em && faltam().length === 0;
    if (fechou) est.em = new Date().toISOString();
    try { salvar(est.vistas.slice(), est.em); } catch (e) {}
    pintarTudo();
    try {
      window.dispatchEvent(new CustomEvent('mv-liveaula-vista',
        { detail: { k: k, apto: apto(), concluiu: fechou } }));
    } catch (e) {}
  }

  /* =====================================================================
     3. O PLAYER — a medicao de 90%
     Copiado do motor do painel (index.html) com os dois consertos de
     10/09/2026 ja dentro: o player antigo e DESTRUIDO ao sair da tela (senao
     a API do YouTube fica presa a uma janela morta e para de entregar evento
     aos proximos), e a medicao roda em relogio proprio, sem depender de
     onStateChange ter disparado.
     ===================================================================== */
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
             '<path d="M8 5.4v13.2L19 12z"/></svg>';
  var seq = 0;

  /* =====================================================================
     17/09/2026 — OS TRES CONSERTOS QUE O PAINEL JA TINHA E ESTE ARQUIVO NAO

     (a) A AULA MORRIA AOS 90%. `marcar()` repinta a biblioteca inteira, e a
         biblioteca e repintada com `corpo.innerHTML=''` — que APAGA o iframe
         da aula que estava tocando. Como as tres aulas da trava so existem na
         biblioteca, eram justamente elas que cortavam sozinhas perto do fim.
         Era isso o "as videoaulas estao travando".
     (b) O PLAYER APAGADO NUNCA ERA DESTRUIDO. A API do YouTube fica presa a
         uma janela que nao existe mais e PARA de entregar evento aos players
         seguintes: da segunda aula em diante nada chegava aos 90% e nada
         ficava verde — e a trava da live nunca abria.
     (c) VALIA A POSICAO DA AGULHA (tempo atual / duracao >= 0,9). Arrastar a
         barrinha ate o fim marcava a aula em dois segundos. O painel do
         lojista e o do parceiro trocaram isso em 15/09 pelo CAMINHO
         PERCORRIDO; este arquivo ficou para tras.

     Agora vale o percurso: a cada 500 ms anota-se o segundo que esta tocando,
     e o salto so entra se couber no tempo real decorrido — 2x continua
     passando, arrasto nao soma nada. O percurso fica guardado POR AULA no
     proprio navegador, entao fechar o estudio no meio da aula nao custa mais
     o que ja foi assistido. E o fim do video nao e prova de nada: o estado
     ENDED so fecha a aula se os 90% percorridos ja estiverem la.
     ===================================================================== */
  /* 28/09/2026: o percurso, o carregador da API e o player moram no motor
     unico (/mvaulaplayer.js). Aqui fica so a CHAVE do percurso, que e deste
     modulo: 'mvTrilhaLv:' + uid + ':' + aula — igual a de antes, entao
     ninguem perde o que ja tinha assistido. */
  var dono = '';                       /* uid, para o percurso nao vazar entre contas */

  function chaveTrilha(k) { return 'mvTrilhaLv:' + (dono || 'anon') + ':' + k; }
  function trilha(k) {
    try { if (window.MvAulaPlayer) return window.MvAulaPlayer.trilha(chaveTrilha(k)); } catch (e) {}
    return { s: {}, n: 0 };
  }
  function segsDe(d) {
    var m = /^(\d+):(\d{1,2})$/.exec(String(d || ''));
    return m ? (Number(m[1]) * 60 + Number(m[2])) : 0;
  }
  function pctDe(k) {
    try {
      var v = achar(k); if (!v) return 0;
      var dur = segsDe(v.d); if (!dur) return 0;
      var t = trilha(k); if (!t || !t.n) return 0;
      return Math.min(99, Math.round(t.n / dur * 100));
    } catch (e) { return 0; }
  }

  function capa(id, q) {
    return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/' + q + '.jpg';
  }
  /* a capa em alta so existe se o video tem miniatura propria. Sem ela o
     YouTube NAO da erro: devolve uma imagem cinza de 120px. Por isso o teste
     e pela LARGURA, nao pelo onerror (que nunca dispara). */
  function imagem(v) {
    var img = document.createElement('img');
    img.loading = 'lazy'; img.decoding = 'async'; img.alt = '';
    function cair() { if (img.src.indexOf('maxres') > -1) img.src = capa(v.id, 'mqdefault'); }
    img.addEventListener('load', function () { if (img.naturalWidth < 200) cair(); });
    img.addEventListener('error', cair);
    img.src = capa(v.id, 'maxresdefault');
    return img;
  }
  function moldura(v) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'lvAulaQuadro'; b.setAttribute('data-lvaula', v.k);
    b.appendChild(imagem(v));
    var pl = document.createElement('span'); pl.className = 'lvAulaPlay'; pl.innerHTML = PLAY;
    b.appendChild(pl);
    if (v.d) {
      var d = document.createElement('span'); d.className = 'lvAulaDur'; d.textContent = v.d;
      b.appendChild(d);
    }
    if (viu(v.k)) b.classList.add('lvAulaVista');
    return b;
  }
  function matar(fr) {
    if (!fr) return;
    try { if (window.MvAulaPlayer) { window.MvAulaPlayer.matar(fr); return; } } catch (e) {}
    try { if (fr.__p && typeof fr.__p.destroy === 'function') fr.__p.destroy(); } catch (e) {}
    fr.__p = null;
  }

  /* ---------- o medidor visivel ----------
     A trava so e justa se o lojista ENXERGA o quanto falta. Sem isto, a regra
     dos 90% parece defeito — foi essa a licao do painel do parceiro. */
  var med = null, medPct = null, medTxt = null, medBar = null, medK = '';
  function montarMedidor(k) {
    med = document.createElement('div'); med.className = 'lvAulaMed';
    var topo = document.createElement('div'); topo.className = 'lvAulaMedTopo';
    medPct = document.createElement('b'); medPct.className = 'lvAulaMedPct';
    medTxt = document.createElement('span'); medTxt.className = 'lvAulaMedTxt';
    topo.appendChild(medPct); topo.appendChild(medTxt);
    var fora = document.createElement('span'); fora.className = 'lvAulaMedFora';
    medBar = document.createElement('i');
    fora.appendChild(medBar);
    med.appendChild(topo); med.appendChild(fora);
    medK = k;
    return med;
  }
  function soltarMedidor() { med = medPct = medTxt = medBar = null; medK = ''; }
  /* estado: 0 = assistindo, 1 = concluida, 2 = adiantou o video */
  function medidor(pc, estado) {
    if (!med) return;
    var ok = estado === 1, erro = estado === 2;
    med.className = 'lvAulaMed' + (ok ? ' lvAulaMedOk' : (erro ? ' lvAulaMedErro' : ''));
    medBar.style.width = Math.max(0, Math.min(100, pc)) + '%';
    if (ok) {
      medPct.textContent = 'Aula concluída';
      medTxt.textContent = 'Pode passar para a próxima.';
    } else if (erro) {
      medPct.textContent = 'Não contou';
      medTxt.textContent = 'Você adiantou o vídeo. Assista do ponto onde parou — só o que passa de verdade conta.';
    } else {
      medPct.textContent = 'Assistido ' + pc + '%';
      medTxt.textContent = pc >= 90 ? 'Pronto, já conta.'
                                    : 'a aula fica verde quando chegar em 90%';
    }
  }
  function andamento(k, dur) {
    try {
      if (medK !== k || !med) return;
      if (viu(k)) { medidor(100, 1); return; }
      if (!(dur > 0)) return;
      medidor(Math.min(100, Math.round(trilha(k).n / dur * 100)), 0);
    } catch (e) {}
  }
  function adiantou(k) {
    try { if (medK === k && med) medidor(pctDe(k), 2); } catch (e) {}
  }
  function iframe(v) {
    try {
      if (window.MvAulaPlayer) return window.MvAulaPlayer.criar(v, {
        prefixo: 'mvLV', chave: chaveTrilha,
        marcar: marcar, andamento: andamento, adiantou: adiantou
      });
    } catch (e) {}
    /* sem o motor (ainda carregando): o video toca, so nao mede */
    var f = document.createElement('iframe');
    f.id = 'mvLVs' + (++seq);
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
            '?rel=0&modestbranding=1&playsinline=1&autoplay=1';
    f.title = v.t;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    return f;
  }
  /* devolve a capa no lugar do player: sem isso o iframe continua tocando
     depois da troca de tela, e dois audios tocam juntos */
  function parar(cx) {
    var q = cx.querySelector('div.lvAulaQuadro'); if (!q) return;
    try { matar(q.querySelector('iframe')); } catch (e) {}
    try {
      var m = cx.querySelector('.lvAulaMed');
      if (m) { if (m === med) soltarMedidor(); m.parentNode.removeChild(m); }
    } catch (e) {}
    var v = achar(cx.getAttribute('data-lvk')); if (!v) return;
    cx.replaceChild(moldura(v), q);
  }
  function pararTodos(soEscondidos) {
    try {
      var cx = document.querySelectorAll('.lvAulaBox');
      for (var i = 0; i < cx.length; i++) {
        if (soEscondidos && cx[i].getClientRects().length) continue;
        parar(cx[i]);
      }
    } catch (e) {}
  }
  function tocar(botao, k) {
    var v = achar(k); if (!v || !botao) return;
    /* A TRAVA QUE VALE MAIS QUE AS OUTRAS: com a live NO AR o audio da aula
       sairia pelo microfone, dentro da transmissao. */
    if (noAr()) { avisoNoAr(); return; }
    var caixa = botao.parentNode;
    pararTodos();                                // um video de cada vez, sempre
    var q = document.createElement('div'); q.className = 'lvAulaQuadro';
    q.appendChild(iframe(v));
    caixa.replaceChild(q, botao);
    try {
      caixa.appendChild(montarMedidor(k));
      medidor(viu(k) ? 100 : pctDe(k), viu(k) ? 1 : 0);
    } catch (e) {}
  }
  function avisoNoAr() {
    try {
      if (window.toast) { window.toast('Encerre a live para assistir a aula.'); return; }
      alert('Encerre a live para assistir a aula.');
    } catch (e) {}
  }

  /* =====================================================================
     4. O EMBUTIDO NAS ABAS DO ESTUDIO
     ===================================================================== */
  function embutir() {
    try {
      MOD().forEach(function (m) {
        if (!m.sel) return;
        var v = prontos(m)[0]; if (!v) return;
        var alvo = document.querySelector(m.sel); if (!alvo) return;
        if (alvo.querySelector(':scope > .lvAulaBox')) return;   // ja esta la

        var box = document.createElement('div');
        box.className = 'lvAulaBox'; box.setAttribute('data-lvk', v.k);
        var topo = document.createElement('div'); topo.className = 'lvAulaTopo';
        var ico = document.createElement('span'); ico.className = 'lvAulaIco'; ico.innerHTML = PLAY;
        var txt = document.createElement('span'); txt.className = 'lvAulaTxt';
        var tit = document.createElement('b'); tit.className = 'lvAulaTit'; tit.textContent = v.t;
        var sub = document.createElement('span'); sub.className = 'lvAulaSub';
        sub.textContent = (m.rot || 'Como usar esta aba') + (v.d ? ' · ' + v.d : '');
        txt.appendChild(tit); txt.appendChild(sub);
        topo.appendChild(ico); topo.appendChild(txt);
        box.appendChild(topo);
        box.appendChild(moldura(v));
        alvo.appendChild(box);
      });
    } catch (e) {}
  }

  /* =====================================================================
     5. A BIBLIOTECA — PALCO + LISTA (28/09/2026)

     POR QUE MUDOU. A versao anterior era uma grade com UMA SECAO POR ABA DO
     ESTUDIO. Onze secoes com um video cada: cada linha ocupava um terco da
     largura e deixava dois tercos vazios, e as aulas saiam na ordem das abas,
     misturando Premium e Enterprise. O proprio player nascia dentro do cartao
     da grade — um video de 250 px de largura. O Paulo viu e chamou de "tudo
     sem organizacao" (28/09).

     AGORA E O MESMO DESENHO DA CENTRAL DE PEDIDOS E DO PAINEL DO PARCEIRO:
     palco a esquerda (o video grande, o titulo e o medidor), lista numerada a
     direita, barra "X de N" no topo. A lista e agrupada por MOMENTO DE USO,
     nao por aba: Comece por aqui (as tres da trava), Durante a live, Vender e
     receber, Antes e depois da live. O grupo vem do campo `g` de cada modulo
     do catalogo; modulo sem `g` cai em "Outras aulas", no fim — aula nova
     nunca some por falta do campo.

     O PALCO NUNCA E REPINTADO POR TABELA. A lista, a barra e o aviso sao
     refeitos a vontade; o palco so muda quando o lojista escolhe outra aula.
     Isso elimina de vez o risco de 17/09 (repintar apagava o iframe que
     estava tocando e a aula cortava aos 90%).
     ===================================================================== */
  var GRUPOS = [
    { g: 'comece',  n: 'Comece por aqui',        s: 'Obrigatórias para entrar ao vivo' },
    { g: 'durante', n: 'Durante a live',         s: 'O que você usa com a câmera ligada' },
    { g: 'vender',  n: 'Vender e receber',       s: 'Pix, pedidos e o cardápio' },
    { g: 'antes',   n: 'Antes e depois da live', s: 'Balcão, ensaio, agendar, Lista VIP, números e cortes' },
    { g: '',        n: 'Outras aulas',           s: '' }
  ];
  /* aulas publicadas, na ordem em que aparecem na lista: grupo a grupo */
  function emOrdem() {
    var r = [];
    GRUPOS.forEach(function (G) {
      MOD().forEach(function (m) {
        var g = m.g || '';
        var conhecido = GRUPOS.some(function (x) { return x.g && x.g === g; });
        if ((G.g && g === G.g) || (!G.g && !conhecido)) {
          prontos(m).forEach(function (v) { r.push({ v: v, m: m, G: G }); });
        }
      });
    });
    return r;
  }
  function itemDe(k) {
    var r = null; emOrdem().forEach(function (it) { if (it.v.k === k) r = it; }); return r;
  }
  function eNova(k) { return novas().some(function (v) { return v.k === k; }); }
  function rotuloPlano(it) {
    if ((CAT.trava || []).indexOf(it.v.k) > -1) return 'Obrigatória';
    return it.v.plano || 'Todos os planos';
  }
  /* a aula que o palco mostra ao abrir: a primeira que falta para a trava,
     senao a primeira aula nova, senao a primeira nao vista, senao a primeira */
  function sugerida() {
    var lista = emOrdem(); if (!lista.length) return null;
    var f = faltam(); if (f.length) return f[0];
    var n = novas(); if (n.length) return n[0];
    for (var i = 0; i < lista.length; i++) if (!viu(lista[i].v.k)) return lista[i].v;
    return lista[0].v;
  }
  function proxima(k) {
    var lista = emOrdem(), achou = false;
    for (var i = 0; i < lista.length; i++) {
      if (achou && !viu(lista[i].v.k)) return lista[i].v;
      if (lista[i].v.k === k) achou = true;
    }
    for (var j = 0; j < lista.length; j++) if (!viu(lista[j].v.k)) return lista[j].v;
    return null;
  }

  var cx = null, corpo = null, caixaEl = null, palco = null, pTit = null, pSub = null,
      pProx = null, lst = null, pBar = null, pCont = null, palcoK = '';
  function montarBiblioteca() {
    if (cx) return;
    cx = document.createElement('div');
    cx.id = 'lvAulasModal'; cx.className = 'lvAulasModal escondido';
    cx.setAttribute('role', 'dialog'); cx.setAttribute('aria-modal', 'true');
    cx.setAttribute('aria-label', 'Aulas da live');
    caixaEl = document.createElement('div'); caixaEl.className = 'lvAulasCaixa';

    var topo = document.createElement('div'); topo.className = 'lvAulasCabeca';
    var tt = document.createElement('div'); tt.className = 'lvAulasTitulos';
    tt.innerHTML = '<h2>' + PLAY.replace('viewBox', 'class="lvAulasH2Ico" viewBox') +
                   'Aulas da live</h2>' +
                   '<p>Curtas e na ordem. A aula fica verde quando você assiste até 90%.</p>';
    var fechar = document.createElement('button');
    fechar.type = 'button'; fechar.className = 'lvAulasFechar';
    fechar.setAttribute('aria-label', 'Fechar'); fechar.textContent = '×';
    fechar.addEventListener('click', fecharBiblioteca);
    topo.appendChild(tt); topo.appendChild(fechar);

    var prog = document.createElement('div'); prog.className = 'lvAulasProg';
    var fora = document.createElement('span'); fora.className = 'lvAulasProgFora';
    pBar = document.createElement('i'); fora.appendChild(pBar);
    pCont = document.createElement('b'); pCont.className = 'lvAulasTotTxt';
    prog.appendChild(fora); prog.appendChild(pCont);

    corpo = document.createElement('div'); corpo.className = 'lvAulasCorpo';
    var grade = document.createElement('div'); grade.className = 'lvAulasPalcoGrade';
    var esq = document.createElement('div'); esq.className = 'lvAulasEsq';
    palco = document.createElement('div'); palco.className = 'lvAulaBox lvAulasPalco';
    pTit = document.createElement('b'); pTit.className = 'lvAulasPTit';
    pSub = document.createElement('span'); pSub.className = 'lvAulasPSub';
    pProx = document.createElement('button'); pProx.type = 'button';
    pProx.className = 'lvAulasProx'; pProx.hidden = true;
    pProx.addEventListener('click', function () {
      var k = pProx.getAttribute('data-k'); if (k) escolher(k, true);
    });
    var gire = document.createElement('span'); gire.className = 'lvAulasGire';
    gire.textContent = 'Gire o celular para ver a aula em tela cheia';
    esq.appendChild(palco); esq.appendChild(gire); esq.appendChild(pTit); esq.appendChild(pSub); esq.appendChild(pProx);
    lst = document.createElement('div'); lst.className = 'lvAulasLista';
    grade.appendChild(esq); grade.appendChild(lst);
    corpo.appendChild(grade);

    caixaEl.appendChild(topo); caixaEl.appendChild(prog); caixaEl.appendChild(corpo);
    cx.appendChild(caixaEl);
    cx.addEventListener('click', function (e) { if (e.target === cx) fecharBiblioteca(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cx && !cx.classList.contains('escondido')) fecharBiblioteca();
    });
    document.body.appendChild(cx);
  }
  /* O aviso do topo mora num bloco proprio para ser refeito SOZINHO. */
  function pintarAviso() {
    if (!corpo) return;
    var velho = corpo.querySelector('.lvAulasAviso');
    if (velho) velho.parentNode.removeChild(velho);
    var cxa = document.createElement('div'); cxa.className = 'lvAulasAviso';
    var f = faltam();
    if (f.length) {
      var av = document.createElement('div'); av.className = 'lvAulasTrava';
      av.innerHTML = '<b>Falta' + (f.length > 1 ? 'm ' + f.length + ' aulas' : ' 1 aula') +
        ' para você entrar ao vivo.</b><span>São as do grupo "Comece por aqui". As outras ' +
        'ficam aqui para consultar quando precisar.</span>';
      cxa.appendChild(av);
    } else if (novas().length) {
      var nv = document.createElement('div'); nv.className = 'lvAulasNovo';
      nv.innerHTML = '<b>Tem aula nova aqui.</b><span>Ferramenta nova ganha aula. ' +
        'Você já pode transmitir — isto é só para ficar em dia.</span>';
      cxa.appendChild(nv);
    }
    if (cxa.firstChild) corpo.insertBefore(cxa, corpo.firstChild);
  }
  /* Lista, barra, aviso e legenda do palco. NAO toca no video. */
  function pintarLista() {
    if (!lst) return;
    var lista = emOrdem(), vistas = 0;
    lista.forEach(function (it) { if (viu(it.v.k)) vistas++; });
    if (pCont) pCont.textContent = vistas + ' de ' + lista.length;
    if (pBar) pBar.style.width = lista.length ? Math.round(vistas / lista.length * 100) + '%' : '0%';
    pintarAviso();

    lst.innerHTML = '';
    var gAtual = null, sec = null, n = 0;
    lista.forEach(function (it) {
      n++;
      if (it.G !== gAtual) {
        gAtual = it.G;
        var doGrupo = lista.filter(function (x) { return x.G === it.G; });
        var vGrupo = doGrupo.filter(function (x) { return viu(x.v.k); }).length;
        sec = document.createElement('div'); sec.className = 'lvAulasGrupo';
        var h = document.createElement('div'); h.className = 'lvAulasGrupoCab';
        var hn = document.createElement('b'); hn.textContent = it.G.n;
        var hc = document.createElement('span'); hc.className = 'lvAulasGrupoCont';
        hc.setAttribute('data-lvcont', it.G.g || 'outras');
        hc.textContent = vGrupo + ' de ' + doGrupo.length;
        h.appendChild(hn); h.appendChild(hc); sec.appendChild(h);
        if (it.G.s) {
          var hs = document.createElement('span'); hs.className = 'lvAulasGrupoSub';
          hs.textContent = it.G.s; sec.appendChild(hs);
        }
        lst.appendChild(sec);
      }
      var ok = viu(it.v.k);
      var bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'lvAulasIt' + (ok ? ' feita' : '') + (palcoK === it.v.k ? ' noPalco' : '');
      bt.setAttribute('data-lvaula', it.v.k);
      /* 17/10/2026: capa da aula, como no YouTube (mesmo desenho da janela
         de videoaulas do painel). mqdefault existe para todo video publicado. */
      var nu = document.createElement('span'); nu.className = 'lvAulasMini';
      var im = document.createElement('img'); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      im.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(it.v.id) + '/mqdefault.jpg';
      im.onerror = function () { this.remove(); };
      nu.appendChild(im);
      var nn = document.createElement('span'); nn.className = 'lvAulasMiniNum'; nn.textContent = String(n);
      nu.appendChild(nn);
      if (it.v.d) { var du = document.createElement('span'); du.className = 'lvAulasMiniDur'; du.textContent = it.v.d; nu.appendChild(du); }
      if (ok) { var ck = document.createElement('span'); ck.className = 'lvAulasMiniOk'; ck.innerHTML = VISTO; nu.appendChild(ck); }
      if (palcoK === it.v.k) { var tc = document.createElement('span'); tc.className = 'lvAulasMiniTocando'; tc.textContent = 'Tocando'; nu.appendChild(tc); }
      var tx = document.createElement('span'); tx.className = 'lvAulasItTxt';
      var nome = document.createElement('span'); nome.className = 'lvAulasItNome';
      nome.textContent = it.v.t;
      var meta = document.createElement('span'); meta.className = 'lvAulasItMeta';
      meta.textContent = (ok ? 'Assistida' : rotuloPlano(it)) + (it.v.d ? ' · ' + it.v.d : '');
      tx.appendChild(nome); tx.appendChild(meta);
      if (!ok && eNova(it.v.k)) {
        var nv = document.createElement('span'); nv.className = 'lvAulasSelo'; nv.textContent = 'Nova';
        tx.appendChild(nv);
      }
      bt.appendChild(nu); bt.appendChild(tx);
      sec.appendChild(bt);
    });
    pintarLegendaPalco();
  }
  function pintarLegendaPalco() {
    if (!pTit) return;
    var it = itemDe(palcoK);
    if (!it) { pTit.textContent = ''; pSub.textContent = ''; pProx.hidden = true; return; }
    pTit.textContent = it.v.t;
    pSub.textContent = it.G.n + ' · ' + (viu(it.v.k) ? 'Assistida' : rotuloPlano(it)) +
                       (it.v.d ? ' · ' + it.v.d : '');
    var px = viu(it.v.k) ? proxima(it.v.k) : null;
    if (px) {
      pProx.hidden = false; pProx.setAttribute('data-k', px.k);
      pProx.textContent = 'Próxima aula: ' + px.t + ' →';
    } else { pProx.hidden = true; pProx.removeAttribute('data-k'); }
  }
  /* troca a aula do palco. `tocarJa` = o lojista clicou: ja comeca a tocar */
  function escolher(k, tocarJa) {
    var v = achar(k); if (!v || !palco) return;
    pararTodos();
    try { var fr = palco.querySelector('iframe'); if (fr) matar(fr); } catch (e) {}
    var m = palco.querySelector('.lvAulaMed'); if (m) { if (m === med) soltarMedidor(); m.parentNode.removeChild(m); }
    palco.innerHTML = '';
    palcoK = k;
    palco.setAttribute('data-lvk', k);
    var capaBt = moldura(v);
    palco.appendChild(capaBt);
    pintarLista();
    if (tocarJa) {
      tocar(capaBt, k);
      /* no celular o palco fica em cima da lista: sobe ate ele */
      try {
        var r = palco.getBoundingClientRect();
        if (r.top < 0 || r.top > window.innerHeight * 0.5) caixaEl.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {}
    }
  }
  /* compatibilidade: o nome antigo continua existindo */
  function pintarBiblioteca() { pintarLista(); }
  function abrirBiblioteca(k) {
    montarBiblioteca();
    cx.classList.remove('escondido');
    document.body.classList.add('lvAulasAberto');
    var alvo = (typeof k === 'string' && achar(k)) ? k : '';
    if (!alvo) { var s = sugerida(); alvo = s ? s.k : ''; }
    if (alvo) escolher(alvo, false); else pintarLista();
    try { lst.scrollTop = 0; caixaEl.scrollTop = 0; } catch (e) {}
    try {
      var sel = lst.querySelector('.lvAulasIt.noPalco');
      if (sel && sel.scrollIntoView && sel.offsetTop > lst.clientHeight - 60) sel.scrollIntoView({ block: 'center' });
    } catch (e) {}
  }
  function fecharBiblioteca() {
    if (!cx) return;
    pararTodos();
    soltarMedidor();
    cx.classList.add('escondido');
    document.body.classList.remove('lvAulasAberto');
  }
  var VISTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M5 12.5l4.2 4.2L19 7"/></svg>';

  function pintarTudo() {
    try {
      /* repinta as capas ja na tela para o visto verde aparecer na hora */
      var bs = document.querySelectorAll('button.lvAulaQuadro[data-lvaula]');
      for (var i = 0; i < bs.length; i++) {
        if (viu(bs[i].getAttribute('data-lvaula'))) bs[i].classList.add('lvAulaVista');
      }
      var aberta = cx && !cx.classList.contains('escondido');
      if (aberta) pintarLista();
    } catch (e) {}
  }

  /* =====================================================================
     6. CSS — vai aqui dentro para o arquivo servir os DOIS lugares sem
     depender de nenhuma folha de estilo do painel ou do estudio.
     ===================================================================== */
  var CSS = [
    '.lvAulaBox{margin-top:12px}',
    '.lvAulaTopo{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}',
    '.lvAulaIco{flex:0 0 22px;color:var(--mv-ciano,#00D4FF)}',
    '.lvAulaIco svg{width:22px;height:22px;display:block}',
    '.lvAulaTxt{display:flex;flex-direction:column;min-width:0}',
    '.lvAulaTit{font-size:14px;line-height:1.25}',
    '.lvAulaSub{font-size:12px;color:var(--mv-txt-3,#8fa6c4)}',
    '.lvAulaQuadro{position:relative;display:block;width:100%;aspect-ratio:16/9;',
      'border:0;padding:0;border-radius:12px;overflow:hidden;cursor:pointer;',
      'background:#0b1526}',
    '.lvAulaQuadro>img{width:100%;height:100%;object-fit:cover;display:block}',
    '.lvAulaQuadro>iframe{width:100%;height:100%;border:0;display:block}',
    '.lvAulaPlay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);',
      'width:52px;height:52px;border-radius:50%;background:rgba(6,13,24,.72);',
      'display:flex;align-items:center;justify-content:center;color:#fff}',
    '.lvAulaPlay svg{width:24px;height:24px;margin-left:2px}',
    '.lvAulaDur{position:absolute;right:8px;bottom:8px;background:rgba(6,13,24,.82);',
      'color:#fff;font-size:11px;font-weight:600;padding:2px 6px;border-radius:6px}',
    '.lvAulaVista{outline:2px solid var(--mv-ok,#25e39b);outline-offset:-2px}',
    '.lvAulaVista .lvAulaPlay{background:rgba(37,227,155,.85);color:#06131f}',
    /* o medidor: a regra dos 90% so e justa se o lojista VE o quanto falta */
    '.lvAulaMed{margin-top:8px;padding:9px 11px;border-radius:12px;',
      'background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.30)}',
    '.lvAulaMedTopo{display:flex;align-items:baseline;gap:8px;margin-bottom:7px}',
    '.lvAulaMedPct{font-size:17px;font-weight:800;letter-spacing:-.02em;color:#00D4FF;flex:0 0 auto}',
    '.lvAulaMedTxt{font-size:11.5px;line-height:1.35;color:var(--mv-txt-2,#c6d8ee)}',
    '.lvAulaMedFora{display:block;height:8px;border-radius:999px;',
      'background:rgba(255,255,255,.10);overflow:hidden}',
    '.lvAulaMedFora>i{display:block;height:100%;width:0%;border-radius:999px;',
      'background:linear-gradient(90deg,#00D4FF,#0066FF);transition:width .35s ease}',
    '.lvAulaMedOk{background:rgba(37,227,155,.10);border-color:rgba(37,227,155,.40)}',
    '.lvAulaMedOk .lvAulaMedPct{color:#25e39b}',
    '.lvAulaMedOk .lvAulaMedFora>i{background:#25e39b}',
    '.lvAulaMedErro{background:rgba(255,138,0,.10);border-color:rgba(255,138,0,.42)}',
    '.lvAulaMedErro .lvAulaMedPct{color:#ffb020}',
    /* biblioteca: palco + lista, o mesmo desenho da Central de Pedidos */
    '.lvAulasModal{position:fixed;inset:0;z-index:70;background:rgba(2,8,18,.78);',
      'display:flex;align-items:center;justify-content:center;padding:24px}',
    '.lvAulasModal.escondido{display:none}',
    '.lvAulasCaixa{position:relative;width:100%;max-width:1240px;max-height:calc(100vh - 48px);',
      'display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;',
      'background:var(--mv-surf,#0b1627);border:1px solid rgba(0,212,255,.16);',
      'border-radius:20px;padding:20px 20px 18px;color:var(--mv-txt-1,#eaf2ff);',
      'box-shadow:0 24px 70px rgba(0,0,0,.55)}',
    '.lvAulasCabeca{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
    '.lvAulasTitulos{min-width:0}',
    '.lvAulasCabeca h2{display:flex;align-items:center;gap:8px;font-size:20px;line-height:1.2;margin:0}',
    '.lvAulasTitulos p{margin:4px 0 0;font-size:13px;color:var(--mv-txt-3,#8fa6c4)}',
    '.lvAulasH2Ico{width:22px;height:22px;flex:0 0 22px;color:var(--mv-ciano,#00D4FF)}',
    '.lvAulasFechar{flex:0 0 36px;width:36px;height:36px;border-radius:10px;cursor:pointer;',
      'background:rgba(255,255,255,.04);border:1px solid var(--mv-linha,#1c3457);',
      'color:var(--mv-txt-2,#c6d8ee);font-size:20px;line-height:1;padding:0}',
    '.lvAulasFechar:hover{border-color:rgba(0,212,255,.5);color:#fff}',
    '.lvAulasProg{display:flex;align-items:center;gap:12px;margin:14px 0 12px}',
    '.lvAulasProgFora{flex:1;height:6px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}',
    '.lvAulasProgFora>i{display:block;height:100%;width:0;border-radius:999px;',
      'background:linear-gradient(90deg,#00D4FF,#25e39b);transition:width .35s ease}',
    '.lvAulasTotTxt{font-size:12.5px;color:var(--mv-txt-2,#c6d8ee);white-space:nowrap}',
    '.lvAulasCorpo{flex:1;min-height:0;display:flex;flex-direction:column}',
    '.lvAulasAviso:empty{display:none}',
    '.lvAulasTrava,.lvAulasNovo{border-radius:12px;padding:10px 12px;margin-bottom:12px;',
      'display:flex;flex-direction:column;gap:2px}',
    '.lvAulasTrava{background:rgba(255,176,32,.10);border:1px solid rgba(255,176,32,.45)}',
    '.lvAulasNovo{background:rgba(0,212,255,.10);border:1px solid rgba(0,212,255,.38)}',
    '.lvAulasTrava b,.lvAulasNovo b{font-size:14px}',
    '.lvAulasTrava span,.lvAulasNovo span{font-size:12px;color:var(--mv-txt-2,#c6d8ee)}',
    '.lvAulasPalcoGrade{flex:1;min-height:0;display:grid;',
      'grid-template-columns:minmax(0,1fr) 400px;gap:20px}',
    '@media (max-width:1100px){.lvAulasPalcoGrade{grid-template-columns:minmax(0,1fr) 360px}}',
    '.lvAulasEsq{min-width:0;display:flex;flex-direction:column;gap:4px;overflow:auto}',
    '.lvAulasPalco{margin-top:0;margin-bottom:6px}',
    '.lvAulasPTit{font-size:15px;line-height:1.3}',
    '.lvAulasGire{display:none;font-size:12px;color:var(--mv-txt-3,#8fa6c4);margin:-2px 0 4px}',
    '.lvAulasGire::before{content:"\\21BB";display:inline-block;margin-right:6px;color:#00D4FF;font-weight:700}',
    '@media (max-width:760px) and (orientation:portrait){.lvAulasGire{display:block}}',
    '.lvAulasPSub{font-size:12px;color:var(--mv-txt-3,#8fa6c4)}',
    '.lvAulasProx{align-self:flex-start;margin-top:10px;padding:9px 14px;border-radius:10px;',
      'cursor:pointer;font:inherit;font-size:13px;font-weight:600;color:#06131f;',
      'background:linear-gradient(90deg,#00D4FF,#25e39b);border:0;text-align:left;max-width:100%}',
    '.lvAulasProx[hidden]{display:none}',
    '.lvAulasLista{min-height:0;overflow:auto;padding-right:4px;display:flex;flex-direction:column;gap:14px}',
    '.lvAulasGrupo{display:flex;flex-direction:column;gap:6px}',
    '.lvAulasGrupoCab{display:flex;align-items:baseline;justify-content:space-between;gap:8px}',
    '.lvAulasGrupoCab b{font-size:12px;text-transform:uppercase;letter-spacing:.5px;',
      'color:var(--mv-ciano,#00D4FF)}',
    '.lvAulasGrupoCont{font-size:11px;color:var(--mv-txt-3,#8fa6c4);white-space:nowrap}',
    '.lvAulasGrupoSub{font-size:11.5px;color:var(--mv-txt-3,#8fa6c4);margin:-4px 0 2px}',
    '.lvAulasIt{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;cursor:pointer;',
      'font:inherit;color:inherit;padding:6px;border-radius:12px;',
      'background:rgba(255,255,255,.025);border:1px solid var(--mv-linha,#1c3457);',
      'transition:border-color .15s,background .15s}',
    '.lvAulasIt:hover{border-color:rgba(0,212,255,.45)}',
    '.lvAulasIt.noPalco{border-color:#00D4FF;background:rgba(0,212,255,.08)}',
    '.lvAulasIt.feita.noPalco{border-color:#25e39b;background:rgba(37,227,155,.08)}',
    '.lvAulasNum{flex:0 0 28px;width:28px;height:28px;border-radius:50%;display:flex;',
      'align-items:center;justify-content:center;font-size:12px;font-weight:700;',
      'background:rgba(255,255,255,.07);color:var(--mv-txt-2,#c6d8ee)}',
    '.lvAulasNum.ok{background:rgba(37,227,155,.18);color:#25e39b}',
    '.lvAulasNum svg{width:15px;height:15px}',
    '.lvAulasMini{position:relative;flex:none;width:168px;aspect-ratio:16/9;border-radius:9px;',
      'overflow:hidden;background:#0b1728}',
    '.lvAulasMini img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}',
    '.lvAulasMiniNum{position:absolute;left:5px;bottom:6px;min-width:20px;padding:1px 5px;border-radius:4px;',
      'background:rgba(0,0,0,.82);color:#fff;font-size:11px;font-weight:700;line-height:1.5;text-align:center}',
    '.lvAulasMiniDur{position:absolute;right:5px;bottom:6px;padding:1px 5px;border-radius:4px;',
      'background:rgba(0,0,0,.82);color:#fff;font-size:11.5px;font-weight:600;line-height:1.5}',
    '.lvAulasMiniOk{position:absolute;left:5px;top:5px;width:22px;height:22px;border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;background:#22c55e;color:#04210f;',
      'box-shadow:0 1px 4px rgba(0,0,0,.4)}',
    '.lvAulasMiniOk svg{width:13px;height:13px}',
    '.lvAulasMiniTocando{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      'background:rgba(0,0,0,.58);color:#fff;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}',
    '.lvAulasItTxt{display:flex;flex-direction:column;gap:2px;min-width:0;padding-top:1px}',
    '.lvAulasItNome{font-size:13.5px;font-weight:600;line-height:1.32;display:-webkit-box;',
      '-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
    '.lvAulasItMeta{font-size:11.5px;color:var(--mv-txt-3,#8fa6c4)}',
    '.lvAulasSelo{align-self:flex-start;margin-top:2px;font-size:10.5px;font-weight:700;',
      'padding:1px 7px;border-radius:999px;background:rgba(0,212,255,.16);color:#00D4FF}',
    /* celular: vira folha que sobe de baixo, palco em cima e lista embaixo,
       a caixa inteira rola */
    '@media (max-width:760px){',
      '.lvAulasModal{padding:0;align-items:flex-end}',
      '.lvAulasCaixa{max-height:94vh;border-radius:20px 20px 0 0;overflow:auto;',
        'padding:16px 14px calc(env(safe-area-inset-bottom) + 18px)}',
      '.lvAulasCorpo,.lvAulasPalcoGrade{flex:none}',
      '.lvAulasPalcoGrade{grid-template-columns:1fr;gap:16px}',
      '.lvAulasEsq,.lvAulasLista{overflow:visible}',
      '.lvAulasMini{width:142px}',
      '.lvAulasCabeca h2{font-size:18px}',
    '}',
    'body.lvAulasAberto{overflow:hidden}'
  ].join('');

  function injetarCSS() {
    if (document.getElementById('lvAulasCSS')) return;
    var s = document.createElement('style'); s.id = 'lvAulasCSS'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* =====================================================================
     7. A PORTA
     ===================================================================== */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-lvaula]') : null;
    if (a) {
      /* item da lista da biblioteca: leva a aula para o palco e toca */
      if (a.classList.contains('lvAulasIt')) { escolher(a.getAttribute('data-lvaula'), true); return; }
      tocar(a, a.getAttribute('data-lvaula')); return;
    }
    var b = e.target && e.target.closest ? e.target.closest('[data-lvaulas-abrir]') : null;
    if (b) { abrirBiblioteca(b.getAttribute('data-lvaulas-abrir')); }
  }, true);

  /* troca de aba para o video que saiu da tela: sem isto o audio continua
     tocando atras da aba nova */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pararTodos();
  });
  /* No PAINEL a troca de secao nao esconde a pagina — troca o .tabConteudo,
     e o iframe da aba que saiu continuaria tocando por tras da nova.
     Embrulhar window.abrirTab NAO serve: o proprio painel a re-embrulha duas
     vezes, dentro de setInterval, depois que o motor ja subiu — o embrulho do
     motor sumia da ponta da cadeia. Ouvir o CLIQUE e imune a ordem de
     carregamento e a quantos embrulhos existirem. */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest
      ? e.target.closest('[data-tab], .tab, .aba, [data-fin], .finAba') : null;
    if (t) setTimeout(function () { pararTodos(true); }, 0);
  }, true);

  window.MvLiveAulas = {
    iniciar: function (op) {
      op = op || {};
      /* o percurso da aula fica no navegador, por conta: sem o uid, dois
         lojistas no mesmo aparelho herdariam o progresso um do outro */
      dono = op.uid || '';
      est = { vistas: (op.estado && op.estado.vistas) || [],
              em: (op.estado && op.estado.em) || '' };
      if (typeof op.salvar === 'function') salvar = op.salvar;
      if (typeof op.noAr === 'function') noAr = op.noAr;
      injetarCSS();
      pronto = true;
      pintarTudo();
      return this;
    },
    estado: function (novo) {          // o banco mudou por fora
      if (!novo) return est;
      est = { vistas: novo.vistas || [], em: novo.em || '' };
      pintarTudo();
      return est;
    },
    embutir: embutir,
    abrir: function (k) { abrirBiblioteca(k); },
    fechar: fecharBiblioteca,
    pararTodos: pararTodos,
    apto: apto,
    faltam: faltam,
    novas: novas,
    total: function () { return todas().length; },
    vistas: function () { return (est.vistas || []).slice(); },
    daTrava: function () { return daTrava().map(achar); },
    catalogo: function () { return CAT; }
  };
})();
