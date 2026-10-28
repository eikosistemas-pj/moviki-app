/* Guias FARO (Moviki) — ajudantes comuns. 28/10/2026.
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
  window.FARO = { API: API, esc: esc, reais: reais, get: get, post: post, origem: origem, ev: ev, copiar: copiar };
})();
