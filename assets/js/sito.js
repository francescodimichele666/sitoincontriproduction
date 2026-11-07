/* Incontri Production — tutto il JavaScript del sito, niente librerie */
(() => {
  const d = document;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* navigazione privata */ } },
  };

  /* ---------- testata: sfondo dopo lo scorrimento, si nasconde scendendo ---------- */
  const top = $('[data-top]');
  const bar = $('[data-progress]');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    if (top) {
      top.classList.toggle('is-solid', y > 24);
      const menuOpen = d.body.classList.contains('menu-open');
      top.classList.toggle('is-hidden', !menuOpen && y > 480 && y > lastY + 4);
      if (y < lastY - 4) top.classList.remove('is-hidden');
    }
    if (bar) {
      const h = d.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    }
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- menu del telefono ---------- */
  const burger = $('[data-burger]');
  const mnav = $('#menu-mobile');
  if (burger && mnav) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.querySelector('.vh').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
      mnav.classList.toggle('is-open', open);
      mnav.toggleAttribute('inert', !open);
      d.body.classList.toggle('menu-open', open);
      if (open) top.classList.remove('is-hidden');
    };
    mnav.setAttribute('inert', '');
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mnav.classList.contains('is-open')) { set(false); burger.focus(); } });
    $$('a', mnav).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  /* ---------- comparsa degli elementi allo scorrimento ---------- */
  const revs = $$('.rv, .rv-clip');
  if ('IntersectionObserver' in window && !calm) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revs.forEach((el) => io.observe(el));
  } else {
    revs.forEach((el) => el.classList.add('in'));
  }

  /* ---------- numeri che contano fino al valore ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !calm) {
    const run = (el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const v = Math.round(end * (1 - Math.pow(1 - k, 4)));
        el.textContent = v + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- luce che segue il mouse nelle testate ---------- */
  $$('[data-spot]').forEach((el) => {
    let raf = 0;
    el.addEventListener('pointermove', (e) => {
      if (raf || e.pointerType !== 'mouse') return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        raf = 0;
      });
    });
  });

  /* ---------- riflesso sulle schede servizi ---------- */
  $$('.card').forEach((c) => c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', (e.clientX - r.left) + 'px');
    c.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }));

  /* ---------- il globo: la rete di "incontri" che gira (SVG disegnato qui) ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const RAD = Math.PI / 180;
  const NODES = [[52, 18], [24, -38], [6, 32], [-14, 78], [34, 118], [-38, 160], [12, -112], [-30, -64], [62, -150], [-56, 14], [26, 196], [-8, -10], [44, 70], [-46, 104]];
  const LINKS = [[0, 1], [0, 2], [1, 11], [2, 11], [2, 3], [2, 12], [12, 4], [3, 13], [4, 5], [5, 10], [10, 8], [8, 6], [6, 7], [7, 1], [7, 9], [9, 11], [9, 3], [12, 0], [13, 5], [4, 10]];

  function globe(svg) {
    const R = 210;
    const mk = (tag, attrs, parent) => {
      const el = d.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      parent.appendChild(el);
      return el;
    };
    svg.textContent = '';
    svg.setAttribute('viewBox', '-260 -260 520 520');
    const defs = mk('defs', {}, svg);
    const gr = mk('radialGradient', { id: 'gGlow' }, defs);
    mk('stop', { offset: '0', 'stop-color': '#e3263a', 'stop-opacity': '.32' }, gr);
    mk('stop', { offset: '1', 'stop-color': '#e3263a', 'stop-opacity': '0' }, gr);
    mk('circle', { r: R * 1.22, fill: 'url(#gGlow)' }, svg);

    const back = mk('g', {}, svg);
    const backLinks = mk('g', {}, svg);
    mk('circle', { r: R, class: 'rim' }, svg);
    const front = mk('g', {}, svg);
    const frontLinks = mk('g', {}, svg);
    const nodesG = mk('g', {}, svg);

    // meridiani e paralleli: una linea davanti e una dietro per ognuno
    const MER = [0, 30, 60, 90, 120, 150].map((v) => v * RAD);
    const PAR = [-55, -25, 5, 35, 62].map((v) => v * RAD);
    const lines = [...MER.map((lon) => ({ lon })), ...PAR.map((lat) => ({ lat }))].map((o) => ({
      ...o, f: mk('path', { class: 'mf' }, front), b: mk('path', { class: 'mb' }, back),
    }));
    // ogni collegamento ha una "scintilla" sopra, accesa solo quando passa un segnale
    const links = LINKS.map(([a, b]) => ({
      a, b,
      el: mk('path', { class: 'lk', pathLength: 1 }, frontLinks),
      sp: mk('path', { class: 'spark', pathLength: 1 }, frontLinks),
    }));
    const nodes = NODES.map(([lat, lon], i) => {
      const g = mk('g', { class: 'nd' }, nodesG);
      const big = i % 3 === 0;
      mk('circle', { class: 'ring', r: big ? 7 : 5, style: `--dl:${(i * 0.37) % 2.8}s` }, g);
      const c = mk('circle', { class: 'c', r: big ? 7 : 5 }, g);
      return { lat: lat * RAD, lon: lon * RAD, g, c, big };
    });

    let rot = 0.4, tilt = -0.32, tTilt = -0.32, tRot = 0;
    const P = (lat, lon) => {
      const x = Math.cos(lat) * Math.sin(lon + rot);
      const y = -Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon + rot);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      return [x * R, (y * ct - z * st) * R, y * st + z * ct];
    };
    const f = (n) => n.toFixed(1);

    function draw() {
      for (const L of lines) {
        let df = '', db = '', prev = null;
        const N = 36;
        for (let i = 0; i <= N; i++) {
          const p = L.lon !== undefined ? P(-Math.PI / 2 + Math.PI * i / N, L.lon) : P(L.lat, Math.PI * 2 * i / N);
          const side = p[2] >= 0;
          const cmd = (prev === side ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]);
          if (side) df += cmd; else db += cmd;
          prev = side;
        }
        // il meridiano gira anche sul retro: lo chiudo dall'altra parte
        if (L.lon !== undefined) {
          prev = null;
          for (let i = 0; i <= N; i++) {
            const p = P(Math.PI / 2 - Math.PI * i / N, L.lon + Math.PI);
            const side = p[2] >= 0;
            const cmd = (prev === side ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]);
            if (side) df += cmd; else db += cmd;
            prev = side;
          }
        }
        L.f.setAttribute('d', df);
        L.b.setAttribute('d', db);
      }
      const pos = nodes.map((n) => P(n.lat, n.lon));
      nodes.forEach((n, i) => {
        const [x, y, z] = pos[i];
        n.g.setAttribute('transform', `translate(${f(x)} ${f(y)}) scale(${(0.55 + 0.45 * Math.max(0, z)).toFixed(2)})`);
        n.g.classList.toggle('b', z < 0);
      });
      for (const l of links) {
        const A = pos[l.a], B = pos[l.b];
        // curva che si alza sopra la superficie, come gli archi del logo
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        const lift = 1 + 0.18 * Math.hypot(A[0] - B[0], A[1] - B[1]) / R;
        const path = `M${f(A[0])} ${f(A[1])}Q${f(mx * lift)} ${f(my * lift)} ${f(B[0])} ${f(B[1])}`;
        l.el.setAttribute('d', path);
        if (l.hot) l.sp.setAttribute('d', path);
        const behind = A[2] < -0.05 || B[2] < -0.05;
        if (behind !== l.behind) {
          l.behind = behind;
          const g = behind ? backLinks : frontLinks;
          g.appendChild(l.el);
          g.appendChild(l.sp);
          l.el.classList.toggle('b', behind);
        }
      }
    }

    if (calm || svg.hasAttribute('data-static')) {
      svg.classList.add('globe-static');
      draw();
      return;
    }

    // segnali che corrono sui collegamenti
    setInterval(() => {
      if (!running) return;
      const vis = links.filter((l) => !l.behind && !l.hot);
      const l = vis[Math.floor(Math.random() * vis.length)];
      if (!l) return;
      l.hot = true;
      l.sp.setAttribute('d', l.el.getAttribute('d'));
      l.sp.classList.add('hot');
      setTimeout(() => { l.hot = false; l.sp.classList.remove('hot'); }, 1550);
    }, 700);

    const host = svg.closest('[data-spot]') || svg;
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      tTilt = -0.32 + ((e.clientY - r.top) / r.height - 0.5) * 0.5;
      tRot = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
    });

    let running = false, last = 0, extra = 0, raf = 0;
    const slow = matchMedia('(pointer: coarse)').matches; // sui telefoni basta mezzo frame rate
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, t - last);
      if (slow && dt < 30) return;
      last = t;
      extra += (tRot - extra) * 0.04;
      rot += dt * 0.00012;
      tilt += (tTilt - tilt) * 0.05;
      const keep = rot;
      rot += extra;
      draw();
      rot = keep;
    };
    const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    draw();
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(svg);
    d.addEventListener('visibilitychange', () => (d.hidden ? stop() : start()));
  }
  $$('[data-globe]').forEach(globe);

  /* ---------- carosello programmi: frecce ---------- */
  $$('[data-rail-nav]').forEach((nav) => {
    const rail = $(nav.dataset.railNav);
    if (!rail) return;
    $$('button', nav).forEach((b) => b.addEventListener('click', () => {
      const card = rail.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 18 : 300;
      rail.scrollBy({ left: b.dataset.dir * step, behavior: calm ? 'auto' : 'smooth' });
    }));
  });

  /* ---------- rassegna stampa: visore a tutto schermo ---------- */
  const lb = $('[data-lightbox]');
  if (lb) {
    const clips = $$('[data-full]');
    const img = $('img', lb);
    const count = $('[data-lb-count]', lb);
    let i = 0;
    // i ritagli sono piccoli (400 px di altezza): li ingrandisco fino a riempire lo schermo
    const fit = () => {
      if (!img.naturalWidth) return;
      const f = img.parentElement, cs = getComputedStyle(f);
      const cw = f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ch = f.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight, 2.5);
      img.style.width = Math.round(img.naturalWidth * s) + 'px';
    };
    img.addEventListener('load', fit);
    addEventListener('resize', () => lb.open && fit());
    const show = (n) => {
      i = (n + clips.length) % clips.length;
      img.src = clips[i].dataset.full;
      img.alt = clips[i].querySelector('img').alt;
      count.textContent = `${i + 1} / ${clips.length}`;
      // precarico la successiva
      const nx = new Image();
      nx.src = clips[(i + 1) % clips.length].dataset.full;
    };
    clips.forEach((c, n) => c.addEventListener('click', () => { show(n); lb.showModal(); }));
    $('[data-lb-prev]', lb).addEventListener('click', () => show(i - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(i + 1));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    let x0 = null, swiped = false;
    lb.addEventListener('click', (e) => {
      if (swiped) { swiped = false; return; }
      if (e.target === lb || e.target.tagName === 'FIGURE') lb.close();
    });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
    // scorrimento col dito per passare all'articolo vicino
    lb.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 50) { swiped = true; show(i + (dx < 0 ? 1 : -1)); }
      x0 = null;
    });
  }

  /* ---------- copia dell'email ---------- */
  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = d.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); d.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('is-on'), 2200);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('Indirizzo copiato'); } catch (e) { toast(b.dataset.copy); }
  }));

  /* ---------- cookie: nulla parte senza consenso ---------- */
  const KEY = 'cookie-preferences';
  const banner = $('[data-cookie]');
  const load = () => { try { return JSON.parse(store.get(KEY)); } catch (e) { return null; } };
  const activate = (cat) => {
    $$(`[data-cookie-category="${cat}"]`).forEach((el) => {
      if (el.dataset.on) return;
      el.dataset.on = '1';
      if (el.tagName === 'SCRIPT') {
        const s = d.createElement('script');
        if (el.dataset.src) s.src = el.dataset.src; else s.textContent = el.textContent;
        el.after(s);
      } else if (el.dataset.src) {
        el.src = el.dataset.src;
      }
    });
  };
  const apply = (p) => ['functional', 'analytics', 'marketing'].forEach((c) => p[c] && activate(c));
  if (banner) {
    const toggles = $$('[data-cookie-toggle]', banner);
    const prefs = $('[data-cookie-prefs]', banner);
    const save = (p) => { p.necessary = true; store.set(KEY, JSON.stringify(p)); apply(p); banner.hidden = true; };
    const open = () => {
      const p = load() || {};
      toggles.forEach((t) => { t.checked = !!p[t.dataset.cookieToggle]; });
      banner.hidden = false;
    };
    const saved = load();
    if (saved) apply(saved); else banner.hidden = false;
    $('[data-cookie-all]', banner).addEventListener('click', () => save({ functional: true, analytics: true, marketing: true }));
    $('[data-cookie-none]', banner).addEventListener('click', () => save({ functional: false, analytics: false, marketing: false }));
    $('[data-cookie-more]', banner).addEventListener('click', (e) => {
      prefs.hidden = !prefs.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!prefs.hidden));
    });
    $('[data-cookie-save]', banner).addEventListener('click', () => {
      const p = {};
      toggles.forEach((t) => { p[t.dataset.cookieToggle] = t.checked; });
      save(p);
    });
    $$('[data-cookie-open]').forEach((b) => b.addEventListener('click', open));
  }
})();
