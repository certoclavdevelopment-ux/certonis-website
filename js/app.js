/* ==========================================================================
   CERTONIS — Interaction engine
   No dependencies. Everything degrades to a readable static page.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------------------------------------------------------------- rAF bus
     One loop for every frame-based effect keeps things cheap and in sync. */
  var tickers = [];
  function addTicker(fn) { tickers.push(fn); }
  function loop() {
    for (var i = 0; i < tickers.length; i++) tickers[i]();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ------------------------------------------------------------ preloader */
  (function preloader() {
    var pre = $(".preloader");
    if (!pre) { body.classList.add("is-loaded"); return; }
    if (reduced) { body.classList.add("is-loaded"); return; }

    var bar = $(".preloader__bar span", pre);
    var pct = $(".preloader__pct", pre);
    var value = 0;
    var done = false;

    var timer = setInterval(function () {
      value = Math.min(value + Math.random() * 18 + 8, done ? 100 : 88);
      if (bar) bar.style.width = value + "%";
      if (pct) pct.textContent = String(Math.round(value)).padStart(3, "0");
      if (value >= 100) {
        clearInterval(timer);
        setTimeout(function () { body.classList.add("is-loaded"); revealAll(); }, 120);
      }
    }, 70);

    function finish() { done = true; }
    if (doc.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    doc.addEventListener("DOMContentLoaded", function () { setTimeout(finish, 350); });
    // never trap the visitor behind the curtain
    setTimeout(finish, 900);
  })();

  /* --------------------------------------------------------- split text */
  function wordsOf(el) {
    var out = [];
    Array.prototype.forEach.call(el.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).forEach(function (w) {
          if (w) out.push({ text: w, cls: "" });
        });
      } else if (node.nodeType === 1) {
        if (node.tagName === "BR") { out.push({ br: true }); return; }
        var cls = node.className || "";
        node.textContent.split(/\s+/).forEach(function (w) {
          if (w) out.push({ text: w, cls: cls });
        });
      }
    });
    return out;
  }

  function splitToLines(el) {
    if (!el.dataset.origHtml) el.dataset.origHtml = el.innerHTML;
    else el.innerHTML = el.dataset.origHtml;

    var words = wordsOf(el);
    el.innerHTML = "";
    var probes = [];
    words.forEach(function (w) {
      if (w.br) { el.appendChild(doc.createElement("br")); probes.push({ br: true }); return; }
      var s = doc.createElement("span");
      s.className = "w " + w.cls;
      s.textContent = w.text;
      el.appendChild(s);
      el.appendChild(doc.createTextNode(" "));
      probes.push({ node: s, cls: w.cls, text: w.text });
    });

    // group words by vertical offset -> real visual lines
    var lines = [];
    var current = null;
    var lastTop = null;
    probes.forEach(function (p) {
      if (p.br) { current = null; lastTop = null; return; }
      var top = p.node.offsetTop;
      if (current === null || Math.abs(top - lastTop) > 2) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(p);
    });

    el.innerHTML = "";
    lines.forEach(function (line, i) {
      var outer = doc.createElement("span");
      outer.className = "split-line";
      outer.style.setProperty("--i", i);
      var inner = doc.createElement("span");
      // the trailing space keeps textContent readable for screen readers and
      // copy-paste — without it the last word of a line glues to the next one
      inner.innerHTML = line.map(function (p) {
        return p.cls ? '<span class="' + p.cls + '">' + p.text + "</span>" : p.text;
      }).join(" ") + " ";
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.classList.add("is-split");
  }

  var splitTargets = $$("[data-split]");
  function runSplit() { splitTargets.forEach(splitToLines); }

  // the language switcher rewrites copy, so it needs to re-split afterwards
  window.certonis = window.certonis || {};
  window.certonis.resplit = function () {
    splitTargets.forEach(function (el) { delete el.dataset.origHtml; });
    runSplit();
    splitTargets.forEach(function (el) {
      el.classList.add("is-inview");
      setTimeout(function () { window.certonis.unmask(el); }, 1400);
    });
  };

  if (splitTargets.length) {
    runSplit();
    var splitW = window.innerWidth;
    var splitTimer;
    window.addEventListener("resize", function () {
      if (Math.abs(window.innerWidth - splitW) < 40) return;
      splitW = window.innerWidth;
      clearTimeout(splitTimer);
      splitTimer = setTimeout(function () {
        runSplit();
        splitTargets.forEach(function (el) {
          if (el.getBoundingClientRect().top > window.innerHeight) return;
          el.classList.add("is-inview");
          setTimeout(function () { window.certonis.unmask(el); }, 1400);
        });
      }, 220);
    }, { passive: true });
  }

  /* ------------------------------------------------------------- reveals */
  var revealSel = ".reveal, .reveal-mask, .clip-in, .scale-in, [data-split], [data-inview]";

  /* Die Maske schneidet die Zeile ab, damit der Text von unten hereinfahren
     kann. Gebraucht wird sie nur währenddessen. Bleibt sie danach bestehen,
     kappt sie je nach Schrift und Größe die Unterlängen von g, y und j.
     Also: nach der Animation abschalten — dann kann dort nichts mehr
     abgeschnitten werden, unabhängig von der gewählten Schrift. */
  var MASK_OFF_AFTER = 2200;

  function unmask(el) {
    var boxes = $$(".split-line, .reveal-mask", el);
    if (el.matches && el.matches(".split-line, .reveal-mask")) boxes.push(el);
    boxes.forEach(function (b) { b.style.overflow = "visible"; });
  }

  function markInview(el) {
    el.classList.add("is-inview");
    setTimeout(function () { unmask(el); }, MASK_OFF_AFTER);
  }

  window.certonis = window.certonis || {};
  window.certonis.unmask = unmask;

  function revealAll() {
    $$(revealSel).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) markInview(el);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        markInview(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    $$(revealSel).forEach(function (el) { io.observe(el); });
  } else {
    $$(revealSel).forEach(function (el) {
      el.classList.add("is-inview");
      unmask(el);
    });
  }

  /* ------------------------------------------------------- scroll state */
  var nav = $(".nav");
  var progress = $(".scroll-progress");
  var lastY = window.scrollY;
  var scrollY = window.scrollY;
  var smoothY = scrollY;

  addTicker(function () {
    scrollY = window.scrollY;
    smoothY = lerp(smoothY, scrollY, 0.12);

    if (progress) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? clamp(scrollY / max, 0, 1) : 0) + ")";
    }

    if (nav) {
      nav.classList.toggle("is-stuck", scrollY > 24);
      var hide = scrollY > lastY && scrollY > 420 && !body.classList.contains("menu-open");
      nav.classList.toggle("is-hidden", hide);
    }
    lastY = scrollY;
  });

  /* --------------------------------------------------------- parallax */
  var parallaxEls = $$("[data-parallax]");
  if (parallaxEls.length && !reduced) {
    addTicker(function () {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
        var speed = parseFloat(el.dataset.parallax) || 0.1;
        var centre = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = "translate3d(0," + (-centre * speed).toFixed(2) + "px,0)";
      }
    });
  }

  /* ----------------------------------------------------- mobile menu */
  var toggle = $(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("menu-open", "is-locked");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) toggle.click();
    });
  }

  /* --------------------------------------------------- active nav link */
  (function markCurrentPage() {
    var here = location.pathname.replace(/index\.html$/, "") || "/";
    $$(".nav__link, .mobile-menu a").forEach(function (link) {
      var target = link.getAttribute("href");
      if (!target || target.charAt(0) !== "/") return;
      if (target.split("#")[0] !== here) return;
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    });
  })();

  /* ------------------------------------------------------ hero rotator */
  (function rotator() {
    var box = $(".hero__rotator");
    if (!box) return;
    var items = $$("span", box);
    if (items.length < 2) return;
    var idx = 0;
    items[0].classList.add("is-current");
    setInterval(function () {
      var cur = items[idx];
      idx = (idx + 1) % items.length;
      var next = items[idx];
      cur.classList.remove("is-current");
      cur.classList.add("is-out");
      next.classList.remove("is-out");
      // force reflow so the incoming item animates from below
      void next.offsetWidth;
      next.classList.add("is-current");
      setTimeout(function () { cur.classList.remove("is-out"); }, 900);
    }, 2800);
  })();

  /* ---------------------------------------------------------- counters */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var dur = 1500;
    var t0 = performance.now();
    function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      el.textContent = prefix + v.toLocaleString("de-AT", {
        minimumFractionDigits: dec, maximumFractionDigits: dec
      }) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "");
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          animateCount(e.target);
          cio.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* --------------------------------------------------- manifest words */
  (function manifest() {
    var els = $$("[data-manifest]");
    if (!els.length) return;

    function build() {
      els.forEach(function (el) {
        var text = el.textContent.trim();
        var keys = (el.dataset.manifest || "").split(",").map(function (s) { return s.trim(); });
        el.innerHTML = text.split(/\s+/).map(function (w) {
          var isKey = keys.some(function (k) { return k && w.replace(/[.,;:!?]/g, "") === k; });
          return '<span class="word' + (isKey ? " is-key" : "") + '">' + w + "</span>";
        }).join(" ");
      });
      allWords = $$("[data-manifest] .word");
    }

    var allWords = [];
    window.certonis = window.certonis || {};
    window.certonis.remanifest = build;
    build();

    addTicker(function () {
      for (var i = 0; i < allWords.length; i++) {
        var r = allWords[i].getBoundingClientRect();
        var trigger = window.innerHeight * 0.78;
        allWords[i].classList.toggle("is-lit", r.top < trigger);
      }
    });
  })();

  /* ------------------------------------------------------ flow section */
  (function flow() {
    var section = $(".flow");
    if (!section) return;
    var track = $(".flow__track", section);
    var rail = $(".flow__rail", section);
    var bar = $(".flow__progress span", section);
    var steps = $$(".flow__step", track);
    if (!track || !rail) return;

    var maxShift = 0;
    var target = 0;
    var current = 0;
    var enabled = false;

    function measure() {
      enabled = window.innerWidth > 860 && !reduced;
      if (!enabled) {
        track.style.transform = "";
        section.style.height = "";
        return;
      }
      // --gutter is a clamp() expression, so read the resolved pixel value
      // off the track's own padding instead of parsing the custom property
      var gutter = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      maxShift = Math.max(0, track.scrollWidth - window.innerWidth + gutter);
      // scroll distance: one viewport plus the horizontal travel
      section.style.height = (window.innerHeight + maxShift * 1.1) + "px";
    }

    measure();
    window.addEventListener("resize", measure, { passive: true });

    addTicker(function () {
      if (!enabled) return;
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var p = clamp(-rect.top / Math.max(1, total), 0, 1);
      target = p * maxShift;
      current = lerp(current, target, 0.09);
      track.style.transform = "translate3d(" + (-current).toFixed(2) + "px,0,0)";
      if (bar) bar.style.width = (p * 100).toFixed(1) + "%";

      var active = Math.round(p * (steps.length - 1));
      for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("is-active", i === active);
    });
  })();

  /* -------------------------------------------------------- accordion */
  $$(".acc__trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc__item");
      var open = item.classList.contains("is-open");
      var group = btn.closest(".accordion");
      if (group) {
        $$(".acc__item.is-open", group).forEach(function (o) {
          o.classList.remove("is-open");
          $(".acc__trigger", o).setAttribute("aria-expanded", "false");
        });
      }
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------------ card pointer */
  if (!isTouch) {
    $$(".card, .price-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* --------------------------------------------------------- magnetic */
  if (!isTouch && !reduced) {
    $$(".magnetic").forEach(function (wrap) {
      var child = wrap.firstElementChild || wrap;
      var tx = 0, ty = 0, cx = 0, cy = 0, active = false;

      wrap.addEventListener("pointerenter", function () { active = true; });
      wrap.addEventListener("pointerleave", function () { active = false; tx = 0; ty = 0; });
      wrap.addEventListener("pointermove", function (e) {
        var r = wrap.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
      });

      addTicker(function () {
        if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) return;
        cx = lerp(cx, tx, 0.16);
        cy = lerp(cy, ty, 0.16);
        child.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
      });
    });
  }

  /* ----------------------------------------------------------- cursor */
  if (!isTouch && !reduced) {
    var ring = doc.createElement("div");
    ring.className = "cursor";
    var dot = doc.createElement("div");
    dot.className = "cursor-dot";
    body.appendChild(ring);
    body.appendChild(dot);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      ring.classList.add("is-visible");
      dot.classList.add("is-visible");
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    }, { passive: true });

    window.addEventListener("pointerdown", function () { ring.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });
    doc.addEventListener("pointerleave", function () {
      ring.classList.remove("is-visible");
      dot.classList.remove("is-visible");
    });

    doc.addEventListener("pointerover", function (e) {
      var t = e.target.closest("a, button, .card, .module-chip, input, textarea, select, label");
      ring.classList.toggle("is-hover", !!t);
    });

    addTicker(function () {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      ring.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0)";
    });
  }

  /* ---------------------------------------------------------- marquee */
  $$(".marquee__track").forEach(function (track) {
    track.innerHTML += track.innerHTML;   // seamless 50% loop
  });

  /* ------------------------------------------------------ smooth jump */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = doc.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------------------------------------------------------- booking
     The scheduler link lives in config.js. It has to be applied here rather
     than in form.js, because the "Discovery Call" buttons sit in the nav on
     every page while form.js only loads on the contact page. */
  (function booking() {
    var cfg = window.CERTONIS_CONFIG || {};
    if (!cfg.bookingUrl) return;
    $$("[data-booking]").forEach(function (el) {
      el.setAttribute("href", cfg.bookingUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  })();

  /* ------------------------------------------------------------- year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------- kbd shortcut */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    var first = $("#f-name");
    if (first) {
      first.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      setTimeout(function () { first.focus({ preventScroll: true }); }, reduced ? 0 : 600);
    } else {
      location.href = "/kontakt.html";
    }
  });
})();
