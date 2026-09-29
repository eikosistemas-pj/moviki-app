/*!
 * mvguarda.js - GUARDA ANTICLONAGEM do Moviki (painéis logados).
 * Só no repo moviki-app. Servido do próprio domínio.
 * Marca de versão: digitar  mvGuarda.versao  no console.
 *
 * Como chega nas páginas: o mvmotion.js (carregado por TODOS os painéis)
 * injeta este arquivo quando o endereço é app.moviki.com.br. Nenhum HTML muda.
 * Não roda no painel do dono (eikoadm01) nem no painel da Guarda (guarda.html).
 *
 * O que faz, só com alguém logado:
 *  1. Detecta robô (webdriver, headless, marcas de Selenium/Playwright/Puppeteer).
 *  2. Conta sinais de cópia: DevTools, Ctrl+U, Ctrl+S, impressão, print,
 *     seleção/cópia em massa, clique gerado por script, ritmo de máquina e
 *     VARREDURA (telas diferentes abertas em 10 minutos).
 *  3. Manda só CONTAGENS para /api/guarda (o vercel.json repassa ao moviki-ai).
 *     Quem pontua e decide é o servidor.
 *  4. Desenha a MARCA D'ÁGUA da conta: quase invisível na tela, aparece no
 *     print quando o contraste é realçado (painel guarda.html); vai escondida
 *     no texto copiado (caracteres de largura zero) e no HTML salvo.
 *  5. Conta travada (congelada, suspensa ou banida): cobre a tela e sai do login.
 *
 * Nunca derruba a página: tudo em try/catch; se a API falhar, nada acontece.
 * CHAVE-MESTRA local: MV_GUARDA_LIGADO = false e subir o arquivo.
 * Chave-mestra do sistema: painel guarda.html > "Guarda ligada" (sem deploy).
 * Teste local: ?guarda=teste em localhost.
 */
