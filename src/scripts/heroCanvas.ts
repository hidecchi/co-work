import * as THREE from "three";

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

  const imageUrl = canvas.dataset.src ?? "/sample.jpg";
  const distance = 5;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = distance;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null =
    null;
  let texture: THREE.Texture | null = null;

  const render = () => {
    renderer.render(scene, camera);
  };

  const resize = () => {
    const { width, height } = wrap.getBoundingClientRect();
    const renderHeight = height * 0.99;
    if (width === 0 || renderHeight === 0) return;

    renderer.setSize(width, renderHeight, false);
    camera.aspect = width / renderHeight;
    camera.updateProjectionMatrix();

    if (!mesh || !texture?.image) return;

    const image = texture.image as HTMLImageElement;
    const view = getVisibleSize(camera, distance);
    const [planeWidth, planeHeight] = getCoverSize(
      image.width / image.height,
      view.width / view.height,
      view.width,
      view.height,
    );

    mesh.scale.set(planeWidth, planeHeight, 1);
    render();
  };

  const loader = new THREE.TextureLoader();
  loader.load(
    imageUrl,
    (loadedTexture) => {
      texture = loadedTexture;
      texture.colorSpace = THREE.SRGBColorSpace;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      scene.add(mesh);
      resize();
    },
    undefined,
    () => {
      canvas.classList.add("hero__canvas--error");
    },
  );

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  resize();

  return () => {
    resizeObserver.disconnect();
    texture?.dispose();
    mesh?.geometry.dispose();
    mesh?.material.dispose();
    renderer.dispose();
  };
}
