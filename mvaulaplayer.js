/*! MOVIKI mvaulaplayer.js | versao 2026-09-28-motorunico | repo: moviki-app
 *
 * O MOTOR UNICO DAS VIDEOAULAS — o player, a medicao dos 90% e o visto verde.
 *
 * QUEM USA
 *   index.html     painel do lojista: biblioteca Tutoriais, aula embutida no fim
 *                  de cada aba, boas-vindas e a trilha da Central de Pedidos
 *   parceiro.html  painel do parceiro: aulas e a trava da Divulgacao
 *   liveaulas.js   aulas do Modo Live, no painel e no estudio (live.html)
 *
 * POR QUE UM ARQUIVO SO
 *   Ate 28/09/2026 este motor existia em QUATRO copias (index, parceiro,
 *   liveaulas e a trilha nova). O visto verde "que so vale na primeira aula"
 *   voltou seis vezes: 03/09, 10/09, 15/09, 16/09, 17/09 e 28/09. Cada vez o
 *   conserto entrava numa copia e a outra ficava para tras, ou uma trilha
 *   nova nascia sem o conserto. A partir daqui:
 *
 *     >>> NENHUM painel cria iframe de aula nem fala com a API do YouTube.
 *     >>> Aula nova = linha no catalogo. Trilha nova = MvAulaPlayer.criar().
 *     >>> Conserto de medicao = SO AQUI, e vale para todos de uma vez.
 *
 * O QUE ELE GARANTE
 *  1. A API do YouTube e carregada UMA vez, e quem chegar depois tambem e
 *     atendido. Antes, se as aulas da live carregassem a API primeiro, o
 *     painel nunca mais montava player nenhum na mesma sessao (provado).
 *  2. O player so e ligado depois que o iframe esta NA PAGINA e CARREGADO.
 *     A primeira aula sempre funcionou porque a API chegava tarde, com o
 *     iframe pronto; da segunda em diante a API ja estava pronta e ligava o
 *     player num iframe ainda vazio. Agora toda aula nasce na condicao da
 *     primeira.
 *  3. VIGIA: se o YouTube nao responder em 4 s, liga de novo no MESMO iframe
 *     (o video nao reinicia). Se ainda assim nao responder, a aula passa a
 *     contar pelo RELOGIO DA TELA: so enquanto a aula esta aberta e a pagina
 *     visivel, nunca mais rapido que o tempo real. A aula NUNCA mais deixa de
 *     ficar verde por falha de comunicacao com o YouTube.
 *  4. Vale o CAMINHO PERCORRIDO, nao a posicao da agulha (15/09): arrastar
 *     nao soma, 2x soma, o fim do video (ENDED) nao prova nada sozinho.
 *  5. O percurso fica guardado POR AULA no navegador (16/09): fechar, trocar
 *     de aula ou recarregar continua de onde parou. Aula concluida apaga o
 *     rascunho. O banco so guarda a aula CONCLUIDA — isso e do painel.
 *  6. Player cujo iframe saiu da pagina e DESTRUIDO sozinho (17/09): quem
 *     apagar a tela com innerHTML='' e esquecer de matar() nao trava mais as
 *     aulas seguintes.
 *  7. DIARIO: os ultimos 80 eventos ficam em localStorage 'mvAulaDiag'. No
 *     console: mvAulaDiag(). Quando alguem disser "nao ficou verde", o diario
 *     diz em qual passo parou — acabou o conserto por teoria.
 *
 * TESTE OBRIGATORIO antes de qualquer entrega que mexa em aula:
 *   a bateria em claude/videoaulas-bateria/ no Project (le o LEIA-ME de la).
 *
 * NAO DEPENDE DE FIREBASE. Falha calado: aula nunca derruba painel.
 */
