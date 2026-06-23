/* ============================================================
   MEMES — 3D endless canvas
   ============================================================ */
(function () {
  "use strict";

  const MEME_FILES = [
    "image - 2026-06-17T173347.375.webp",
    "image - 2026-06-17T173836.322.webp",
    "image - 2026-06-17T174049.238.webp",
    "image - 2026-06-17T180625.407.webp",
    "image - 2026-06-17T184341.399.webp",
    "image - 2026-06-17T192648.782.webp",
    "image - 2026-06-21T165140.471.webp",
    "image - 2026-06-21T171411.056.webp",
    "image - 2026-06-21T174045.726.webp",
    "image - 2026-06-21T191908.796.webp",
    "image - 2026-06-21T193747.052.webp",
    "image - 2026-06-21T222815.724.webp",
    "image - 2026-06-21T223143.253.webp",
    "image - 2026-06-22T084415.774.webp",
    "image - 2026-06-22T100956.289.webp",
    "image - 2026-06-22T112501.533.webp",
    "image - 2026-06-22T210150.914.webp",
    "image - 2026-06-22T213754.899.webp",
    "image - 2026-06-22T214331.979.webp",
    "image - 2026-06-22T230508.537.webp",
    "image - 2026-06-22T234748.540.webp",
    "image - 2026-06-23T054055.208.webp",
    "photo_2026-06-19_11-16-52.webp",
    "photo_2026-06-21_04-17-38.webp",
    "photo_2026-06-21_05-15-29.webp",
    "photo_2026-06-21_18-19-51.webp",
    "photo_2026-06-21_18-20-06.webp",
    "photo_2026-06-21_18-20-25.webp",
    "photo_2026-06-21_19-19-14.webp",
    "photo_2026-06-22_10-59-35.webp",
    "photo_2026-06-22_11-44-01.webp",
    "photo_2026-06-22_11-44-37.webp",
    "photo_2026-06-22_14-31-24.webp",
    "photo_2026-06-22_14-31-44.webp",
    "photo_2026-06-22_14-31-53.webp",
    "photo_2026-06-22_14-32-06.webp",
    "photo_2026-06-22_19-36-29 (2).webp",
    "photo_2026-06-22_20-41-04.webp",
    "photo_2026-06-22_23-31-14.webp",
    "photo_2026-06-22_23-36-43.webp",
    "photo_2026-06-23_01-44-11.webp",
    "photo_2026-06-23_02-08-08.webp",
    "photo_2026-06-23_04-13-51 (2).webp",
    "photo_2026-06-23_04-13-51.webp",
    "photo_2026-06-23_05-21-42.webp",
    "photo_2026-06-23_05-50-57.webp",
    "photo_2026-06-23_06-59-47.webp",
    "photo_2026-06-23_07-06-56.webp",
    "photo_2026-06-23_07-53-53.webp",
    "photo_2026-06-23_09-43-35.webp",
  ];

  const COLS = 10;
  const ROWS = 6;
  const SLABS_PER_STRIP = 4;
  const STRIP_COUNT = 2;
  const BASE = "assets/memes/";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  function memeSrc(file) {
    return BASE + encodeURIComponent(file).replace(/%2F/g, "/");
  }

  function buildTrack() {
    const track = document.createElement("div");
    track.className = "memes__track";

    for (let r = 0; r < STRIP_COUNT; r++) {
      const strip = document.createElement("div");
      strip.className = "memes__strip";
      for (let c = 0; c < SLABS_PER_STRIP; c++) {
        strip.appendChild(buildSlab(r * SLABS_PER_STRIP + c));
      }
      track.appendChild(strip);
    }

    return track;
  }

  function buildSlab(seed = 0) {
    const slab = document.createElement("div");
    slab.className = "memes__slab";
    const total = COLS * ROWS;

    for (let i = 0; i < total; i++) {
      const file = MEME_FILES[(i + seed * 7) % MEME_FILES.length];
      const src = memeSrc(file);
      const z = ((i * 37) % 7) - 3;
      const rotY = ((i * 13) % 5) - 2;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "memes__card";
      card.dataset.cursor = "hover";
      card.dataset.memeSrc = src;
      card.style.setProperty("--z", z * 28);
      card.style.setProperty("--ry", rotY + "deg");

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Community meme";
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      card.appendChild(img);
      slab.appendChild(card);
    }

    return slab;
  }

  function initModal() {
    const modal = document.getElementById("memeModal");
    const img = modal?.querySelector(".meme-modal__img");
    const close = modal?.querySelector(".meme-modal__close");
    if (!modal || !img) return;

    function open(src) {
      img.src = src;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("meme-modal-open");
    }

    function shut() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("meme-modal-open");
      img.removeAttribute("src");
    }

    document.addEventListener("click", (e) => {
      const card = e.target.closest(".memes__card");
      if (card?.dataset.memeSrc) {
        e.preventDefault();
        open(card.dataset.memeSrc);
      }
    });

    close?.addEventListener("click", shut);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("meme-modal__backdrop")) shut();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) shut();
    });
  }

  function initDrift(track, tilt) {
    const slab = track.querySelector(".memes__slab");
    const strip = track.querySelector(".memes__strip");
    if (!slab || !strip) return;

    const slabW = slab.offsetWidth;
    const stripH = strip.offsetHeight;
    const drift = { p: 0 };
    const loops = 500;
    const driftYRatio = 0.14;

    if (!hasGSAP || reduced) {
      gsap?.set?.(tilt, { rotateX: 14, rotateY: -10, rotateZ: -2 });
      return;
    }

    gsap.set(tilt, { rotateX: 18, rotateY: -14, rotateZ: -3, transformPerspective: 1400 });

    gsap.to(drift, {
      p: slabW * loops,
      duration: 70 * loops,
      ease: "none",
      onUpdate() {
        const x = drift.p % slabW;
        const y = (drift.p * driftYRatio) % stripH;
        track.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
      },
    });

    gsap.utils.toArray(track.querySelectorAll(".memes__card")).forEach((card, i) => {
      gsap.to(card, {
        y: "+=14",
        duration: 2.8 + (i % 5) * 0.35,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: (i % 9) * 0.15,
      });
    });
  }

  function hookCursor() {
    const cursor = document.querySelector(".cursor");
    if (!cursor || window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".memes__card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  function initReveal() {
    if (!hasGSAP || reduced || !window.ScrollTrigger) return;

    gsap.from(".memes__header", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: "#memes", start: "top 75%" },
    });
  }

  function init() {
    const mount = document.querySelector("[data-memes-track]");
    const tilt = document.querySelector("[data-memes-tilt]");
    if (!mount || !tilt) return;

    const track = buildTrack();
    mount.replaceWith(track);
    track.dataset.memesTrack = "";

    initModal();

    requestAnimationFrame(() => {
      initDrift(track, tilt);
      hookCursor();
      initReveal();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
