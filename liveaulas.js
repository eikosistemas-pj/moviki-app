/*! MOVIKI liveaulas.js | versao 2026-09-15-liveaulas2 | repo: moviki-app
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
 *  - pinta a biblioteca (a aba "Aulas da live");
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
     ===================================================================== */
  var CAT = {
    /* as tres que o lojista precisa ver antes da primeira transmissao */
    trava: ['mod-live-abertura', 'mod-live-regras', 'mod-live-primeira'],
    modulos: [
      { n: 'Comece por aqui', sel: '', v: [
        { k: 'mod-live-abertura', t: 'Live no Moviki: o que é e como funciona',
          d: '1:20', id: '1TqgHffAyYU', em: '2026-09-15' },
        { k: 'mod-live-regras',   t: 'O que pode e o que não pode na live',
          d: '1:04', id: '3WceM12RkWE', em: '2026-09-15' },
        { k: 'mod-live-primeira', t: 'Sua primeira live: título, câmera e entrar ao vivo',
          d: '1:16', id: 'sngj1eUC7kU', em: '2026-09-15' } ]},

      { n: 'Produtos', sel: '.painelAba[data-aba="produtos"]', v: [
        { k: 'mod-live-sacolinha', t: 'Sacolinha e produto em destaque',
          d: '0:55', id: '3Fsofzdj0u4', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Chat', sel: '.painelAba[data-aba="chat"]', v: [
        { k: 'mod-live-chat', t: 'Chat da live: responder e apagar',
          d: '0:33', id: 'V6WZqQ0s-bY', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Agendar', sel: '.painelAba[data-aba="agendar"]', v: [
        { k: 'mod-live-agendar', t: 'Agendar a próxima live e divulgar o link',
          d: '0:31', id: 'cWG2cWGMrII', plano: 'Premium', em: '2026-09-15' } ]},

      { n: 'Receber no Pix', sel: '.painelAba[data-aba="pix"]', v: [
        { k: 'mod-live-pix', t: 'Como você recebe o dinheiro',
          d: '1:30', id: 'hhTBM163vK0', plano: 'Enterprise', em: '2026-09-15' } ]},

      /* PEDIDOS E CARDAPIO MORAM NO PAINEL, nao no estudio: o pedido pago cai
         no Financeiro e o cardapio compravel e a aba Cardapio. Como embutir()
         so procura o alvo, o mesmo catalogo serve as duas paginas — no estudio
         estes dois seletores nao existem e as aulas ficam so na biblioteca. */
      { n: 'Pedidos', sel: '#tab-financeiro', rot: 'O pedido que vem da live', v: [
        { k: 'mod-live-pedidos', t: 'Pedidos: conferir, confirmar e entregar',
          d: '1:00', id: 'qx4dFUC9ORs', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Oferta relâmpago', sel: '.painelAba[data-aba="oferta"]', v: [
        { k: 'mod-live-oferta', t: 'Oferta relâmpago e estoque ao vivo',
          d: '0:55', id: 'pbWfLHoKGag', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Cupom e brinde', sel: '.painelAba[data-aba="cupom"]', v: [
        { k: 'mod-live-cupom', t: 'Cupom, brinde e "Estou aqui agora"',
          d: '0:50', id: 'BQPflIBLNG0', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Fila de pedidos', sel: '.painelAba[data-aba="fila"]', v: [
        { k: 'mod-live-fila', t: 'Fila de pedidos',
          d: '0:21', id: 'hhooJvRXx2Q', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Dados', sel: '.painelAba[data-aba="dados"]', v: [
        { k: 'mod-live-dados', t: 'Dados ao vivo e o resumo da live',
          d: '0:31', id: '07rQewrYNaI', plano: 'Enterprise', em: '2026-09-15' } ]},

      { n: 'Cortes', sel: '.painelAba[data-aba="cortes"]', v: [
        { k: 'mod-live-cortes', t: 'Cortes para Reels e Status',
          d: '0:24', id: 'vzZOyzzfYHM', plano: 'Enterprise', em: '2026-09-15' } ]},

      /* Esta aba ja tem a aula do painel (mod-cardapio, que ensina a MONTAR o
         cardapio). Esta ensina o cardapio a VENDER, que e outro assunto — as
         duas caixas convivem, com titulos que nao se confundem. */
      { n: 'Cardápio', sel: '#tab-cardapio', rot: 'Vender pelo cardápio, sem live', v: [
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
  var ytPronto = false, ytFila = [], seq = 0;

  function carregarYT(cb) {
    if (ytPronto) return cb();
    ytFila.push(cb);
    if (document.getElementById('mvYTApi')) return;
    var antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      ytPronto = true;
      try { if (typeof antes === 'function') antes(); } catch (e) {}
      ytFila.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
    };
    var sc = document.createElement('script');
    sc.id = 'mvYTApi'; sc.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(sc);
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
    try { clearInterval(fr.__t); } catch (e) {}
    fr.__t = null;
    try { if (fr.__p && typeof fr.__p.destroy === 'function') fr.__p.destroy(); } catch (e) {}
    fr.__p = null;
  }
  function vigiar(f, v) {
    carregarYT(function () {
      var n = 0;
      (function esperar() {
        /* iframe() devolve o elemento ANTES de quem chamou anexa-lo. Montar o
           player num id que ainda nao esta no documento faz o player nunca
           nascer — e a aula nunca ficava verde da segunda em diante. */
        if (!document.getElementById(f.id)) {
          if (++n > 60) return;                  // 3 s e desiste, sem quebrar nada
          setTimeout(esperar, 50); return;
        }
        montar();
      })();
      function pararRelogio() { try { clearInterval(f.__t); } catch (e) {} f.__t = null; }
      function contar() { if (f.__contado) return; f.__contado = 1; pararRelogio(); marcar(v.k); }
      function relogio() {
        if (f.__t) return;
        f.__t = setInterval(function () {
          try {
            if (!document.body.contains(f)) { pararRelogio(); return; }
            if (!f.__p) return;
            var d = f.__p.getDuration(), t = f.__p.getCurrentTime();
            if (d > 0 && t / d >= 0.9) contar();
          } catch (e) {}
        }, 1000);
      }
      function montar() {
        try {
          f.__p = new YT.Player(f.id, { events: {
            onReady: relogio,
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.ENDED) { contar(); return; }
              if (e.data === YT.PlayerState.PLAYING) relogio();
            }
          } });
        } catch (e) {}
      }
    });
  }
  function iframe(v) {
    var f = document.createElement('iframe');
    f.id = 'mvLV' + (++seq);
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
            '?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1';
    f.title = v.t;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    vigiar(f, v);
    return f;
  }
  /* devolve a capa no lugar do player: sem isso o iframe continua tocando
     depois da troca de tela, e dois audios tocam juntos */
  function parar(cx) {
    var q = cx.querySelector('div.lvAulaQuadro'); if (!q) return;
    try { matar(q.querySelector('iframe')); } catch (e) {}
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
    pararTodos();                                // um video de cada vez, sempre
    var q = document.createElement('div'); q.className = 'lvAulaQuadro';
    q.appendChild(iframe(v));
    botao.parentNode.replaceChild(q, botao);
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
     5. A BIBLIOTECA
     ===================================================================== */
  var cx = null, corpo = null;
  function montarBiblioteca() {
    if (cx) return;
    cx = document.createElement('div');
    cx.id = 'lvAulasModal'; cx.className = 'lvAulasModal escondido';
    var caixa = document.createElement('div'); caixa.className = 'lvAulasCaixa';
    var topo = document.createElement('div'); topo.className = 'lvAulasCabeca';
    topo.innerHTML = '<h2>' + PLAY.replace('viewBox', 'class="lvAulasH2Ico" viewBox') +
                     'Aulas da live</h2>';
    var fechar = document.createElement('button');
    fechar.type = 'button'; fechar.className = 'lvAulasFechar'; fechar.textContent = 'Fechar';
    fechar.addEventListener('click', fecharBiblioteca);
    topo.appendChild(fechar);
    corpo = document.createElement('div'); corpo.className = 'lvAulasCorpo';
    caixa.appendChild(topo); caixa.appendChild(corpo);
    cx.appendChild(caixa);
    cx.addEventListener('click', function (e) { if (e.target === cx) fecharBiblioteca(); });
    document.body.appendChild(cx);
  }
  function pintarBiblioteca() {
    if (!corpo) return;
    corpo.innerHTML = '';
    var f = faltam();
    if (f.length) {
      var av = document.createElement('div'); av.className = 'lvAulasTrava';
      av.innerHTML = '<b>Falta' + (f.length > 1 ? 'm ' + f.length + ' aulas' : ' 1 aula') +
        ' para você entrar ao vivo.</b><span>São as três do começo. As outras ficam ' +
        'aqui para consultar quando precisar.</span>';
      corpo.appendChild(av);
    } else if (novas().length) {
      var nv = document.createElement('div'); nv.className = 'lvAulasNovo';
      nv.innerHTML = '<b>Tem aula nova aqui.</b><span>Ferramenta nova ganha aula. ' +
        'Você já pode transmitir — isto é só para ficar em dia.</span>';
      corpo.appendChild(nv);
    }
    MOD().forEach(function (m) {
      var vs = prontos(m); if (!vs.length) return;
      var sec = document.createElement('section'); sec.className = 'lvAulasSec';
      var h = document.createElement('h3'); h.textContent = m.n; sec.appendChild(h);
      var grade = document.createElement('div'); grade.className = 'lvAulasGrade';
      vs.forEach(function (v) {
        var cel = document.createElement('div');
        cel.className = 'lvAulaBox lvAulaCel'; cel.setAttribute('data-lvk', v.k);
        cel.appendChild(moldura(v));
        var leg = document.createElement('div'); leg.className = 'lvAulaLeg';
        var t = document.createElement('b'); t.textContent = v.t; leg.appendChild(t);
        var s = document.createElement('span');
        s.textContent = (viu(v.k) ? 'Assistida' : (v.plano || 'Todos os planos')) +
                        (v.d ? ' · ' + v.d : '');
        leg.appendChild(s);
        cel.appendChild(leg);
        grade.appendChild(cel);
      });
      sec.appendChild(grade);
      corpo.appendChild(sec);
    });
  }
  function abrirBiblioteca() {
    montarBiblioteca(); pintarBiblioteca();
    cx.classList.remove('escondido');
    document.body.classList.add('lvAulasAberto');
  }
  function fecharBiblioteca() {
    if (!cx) return;
    pararTodos();
    cx.classList.add('escondido');
    document.body.classList.remove('lvAulasAberto');
  }

  function pintarTudo() {
    try {
      /* repinta as capas ja na tela para o visto verde aparecer na hora */
      var bs = document.querySelectorAll('button[data-lvaula]');
      for (var i = 0; i < bs.length; i++) {
        if (viu(bs[i].getAttribute('data-lvaula'))) bs[i].classList.add('lvAulaVista');
      }
      if (corpo && cx && !cx.classList.contains('escondido')) pintarBiblioteca();
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
    /* biblioteca */
    '.lvAulasModal{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.72);',
      'display:flex;align-items:flex-end;justify-content:center}',
    '.lvAulasModal.escondido{display:none}',
    '.lvAulasCaixa{width:100%;max-width:820px;max-height:90vh;overflow:auto;',
      'background:var(--mv-surf,#0e1c30);border-radius:20px 20px 0 0;',
      'padding:16px 16px calc(env(safe-area-inset-bottom) + 18px)}',
    '.lvAulasCabeca{display:flex;align-items:center;justify-content:space-between;',
      'gap:10px;margin-bottom:10px}',
    '.lvAulasCabeca h2{display:flex;align-items:center;gap:8px;font-size:18px;margin:0}',
    '.lvAulasH2Ico{width:22px;height:22px;color:var(--mv-ciano,#00D4FF)}',
    '.lvAulasFechar{background:transparent;border:1px solid var(--mv-linha,#1c3457);',
      'color:var(--mv-txt-2,#c6d8ee);border-radius:10px;padding:6px 12px;cursor:pointer}',
    '.lvAulasSec{margin-top:14px}',
    '.lvAulasSec h3{font-size:13px;color:var(--mv-txt-3,#8fa6c4);margin:0 0 8px;',
      'text-transform:uppercase;letter-spacing:.4px}',
    '.lvAulasGrade{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}',
    '.lvAulaCel{margin-top:0}',
    '.lvAulaLeg{margin-top:6px;display:flex;flex-direction:column;gap:2px}',
    '.lvAulaLeg b{font-size:13px;line-height:1.25}',
    '.lvAulaLeg span{font-size:11px;color:var(--mv-txt-3,#8fa6c4)}',
    '.lvAulasTrava,.lvAulasNovo{border-radius:12px;padding:10px 12px;margin-bottom:6px;',
      'display:flex;flex-direction:column;gap:2px}',
    '.lvAulasTrava{background:rgba(255,176,32,.12);border:1px solid rgba(255,176,32,.45)}',
    '.lvAulasNovo{background:rgba(0,212,255,.10);border:1px solid rgba(0,212,255,.38)}',
    '.lvAulasTrava b,.lvAulasNovo b{font-size:14px}',
    '.lvAulasTrava span,.lvAulasNovo span{font-size:12px;color:var(--mv-txt-2,#c6d8ee)}',
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
    if (a) { tocar(a, a.getAttribute('data-lvaula')); return; }
    var b = e.target && e.target.closest ? e.target.closest('[data-lvaulas-abrir]') : null;
    if (b) { abrirBiblioteca(); }
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
    abrir: abrirBiblioteca,
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
