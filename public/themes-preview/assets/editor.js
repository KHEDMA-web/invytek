/* ════════════════════════════════════════════════════════════
   INVYTEK — Éditeur d'invitation
   Panneau "Personnaliser" : édition live + lien partageable.
   Chaque thème déclare window.INVYTEK_CONFIG avant de charger ce script.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var cfg = window.INVYTEK_CONFIG;
  if (!cfg) return;
  var KEY = 'invytek:' + cfg.theme;

  /* ---------- inject logo slots for image fields (no per-theme HTML needed) ---------- */
  cfg.fields.forEach(function (f) {
    if (f.type === 'image' && f.mount) {
      var host = document.querySelector(f.mount); if (!host) return;
      var img = document.createElement('img'); img.className = 'ivk-logo-' + f.key; img.alt = 'logo';
      img.style.cssText = 'display:none;max-height:58px;max-width:64%;margin:0 auto 1.1rem auto;object-fit:contain;' + (f.logoStyle || '');
      host.insertBefore(img, host.firstChild);
      f.sel = '.ivk-logo-' + f.key;
    }
  });

  /* ---------- encode / decode (unicode-safe base64url) ---------- */
  function enc(obj) {
    var s = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function dec(str) {
    try {
      var s = str.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(s))));
    } catch (e) { return null; }
  }

  /* ---------- apply data to the DOM ---------- */
  function applyLogo(el, val) {
    if (!el) return;
    if (val) {
      if (el.tagName === 'IMG') { el.src = val; el.style.display = 'block'; }
      else { el.style.backgroundImage = 'url(' + val + ')'; el.style.display = 'block'; }
      el.removeAttribute('data-empty');
    } else {
      if (el.tagName === 'IMG') el.removeAttribute('src');
      else el.style.backgroundImage = '';
      el.style.display = 'none';
    }
  }
  function apply(data) {
    cfg.fields.forEach(function (f) {
      if (f.type === 'datetime' || f.type === 'select') return;
      if (f.type === 'image') { document.querySelectorAll(f.sel).forEach(function (el) { applyLogo(el, data[f.key]); }); return; }
      if (data[f.key] == null || data[f.key] === '') return;
      document.querySelectorAll(f.sel).forEach(function (el) {
        if (f.attr) el.setAttribute(f.attr, data[f.key]);
        else el.textContent = data[f.key];
      });
    });
    if (data.iso && typeof cfg.setEventDate === 'function') cfg.setEventDate(data.iso);
    if (typeof cfg.onChange === 'function') cfg.onChange(data);
  }

  /* ---------- initial data: defaults < localStorage < URL ---------- */
  var data = {};
  cfg.fields.forEach(function (f) {
    if (f.type === 'datetime') { data[f.key] = f.val || ''; return; }
    if (f.type === 'image') { data[f.key] = f.val || ''; return; }
    if (f.type === 'select') { data[f.key] = (f.val != null) ? f.val : (f.options && f.options[0] ? f.options[0].value : ''); return; }
    var el = document.querySelector(f.sel);
    data[f.key] = (f.val != null) ? f.val : (el ? (f.attr ? el.getAttribute(f.attr) : el.textContent.trim()) : '');
  });
  try { var ls = JSON.parse(localStorage.getItem(KEY) || 'null'); if (ls) Object.assign(data, ls); } catch (e) {}
  var urlInv = new URLSearchParams(location.search).get('inv');
  if (urlInv) { var u = dec(urlInv); if (u) Object.assign(data, u); }
  apply(data);

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

  /* ---------- UI ---------- */
  var accent = cfg.accent || '#D4AF61';
  var style = document.createElement('style');
  style.textContent = [
    '.ivk-launch{position:fixed;right:18px;bottom:18px;z-index:300;display:inline-flex;align-items:center;gap:.5rem;',
    'font-family:"Marcellus",serif;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;text-indent:.14em;',
    'padding:.85rem 1.3rem;border-radius:40px;cursor:pointer;border:1px solid ' + accent + ';color:#fff;',
    'background:rgba(20,16,10,.78);backdrop-filter:blur(10px);box-shadow:0 10px 30px rgba(0,0,0,.45);transition:transform .25s,box-shadow .25s;}',
    '.ivk-launch:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.55);}',
    '.ivk-launch svg{width:15px;height:15px;}',
    '.ivk-back{position:fixed;left:18px;top:18px;z-index:300;display:inline-flex;align-items:center;gap:.4rem;',
    'font-family:"Marcellus",serif;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;text-indent:.16em;',
    'padding:.6rem 1rem;border-radius:40px;cursor:pointer;border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.78);',
    'background:rgba(20,16,10,.6);backdrop-filter:blur(8px);text-decoration:none;transition:all .25s;}',
    '.ivk-back:hover{color:#fff;border-color:' + accent + ';}',
    '.ivk-back svg{width:14px;height:14px;}',
    '.ivk-backdrop{position:fixed;inset:0;z-index:310;background:rgba(8,6,3,.55);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .3s;}',
    '.ivk-backdrop.show{opacity:1;pointer-events:auto;}',
    '.ivk-panel{position:fixed;z-index:320;right:0;top:0;bottom:0;width:380px;max-width:92vw;background:linear-gradient(180deg,#1a1510,#120e08);',
    'border-left:1px solid ' + accent + '44;box-shadow:-30px 0 80px rgba(0,0,0,.6);transform:translateX(102%);transition:transform .42s cubic-bezier(.16,1,.3,1);',
    'display:flex;flex-direction:column;font-family:"Cormorant Garamond",serif;}',
    '.ivk-panel.show{transform:none;}',
    '.ivk-hd{display:flex;align-items:center;justify-content:space-between;padding:1.3rem 1.4rem;border-bottom:1px solid ' + accent + '22;}',
    '.ivk-hd h3{font-family:"Marcellus",serif;font-size:1.15rem;color:#F3E9D2;margin:0;letter-spacing:.04em;font-weight:400;}',
    '.ivk-hd p{font-size:.92rem;color:rgba(243,233,210,.5);margin:.15rem 0 0;}',
    '.ivk-x{background:none;border:none;color:rgba(243,233,210,.6);font-size:1.5rem;cursor:pointer;line-height:1;padding:.2rem .4rem;}',
    '.ivk-x:hover{color:' + accent + ';}',
    '.ivk-body{flex:1;overflow-y:auto;padding:1.2rem 1.4rem 1.4rem;}',
    '.ivk-field{margin-bottom:1.1rem;}',
    '.ivk-field label{display:block;font-family:"Marcellus",serif;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;',
    'color:' + accent + ';margin-bottom:.45rem;text-indent:.18em;}',
    '.ivk-field input,.ivk-field textarea,.ivk-field select{width:100%;background:rgba(255,255,255,.04);border:1px solid ' + accent + '33;color:#F7F1E6;',
    'font-family:"Cormorant Garamond",serif;font-size:16px;padding:.7rem .8rem;border-radius:6px;outline:none;transition:border-color .2s;}',
    '.ivk-field select{appearance:none;-webkit-appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27none%27 stroke=%27%23B8923C%27 stroke-width=%272%27%3E%3Cpath d=%27M2 4l4 4 4-4%27/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .8rem center;padding-right:2rem;}',
    '.ivk-field select option{background:#1a1510;color:#F7F1E6;}',
    '.ivk-field input:focus,.ivk-field textarea:focus,.ivk-field select:focus{border-color:' + accent + ';}',
    '.ivk-field textarea{resize:vertical;min-height:64px;line-height:1.5;}',
    '.ivk-ft{padding:1.1rem 1.4rem;border-top:1px solid ' + accent + '22;display:flex;flex-direction:column;gap:.6rem;}',
    '.ivk-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-family:"Marcellus",serif;font-size:.72rem;',
    'letter-spacing:.14em;text-transform:uppercase;text-indent:.14em;padding:.9rem 1rem;border-radius:40px;cursor:pointer;border:1px solid transparent;transition:all .25s;}',
    '.ivk-btn.primary{background:linear-gradient(135deg,' + accent + ',' + (cfg.accent2 || '#B8923C') + ');color:#1c1408;}',
    '.ivk-btn.primary:hover{transform:translateY(-2px);}',
    '.ivk-btn.ghost{background:transparent;color:rgba(243,233,210,.6);border-color:' + accent + '33;}',
    '.ivk-btn.ghost:hover{color:#F3E9D2;border-color:' + accent + ';}',
    '.ivk-btn svg{width:15px;height:15px;}',
    '.ivk-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%) translateY(14px);z-index:340;background:#1a1510;color:#F3E9D2;',
    'font-family:"Cormorant Garamond",serif;font-size:1rem;padding:.8rem 1.4rem;border-radius:40px;border:1px solid ' + accent + '66;',
    'opacity:0;pointer-events:none;transition:all .35s;}',
    '.ivk-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}',
    '.ivk-upload{display:flex;align-items:center;gap:.7rem;}',
    '.ivk-upload .prev{width:48px;height:48px;border-radius:8px;border:1px solid ' + accent + '33;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:repeating-conic-gradient(#2a2418 0 25%,#1c1810 0 50%) 0/14px 14px;}',
    '.ivk-upload .prev img{max-width:100%;max-height:100%;object-fit:contain;}',
    '.ivk-upload .lbl{flex:1;font-family:"Marcellus",serif;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;text-align:center;padding:.7rem .6rem;border:1px dashed ' + accent + '55;border-radius:8px;color:#F7F1E6;cursor:pointer;transition:all .2s;}',
    '.ivk-upload .lbl:hover{border-color:' + accent + ';background:rgba(255,255,255,.04);}',
    '.ivk-upload input[type=file]{display:none;}',
    '.ivk-upload .rm{background:none;border:none;color:rgba(243,233,210,.5);font-size:1.3rem;cursor:pointer;padding:.2rem .4rem;line-height:1;}',
    '.ivk-upload .rm:hover{color:' + accent + ';}',
    '.ivk-hint{font-family:"Cormorant Garamond",serif;font-size:.82rem;color:rgba(243,233,210,.4);margin-top:.4rem;}',
    '@media(max-width:560px){.ivk-panel{left:0;right:0;top:auto;width:auto;max-width:none;height:86vh;border-left:none;',
    'border-top:1px solid ' + accent + '44;border-radius:18px 18px 0 0;transform:translateY(102%);}.ivk-panel.show{transform:none;}}'
  ].join('');
  document.head.appendChild(style);

  // launcher — désactivé (bouton masqué sur la vitrine publique)
  /* RÉACTIVER si besoin :
  var launch = document.createElement('button');
  launch.className = 'ivk-launch';
  launch.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Personnaliser';
  document.body.appendChild(launch);
  */
  var launch = { addEventListener: function() {} }; // stub pour éviter les erreurs de référence

  // back to gallery
  var back = document.createElement('a');
  back.className = 'ivk-back';
  back.href = cfg.backHref || '../themes.html';
  back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Thèmes';
  document.body.appendChild(back);

  // backdrop + panel
  var backdrop = document.createElement('div');
  backdrop.className = 'ivk-backdrop';
  document.body.appendChild(backdrop);

  var panel = document.createElement('div');
  panel.className = 'ivk-panel';
  var bodyHtml = '';
  cfg.fields.forEach(function (f) {
    var v = data[f.key] != null ? String(data[f.key]).replace(/"/g, '&quot;') : '';
    bodyHtml += '<div class="ivk-field"><label>' + f.label + '</label>';
    if (f.type === 'textarea') bodyHtml += '<textarea data-k="' + f.key + '">' + v + '</textarea>';
    else if (f.type === 'datetime') bodyHtml += '<input type="datetime-local" data-k="' + f.key + '" value="' + v + '">';
    else if (f.type === 'select') {
      bodyHtml += '<select data-k="' + f.key + '">';
      (f.options || []).forEach(function (o) { bodyHtml += '<option value="' + o.value + '"' + (v === o.value ? ' selected' : '') + '>' + o.label + '</option>'; });
      bodyHtml += '</select>';
    }
    else if (f.type === 'image') {
      bodyHtml += '<div class="ivk-upload"><span class="prev" data-prev="' + f.key + '">' + (v ? '<img src="' + v + '">' : '') + '</span>' +
        '<label class="lbl">Choisir un logo<input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" data-k="' + f.key + '"></label>' +
        '<button type="button" class="rm" data-rm="' + f.key + '" title="Retirer">&times;</button></div>' +
        '<div class="ivk-hint">PNG transparent recommandé. Stocké sur cet appareil.</div>';
    }
    else bodyHtml += '<input type="text" data-k="' + f.key + '" value="' + v + '">';
    bodyHtml += '</div>';
  });
  panel.innerHTML =
    '<div class="ivk-hd"><div><h3>Personnaliser</h3><p>Votre carte, en direct</p></div><button class="ivk-x" aria-label="Fermer">&times;</button></div>' +
    '<div class="ivk-body">' + bodyHtml + '</div>' +
    '<div class="ivk-ft">' +
    '<button class="ivk-btn primary" data-act="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6 15.4 6.4M8.6 13.4l6.8 4.2"/></svg> Partager mon invitation</button>' +
    '<button class="ivk-btn ghost" data-act="reset">Réinitialiser</button>' +
    '</div>';
  document.body.appendChild(panel);

  var toast = document.createElement('div');
  toast.className = 'ivk-toast';
  document.body.appendChild(toast);
  function showToast(m) { toast.textContent = m; toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 2600); }

  function open() { backdrop.classList.add('show'); panel.classList.add('show'); }
  function close() { backdrop.classList.remove('show'); panel.classList.remove('show'); }
  launch.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  panel.querySelector('.ivk-x').addEventListener('click', close);

  // live binding
  panel.querySelectorAll('[data-k]').forEach(function (inp) {
    var k = inp.getAttribute('data-k');
    var f = cfg.fields.filter(function (x) { return x.key === k; })[0];
    if (f.type === 'image') {
      inp.addEventListener('change', function () {
        var file = inp.files && inp.files[0]; if (!file) return;
        var rd = new FileReader();
        rd.onload = function () {
          data[k] = rd.result;
          document.querySelectorAll(f.sel).forEach(function (el) { applyLogo(el, rd.result); });
          var pv = panel.querySelector('[data-prev="' + k + '"]'); if (pv) pv.innerHTML = '<img src="' + rd.result + '">';
          if (typeof cfg.onChange === 'function') cfg.onChange(data);
          persist();
        };
        rd.readAsDataURL(file);
      });
      return;
    }
    var handler = function () {
      data[k] = inp.value;
      if (f.type === 'datetime') { if (typeof cfg.setEventDate === 'function' && inp.value) cfg.setEventDate(inp.value); }
      else if (f.type === 'select') { /* applied via onChange */ }
      else { document.querySelectorAll(f.sel).forEach(function (el) { if (f.attr) el.setAttribute(f.attr, inp.value); else el.textContent = inp.value; }); }
      if (typeof cfg.onChange === 'function') cfg.onChange(data);
      persist();
    };
    inp.addEventListener('input', handler);
    inp.addEventListener('change', handler);
  });

  // remove-logo buttons
  panel.querySelectorAll('[data-rm]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var k = btn.getAttribute('data-rm');
      var f = cfg.fields.filter(function (x) { return x.key === k; })[0];
      data[k] = '';
      document.querySelectorAll(f.sel).forEach(function (el) { applyLogo(el, ''); });
      var pv = panel.querySelector('[data-prev="' + k + '"]'); if (pv) pv.innerHTML = '';
      var fi = panel.querySelector('input[type=file][data-k="' + k + '"]'); if (fi) fi.value = '';
      if (typeof cfg.onChange === 'function') cfg.onChange(data);
      persist();
    });
  });

  // actions
  panel.querySelector('[data-act="share"]').addEventListener('click', function () {
    var btn = panel.querySelector('[data-act="share"]');
    btn.textContent = 'Publication…';
    btn.disabled = true;
    persist();
    fetch('/api/publish-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: cfg.theme, fields: data })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.error === 'unauthenticated') {
        var encoded = encodeURIComponent(location.pathname + '?inv=' + enc(data));
        location.href = '/auth?callbackUrl=' + encoded;
        return;
      }
      if (res.slug) {
        showToast('Invitation publiée ✦');
        setTimeout(function () { location.href = '/i/' + res.slug; }, 900);
      } else {
        showToast(res.error || 'Erreur — réessayez');
        btn.textContent = 'Partager mon invitation';
        btn.disabled = false;
      }
    }).catch(function () {
      showToast('Erreur réseau — réessayez');
      btn.textContent = 'Partager mon invitation';
      btn.disabled = false;
    });
  });
  panel.querySelector('[data-act="reset"]').addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.href = location.origin + location.pathname;
  });
})();
