/* ============================================================
   LET IT RIDE — motion
   ============================================================ */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- helper: split text into chars ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    const frag = document.createDocumentFragment();
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "char";
      s.setAttribute("aria-hidden", "true");
      s.textContent = c === " " ? " " : c;
      frag.appendChild(s);
    });
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  }

  /* =========================================================
     PRELOADER
     ========================================================= */
  document.body.classList.add("loading");
  const loader = document.getElementById("loader");
  const countEl = document.getElementById("count");
  const barEl = document.getElementById("loaderbar");

  function startSite() {
    if (document.body.dataset.ready) return;
    document.body.dataset.ready = "true";
    document.body.classList.remove("loading");
    initHeroIntro();
    document.dispatchEvent(new CustomEvent("site:ready"));
  }

  function runLoader() {
    if (reduced || !hasGSAP) {
      if (loader) loader.style.display = "none";
      startSite();
      return;
    }
    // reveal loader letters
    gsap.to("#loader .loader__word span", {
      y: 0, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.1,
    });
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.7, ease: "power2.inOut",
      onUpdate() {
        const v = Math.round(obj.v);
        if (countEl) countEl.textContent = v;
        if (barEl) barEl.style.width = v + "%";
      },
      onComplete() {
        gsap.to("#loader .loader__inner", { yPercent: -10, opacity: 0, duration: 0.5, ease: "power2.in" });
        gsap.to("#loader .loader__count, #loader .loader__bar", { opacity: 0, duration: 0.3 });
        gsap.to(loader, {
          yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15,
          onComplete() { loader.style.display = "none"; ScrollTrigger.refresh(); },
        });
        startSite();
      },
    });
  }

  /* =========================================================
     HERO INTRO
     ========================================================= */
  function initHeroIntro() {
    if (reduced || !hasGSAP) {
      document.querySelectorAll(".hero__title .word, .loader__word span").forEach((el) => (el.style.transform = "none"));
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero__title .word", { y: 0, duration: 1, stagger: 0.08 }, 0.05)
      .from(".hero__kicker", { y: 20, opacity: 0, duration: 0.7 }, 0.2)
      .from(".hero__card", { y: 50, opacity: 0, scale: 0.94, duration: 1 }, 0.4)
      .from(".hero__strip > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.06 }, 0.7)
      .from(".hero__sub", { y: 24, opacity: 0, duration: 0.8 }, 0.55)
      .from(".hero__actions .btn", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.65)
      .from(".hero__ca", { y: 20, opacity: 0, duration: 0.7 }, 0.8)
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, 1);
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  if (!isTouch && hasGSAP) {
    const cursor = document.querySelector(".cursor");
    const ring = cursor.querySelector(".cursor__ring");
    const dot = cursor.querySelector(".cursor__dot");
    let rx = innerWidth / 2, ry = innerHeight / 2;
    const setRX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const setRY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    const setDX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const setDY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      rx = e.clientX; ry = e.clientY;
      setRX(rx); setRY(ry); setDX(rx); setDY(ry);
    });
    document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
    document.querySelectorAll('[data-cursor="copy"]').forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-copy"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-copy"));
    });
  }

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */
  if (!isTouch && hasGSAP) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: "power3" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
      });
    });
    document.querySelectorAll("[data-magnetic-soft]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * 0.08, y: y * 0.08, rotateY: x * 0.02, rotateX: -y * 0.02, duration: 0.6, ease: "power3" });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.8, ease: "power3" }));
    });
  }

  /* =========================================================
     SCROLL PROGRESS + NAV HIDE
     ========================================================= */
  const fill = document.querySelector(".scrollbar__fill");
  const nav = document.getElementById("nav");
  let lastY = 0;
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (fill) fill.style.transform = `scaleX(${p})`;
    const y = h.scrollTop;
    if (nav) {
      if (y > lastY && y > 300) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* =========================================================
     COPY CONTRACT
     ========================================================= */
  const CA = "DYTSiPC3u1LLg6je5VhQsxb87uGw5f5poktKfGigpump";
  function copyCA() {
    const done = () => {
      const state = document.getElementById("caState");
      if (state) { state.textContent = "COPIED ✓"; setTimeout(() => (state.textContent = "COPY"), 1600); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CA).then(done).catch(done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = CA; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove(); done();
    }
  }
  ["caChip", "caChip2"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", copyCA);
  });

  /* =========================================================
     SCROLLTRIGGER ANIMATIONS
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger && !reduced) {

    /* reveal lines */
    gsap.utils.toArray(".reveal-line").forEach((el) => {
      ScrollTrigger.create({
        trigger: el, start: "top 85%",
        onEnter: () => el.classList.add("in"),
      });
    });

    /* hero parallax */
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0.2;
      gsap.to(el, {
        yPercent: amt * 100,
        ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    /* counters */
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 1.6, ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(o.v) + suffix),
        }),
      });
    });

    /* horizontal pinned RIDE section */
    const track = document.querySelector("[data-ride-track]");
    const pin = document.querySelector("[data-ride-pin]");
    if (track && pin) {
      const getScroll = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: pin, start: "top top",
          end: () => "+=" + getScroll(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });

      /* chart draws as the chart panel comes in */
      const chartLine = document.querySelector(".chart__line");
      if (chartLine) {
        gsap.to(chartLine, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: {
            trigger: ".panel--chart", containerAnimation: tween,
            start: "left 75%", end: "right 70%", scrub: true,
          },
        });
        gsap.to(".chart__dot", {
          opacity: 1, duration: 0.3,
          scrollTrigger: { trigger: ".panel--chart", containerAnimation: tween, start: "center 60%", toggleActions: "play none none reverse" },
        });
        gsap.to(".chart__jeet, .chart__top", {
          opacity: 1, duration: 0.4, stagger: 0.1,
          scrollTrigger: { trigger: ".panel--chart", containerAnimation: tween, start: "left 50%", toggleActions: "play none none reverse" },
        });
      }
      /* beat panels emphasis */
      gsap.utils.toArray(".panel--beat .panel__cmd").forEach((cmd) => {
        gsap.from(cmd, {
          opacity: 0, x: 60, ease: "power3.out",
          scrollTrigger: { trigger: cmd, containerAnimation: tween, start: "left 80%", end: "left 40%", scrub: true },
        });
      });

      const punch = document.querySelector("[data-ride-punch]");
      if (punch) {
        gsap.from(punch, {
          opacity: 0, x: 60, ease: "power3.out",
          scrollTrigger: { trigger: punch, containerAnimation: tween, start: "left 80%", end: "left 40%", scrub: true },
        });
      }
    }

    /* versus words split + reveal */
    document.querySelectorAll("[data-split]").forEach((el) => {
      const chars = splitChars(el);
      gsap.to(chars, {
        y: 0, duration: 0.8, ease: "power4.out", stagger: 0.04,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    /* steps reveal */
    gsap.from("[data-step]", {
      y: 60, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".buy__steps", start: "top 80%" },
    });

    /* footer big word per-char drift */
    const fb = document.querySelector("[data-split-words]");
    if (fb) {
      const chars = splitChars(fb);
      gsap.from(chars, {
        yPercent: 110, opacity: 0, duration: 0.9, ease: "power4.out", stagger: 0.04,
        scrollTrigger: { trigger: fb, start: "top 92%" },
      });
    }

    /* creator tribute — scroll-scrubbed counter + kinetic reveals */
    (function initTribute() {
      const section = document.querySelector("#tribute");
      if (!section) return;

      const ghost = section.querySelector("[data-tribute-parallax]");
      const tag = section.querySelector("[data-tribute-tag]");
      const title = section.querySelector("[data-tribute-title]");
      const card = section.querySelector("[data-tribute-card]");
      const pctEl = section.querySelector("[data-tribute-count]");
      const barEl = section.querySelector("[data-tribute-bar]");
      const cardP = section.querySelector("[data-tribute-card-p]");
      const btn = section.querySelector("[data-tribute-btn]");
      const outro = section.querySelector("[data-tribute-outro]");

      if (ghost) {
        gsap.fromTo(ghost, { xPercent: 12 }, {
          xPercent: -18, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
        gsap.to(ghost, {
          opacity: 0.35, ease: "none",
          scrollTrigger: { trigger: section, start: "top 80%", end: "top 20%", scrub: true },
        });
      }

      if (tag) {
        gsap.from(tag, {
          y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: tag, start: "top 88%" },
        });
      }

      if (title) {
        gsap.from(title, {
          y: 110, opacity: 0, rotateX: 14, transformPerspective: 800, transformOrigin: "left bottom",
          duration: 1.15, ease: "power4.out",
          scrollTrigger: { trigger: title, start: "top 86%" },
        });
        const italic = title.querySelector(".i");
        if (italic) {
          gsap.from(italic, {
            scaleX: 0, opacity: 0, transformOrigin: "left center",
            duration: 1, ease: "power4.inOut", delay: 0.15,
            scrollTrigger: { trigger: title, start: "top 86%" },
          });
        }
      }

      gsap.utils.toArray(section.querySelectorAll("[data-tribute-line]")).forEach((line, i) => {
        const endOpacity = line.classList.contains("dim") ? 0.6 : 1;
        gsap.fromTo(line,
          { x: -80, opacity: 0, skewX: -6 },
          {
            x: 0, opacity: endOpacity, skewX: 0, duration: 1, ease: "power3.out", delay: i * 0.12,
            scrollTrigger: { trigger: line, start: "top 88%" },
          }
        );
      });

      if (card) {
        gsap.from(card, {
          x: 140, opacity: 0, rotateY: -22, scale: 0.9, transformPerspective: 900,
          duration: 1.15, ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 84%" },
        });
      }

      if (pctEl && barEl) {
        const ride = { v: 0 };
        ScrollTrigger.create({
          trigger: pctEl,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(ride, {
              v: 100,
              duration: 2.2,
              ease: "power2.out",
              onUpdate() {
                pctEl.textContent = Math.round(ride.v) + "%";
                barEl.style.transform = `scaleX(${ride.v / 100})`;
              },
              onComplete() {
                gsap.fromTo(pctEl,
                  { scale: 1 },
                  { scale: 1.08, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 }
                );
              },
            });
          },
        });
      }

      if (cardP) {
        gsap.from(cardP, {
          y: 24, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2,
          scrollTrigger: { trigger: cardP, start: "top 90%" },
        });
      }

      if (btn) {
        gsap.from(btn, {
          y: 20, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.35,
          scrollTrigger: { trigger: btn, start: "top 92%" },
        });
      }

      if (outro) {
        const chars = splitChars(outro);
        gsap.from(chars, {
          yPercent: 130, opacity: 0, rotateZ: () => gsap.utils.random(-12, 12),
          duration: 0.85, ease: "power4.out", stagger: { each: 0.035, from: "center" },
          scrollTrigger: { trigger: outro, start: "top 92%" },
        });
        gsap.to(outro, {
          yPercent: -8, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      }
    })();

    /* section bg color flips for difference-nav feel already handled by mix-blend */
  } else {
    // reduced motion: ensure visible
    document.querySelectorAll(".reveal-line").forEach((el) => el.classList.add("in"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")));
    const tributePct = document.querySelector("[data-tribute-count]");
    const tributeBar = document.querySelector("[data-tribute-bar]");
    if (tributePct) tributePct.textContent = "100%";
    if (tributeBar) tributeBar.style.transform = "scaleX(1)";
    document.querySelectorAll("[data-tribute-line], [data-tribute-card-p], [data-tribute-btn]").forEach((el) => {
      el.style.opacity = "1";
    });
  }

  /* =========================================================
     KICK OFF
     ========================================================= */
  if (document.readyState === "complete") runLoader();
  else window.addEventListener("load", runLoader);
  // safety: never get stuck on loader
  setTimeout(() => {
    if (document.body.classList.contains("loading")) { if (loader) loader.style.display = "none"; startSite(); }
  }, 4000);
})();
