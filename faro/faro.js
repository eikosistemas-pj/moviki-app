/* Guias FARO (Moviki) — ajudantes comuns. 28/10/2026.
   versao 2026-10-28-menu: menu de todas as paginas dos guias (botao Menu no alto: Minha biblioteca,
   guias a venda com selo, inicio, artigos gratis, ajuda, entrar/sair deste aparelho) e o atalho de
   voltar no alto de cada pagina interna. VENDA = guias a venda agora (selo e data de fim); guia novo
   entra aqui no mesmo pacote. O preco continua so do robo.
   antes 2026-10-28-parceiro: guarda o ?ref= do parceiro (mesmo cookie mv_ref do programa, 90 dias,
   ultimo clique vence) e a pagina de venda manda o apelido na compra: 50% do guia para o parceiro.
   O preço e a entrega vêm SEMPRE do robô (moviki-robo /api/faro): a página só mostra. */
(function () {
  'use strict';
  var API = 'https://moviki-robo.vercel.app/api/faro';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function reais(v) {
    var n = Number(v) || 0;
    return 'R$ ' + n.toFixed(2).replace('.', ',');
  }
  function get(params) {
    var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(API + '?' + q, { cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { j._http = r.status; return j; }); });
  }
  function post(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._http = r.status; return j; }); });
  }
  /* Origem da compra: UTMs da URL (ou guardadas pelo mvmetrica.js na sessão) e o
     clique de anúncio da Meta. Só etiqueta; nunca decide preço. */
  function origem() {
    var utm = '', fbc = '';
    try {
      var u = new URLSearchParams(location.search), partes = [];
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
        var v = u.get(k); if (v) partes.push(k + '=' + encodeURIComponent(v.slice(0, 60)));
      });
      utm = partes.join('&');
      if (!utm && u.get('ref')) utm = 'utm_source=' + encodeURIComponent(u.get('ref').slice(0, 40));
      if (window.mvFb) { var f = window.mvFb() || {}; fbc = f.fbc || ''; if (!utm && f.utm) utm = f.utm; }
      if (utm) sessionStorage.setItem('faro_utm', utm); else utm = sessionStorage.getItem('faro_utm') || '';
    } catch (e) {}
    return { utm: utm, fbc: fbc };
  }
  function ev(nome, p) { try { if (window.mvEv) window.mvEv(nome, p || {}); } catch (e) {} }
  function copiar(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
    var t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t); return Promise.resolve();
  }
  /* Indicacao do parceiro: a mesma regra do painel (index.html): URL > cookie
     mv_ref (.moviki.com.br) > localStorage, janela de 90 dias. Gravar aqui faz a
     pessoa que comprou o guia e depois cria conta no Moviki, no mesmo aparelho,
     tambem ficar como indicacao do parceiro. */
  var limpaRef = function (v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40); };
  function guardarRef(r) {
    try { localStorage.setItem('moviki_ref', r); localStorage.setItem('moviki_ref_em', String(Date.now())); } catch (e) {}
    try { document.cookie = 'mv_ref=' + encodeURIComponent(r) + '; Max-Age=7776000; Path=/; Domain=.moviki.com.br; SameSite=Lax; Secure'; } catch (e) {}
  }
  function ref() {
    try {
      var u = limpaRef(new URLSearchParams(location.search).get('ref'));
      if (u.length >= 3) { guardarRef(u); return u; }
      var m = document.cookie.match(/(?:^|;\s*)mv_ref=([^;]*)/);
      var c = m ? limpaRef(decodeURIComponent(m[1])) : '';
      if (c.length >= 3) return c;
      var l = limpaRef(localStorage.getItem('moviki_ref'));
      var em = parseInt(localStorage.getItem('moviki_ref_em') || '0', 10) || 0;
      if (l.length >= 3 && (!em || Date.now() - em <= 7776000000)) return l;
    } catch (e) {}
    return '';
  }

  /* ---------- Guias a venda agora (selo e prazo real da temporada). Guia novo: uma linha aqui. ---------- */
  var VENDA = [
    { slug: 'natal-por-encomenda', titulo: 'Natal por encomenda', capa: '/faro/capas/natal-por-encomenda.jpg', pagina: '/faro/natal-por-encomenda/', ate: '2026-12-15', prazo: 'Vende até 15/12', novo: true },
    { slug: 'verao-na-praia', titulo: 'Vender na praia neste verão', capa: '/faro/capas/verao-na-praia.jpg', pagina: '/faro/verao-na-praia/', ate: '2027-02-28', prazo: 'Temporada de verão' }
  ];
  function hoje() { return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10); }
  function aVenda() { var h = hoje(); return VENDA.filter(function (g) { return !g.ate || h <= g.ate; }); }
  function infoVenda(slug) { for (var i = 0; i < VENDA.length; i++) if (VENDA[i].slug === slug) return VENDA[i]; return null; }

  /* ---------- Menu (todas as paginas dos guias) ---------- */
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sairAparelho() {
    try { localStorage.removeItem('faro_bib'); localStorage.removeItem('faro_acesso'); localStorage.removeItem('faro_meus'); } catch (e) {}
    ev('faro_menu_sair', {});
    location.href = '/faro/biblioteca.html';
  }
  function itemMenu(href, ico, txt, sub, extra) {
    return '<a class="fm-item" href="' + esc(href) + '"' + (extra || '') + '><span class="fm-ico" aria-hidden="true">' + ico + '</span><span><b>' + txt + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></a>';
  }
  function montarMenu() {
    var entrou = !!ls('faro_bib') || !!(window.FARO && window.FARO.bibHref);
    var bib = (window.FARO && window.FARO.bibHref) || '/faro/biblioteca.html';
    var h = '<div class="fm-cab"><b>Guias FARO</b><button type="button" class="fm-x" aria-label="Fechar o menu">✕</button></div>';
    h += itemMenu(bib, '📚', 'Minha biblioteca', entrou ? 'Os guias que você comprou' : 'Entre com o e-mail da compra');
    var lista = aVenda(), meus = String(ls('faro_meus') || '').split(',');
    if (lista.length) {
      h += '<div class="fm-sec">À venda agora</div>';
      lista.forEach(function (g) {
        var seu = meus.indexOf(g.slug) > -1;
        h += '<a class="fm-guia" href="' + (seu ? esc(bib) : esc(g.pagina) + '?utm_source=faro_menu&amp;utm_medium=app&amp;utm_campaign=' + encodeURIComponent(g.slug)) + '">' +
          '<img src="' + esc(g.capa) + '" alt="" loading="lazy"><span>' + (seu ? '<span class="fm-selo seu">Seu</span>' : '<span class="fm-selo">À venda</span>' + (g.novo ? '<span class="fm-selo novo">Novo</span>' : '')) +
          '<b>' + esc(g.titulo) + '</b><small>' + (seu ? 'Já é seu: toque para abrir' : esc(g.prazo || '')) + '</small></span></a>';
      });
    }
    h += '<div class="fm-sec">Navegar</div>';
    h += itemMenu('/faro/', '🏠', 'Início dos Guias FARO', 'Todos os guias à venda');
    h += itemMenu('https://www.moviki.com.br/guias', '📖', 'Artigos grátis', 'Leituras curtas no site do Moviki');
    h += '<div class="fm-sec">Ajuda</div>';
    if (!entrou) h += itemMenu('/faro/biblioteca.html#ajuda', '💬', 'Não consigo entrar', 'Uma pessoa chama você no WhatsApp');
    h += itemMenu('mailto:suporte@moviki.com.br', '✉️', 'Falar com o suporte', 'suporte@moviki.com.br');
    if (ls('faro_bib') || ls('faro_acesso')) h += '<button type="button" class="fm-item fm-sair"><span class="fm-ico" aria-hidden="true">🚪</span><span><b>Sair deste aparelho</b><small>Para entrar com outro e-mail</small></span></button>';
    else h += itemMenu('/faro/biblioteca.html', '🔑', 'Entrar', 'Sem senha: mandamos um botão no seu e-mail');
    return h;
  }
  function menu(opc) {
    opc = opc || {};
    var barra = document.querySelector('.barra'); if (!barra || barra.querySelector('.fm-btn')) return;
    var lugar = barra.querySelector('[data-faro-menu]');
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fm-btn';
    b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span aria-hidden="true">☰</span> Menu';
    if (lugar) { lugar.innerHTML = ''; lugar.appendChild(b); } else barra.appendChild(b);
    if (opc.volta) {
      var v = document.createElement('a'); v.className = 'fm-volta'; v.href = opc.volta.href; v.textContent = '← ' + opc.volta.txt;
      if (opc.volta.id) v.id = opc.volta.id;
      barra.parentNode.insertBefore(v, barra.nextSibling);
    }
    var fundo = document.createElement('div'); fundo.className = 'fm-fundo'; fundo.hidden = true;
    var caixa = document.createElement('nav'); caixa.className = 'fm-caixa'; caixa.setAttribute('aria-label', 'Menu dos Guias FARO');
    fundo.appendChild(caixa); document.body.appendChild(fundo);
    function fechar() { fundo.hidden = true; b.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', tecla); b.focus(); }
    function tecla(e) { if (e.key === 'Escape') fechar(); }
    b.addEventListener('click', function () {
      caixa.innerHTML = montarMenu(); fundo.hidden = false; b.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', tecla);
      caixa.querySelector('.fm-x').addEventListener('click', fechar);
      var sa = caixa.querySelector('.fm-sair'); if (sa) sa.addEventListener('click', sairAparelho);
      [].forEach.call(caixa.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { ev('faro_menu_ir', { para: a.getAttribute('href').split('?')[0] }); if (a.getAttribute('href').indexOf('#ajuda') > -1 && location.pathname === '/faro/biblioteca.html') { fechar(); } }); });
      var pri = caixa.querySelector('a'); if (pri) pri.focus();
      ev('faro_menu_abrir', {});
    });
    fundo.addEventListener('click', function (e) { if (e.target === fundo) fechar(); });
  }

  ref();   /* grava na chegada, em qualquer pagina dos guias */
  window.FARO = { API: API, esc: esc, reais: reais, get: get, post: post, origem: origem, ev: ev, copiar: copiar, ref: ref, menu: menu, VENDA: VENDA, aVenda: aVenda, infoVenda: infoVenda, bibHref: '' };
})();
