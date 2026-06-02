/* ════════════════════════════════════════════════════════════
   INVYTEK — interactions
   Particules dorées · parallax · scroll-reveal · enveloppe animée
   Framework-agnostic (portable en sections Next.js / hooks)
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Scroll reveal ───────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ───────── Particules dorées (canvas) ───────── */
  function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dpr, dots = [];

    function mode() { return document.documentElement.getAttribute('data-particles') || 'float'; }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var n = Math.round(Math.min(70, (W * H) / 26000));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.7 + 0.4,
          vy: -(Math.random() * 0.28 + 0.06),
          vx: (Math.random() - 0.5) * 0.18,
          a: Math.random() * Math.PI * 2,
          tw: Math.random() * 0.04 + 0.01
        });
      }
    }
    function frame() {
      if (mode() === 'off') { ctx.clearRect(0, 0, W, H); requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, W, H);
      var sparkle = mode() === 'sparkle';
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y += d.vy; d.x += d.vx; d.a += d.tw;
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
        var op = (Math.sin(d.a) * 0.5 + 0.5) * (sparkle ? 0.9 : 0.55) + 0.08;
        var rr = sparkle ? d.r * (0.7 + Math.sin(d.a) * 0.5) : d.r;
        ctx.beginPath();
        ctx.arc(d.x, d.y, Math.max(0.2, rr), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + (sparkle ? '244,225,170' : '212,175,97') + ',' + op.toFixed(3) + ')';
        ctx.shadowBlur = sparkle ? 8 : 4;
        ctx.shadowColor = 'rgba(212,175,97,0.6)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();
    if (!reduced) requestAnimationFrame(frame);
  }

  /* ───────── Parallax (souris) ───────── */
  function initParallax() {
    if (reduced) return;
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-parallax')) || 10;
        l.style.transform = 'translate3d(' + (cx * d) + 'px,' + (cy * d) + 'px,0)';
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ───────── Enveloppe → arche ───────── */
  function initEnvelope() {
    var stage = document.querySelector('[data-invite]');
    if (!stage) return;
    var petalLayer = stage.querySelector('.petals');

    function open() {
      if (stage.classList.contains('open')) return;
      stage.classList.add('open');
      if (!reduced) startPetals();
    }
    function toggle() {
      stage.classList.toggle('open');
      if (stage.classList.contains('open') && !reduced) startPetals();
    }
    stage.addEventListener('click', toggle);

    var petalTimer = null;
    function startPetals() {
      if (!petalLayer || petalTimer) return;
      var count = 0;
      petalTimer = setInterval(function () {
        if (!stage.classList.contains('open')) { clearInterval(petalTimer); petalTimer = null; return; }
        spawnPetal();
        if (++count > 60) { clearInterval(petalTimer); petalTimer = null; }
      }, 420);
    }
    function spawnPetal() {
      var p = document.createElement('span');
      p.className = 'petal';
      var size = 7 + Math.random() * 9;
      p.style.left = (Math.random() * 100) + '%';
      p.style.width = size + 'px'; p.style.height = (size * 1.3) + 'px';
      p.style.animationDuration = (5 + Math.random() * 4) + 's';
      p.style.setProperty('--sway', (Math.random() * 50 - 25) + 'px');
      p.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
      petalLayer.appendChild(p);
      setTimeout(function () { p.remove(); }, 9500);
    }

    // auto-ouverture
    if (!reduced) setTimeout(open, 1400); else stage.classList.add('open');
  }

  /* ───────── Countdown (multi) ───────── */
  function initCountdown() {
    var els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;
    function tickAll() {
      els.forEach(function (el) {
        var target = new Date(el.getAttribute('data-countdown')).getTime();
        var diff = Math.max(0, target - Date.now());
        var map = {
          j: Math.floor(diff / 86400000),
          h: Math.floor(diff / 3600000) % 24,
          m: Math.floor(diff / 60000) % 60
        };
        el.querySelectorAll('[data-u]').forEach(function (u) {
          u.querySelector('.n').textContent = String(map[u.getAttribute('data-u')]).padStart(2, '0');
        });
      });
    }
    tickAll(); setInterval(tickAll, 30000);
  }

  /* ───────── Bascule Mariage / Entreprise ───────── */
  function initSwitch() {
    var sw = document.querySelector('[data-invite-switch]');
    var invite = document.querySelector('[data-invite]');
    if (!sw || !invite) return;
    sw.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        sw.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        invite.classList.toggle('biz', b.getAttribute('data-mode') === 'biz');
      });
    });
  }

  function boot() {
    initReveal(); initParticles(); initParallax(); initEnvelope(); initCountdown(); initSwitch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
