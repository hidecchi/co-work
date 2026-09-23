import * as THREE from "three";
import fragmentShader from "../sample/fragment.glsl?raw";
import vertexShader from "../sample/vertex.glsl?raw";
import { HERO_MOBILE_IMAGE_BREAKPOINT } from "../config/heroCanvas";
import { Ripple } from "./heroRipple";

const RIPPLE_COUNT = 50;
const SPAWN_INTERVAL = 2;
const POINTER_STOP_DELAY = 80;
const MOBILE_IMAGE_BREAKPOINT = HERO_MOBILE_IMAGE_BREAKPOINT;

function getHeroImageUrl(canvas: HTMLCanvasElement) {
  const desktop = canvas.dataset.src ?? "/sample.jpg";
  const mobile = canvas.dataset.srcSp ?? "/sample-sp.jpg";
  return window.innerWidth < MOBILE_IMAGE_BREAKPOINT ? mobile : desktop;
}

function getViewport(canvasWidth: number, canvasHeight: number) {
  return {
    width: Math.max(64, Math.round(canvasWidth / 5)),
    height: Math.max(64, Math.round(canvasHeight / 5)),
  };
}

function isRippleEnabled() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getMapPos(
  event: MouseEvent,
  rect: DOMRect,
  vpWidth: number,
  vpHeight: number,
) {
  return {
    x: ((event.clientX - rect.left) / rect.width - 0.5) * vpWidth,
    y: (0.5 - (event.clientY - rect.top) / rect.height) * vpHeight,
  };
}

function getVisibleSize(camera: THREE.PerspectiveCamera, distance: number) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * distance;
  return { width: height * camera.aspect, height };
}

function getCoverSize(
  imageAspect: number,
  viewAspect: number,
  viewWidth: number,
  viewHeight: number,
) {
  if (viewAspect > imageAspect) {
    return [viewWidth, viewWidth / imageAspect] as const;
  }

  return [viewHeight * imageAspect, viewHeight] as const;
}

