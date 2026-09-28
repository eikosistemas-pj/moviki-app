/*! MOVIKI mvaulaplayer.js | versao 2026-09-28-motor2 | repo: moviki-app
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
 *  2. O PROPRIO YOUTUBE cria o player (YT.Player num marcador, com
 *     videoId) — o caminho oficial da API. Ate a 1a versao deste motor o
 *     painel criava o iframe e "ligava" o player nele depois; esse aperto de
 *     mao falhava a partir da 2a/3a aula (28/09, visto em campo pelo Paulo:
 *     a barra ficava parada e so andava pelo relogio, e na 7a aula ficou em
 *     0% com o video tocando ate o fim).
 *  3. VIGIA, para os tres jeitos de o YouTube falhar: nao responde (4 s),
 *     responde mas nao entrega o tempo do video (3 s), ou diz "tocando" com
 *     o tempo parado (6 s). Em qualquer um, a aula passa a contar pelo
 *     RELOGIO DA TELA: a 1x, so com a pagina visivel, e parando quando o
 *     YouTube avisa pausa. O tempo que ja passou com o video na tela conta.
 *     Se o YouTube voltar a entregar o tempo, a medicao exata reassume.
 *     No relogio nao existe "voce adiantou": nao da para acusar sem dado.
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

  var VERSAO = '2026-09-28-motor2';
  var META = 0.9;              /* fracao percorrida que fecha a aula */
  var TIQUE = 500;             /* ms entre leituras */
  var VIGIA_SEM_RESPOSTA = 4000; /* YouTube nao respondeu: conta pela tela */
  var VIGIA_SEM_TEMPO = 3000;    /* respondeu mas nao entrega o tempo */
  var VIGIA_PARADO = 6000;       /* diz "tocando" mas o tempo nao anda */
  var ESPERA_API = 2500;         /* API nao chegou: mostra o video assim mesmo */

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
     A SESSAO — uma por aula aberta
     ------------------------------------------------------------------ */
  var S = {};                  /* id do elemento -> sessao */
  var seq = 0;
  function noDoc(el) { return !!(el && el.isConnected !== false && document.documentElement.contains(el)); }
  function elem(s) { return document.getElementById(s.id) || s.el; }

  function encerrar(s, motivo) {
    if (!s || s.fim) return;
    s.fim = true;
    try { clearInterval(s.iv); } catch (_) {}
    try { clearTimeout(s.toPlano); } catch (_) {}
    guardar(s.chave);
    try { if (s.p && typeof s.p.destroy === 'function') s.p.destroy(); } catch (_) {}
    s.p = null;
    delete S[s.id];
    if (motivo) diario(motivo, s.v.k, s.modo);
  }

  function aviso(s, nome, a, b) {
    try { var fn = s.op[nome]; if (typeof fn === 'function') fn(a, b); } catch (_) {}
  }

  /* duracao para a meta: a do YouTube quando ele informa, senao a do
     catalogo (so para nao travar a barra enquanto o YouTube nao fala) */
  function duracao(s) {
    if (!(s.dur > 0) && s.p && s.pronto) {
      try { var d = s.p.getDuration(); if (d > 0) s.dur = d; } catch (_) {}
    }
    return s.dur > 0 ? s.dur : s.durCat;
  }

  /* fecha a aula SO com 90% percorridos — uma marcacao por sessao */
  function fechar(s) {
    if (s.contado) return true;
    var dur = duracao(s);
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

  /* o YouTube nao esta entregando o tempo do video: a aula passa a contar
     pelo RELOGIO DA TELA, a 1x, so com a pagina visivel e so enquanto o
     video nao estiver pausado (quando o YouTube avisa o estado) */
  function paraRelogio(s, motivo, desde) {
    if (s.modo === 'relogio') return;
    s.modo = 'relogio';
    s.pos = Math.max(0, desde || 0);
    if (s.durCat > 0) s.pos = Math.min(s.pos, s.durCat);
    if (s.pos > 0) somar(s, 0, s.pos);
    s.relMs = Date.now();
    diario('relogio-da-tela', s.v.k, motivo);
  }

  function tique(s) {
    if (s.fim) return;
    var el = elem(s);
    if (!noDoc(el)) { encerrar(s, 'saiu-da-tela'); return; }
    var agora = Date.now();
    var real = s.ultimoTiq ? Math.min((agora - s.ultimoTiq) / 1000, 2) : 0;
    s.ultimoTiq = agora;
    var visivel = !document.hidden;
    if (!s.naTelaMs) s.naTelaMs = agora;

    /* le o tempo do video, se o YouTube estiver entregando */
    var tt = NaN;
    if (s.p && s.pronto) { try { tt = Number(s.p.getCurrentTime()); } catch (_) { tt = NaN; } }
    var temTempo = isFinite(tt) && tt >= 0;

    if (s.modo === 'api') {
      if (temTempo) {
        var passou = s.ultimoMs ? ((agora - s.ultimoMs) / 1000) : 0;
        s.ultimoMs = agora;
        /* so conta o trecho se o avanco couber no tempo que passou de
           verdade — a folga de 1,6x deixa o 2x passar e barra o arrasto */
        if (s.ultimo >= 0 && tt >= s.ultimo && (tt - s.ultimo) <= passou * 1.6 + 0.6) somar(s, s.ultimo, tt);
        else somar(s, tt, tt);
        if (tt !== s.ultimo) s.parado = 0;
        else if (s.estado === 1 && visivel) s.parado += real;
        s.ultimo = tt;
        s.semTempo = 0;
      } else if (visivel) {
        s.semTempo += real;
      }
      /* os tres jeitos de o YouTube falhar, e o que o vigia faz */
      if (visivel) {
        if (!s.pronto && (agora - s.naTelaMs) > VIGIA_SEM_RESPOSTA) {
          paraRelogio(s, 'sem-resposta', (agora - s.naTelaMs) / 1000);
        } else if (s.pronto && !temTempo && s.semTempo > VIGIA_SEM_TEMPO / 1000) {
          paraRelogio(s, 'sem-tempo', (agora - s.naTelaMs) / 1000);
        } else if (temTempo && s.estado === 1 && s.parado > VIGIA_PARADO / 1000) {
          paraRelogio(s, 'tempo-parado', tt);
        }
      }
    } else if (s.modo === 'relogio') {
      if (temTempo && s.ultimo >= 0 && tt > s.ultimo + 0.25) {
        /* o YouTube voltou a entregar o tempo: a medicao exata assume */
        s.modo = 'api'; s.ultimo = tt; s.ultimoMs = agora; s.parado = 0; s.semTempo = 0;
        diario('api-voltou', s.v.k);
      } else {
        if (temTempo) s.ultimo = tt;
        var pausado = (s.estado === 0 || s.estado === 2 || s.estado === 5);
        if (visivel && !pausado && real > 0) {
          var de = s.pos;
          s.pos = s.durCat > 0 ? Math.min(s.pos + real, s.durCat) : s.pos + real;
          somar(s, de, s.pos);
        }
      }
    }

    var dur = duracao(s);
    if (dur > 0 && !s.contado && !s.acabou) aviso(s, 'andamento', s.v.k, dur);
    if ((++s.gravou % 4) === 0) guardar(s.chave);
    fechar(s);
  }

  function eventos(s) {
    return {
      onReady: function (e) {
        if (s.fim) return;
        if (!s.pronto) diario('pronto', s.v.k, String(Date.now() - (s.anexadoMs || Date.now())) + 'ms');
        s.pronto = true;
        try { var d = e.target.getDuration(); if (d > 0) s.dur = d; } catch (_) {}
      },
      onStateChange: function (e) {
        if (s.fim) return;
        if (!s.pronto) { s.pronto = true; diario('pronto', s.v.k, 'pelo-estado'); }
        s.estado = e.data;
        var E = (window.YT && window.YT.PlayerState) || { PLAYING: 1, ENDED: 0 };
        if (e.data === E.PLAYING) { s.ultimoMs = 0; s.acabou = false; s.parado = 0; return; }
        if (e.data === E.ENDED) {
          tique(s);
          guardar(s.chave);
          s.acabou = true;          /* o medidor para onde esta: o aviso fica na tela */
          if (!fechar(s)) {
            /* "adiantou" so quando o tempo do video era confiavel. No
               relogio da tela nao da para acusar ninguem. */
            if (s.modo === 'api') { diario('adiantou', s.v.k); aviso(s, 'adiantou', s.v.k); }
            else diario('fim-sem-meta', s.v.k, Math.round(s.t.n) + 's');
          }
          aviso(s, 'acabou', s.v.k);
        }
      },
      onError: function (e) {
        diario('erro-video', s.v.k, String(e && e.data));
      }
    };
  }

  /* o YouTube cria o proprio iframe no lugar do marcador — o caminho
     oficial da API, que funciona igual da primeira a centesima aula */
  function montar(s) {
    if (s.fim || s.p) return;
    var alvo = document.getElementById(s.id);
    if (!noDoc(alvo)) return;
    try {
      var op = { events: eventos(s) };
      if (alvo.tagName !== 'IFRAME') {
        op.videoId = s.v.id;
        op.host = 'https://www.youtube-nocookie.com';
        op.width = '100%'; op.height = '100%';
        op.playerVars = { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 };
        try { op.playerVars.origin = location.origin; } catch (_) {}
      }
      s.p = new window.YT.Player(s.id, op);
      s.anexadoMs = Date.now();
      var fr = document.getElementById(s.id);
      if (fr && fr.tagName === 'IFRAME') {
        s.el = fr; fr.__p = s.p;
        try { fr.title = s.v.t || 'Aula'; fr.setAttribute('allowfullscreen', ''); } catch (_) {}
      }
      diario('montou', s.v.k, alvo.tagName === 'IFRAME' ? 'no-iframe' : 'api');
    } catch (err) {
      diario('erro-montar', s.v.k, String(err && err.message || err).slice(0, 60));
    }
  }

  /* plano B: a API do YouTube nao chegou. O video aparece mesmo assim, num
     iframe comum; se a API chegar depois, liga nele. */
  function planoB(s) {
    if (s.fim || s.p || ytOk()) return;
    var ph = document.getElementById(s.id);
    if (!noDoc(ph) || ph.tagName === 'IFRAME') return;
    var f = document.createElement('iframe');
    f.id = s.id;
    var origem = '';
    try { origem = '&origin=' + encodeURIComponent(location.origin); } catch (_) {}
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(s.v.id) +
            '?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1' + origem;
    f.title = s.v.t || 'Aula';
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    ph.parentNode.replaceChild(f, ph);
    s.el = f;
    diario('plano-b', s.v.k);
  }

  /* Devolve o MARCADOR da aula. Quem chama so precisa coloca-lo na pagina;
     o YouTube troca o marcador pelo player.
     op: { prefixo, chave(k) -> chave do localStorage, marcar(k),
           andamento(k, dur), adiantou(k), acabou(k) } */
  function criar(v, op) {
    op = op || {};
    var id = (op.prefixo || 'mvAula') + (++seq) + '_' + Math.random().toString(36).slice(2, 6);
    var ph = document.createElement('div');
    ph.id = id; ph.className = 'mvAulaMarcador';
    ph.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000';

    var chave = (typeof op.chave === 'function') ? op.chave(v.k) : ('mvTrilha:anon:' + v.k);
    var s = {
      id: id, el: ph, v: v, op: op, chave: chave, t: trilha(chave),
      modo: 'api', pronto: false, p: null, estado: -1, dur: 0, durCat: segsDe(v.d),
      ultimo: -1, ultimoMs: 0, ultimoTiq: 0, parado: 0, semTempo: 0,
      pos: 0, relMs: 0, gravou: 0, naTelaMs: 0, anexadoMs: 0,
      contado: false, acabou: false, fim: false
    };
    S[id] = s;
    diario('criou', v.k);

    (function esperar(n) {
      if (s.fim) return;
      if (noDoc(ph)) {
        /* o marcador so fica "absolute" se o pai for posicionado */
        try {
          if (getComputedStyle(ph.parentNode).position === 'static') ph.style.position = 'relative';
        } catch (_) {}
        if (ytOk()) montar(s);
        else {
          carregarYT(function () { montar(s); });
          s.toPlano = setTimeout(function () { planoB(s); }, ESPERA_API);
        }
        return;
      }
      if (n > 400) { encerrar(s, 'nunca-entrou-na-tela'); return; }   /* 20 s */
      setTimeout(function () { esperar(n + 1); }, 50);
    })(0);

    s.iv = setInterval(function () { try { tique(s); } catch (_) {} }, TIQUE);
    return ph;
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
