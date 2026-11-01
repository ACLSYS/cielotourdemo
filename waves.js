/* waves.js — Caribbean Tours · ondas en hero, divisores y botones */
(function () {
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* divisores ondulados (svg.wave) */
  var waves = [].slice.call(document.querySelectorAll('svg.wave')).map(function (svg, i) {
    var w = { svg: svg, p: svg.querySelector('path'), i: i, top: svg.classList.contains('top'), vis: true };
    svg._w = w;
    return w;
  });
  function setPath(w, t) {
    var d = w.top ? 'M0,0H1440' : 'M0,60H1440';
    for (var x = 1440; x >= 0; x -= 20) {
      var y = 30 + 11 * Math.sin(x / 1440 * Math.PI * 4 + t * 1.2 + w.i) +
                   5 * Math.sin(x / 1440 * Math.PI * 7 - t * 0.8 + w.i * 2);
      d += 'L' + x + ',' + y.toFixed(1);
    }
    w.p.setAttribute('d', d + 'Z');
  }

  /* ondas del hero (canvas) */
  var hero = document.querySelector('.hero');
  var cv, ctx, W = 0, H = 0, px = -999, pa = 0, heroVis = true;
  var LAYERS = [
    { c: 'rgba(161,209,240,.28)', a: .16, f: 1.1, s: .7,  o: 0, b: .50 },
    { c: 'rgba(97,176,223,.32)',  a: .14, f: 1.6, s: -.9, o: 2, b: .60 },
    { c: 'rgba(241,248,253,.55)', a: .12, f: 1.3, s: .8,  o: 4, b: .72 },
    { c: '#F1F8FD',               a: .10, f: 1.9, s: -.6, o: 1, b: .86 }
  ];
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (RM) drawHero(0);
  }
  function drawHero(t) {
    ctx.clearRect(0, 0, W, H);
    LAYERS.forEach(function (L) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 8) {
        var y = H * L.b +
                H * L.a * Math.sin(x / W * 6.283 * L.f + t * L.s + L.o) +
                H * L.a * .4 * Math.sin(x / W * 6.283 * L.f * 2.3 - t * L.s * 1.3);
        if (pa > .01) y -= 14 * pa * Math.exp(-Math.pow((x - px) / 150, 2)) * Math.sin(x / 26 - t * 7);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = L.c;
      ctx.fill();
    });
    pa *= .965;
  }
  if (hero) {
    cv = document.createElement('canvas');
    cv.className = 'hero-waves';
    cv.setAttribute('aria-hidden', 'true');
    var sc = hero.querySelector('.hero-scrim');
    sc ? sc.after(cv) : hero.appendChild(cv);
    ctx = cv.getContext('2d');
    size();
    window.addEventListener('resize', size);
    if (!RM) hero.addEventListener('pointermove', function (e) {
      px = e.clientX - hero.getBoundingClientRect().left;
      pa = 1;
    });
  }

  /* loop: solo dibuja lo visible */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.target === hero) heroVis = en.isIntersecting;
        else if (en.target._w) en.target._w.vis = en.isIntersecting;
      });
    });
    waves.forEach(function (w) { io.observe(w.svg); });
    if (hero) io.observe(hero);
  }
  if (RM) {
    waves.forEach(function (w) { setPath(w, 0); });
  } else {
    var t0 = performance.now();
    (function frame(now) {
      var t = (now - t0) / 1000;
      if (hero && heroVis) drawHero(t);
      waves.forEach(function (w) { if (w.vis) setPath(w, t); });
      requestAnimationFrame(frame);
    })(t0);

    /* ripple al tocar botones */
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn,.fab,.pill');
      if (!b) return;
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
      var sp = document.createElement('span');
      sp.className = 'cw-ripple';
      sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(sp);
      setTimeout(function () { sp.remove(); }, 700);
    });
  }
})();