export function initHeroCanvas(
  selector = ".hero__canvas",
  wrapSelector = ".hero__image-wrap",
) {
  const canvas = document.querySelector<HTMLCanvasElement>(selector);
  const wrap = document.querySelector<HTMLElement>(wrapSelector);
  if (!canvas || !wrap) return () => {};

  const imageUrl = getHeroImageUrl(canvas);
  let currentImageUrl = imageUrl;
  const distance = 5;
  const rippleEnabled = isRippleEnabled();
  let animationId = 0;
  let mouseTick = 0;
  let mouseMoving = false;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  let vp = getViewport(1, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = distance;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const rippleScene = new THREE.Scene();
  const rippleCamera = new THREE.OrthographicCamera(
    -vp.width / 2,
    vp.width / 2,
    vp.height / 2,
    -vp.height / 2,
    0,
    2,
  );
  rippleCamera.position.z = 1;

  const rippleTarget = new THREE.WebGLRenderTarget(vp.width, vp.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });

  const ripples: Ripple[] = [];
  let displayMesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.ShaderMaterial
  > | null = null;
  let imageTexture: THREE.Texture | null = null;
  let lastMouseEvent: MouseEvent | null = null;

  const updateRippleCamera = () => {
    rippleCamera.left = -vp.width / 2;
    rippleCamera.right = vp.width / 2;
    rippleCamera.top = vp.height / 2;
    rippleCamera.bottom = -vp.height / 2;
    rippleCamera.updateProjectionMatrix();
    rippleTarget.setSize(vp.width, vp.height);
    for (const ripple of ripples) {
      ripple.resize(vp);
    }
  };

  const renderRippleTarget = () => {
    renderer.setRenderTarget(rippleTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(rippleScene, rippleCamera);
    renderer.setRenderTarget(null);
  };

  const render = () => {
    if (!displayMesh) return;

    mouseTick += 1;

    if (rippleEnabled && mouseMoving && mouseTick % SPAWN_INTERVAL === 0) {
      const ripple = ripples.find((item) => !item.isUsed);
      if (ripple && lastMouseEvent) {
        const rect = canvas.getBoundingClientRect();
        ripple.start(getMapPos(lastMouseEvent, rect, vp.width, vp.height));
      }
    }

    if (rippleEnabled) {
      for (const ripple of ripples) {
        ripple.tick();
      }
      renderRippleTarget();
      displayMesh.material.uniforms.texRipple.value = rippleTarget.texture;
    }

    renderer.render(scene, camera);
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    render();
  };

  const resize = () => {
    const { width, height } = wrap.getBoundingClientRect();
    const renderHeight = height * 0.99;
    if (width === 0 || renderHeight === 0) return;

    renderer.setSize(width, renderHeight, false);
    camera.aspect = width / renderHeight;
    camera.updateProjectionMatrix();

    vp = getViewport(width, renderHeight);
    updateRippleCamera();

    if (!displayMesh || !imageTexture?.image) return;

    const image = imageTexture.image as HTMLImageElement;
    const view = getVisibleSize(camera, distance);
    const [planeWidth, planeHeight] = getCoverSize(
      image.width / image.height,
      view.width / view.height,
      view.width,
      view.height,
    );

    displayMesh.scale.set(planeWidth, planeHeight, 1);
  };

  const onMouseMove = (event: MouseEvent) => {
    const moved =
      Math.hypot(event.clientX - lastMouseX, event.clientY - lastMouseY) > 1;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    lastMouseEvent = event;

    if (!moved) return;

    mouseMoving = true;

    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      mouseMoving = false;
      stopTimer = null;
    }, POINTER_STOP_DELAY);
  };

  const onMouseLeave = () => {
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = null;
    mouseMoving = false;
    lastMouseEvent = null;
  };

  const loader = new THREE.TextureLoader();

  const applyImageTexture = (texture: THREE.Texture) => {
    imageTexture?.dispose();
    imageTexture = texture;
    imageTexture.colorSpace = THREE.SRGBColorSpace;

    if (displayMesh) {
      displayMesh.material.uniforms.tDiffuse.value = imageTexture;
      resize();
      return;
    }

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: imageTexture },
        texRipple: { value: rippleTarget.texture },
      },
      toneMapped: false,
    });

    displayMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      displayMaterial,
    );
    scene.add(displayMesh);
    resize();

    if (!rippleEnabled) {
      animate();
      return;
    }

    loader.load("/ripple.png", (rippleTexture) => {
      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const ripple = new Ripple(rippleTexture, vp);
        rippleScene.add(ripple.mesh);
        ripples.push(ripple);
      }

      resize();
      animate();
    });
  };

  const loadHeroImage = (url: string) => {
    loader.load(url, applyImageTexture, undefined, () =>
      canvas.classList.add("hero__canvas--error"),
    );
  };

  const onViewportChange = () => {
    const nextUrl = getHeroImageUrl(canvas);
    if (nextUrl === currentImageUrl) return;
    currentImageUrl = nextUrl;
    loadHeroImage(nextUrl);
  };

  loadHeroImage(imageUrl);

  const mobileMediaQuery = window.matchMedia(
    `(max-width: ${MOBILE_IMAGE_BREAKPOINT - 1}px)`,
  );
  mobileMediaQuery.addEventListener("change", onViewportChange);

  if (rippleEnabled) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  resize();

  return () => {
    if (stopTimer) clearTimeout(stopTimer);
    mobileMediaQuery.removeEventListener("change", onViewportChange);
    cancelAnimationFrame(animationId);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseleave", onMouseLeave);
    resizeObserver.disconnect();
    imageTexture?.dispose();
    for (const ripple of ripples) {
      ripple.dispose();
    }
    displayMesh?.geometry.dispose();
    displayMesh?.material.dispose();
    rippleTarget.dispose();
    renderer.dispose();
  };
}
