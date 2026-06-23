(function () {
  "use strict";

  const hero = document.getElementById("hero");
  const orb = document.querySelector(".hero__light");
  const lit = document.querySelector(".hero__ghost-lit");
  if (!hero || !orb || !lit) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  let wanderTween = null;

  function syncLitMask() {
    const litRect = lit.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();
    const cx = orbRect.left + orbRect.width * 0.5 - litRect.left;
    const cy = orbRect.top + orbRect.height * 0.5 - litRect.top;
    const r = Math.max(orbRect.width, orbRect.height) * 0.42;

    lit.style.setProperty("--hero-light-x", `${cx}px`);
    lit.style.setProperty("--hero-light-y", `${cy}px`);
    lit.style.setProperty("--hero-light-r", `${r}px`);
  }

  function randomPoint() {
    const padX = hero.clientWidth * 0.1;
    const padY = hero.clientHeight * 0.12;
    return {
      left: padX + Math.random() * (hero.clientWidth - padX * 2),
      top: padY + Math.random() * (hero.clientHeight - padY * 2),
    };
  }

  function wander() {
    if (!hasGSAP || reduced) return;
    const target = randomPoint();
    wanderTween = gsap.to(orb, {
      left: target.left,
      top: target.top,
      duration: 3.5 + Math.random() * 4.5,
      ease: "sine.inOut",
      onUpdate: syncLitMask,
      onComplete: wander,
    });
  }

  function start() {
    syncLitMask();

    if (reduced || !hasGSAP) {
      orb.style.left = "52%";
      orb.style.top = "44%";
      orb.style.transform = "translate(-50%, -50%)";
      orb.style.opacity = "1";
      syncLitMask();
      return;
    }

    gsap.set(orb, {
      xPercent: -50,
      yPercent: -50,
      left: hero.clientWidth * 0.5,
      top: hero.clientHeight * 0.42,
      opacity: 0,
    });
    gsap.to(orb, { opacity: 1, duration: 1.4, ease: "power2.out" });
    wander();

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onUpdate: syncLitMask,
      });
    }
  }

  function onResize() {
    syncLitMask();
  }

  if (document.body.dataset.ready) start();
  else document.addEventListener("site:ready", start, { once: true });

  window.addEventListener("resize", onResize);
})();