(function () {
  'use strict';
  if (window.MvAulaPlayer) return;

  var VERSAO = '2026-09-28-motorunico';
  var META = 0.9;              /* fracao percorrida que fecha a aula */
  var TIQUE = 500;             /* ms entre leituras */
  var VIGIA_REANEXA = 4000;    /* sem resposta do YouTube: liga de novo */
  var VIGIA_RELOGIO = 9000;    /* ainda sem resposta: conta pela tela */
  var ESPERA_LOAD = 4000;      /* iframe que nao avisa que carregou */

  /* ------------------------------------------------------------------
     DIARIO
     ------------------------------------------------------------------ */
  var DIAG = 'mvAulaDiag';
  function diario(ev, k, extra) {
    try {
      if (!window.localStorage) return;
      var l = [];
      try { l = JSON.parse(localStorage.getItem(DIAG) || '[]') || []; } catch (_) { l = []; }
      var r = { t: new Date().toISOString().slice(5, 19), ev: ev, k: k || '' };
      if (extra) r.x = extra;
      l.push(r);
      if (l.length > 80) l = l.slice(l.length - 80);
      localStorage.setItem(DIAG, JSON.stringify(l));
    } catch (_) {}
  }
  window.mvAulaDiag = function () {
    try { return JSON.parse(localStorage.getItem(DIAG) || '[]'); } catch (_) { return []; }
  };

  /* ------------------------------------------------------------------
     A API DO YOUTUBE — um carregador para a pagina inteira
     ------------------------------------------------------------------ */
  var fila = [], pediu = false;
  function ytOk() {
    return !!(window.YT && typeof window.YT.Player === 'function');
  }
  function soltar() {
    if (!ytOk()) return;
    var l = fila.splice(0);
    for (var i = 0; i < l.length; i++) { try { l[i](); } catch (_) {} }
  }
  function carregarYT(cb) {
    if (ytOk()) { cb(); return; }
    fila.push(cb);
    if (pediu) return;
    pediu = true;
    var antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      try { if (typeof antes === 'function') antes(); } catch (_) {}
      soltar();
    };
    if (!document.getElementById('mvYTApi') &&
        !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      var sc = document.createElement('script');
      sc.id = 'mvYTApi'; sc.src = 'https://www.youtube.com/iframe_api';
      (document.head || document.documentElement).appendChild(sc);
    }
    /* rede de seguranca: nao importa quem carregou a API nem se alguem
       sobrescreveu o onYouTubeIframeAPIReady — conferimos sozinhos */
    var n = 0, iv = setInterval(function () {
      if (ytOk()) { clearInterval(iv); soltar(); }
      else if (++n > 300) { clearInterval(iv); diario('api-nao-carregou'); }
    }, 200);
  }

  /* ------------------------------------------------------------------
     O PERCURSO — por aula, no navegador
     ------------------------------------------------------------------ */
  var PERCORRIDO = {};         /* chave completa -> { s:{}, n:segundos } */
  function trilha(chave) {
    if (!PERCORRIDO[chave]) {
      var t = { s: {}, n: 0 };
      try {
        var cru = window.localStorage && localStorage.getItem(chave);
        var l = cru ? JSON.parse(cru) : null;
        if (l && l.length) {
          for (var i = 0; i < l.length; i++) {
            var x = Number(l[i]);
            if (x >= 0 && !t.s[x]) { t.s[x] = 1; t.n++; }
          }
        }
      } catch (_) {}
      PERCORRIDO[chave] = t;
    }
    return PERCORRIDO[chave];
  }
  function guardar(chave) {
    try {
      var t = PERCORRIDO[chave]; if (!t || !window.localStorage) return;
      var l = [];
      for (var s in t.s) { if (t.s[s]) l.push(Number(s)); }
      localStorage.setItem(chave, JSON.stringify(l));
    } catch (_) {}
  }
  function limpar(chave) {
    try { if (window.localStorage) localStorage.removeItem(chave); } catch (_) {}
  }
  try {
    window.addEventListener('pagehide', function () {
      try { for (var c in PERCORRIDO) { if (PERCORRIDO[c] && PERCORRIDO[c].n) guardar(c); } } catch (_) {}
    });
  } catch (_) {}

  /* "2:23" -> 143. So para o relogio da tela e para a barra antes do
     YouTube informar a duracao de verdade. */
  function segsDe(d) {
    var m = /^(\d+):(\d{1,2})$/.exec(String(d || ''));
    return m ? (Number(m[1]) * 60 + Number(m[2])) : 0;
  }

  /* ------------------------------------------------------------------
     A SESSAO — uma por iframe
     ------------------------------------------------------------------ */
  var S = {};                  /* id do iframe -> sessao */
  var seq = 0;
  function noDoc(el) { return !!(el && el.isConnected !== false && document.documentElement.contains(el)); }

  function encerrar(s, motivo) {
    if (!s || s.fim) return;
    s.fim = true;
    try { clearInterval(s.iv); } catch (_) {}
    try { clearTimeout(s.toLoad); } catch (_) {}
    guardar(s.chave);
    for (var i = 0; i < s.ps.length; i++) {
      try { if (typeof s.ps[i].destroy === 'function') s.ps[i].destroy(); } catch (_) {}
    }
    s.ps = []; s.p = null;
    try { s.f.__p = null; } catch (_) {}
    delete S[s.f.id];
    if (motivo) diario(motivo, s.v.k, s.modo);
  }

  function aviso(s, nome, a, b) {
    try { var fn = s.op[nome]; if (typeof fn === 'function') fn(a, b); } catch (_) {}
  }

  function duracao(s) {
    if (s.dur > 0) return s.dur;
    if (s.p && s.pronto) {
      try { var d = s.p.getDuration(); if (d > 0) { s.dur = d; return d; } } catch (_) {}
    }
    return 0;
  }

  /* fecha a aula SO com 90% percorridos — uma marcacao por sessao */
  function fechar(s) {
    if (s.contado) return true;
    var dur = duracao(s) || (s.modo === 'relogio' ? s.durCat : 0);
    if (!(dur > 0 && s.t.n >= dur * META)) return false;
    s.contado = true;
    limpar(s.chave);
    diario('concluiu', s.v.k, s.modo);
    aviso(s, 'marcar', s.v.k);
    aviso(s, 'andamento', s.v.k, dur);
    return true;
  }

  function somar(s, de, ate) {
    for (var i = Math.floor(de); i <= Math.floor(ate); i++) {
      if (i >= 0 && !s.t.s[i]) { s.t.s[i] = 1; s.t.n++; }
    }
  }

  function tique(s) {
    if (s.fim) return;
    if (!noDoc(s.f)) { encerrar(s, 'saiu-da-tela'); return; }
    var agora = Date.now();

    /* ---- o vigia: o YouTube respondeu? ---- */
    if (!s.pronto && s.anexadoMs && !document.hidden) {
      var espera = agora - s.anexadoMs;
      if (s.modo === 'api' && espera > VIGIA_RELOGIO) {
        /* o video ja estava na tela desde que carregou (autoplay): esse
           tempo tambem conta, a 1x */
        s.modo = 'relogio';
        var desde = s.loadMs || s.anexadoMs;
        s.pos = Math.max(0, (agora - desde) / 1000);
        if (s.durCat > 0) s.pos = Math.min(s.pos, s.durCat);
        if (s.pos > 0) somar(s, 0, s.pos);
        s.relMs = agora;
        diario('relogio-da-tela', s.v.k);
      } else if (s.modo === 'api' && espera > VIGIA_REANEXA && !s.reanexou) {
        s.reanexou = true;
        diario('reanexou', s.v.k);
        anexar(s);
      }
    }

    if (s.modo === 'api' && s.pronto && s.p) {
      var tt;
      try { tt = s.p.getCurrentTime(); } catch (_) { tt = NaN; }
      if (tt >= 0) {
        var real = s.ultimoMs ? ((agora - s.ultimoMs) / 1000) : 0;
        s.ultimoMs = agora;
        /* so conta o trecho se o avanco couber no tempo que passou de
           verdade — a folga de 1,6x deixa o 2x passar e barra o arrasto */
        if (s.ultimo >= 0 && (tt - s.ultimo) <= real * 1.6 + 0.6 && tt >= s.ultimo) somar(s, s.ultimo, tt);
        else somar(s, tt, tt);
        s.ultimo = tt;
      }
    } else if (s.modo === 'relogio') {
      /* sem YouTube: conta o tempo de TELA, a 1x, so com a pagina visivel */
      var passo = s.relMs ? Math.min((agora - s.relMs) / 1000, 1.5) : 0;
      s.relMs = agora;
      if (!document.hidden && passo > 0) {
        var lim = s.durCat > 0 ? s.durCat : 0;
        var de = s.pos;
        s.pos = lim ? Math.min(s.pos + passo, lim) : s.pos + passo;
        somar(s, de, s.pos);
      }
    }

    var dur = duracao(s) || (s.modo === 'relogio' ? s.durCat : 0);
    if (dur > 0 && !s.contado && !s.acabou) aviso(s, 'andamento', s.v.k, dur);
    if ((++s.gravou % 4) === 0) guardar(s.chave);
    fechar(s);
  }

  function anexar(s) {
    carregarYT(function () {
      if (s.fim || !noDoc(s.f)) return;
      try {
        /* Se houver dois players no mesmo iframe (o vigia religou), vale o
           que responder primeiro — nunca descartar quem so estava lento. */
        var p = new window.YT.Player(s.f.id, { events: {
          onReady: function (e) {
            if (s.fim) return;
            s.p = p; s.f.__p = p;
            var volta = !s.pronto;
            s.pronto = true;
            try { var d = e.target.getDuration(); if (d > 0) s.dur = d; } catch (_) {}
            if (s.modo === 'relogio') {
              /* o YouTube voltou a responder: a medicao exata assume */
              s.modo = 'api'; s.ultimo = -1; s.ultimoMs = 0;
              diario('api-voltou', s.v.k);
            }
            if (volta) diario('pronto', s.v.k, s.reanexou ? 'na-2a' : '');
          },
          onStateChange: function (e) {
            if (s.fim) return;
            if (!s.pronto || s.modo === 'relogio') {
              s.p = p; s.f.__p = p;
              if (s.modo === 'relogio') { s.modo = 'api'; s.ultimo = -1; s.ultimoMs = 0; diario('api-voltou', s.v.k); }
              if (!s.pronto) { s.pronto = true; diario('pronto', s.v.k, 'pelo-estado'); }
            }
            if (p !== s.p) return;
            var E = (window.YT && window.YT.PlayerState) || { PLAYING: 1, ENDED: 0 };
            if (e.data === E.PLAYING) { s.ultimoMs = 0; s.acabou = false; return; }
            if (e.data === E.ENDED) {
              s.acabou = true;          /* o medidor para onde esta: o aviso fica na tela */
              tique(s);
              guardar(s.chave);
              if (!fechar(s)) { diario('adiantou', s.v.k); aviso(s, 'adiantou', s.v.k); }
              aviso(s, 'acabou', s.v.k);
            }
          }
        } });
        s.ps.push(p);
        if (!s.p) { s.p = p; s.f.__p = p; }
        s.anexadoMs = Date.now();
        diario('anexou', s.v.k, s.reanexou ? '2a' : '');
      } catch (err) {
        diario('erro-anexar', s.v.k, String(err && err.message || err).slice(0, 60));
      }
    });
  }

  /* Cria o iframe da aula e deixa tudo ligado. Quem chama so precisa
     colocar o elemento devolvido na pagina.
     op: { prefixo, chave(k) -> chave do localStorage, marcar(k),
           andamento(k, dur), adiantou(k), acabou(k) } */
  function criar(v, op) {
    op = op || {};
    var f = document.createElement('iframe');
    f.id = (op.prefixo || 'mvAula') + (++seq) + '_' + Math.random().toString(36).slice(2, 6);
    var origem = '';
    try { origem = '&origin=' + encodeURIComponent(location.origin); } catch (_) {}
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
            '?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1' + origem;
    f.title = v.t || 'Aula';
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');

    var chave = (typeof op.chave === 'function') ? op.chave(v.k) : ('mvTrilha:anon:' + v.k);
    var s = {
      f: f, v: v, op: op, chave: chave, t: trilha(chave),
      modo: 'api', pronto: false, p: null, ps: [], dur: 0, durCat: segsDe(v.d),
      ultimo: -1, ultimoMs: 0, pos: 0, relMs: 0, gravou: 0,
      contado: false, fim: false, acabou: false, reanexou: false, anexadoMs: 0, loadMs: 0
    };
    S[f.id] = s;
    diario('criou', v.k);

    var ligou = false;
    function ligar() {
      if (ligou || s.fim) return;
      ligou = true;
      try { clearTimeout(s.toLoad); } catch (_) {}
      anexar(s);
    }
    /* condicao da PRIMEIRA aula para todas: iframe na pagina e carregado */
    f.addEventListener('load', function () {
      if (!s.loadMs) s.loadMs = Date.now();
      if (noDoc(f)) ligar();
    });
    (function esperar(n) {
      if (s.fim) return;
      if (noDoc(f)) {
        s.toLoad = setTimeout(ligar, ESPERA_LOAD);
        return;
      }
      if (n > 400) { encerrar(s, 'nunca-entrou-na-tela'); return; }   /* 20 s */
      setTimeout(function () { esperar(n + 1); }, 50);
    })(0);

    s.iv = setInterval(function () { try { tique(s); } catch (_) {} }, TIQUE);
    return f;
  }

  /* Encerra de verdade: para o relogio, guarda o percurso e destroi o player */
  function matar(el) {
    if (!el) return;
    var s = S[el.id];
    if (s) { encerrar(s, ''); return; }
    try { if (el.__p && typeof el.__p.destroy === 'function') el.__p.destroy(); } catch (_) {}
    el.__p = null;
  }

  window.MvAulaPlayer = {
    versao: VERSAO,
    criar: criar,
    matar: matar,
    trilha: trilha,
    guardar: guardar,
    segsDe: segsDe,
    carregarYT: carregarYT,
    sessoes: function () { var n = 0; for (var k in S) { if (S[k]) n++; } return n; }
  };
})();
