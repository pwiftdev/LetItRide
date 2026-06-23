/* ============================================================
   Decor orbs — chips & cards between sections
   ============================================================ */
(function () {
  "use strict";

  const CHIP = "assets/chip.png";
  const CARDS = "assets/cards.png";

  const PLACEMENTS = [
    { after: "#hero", align: "right", kind: "chip", size: 68, y: -36 },
    { after: ".marq", align: "left", kind: "cards", size: 64, y: -24 },
    { after: "#test", align: "right", kind: "chip", size: 56, y: -28 },
    { after: "#ride", align: "left", kind: "cards", size: 72, y: -32 },
    { after: "#memes", align: "right", kind: "chip", size: 60, y: -26 },
    { after: "#versus", align: "left", kind: "cards", size: 52, y: -22 },
    { after: "#clip", align: "right", kind: "chip", size: 64, y: -30 },
    { after: "#buy", align: "left", kind: "cards", size: 58, y: -24 },
    { after: "#tribute", align: "right", kind: "chip", size: 54, y: -28 },
  ];

  function createOrb(placement, i) {
    const isChip = placement.kind === "chip";
    const orb = document.createElement("div");
    orb.className = "decor-orb" + (isChip ? " decor-orb--chip" : "") + " decor-orb--" + placement.align;
    orb.style.width = placement.size + "px";
    orb.style.height = placement.size + "px";
    orb.style.top = placement.y + "px";

    const img = document.createElement("img");
    img.src = isChip ? CHIP : CARDS;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    if (isChip) {
      img.style.animationDuration = 3.4 + (i % 5) * 0.65 + "s";
    }

    orb.appendChild(img);
    return orb;
  }

  function insertAfter(el, node) {
    el.parentNode.insertBefore(node, el.nextSibling);
  }

  function init() {
    const mobile = window.innerWidth < 760;
    const picks = mobile ? PLACEMENTS.filter((_, i) => i % 2 === 0) : PLACEMENTS;

    picks.forEach((placement, i) => {
      const anchor = document.querySelector(placement.after);
      if (!anchor) return;

      const divider = document.createElement("div");
      divider.className = "decor-divider";
      divider.setAttribute("aria-hidden", "true");
      divider.appendChild(createOrb(placement, i));
      insertAfter(anchor, divider);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