(function () {
  'use strict';

  // >>> CHAVE-MESTRA LOCAL. false = este arquivo não faz nada. <<<
  var MV_GUARDA_LIGADO = true;

  var VERSAO = '2026-09-28-guarda1';
  var W = window, D = document;
  if (W.mvGuarda) return;
  var api = { versao: VERSAO, estado: 'desligado', marca: '' };
  W.mvGuarda = api;
  if (!MV_GUARDA_LIGADO) return;

  var host = String(location.hostname || '');
  var busca = String(location.search || '');
  var local = /^(localhost|127\.0\.0\.1)$/.test(host) && /[?&]guarda=teste(&|$)/.test(busca);
  if (!/^app\.moviki\.com\.br$/i.test(host) && !local) return;
  var caminho = String(location.pathname || '/');
  if (/^\/(eikoadm01|guarda)(\.html)?\/?$/i.test(caminho)) return;

  // Ganchos de teste valem SO em localhost com ?guarda=teste.
  var API = (local && W.MV_GUARDA_API) || '/api/guarda';
  var FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var PAGINA = (caminho.replace(/\.html$/i, '').replace(/\/+$/, '') || '/index').slice(0, 40);
  var ENVIO_MS = (local && W.MV_GUARDA_ENVIO_MS) || 30000, AMOSTRA_MS = (local && W.MV_GUARDA_AMOSTRA_MS) || 2500;
  var ALFA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  var usuario = null, tokenAtual = '', ativo = false, travado = false;
  var c = {}, roboAchado = [], roboEnviado = false, ritmo = false, ritmoEnviado = false;
  var telasVistas = {}, telasEnviadas = {}, telasNovas = [], max10 = 0, max10Enviado = 0;
  var cliques = [], timers = [], sujo = false;
  var disp = '', fp = '';
  var marca = '', marcaEl = null, marcaCfg = null, marcaRemovidaContada = false;
  var ultimos = {};

  function agora() { return Date.now(); }
  function soma(k, n) { c[k] = (c[k] || 0) + (n || 1); sujo = true; }
  // Mesmo sinal repetido em menos de "janela" ms conta uma vez só.
  function somaUma(k, janela) {
    var t = agora();
    if (ultimos[k] && t - ultimos[k] < (janela || 1500)) return;
    ultimos[k] = t; soma(k);
  }

  /* ---------------------------------------------------------------- */
  /* APARELHO                                                          */
  /* ---------------------------------------------------------------- */
  function idLocal() {
    try {
      var v = W.localStorage.getItem('mv_g');
      if (v && /^[a-z0-9]{24}$/.test(v)) return v;
      var s = '', a = new Uint8Array(24);
      (W.crypto || W.msCrypto).getRandomValues(a);
      for (var i = 0; i < 24; i++) s += 'abcdefghijklmnopqrstuvwxyz0123456789'[a[i] % 36];
      W.localStorage.setItem('mv_g', s);
      return s;
    } catch (e) { return ''; }
  }
  function impressao() {
    var p = [];
    try {
      var n = W.navigator || {};
      p.push(n.userAgent, n.language, (n.languages || []).join(','), n.platform, n.hardwareConcurrency, n.deviceMemory, n.maxTouchPoints);
      p.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth, new Date().getTimezoneOffset());
      try { p.push(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (e) {}
      try {
        var cv = D.createElement('canvas'); cv.width = 220; cv.height = 40;
        var x = cv.getContext('2d');
        x.textBaseline = 'top'; x.font = '15px Arial'; x.fillStyle = '#f60'; x.fillRect(90, 1, 60, 20);
        x.fillStyle = '#069'; x.fillText('Moviki ao vivo ção', 2, 15);
        x.fillStyle = 'rgba(102,204,0,.7)'; x.fillText('Moviki ao vivo ção', 4, 17);
        p.push(cv.toDataURL());
      } catch (e) {}
    } catch (e) {}
    var txt = p.join('~');
    try {
      if (W.crypto && W.crypto.subtle && W.TextEncoder) {
        return W.crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)).then(function (b) {
          var h = '', a = new Uint8Array(b);
          for (var i = 0; i < 16; i++) h += ('0' + a[i].toString(16)).slice(-2);
          return h;
        });
      }
    } catch (e) {}
    return Promise.resolve('');
  }

  /* ---------------------------------------------------------------- */
  /* 1. ROBÔ                                                           */
  /* ---------------------------------------------------------------- */
  function detectarRobo() {
    var r = [];
    try { if (W.navigator.webdriver === true) r.push('webdriver'); } catch (e) {}
    try {
      var ua = String(W.navigator.userAgent || '');
      if (/HeadlessChrome|PhantomJS|SlimerJS|puppeteer|playwright|selenium/i.test(ua)) r.push('ua_headless');
    } catch (e) {}
    var chaves = ['callPhantom', '_phantom', '__nightmare', 'domAutomation', 'domAutomationController',
      '_Selenium_IDE_Recorder', '_selenium', '__webdriver_script_fn', '__driver_evaluate', '__webdriver_evaluate',
      '__selenium_evaluate', '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped',
      '__selenium_unwrapped', '__fxdriver_unwrapped', '__lastWatirAlert', '__playwright__binding__',
      '__pwInitScripts', '__playwright_evaluation_script__', '__puppeteer_evaluation_script__'];
    for (var i = 0; i < chaves.length; i++) { try { if (chaves[i] in W) r.push('js' + chaves[i]); } catch (e) {} }
    try { for (var k in D) { if (/^\$?(cdc|wdc)_/.test(k)) { r.push('cdc'); break; } } } catch (e) {}
    try { Object.keys(W).forEach(function (k) { if (/^\$?(cdc|wdc)_/.test(k) && r.indexOf('cdc') < 0) r.push('cdc'); }); } catch (e) {}
    try {
      var h = D.documentElement;
      ['webdriver', 'selenium', 'driver'].forEach(function (a) { if (h.getAttribute(a) !== null) r.push('attr_' + a); });
    } catch (e) {}
    return r;
  }
  function checarRobo() {
    var r = detectarRobo();
    r.forEach(function (x) { if (roboAchado.indexOf(x) < 0) { roboAchado.push(x); sujo = true; } });
    if (roboAchado.length && !roboEnviado) enviarSinais(false);
  }

  /* ---------------------------------------------------------------- */
  /* 2. INSPEÇÃO (DevTools / CDP)                                      */
  /* ---------------------------------------------------------------- */
  function checarInspecao() {
    // Com DevTools ou protocolo de depuração ligado, o console serializa o
    // objeto e chama o "getter" do stack. Sem ninguém olhando, não chama.
    var viu = false;
    try {
      var e = new Error();
      Object.defineProperty(e, 'stack', { configurable: true, get: function () { viu = true; return ''; } });
      console.debug(e);
    } catch (x) {}
    if (viu) somaUma('inspecao', 300000);
    try {
      // Painel encaixado muda a proporção de UM eixo só; zoom muda os dois.
      if (!('ontouchstart' in W) && W.outerWidth && W.innerWidth && W.innerHeight) {
        var rw = W.outerWidth / W.innerWidth, rh = W.outerHeight / W.innerHeight;
        var aberto = (rw - rh > 0.25) || (rh - rw > 0.45);
        if (aberto && !api._devAberto) somaUma('painel_dev', 300000);
        api._devAberto = aberto;
      }
    } catch (x) {}
  }

  /* ---------------------------------------------------------------- */
  /* 3. TECLAS, IMPRESSÃO, CÓPIA, CLIQUES                              */
  /* ---------------------------------------------------------------- */
  function emCampo(el) {
    try {
      if (!el) return false;
      var t = (el.tagName || '').toUpperCase();
      return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el.isContentEditable === true;
    } catch (e) { return false; }
  }
  function aoTeclar(e) {
    try {
      var k = String(e.key || '').toLowerCase();
      var ctrl = e.ctrlKey || e.metaKey;
      if (k === 'f12') return somaUma('atalho_dev');
      if (ctrl && (e.shiftKey || e.altKey) && (k === 'i' || k === 'j' || k === 'c')) return somaUma('atalho_dev');
      if (e.metaKey && e.shiftKey && (k === '3' || k === '4' || k === '5')) return somaUma('print');
      if (ctrl && !e.shiftKey && k === 'u') return somaUma('ver_fonte');
      if (ctrl && k === 's') return somaUma('salvar');
      if (ctrl && k === 'p') return somaUma('imprimir', 4000);
      if (ctrl && k === 'a' && !emCampo(e.target)) return somaUma('sel_tudo');
    } catch (x) {}
  }
  function aoSoltar(e) {
    try { if (String(e.key || '') === 'PrintScreen') somaUma('print'); } catch (x) {}
  }

  // Marca invisível no texto copiado: caracteres de largura zero.
  function zw(m) {
    var s = '⁠';
    for (var i = 0; i < m.length; i++) {
      var v = ALFA.indexOf(m[i]);
      for (var b = 4; b >= 0; b--) s += ((v >> b) & 1) ? '‌' : '​';
    }
    return s + '⁠';
  }
  function textoDeDivulgar() {
    try {
      var sl = W.getSelection(), n = sl && sl.anchorNode;
      var el = n && (n.nodeType === 1 ? n : n.parentElement);
      return !!(el && el.closest && el.closest('section[data-sec="material"],section[data-sec="divulgacao"],section[data-sec="criador"],[data-mv-copia-livre]'));
    } catch (e) { return false; }
  }
  function aoCopiar(e) {
    try {
      if (emCampo(e.target)) return;
      var sel = String((W.getSelection && W.getSelection()) || '');
      if (sel.length > 1500) somaUma('copia_grande', 1000);
      // Texto feito para ser copiado e postado (legendas do Material de apoio,
      // Divulgação, Área do criador) nunca leva marca: o caractere invisível
      // iria parar no post do Instagram. Só texto longo (1.000+) é marcado.
      if (marca && sel.length >= 1000 && e.clipboardData && !textoDeDivulgar()) {
        var z = zw(marca), i = sel.indexOf(' ');
        var marcado = (i > 0 ? sel.slice(0, i) + z + sel.slice(i) : sel) + z;
        e.clipboardData.setData('text/plain', marcado);
        e.preventDefault();
      }
    } catch (x) {}
  }
  function aoClicar(e) {
    try {
      if (!e.isTrusted) {
        var t = e.target, tag = t && t.tagName ? t.tagName.toUpperCase() : '';
        var inocente = (tag === 'INPUT' && String(t.type).toLowerCase() === 'file') || (tag === 'A' && t.hasAttribute('download'));
        if (!inocente) soma('clique_sintetico');
        return;
      }
      var t0 = agora();
      cliques.push(t0);
      if (cliques.length > 30) cliques.shift();
      if (!ritmo && cliques.length >= 25) {
        var iv = [];
        for (var i = 1; i < cliques.length; i++) iv.push(cliques[i] - cliques[i - 1]);
        var m = iv.reduce(function (a, b) { return a + b; }, 0) / iv.length;
        var dp = Math.sqrt(iv.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / iv.length);
        if (m < 2500 && m > 0 && dp / m < 0.12) { ritmo = true; sujo = true; }
      }
    } catch (x) {}
  }

  /* ---------------------------------------------------------------- */
  /* 4. VARREDURA — qual tela está aberta agora                        */
  /* ---------------------------------------------------------------- */
  function visivel(el) {
    try {
      if (!el) return false;
      if (el.offsetParent !== null) return true;
      var cs = getComputedStyle(el);
      return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden';
    } catch (e) { return false; }
  }
  function textoDe(el, n) { return String((el && el.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, n || 40); }
  function telaAtual() {
    var p = [];
    try {
      var sec = D.querySelector('section[data-sec]:not(.hide)');
      if (sec) p.push('s:' + sec.getAttribute('data-sec'));
      var ed = D.getElementById('editor'), et = D.getElementById('editorTit');
      if (ed && et && !ed.classList.contains('escondido')) p.push('e:' + textoDe(et, 30));
      var qz = D.querySelector('.qzTela.qzAtiva');
      if (qz && qz.id) p.push('q:' + qz.id);
      if (!p.length) {
        var hs = D.querySelectorAll('h1,h2,h3');
        for (var i = 0; i < hs.length; i++) { if (visivel(hs[i])) { var t = textoDe(hs[i]); if (t) { p.push('h:' + t); break; } } }
      }
      var mods = D.querySelectorAll('[role="dialog"],[aria-modal="true"],[class*="modal"],[class*="Modal"],[class*="overlay"],[class*="folha"],.ov');
      for (var j = 0; j < mods.length && j < 60; j++) {
        var m = mods[j];
        if (m === marcaEl || !visivel(m)) continue;
        var h = m.querySelector('h1,h2,h3,h4,strong');
        var nome = m.id || textoDe(h, 30);
        if (nome) { p.push('m:' + nome); break; }
      }
    } catch (e) {}
    return p.join('|');
  }
  function hashCurto(s) {
    var h1 = 5381, h2 = 52711;
    for (var i = 0; i < s.length; i++) { var ch = s.charCodeAt(i); h1 = (h1 * 33) ^ ch; h2 = (h2 * 33) ^ ch; }
    return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).slice(0, 10);
  }
  function amostrarTela() {
    try {
      if (D.visibilityState !== 'visible') return;
      var k = telaAtual();
      if (!k) return;
      var h = hashCurto(k), t = agora();
      telasVistas[h] = t;
      if (!telasEnviadas[h] && telasNovas.indexOf(h) < 0) { telasNovas.push(h); sujo = true; }
      var n = 0;
      for (var x in telasVistas) { if (t - telasVistas[x] <= 600000) n++; }
      if (n > max10) { max10 = n; if (max10 > max10Enviado) sujo = true; }
    } catch (e) {}
  }

  /* ---------------------------------------------------------------- */
  /* 5. MARCA D'ÁGUA                                                   */
  /* ---------------------------------------------------------------- */
  function svgMarca(m) {
    var t = 'moviki · ' + m;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190">' +
      '<text x="22" y="110" transform="rotate(-24 160 95)" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="700" fill="#7f7f7f">' + t + '</text></svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }
  function aplicarMarca(m, cfg) {
    try {
      marca = m; api.marca = m; marcaCfg = cfg;
      D.documentElement.setAttribute('data-mv-sessao', m);
      try { D.documentElement.style.setProperty('--mv-sessao', '"' + m + '"'); } catch (e) {}
      if (!api._comentario) {
        api._comentario = D.createComment(' mv:' + m + ' ');
        (D.body || D.documentElement).appendChild(api._comentario);
      }
      if (!cfg.visual) { if (marcaEl && marcaEl.parentNode) marcaEl.parentNode.removeChild(marcaEl); marcaEl = null; return; }
      if (!marcaEl) {
        marcaEl = D.createElement('div');
        marcaEl.setAttribute('aria-hidden', 'true');
        marcaEl.setAttribute('data-mv-sem-motion', '');
      }
      marcaEl.id = 'mvw' + m.toLowerCase();
      marcaEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;user-select:none;z-index:2147483600;' +
        'background-repeat:repeat;background-image:' + svgMarca(m) + ';opacity:' + cfg.opacidade + ';';
      if (!marcaEl.parentNode) (D.body || D.documentElement).appendChild(marcaEl);
    } catch (e) {}
  }
  function vigiarMarca() {
    try {
      if (!marca || !marcaCfg || !marcaCfg.visual || travado) return;
      var sumiu = !marcaEl || !marcaEl.isConnected || getComputedStyle(marcaEl).display === 'none' ||
        getComputedStyle(marcaEl).visibility === 'hidden' || Number(getComputedStyle(marcaEl).opacity) < marcaCfg.opacidade / 2;
      if (sumiu) {
        if (!marcaRemovidaContada) { marcaRemovidaContada = true; soma('marca_removida'); }
        marcaEl = null; aplicarMarca(marca, marcaCfg);
      }
    } catch (e) {}
  }
  function tirarMarca() {
    try { if (marcaEl && marcaEl.parentNode) marcaEl.parentNode.removeChild(marcaEl); } catch (e) {}
    marcaEl = null; marca = ''; api.marca = '';
    try { D.documentElement.removeAttribute('data-mv-sessao'); } catch (e) {}
  }

  /* ---------------------------------------------------------------- */
  /* 6. TELA DE CONTA TRAVADA                                          */
  /* ---------------------------------------------------------------- */
  function bloquear(estado) {
    if (travado) return;
    travado = true; parar();
    try {
      var banido = estado === 'banido';
      var cx = D.createElement('div');
      cx.id = 'mvGuardaBloqueio';
      cx.setAttribute('role', 'alertdialog');
      cx.setAttribute('data-mv-sem-motion', '');
      cx.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0b1530;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;';
      cx.innerHTML = '<div style="max-width:440px;text-align:left;line-height:1.5">' +
        '<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7fd3ff;margin-bottom:10px">Moviki · segurança</div>' +
        '<h2 style="margin:0 0 12px;font-size:22px">' + (banido ? 'Esta conta foi encerrada' : 'Acesso em verificação') + '</h2>' +
        '<p style="margin:0 0 12px;color:#d6def5">' + (banido
          ? 'O acesso foi encerrado por descumprimento dos Termos de Uso (cláusula 8-A — proteção do software). Se você acredita que houve engano, peça a revisão pelos canais abaixo.'
          : 'Por segurança, o acesso desta conta foi pausado até uma pessoa da equipe verificar a atividade. Se foi engano, fale com a gente: a revisão é humana e feita em até 5 dias úteis.') + '</p>' +
        '<p style="margin:0;color:#d6def5">WhatsApp <a style="color:#7fd3ff" href="https://wa.me/554120186848">(41) 2018-6848</a> · <a style="color:#7fd3ff" href="mailto:suporte@moviki.com.br">suporte@moviki.com.br</a></p></div>';
      (D.body || D.documentElement).appendChild(cx);
    } catch (e) {}
    try { if (api._sair) api._sair(); } catch (e) {}
  }

  /* ---------------------------------------------------------------- */
  /* 7. CONVERSA COM O SERVIDOR                                        */
  /* ---------------------------------------------------------------- */
  function tratar(r) {
    if (!r || typeof r !== 'object') return;
    if (r.ligado === false || r.isento === true) { api.estado = r.ligado === false ? 'desligado' : 'isento'; parar(); tirarMarca(); return; }
    api.estado = r.estado || 'ok';
    if (r.marca) aplicarMarca(r.marca, { visual: r.marcaVisual !== false, opacidade: Number(r.opacidade) || 0.03 });
    if (r.travado) bloquear(r.estado);
  }
  function postar(corpo, manter) {
    try {
      return fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo), keepalive: !!manter, credentials: 'omit', cache: 'no-store',
      }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function corpoBase(acao) {
    return { acao: acao, t: tokenAtual, disp: disp, fp: fp, pagina: PAGINA, versao: VERSAO };
  }
  function montarLote() {
    var l = { c: c, robo: roboEnviado ? [] : roboAchado.slice(0, 12), ritmo: ritmo && !ritmoEnviado, max10: max10, telas: telasNovas.slice(0, 60), pagina: PAGINA };
    return l;
  }
  function confirmarEnvio(l) {
    c = {};
    if (l.robo.length) roboEnviado = true;
    if (l.ritmo) ritmoEnviado = true;
    l.telas.forEach(function (h) { telasEnviadas[h] = 1; });
    telasNovas = telasNovas.filter(function (h) { return !telasEnviadas[h]; });
    max10Enviado = Math.max(max10Enviado, l.max10);
    sujo = false;
  }
  function renovarToken() {
    if (!usuario) return Promise.resolve('');
    try { return usuario.getIdToken().then(function (t) { tokenAtual = t || ''; return tokenAtual; }).catch(function () { return tokenAtual; }); }
    catch (e) { return Promise.resolve(tokenAtual); }
  }
  function enviarSinais(saindo) {
    if (!ativo || travado || !sujo || !usuario) return;
    var l = montarLote();
    if (saindo) {
      // Na saída não dá tempo de renovar o token: vai o último que temos.
      if (!tokenAtual) return;
      var b = corpoBase('sinais'); b.lote = l; confirmarEnvio(l); postar(b, true);
      return;
    }
    renovarToken().then(function () {
      if (!tokenAtual) return;
      var b = corpoBase('sinais'); b.lote = l; confirmarEnvio(l);
      return postar(b, false).then(tratar);
    });
  }
  function escuta(alvo, ev, fn, opt) { try { alvo.addEventListener(ev, fn, opt || true); timers.push(function () { alvo.removeEventListener(ev, fn, opt || true); }); } catch (e) {} }
  function intervalo(fn, ms) { var id = setInterval(fn, ms); timers.push(function () { clearInterval(id); }); }

  function comecar() {
    if (ativo || travado) return;
    ativo = true;
    disp = idLocal();
    impressao().then(function (h) { fp = h || ''; }).catch(function () {}).then(function () {
      return renovarToken();
    }).then(function () {
      if (!tokenAtual) return;
      return postar(corpoBase('status'), false).then(function (r) {
        tratar(r);
        if (!ativo || travado) return;
        checarRobo();
        checarInspecao();
        amostrarTela();
        escuta(D, 'keydown', aoTeclar);
        escuta(D, 'keyup', aoSoltar);
        escuta(D, 'copy', aoCopiar);
        escuta(D, 'click', aoClicar);
        escuta(W, 'beforeprint', function () { somaUma('imprimir', 4000); });
        escuta(W, 'pagehide', function () { enviarSinais(true); });
        escuta(D, 'visibilitychange', function () { if (D.visibilityState === 'hidden') enviarSinais(true); });
        intervalo(amostrarTela, AMOSTRA_MS);
        intervalo(checarInspecao, 10000);
        intervalo(vigiarMarca, 5000);
        intervalo(function () { enviarSinais(false); }, ENVIO_MS);
        setTimeout(checarRobo, 3000);
      });
    }).catch(function () {});
  }
  function parar() {
    ativo = false;
    while (timers.length) { try { timers.pop()(); } catch (e) {} }
  }

  /* ---------------------------------------------------------------- */
  /* 8. LOGIN — usa o MESMO Firebase que a página já abriu             */
  /* ---------------------------------------------------------------- */
  // import() da mesma URL que a página usa devolve a MESMA instância do SDK.
  function iniciar() {
    var auth0 = local && W.MV_GUARDA_AUTH; // gancho de teste (localhost)
    if (auth0) { ligarAuth(auth0.auth, auth0.onAuthStateChanged, auth0.signOut); return; }
    Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js')]).then(function (m) {
      var appM = m[0], authM = m[1], n = 0;
      (function tentar() {
        var apps = [];
        try { apps = appM.getApps(); } catch (e) {}
        if (!apps.length) { if (++n < 80) setTimeout(tentar, 500); return; }
        var auth = authM.getAuth(apps[0]);
        ligarAuth(auth, authM.onAuthStateChanged, authM.signOut);
      })();
    }).catch(function () {});
  }
  function ligarAuth(auth, onChange, sair) {
    api._sair = function () { try { return sair(auth); } catch (e) {} };
    onChange(auth, function (u) {
      if (u && !travado) { usuario = u; comecar(); }
      else if (!u) { usuario = null; tokenAtual = ''; parar(); if (!travado) tirarMarca(); }
    });
  }

  api.zw = zw; // usado pelo teste
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
