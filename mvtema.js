/* mvtema.js — 2026-10-01-conforto (P65)
   Botao "Aparencia" (Escuro / Claro) no menu do painel do negocio e do parceiro.
   - A escolha fica no aparelho (localStorage "mv_tema"); a mesma vale nos dois paineis.
   - O CSS do modo claro ja vem pronto em cada pagina (regras gemeas com
     :where(html[data-tema="claro"])). Este arquivo so liga/desliga o atributo
     e ajusta as cores escritas direto no elemento (style="..."), que o CSS
     nao alcanca. Ao voltar para o escuro, devolve as cores originais.
   - O estudio da live (live.html) fica sempre escuro: e tela de camera. */
(function () {
  'use strict';
  var RAIZ = document.documentElement;
  var CHAVE = 'mv_tema';

  function lerTema() { try { return localStorage.getItem(CHAVE) === 'claro' ? 'claro' : 'escuro'; } catch (e) { return 'escuro'; } }
  function gravarTema(t) { try { localStorage.setItem(CHAVE, t); } catch (e) {} }

  /* ---------- cores (mesma regra do gerador do CSS) ---------- */
  function rgba(s) {
    if (!s) return null;
    var m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3) return null;
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function luma(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function hsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) { var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return [h, s, l];
  }
  function css(h, s, l, a) { return 'hsla(' + Math.round(h * 360) + ',' + Math.round(s * 100) + '%,' + Math.round(l * 100) + '%,' + (a == null ? 1 : a) + ')'; }
  function croma(c) { return (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255; }
  function neutro(c) { var h = hsl(c)[0] * 360, mx = Math.max(c[0], c[1], c[2]), s = mx ? (mx - Math.min(c[0], c[1], c[2])) / mx : 0; return s < 0.25 || (((h >= 188 && h <= 236) || (window.MV_TEMA_VERDE && h >= 128 && h <= 178)) && (s < 0.45 || luma(c) < 0.2)); }
  function vivo(c) { return c && c[3] > 0.6 && hsl(c)[1] > 0.35 && luma(c) > 0.3; }

  function mTxt(c) {
    var x = hsl(c), L = luma(c);
    if (neutro(c)) { if (L > 0.6) return '#142030'; if (L > 0.42) return '#3d4a5c'; if (L > 0.25) return '#5c6a7d'; return null; }
    if (x[2] > 0.45 || L > 0.45) return css(x[0], Math.min(x[1], 0.9), 0.32, c[3]);
    return null;
  }
  function mBg(c) {
    if (c[3] < 0.02) return null;
    var L = luma(c), x = hsl(c);
    if (c[0] > 200 && c[1] > 200 && c[2] > 200 && c[3] < 0.6) return 'rgba(20,40,70,' + Math.min(0.07, c[3] + 0.01) + ')';
    if ((L < 0.25 && neutro(c)) || L < 0.03) {
      if (c[3] < 0.4) return 'rgba(20,40,70,.04)';
      if (L < 0.04 && c[3] < 0.9 && c[0] < 15 && c[1] < 15 && c[2] < 15) return null;
      return '#ffffff';
    }
    if (L < 0.25) return css(x[0], Math.min(x[1], 0.75), 0.93, 1);
    return null;
  }
  function mBorda(c) {
    if (c[0] > 200 && c[1] > 200 && c[2] > 200 && c[3] < 0.6) return 'rgba(20,40,70,.14)';
    var L = luma(c), x = hsl(c);
    if (L < 0.4 && neutro(c)) return '#d6dde7';
    if (L < 0.25) return css(x[0], Math.min(x[1], 0.7), 0.78, 1);
    return null;
  }

  /* ---------- cores escritas no elemento ---------- */
  var PROPS = [['color', mTxt], ['backgroundColor', mBg], ['borderColor', mBorda], ['borderLeftColor', mBorda], ['borderTopColor', mBorda]];
  function foraDoTema(el) { return el.closest && el.closest('.marca,.mvTopo,.mvSideLogo,.quizOverlay,#qzLoader,.cfSemTema'); }

  function claroNoElemento(el) {
    if (!el.style || !el.getAttribute('style') || foraDoTema(el)) return;
    if (el.__cfFeito === el.getAttribute('style')) return;
    var orig = el.__cfOrig || {}, mudou = false;
    for (var i = 0; i < PROPS.length; i++) {
      var p = PROPS[i][0], v = el.style[p];
      if (!v) continue;
      if (v.indexOf('var(') >= 0) {
        if (p !== 'color') continue;
        var nv0 = v.replace(/var\(--(mv-)?(ciano|azul)\b/g, 'var(--cf-$2-txt').replace(/var\(--mv-(ok|alerta|erro|roxo|laranja)\b/g, 'var(--cf-$1-txt');
        if (nv0 !== v) { if (!(p in orig)) orig[p] = v; el.style[p] = nv0; mudou = true; }
        continue;
      }
      var c = rgba(v);
      if (!c) { var tmp = document.createElement('i'); tmp.style.color = v; c = rgba(tmp.style.color); }
      if (!c) continue;
      if (p === 'color') { var bg = rgba(getComputedStyle(el).backgroundColor); if (vivo(bg)) continue; }
      var nv = PROPS[i][1](c);
      if (nv) { if (!(p in orig)) orig[p] = v; el.style[p] = nv; mudou = true; }
    }
    if (mudou) el.__cfOrig = orig;
    el.__cfFeito = el.getAttribute('style');
  }
  function escuroNoElemento(el) {
    var o = el.__cfOrig; if (!o) return;
    for (var p in o) el.style[p] = o[p];
    el.__cfOrig = null; el.__cfFeito = null;
  }
  function varrer(raiz, fn) {
    if (!raiz || !raiz.querySelectorAll) return;
    if (raiz.nodeType === 1 && raiz.hasAttribute('style')) fn(raiz);
    var l = raiz.querySelectorAll('[style]');
    for (var i = 0; i < l.length; i++) fn(l[i]);
  }

  var obs = null, fila = [], agendado = false;
  function processa() {
    agendado = false;
    var itens = fila; fila = [];
    for (var i = 0; i < itens.length; i++) varrer(itens[i], claroNoElemento);
  }
  function observar(ligar) {
    if (obs) { obs.disconnect(); obs = null; }
    if (!ligar || !window.MutationObserver) return;
    obs = new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'attributes') fila.push(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) if (m.addedNodes[j].nodeType === 1) fila.push(m.addedNodes[j]);
      }
      if (!agendado) { agendado = true; (window.requestAnimationFrame || setTimeout)(processa); }
    });
    obs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
  }

  function marcarBotoes(t) {
    var bs = document.querySelectorAll('[data-cf-tema]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-cf-tema') === t ? 'true' : 'false');
  }

  function aplicar(t, salvar) {
    if (t === 'claro') RAIZ.setAttribute('data-tema', 'claro'); else RAIZ.removeAttribute('data-tema');
    if (salvar) gravarTema(t);
    marcarBotoes(t);
    if (!document.body) return;
    if (t === 'claro') { varrer(document.body, claroNoElemento); observar(true); }
    else { observar(false); varrer(document.body, escuroNoElemento); }
  }
  window.mvTema = function (t) { aplicar(t === 'claro' ? 'claro' : 'escuro', true); };

  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('[data-cf-tema]');
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    window.mvTema(b.getAttribute('data-cf-tema'));
  }, true);

  function iniciar() { aplicar(lerTema(), false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
