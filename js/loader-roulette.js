/* ============================================================
   LOADER — 3D roulette wheel (GLB)
   ============================================================ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

(function () {
  "use strict";

  const mount = document.querySelector("[data-loader-roulette]");
  const loaderEl = document.getElementById("loader");
  if (!mount || !loaderEl) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const MODEL = "assets/rou_lp_test_06.glb";
  const TILT = -0.38;
  const FIT_MARGIN = 1.38;

  let renderer, scene, camera, wheel, modelRoot, raf = 0;
  let finalScale = 1;
  let camHome = new THREE.Vector3();
  let lookTarget = new THREE.Vector3();
  let spin = 0;
  let targetSpin = reduced ? 0 : 0.052;
  let entered = false;
  let modelReady = false;
  let active = true;

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
    camera.position.copy(camHome);
    camera.lookAt(lookTarget);
    return dist;
  }

  function init() {
    const canvas = document.createElement("canvas");
    mount.appendChild(canvas);

    if (hasGSAP && !reduced) {
      gsap.set(mount, { opacity: 0 });
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

    new GLTFLoader().load(
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
        finalScale = 2.15 / maxDim;
        root.scale.setScalar(finalScale * 0.45);
        root.rotation.x = -0.72;
        scene.add(root);

        modelRoot = root;
        wheel = root.getObjectByName("geo1_inside_0") || root;
        modelReady = true;
        mount.classList.add("is-ready");
        resize();
        setEntranceStart();
        if (!reduced) loop();
        setTimeout(runEntrance, 180);
      },
      undefined,
      () => mount.classList.add("is-error")
    );

    window.addEventListener("resize", resize);
    document.addEventListener("loader:dismiss", stop, { once: true });
  }

  function setEntranceStart() {
    modelRoot.scale.setScalar(finalScale * 0.45);
    modelRoot.rotation.x = -0.72;
    const dist = fitCamera(modelRoot, FIT_MARGIN * 1.55);
    camera.position.y += dist * 0.12;
    camera.position.z += dist * 0.18;
    camera.lookAt(lookTarget);
  }

  function runEntrance() {
    if (entered || !modelReady || !active) return;
    entered = true;

    if (reduced || !hasGSAP) {
      mount.style.opacity = "0.55";
      modelRoot.scale.setScalar(finalScale);
      modelRoot.rotation.x = TILT;
      fitCamera(modelRoot, FIT_MARGIN);
      return;
    }

    setEntranceStart();

    modelRoot.scale.setScalar(finalScale);
    modelRoot.rotation.x = TILT;
    fitCamera(modelRoot, FIT_MARGIN);
    const toPos = camHome.clone();
    const toLook = lookTarget.clone();

    setEntranceStart();

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(mount, { opacity: 0.55, duration: 1.15 }, 0)
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

  function stop() {
    active = false;
    cancelAnimationFrame(raf);
    if (hasGSAP) gsap.to(mount, { opacity: 0, duration: 0.35 });
  }

  function resize() {
    if (!renderer || !camera) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (modelRoot && entered) fitCamera(modelRoot, FIT_MARGIN);
    else if (modelRoot) setEntranceStart();
  }

  function loop() {
    if (!active) return;
    raf = requestAnimationFrame(loop);
    if (wheel && active) {
      const t = performance.now() * 0.001;
      const roll = 0.018 + Math.sin(t * 1.4) * 0.008;
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
