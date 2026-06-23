/* ============================================================
   THE TEST — 3D roulette wheel (GLB)
   ============================================================ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

(function () {
  "use strict";

  const mount = document.querySelector("[data-test-roulette]");
  const section = document.querySelector("#test");
  if (!mount || !section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const MODEL = "assets/rou_lp_test_06.glb";
  const TILT = -0.38;
  const FIT_MARGIN = 1.52;

  let renderer, scene, camera, wheel, modelRoot, raf = 0;
  let finalScale = 1;
  let camHome = new THREE.Vector3();
  let camStart = new THREE.Vector3();
  let lookTarget = new THREE.Vector3();
  let spin = 0;
  let targetSpin = reduced ? 0 : 0.014;
  let inView = true;
  let entered = false;
  let modelReady = false;

  function lookAtWheel() {
    camera.lookAt(lookTarget);
  }

  function fitCamera(root, margin = FIT_MARGIN) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const aspect = camera.aspect || 1;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distV = (size.y / 2) / Math.tan(vFov / 2);
    const distH = (size.x / 2) / Math.tan(hFov / 2);
    const dist = Math.max(distV, distH) * margin;

    camHome.set(center.x, center.y + dist * 0.78, center.z + dist * 0.72);
    lookTarget.set(center.x, center.y * 0.35, center.z);
    return dist;
  }

  function setEntranceCamera(root) {
    const dist = fitCamera(root, FIT_MARGIN * 1.45);
    camStart.set(camHome.x, camHome.y + dist * 0.12, camHome.z + dist * 0.18);
    camera.position.copy(camStart);
    lookAtWheel();
  }

  function init() {
    const canvas = document.createElement("canvas");
    mount.appendChild(canvas);

    if (hasGSAP && !reduced) {
      gsap.set(mount, { opacity: 0, y: 64, scale: 0.86 });
    }

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(3, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf6f4ef, 0.7);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    const loader = new GLTFLoader();
    loader.load(
      MODEL,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
          }
        });

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        finalScale = 2.05 / maxDim;
        root.scale.setScalar(finalScale * 0.45);
        root.rotation.x = -0.72;
        scene.add(root);

        modelRoot = root;
        wheel = root.getObjectByName("geo1_inside_0") || root;
        modelReady = true;
        mount.classList.add("is-ready");
        resize();
        setEntranceCamera(root);
        setupScroll();
        if (!reduced) loop();
        maybeEnter();
      },
      undefined,
      () => mount.classList.add("is-error")
    );

    window.addEventListener("resize", resize);
  }

  function runEntrance() {
    if (entered || !modelReady) return;
    entered = true;

    modelRoot.scale.setScalar(finalScale);
    modelRoot.rotation.x = TILT;
    fitCamera(modelRoot, FIT_MARGIN);
    const toPos = camHome.clone();
    const toLook = lookTarget.clone();

    if (reduced || !hasGSAP) {
      mount.style.opacity = "1";
      mount.style.transform = "none";
      camera.position.copy(toPos);
      camera.lookAt(toLook);
      return;
    }

    modelRoot.scale.setScalar(finalScale * 0.45);
    modelRoot.rotation.x = -0.72;
    setEntranceCamera(modelRoot);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(mount, { opacity: 1, y: 0, scale: 1, duration: 1.15 }, 0)
      .to(
        camera.position,
        {
          x: toPos.x,
          y: toPos.y,
          z: toPos.z,
          duration: 1.35,
          onUpdate: () => camera.lookAt(toLook),
        },
        0.05
      )
      .to(
        modelRoot.scale,
        { x: finalScale, y: finalScale, z: finalScale, duration: 1.35 },
        0.05
      )
      .to(modelRoot.rotation, { x: TILT, duration: 1.35 }, 0.05);
  }

  function maybeEnter() {
    if (entered) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.82) runEntrance();
  }

  function setupScroll() {
    if (typeof window.ScrollTrigger === "undefined") {
      runEntrance();
      return;
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      once: true,
      onEnter: runEntrance,
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      end: "bottom 15%",
      onEnter: () => { inView = true; targetSpin = 0.052; },
      onEnterBack: () => { inView = true; targetSpin = 0.052; },
      onLeave: () => { inView = false; targetSpin = 0.008; },
      onLeaveBack: () => { inView = false; targetSpin = 0.008; },
    });

    ScrollTrigger.refresh();
    maybeEnter();
  }

  function resize() {
    if (!renderer || !camera) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (modelRoot && entered) {
      fitCamera(modelRoot, FIT_MARGIN);
      camera.position.copy(camHome);
      lookAtWheel();
    } else if (modelRoot) {
      setEntranceCamera(modelRoot);
    }
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (wheel && entered) {
      const t = performance.now() * 0.001;
      const roll = inView ? 0.018 + Math.sin(t * 1.4) * 0.008 : 0.006;
      spin += (Math.max(targetSpin, roll) - spin) * 0.035;
      wheel.rotation.y += spin;
    }
    renderer.render(scene, camera);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
