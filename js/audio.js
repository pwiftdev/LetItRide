/* ============================================================
   LET IT RIDE — ambient audio + equalizer
   ============================================================ */
(function () {
  "use strict";

  const BAR_COUNT = 14;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const eq = document.getElementById("eq");
  const btn = document.getElementById("eqBtn");
  const barsWrap = document.getElementById("eqBars");
  const stateEl = document.getElementById("eqState");
  const audio = document.getElementById("rideAudio");

  if (!eq || !btn || !barsWrap || !stateEl || !audio) return;

  let ctx = null;
  let analyser = null;
  let source = null;
  let freqData = null;
  let raf = 0;
  let started = false;
  let bars = [];

  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("span");
    bar.className = "eq__bar";
    barsWrap.appendChild(bar);
    bars.push(bar);
  }

  function setState(text) {
    stateEl.textContent = text;
  }

  function setPlaying(playing) {
    eq.classList.toggle("is-playing", playing);
    eq.classList.toggle("is-idle", !playing);
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? "Pause Let It Ride" : "Play Let It Ride");
    setState(playing ? "NOW PLAYING" : "PAUSED");
  }

  function initGraph() {
    if (ctx) return;
    ctx = new AudioContext();
    source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  }

  function draw() {
    if (!analyser || !freqData) return;
    analyser.getByteFrequencyData(freqData);
    bars.forEach((bar, i) => {
      const sample = freqData[Math.min(i + 1, freqData.length - 1)] || 0;
      const scale = 0.12 + (sample / 255) * 0.88;
      bar.style.transform = `scaleY(${scale.toFixed(3)})`;
    });
    raf = requestAnimationFrame(draw);
  }

  function stopDraw() {
    cancelAnimationFrame(raf);
    raf = 0;
    bars.forEach((bar) => {
      bar.style.transform = "scaleY(0.18)";
    });
  }

  async function play() {
    try {
      initGraph();
      if (ctx.state === "suspended") await ctx.resume();
      await audio.play();
      setPlaying(true);
      if (!reduced) draw();
      return true;
    } catch (err) {
      setPlaying(false);
      setState("TAP TO PLAY");
      return false;
    }
  }

  async function pause() {
    audio.pause();
    setPlaying(false);
    stopDraw();
  }

  async function toggle() {
    if (audio.paused) await play();
    else await pause();
  }

  async function autoplay() {
    if (started) return;
    started = true;
    eq.classList.add("is-visible");
    setState("NOW PLAYING");
    const ok = await play();
    if (!ok) {
      setState("TAP TO PLAY");
      eq.classList.add("is-idle");
    }
  }

  btn.addEventListener("click", toggle);

  audio.addEventListener("play", () => {
    setPlaying(true);
    if (!reduced && analyser && !raf) draw();
  });

  audio.addEventListener("pause", () => {
    setPlaying(false);
    stopDraw();
    if (started && audio.currentTime > 0) setState("PAUSED");
  });

  audio.addEventListener("ended", () => {
    setPlaying(false);
    stopDraw();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopDraw();
    else if (!audio.paused && !reduced && analyser) draw();
  });

  document.addEventListener("site:ready", autoplay, { once: true });
})();
