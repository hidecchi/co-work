import * as THREE from "three";

type Viewport = { width: number; height: number };

const START_SCALE = 0.12;
const START_OPACITY = 0.75;
const SCALE_SPEED = 0.061;
const FADE_RATE = 0.9;
const ROTATION_SPEED = 0;
const BRUSH_SIZE = 0.875;

export class Ripple {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  material: THREE.MeshBasicMaterial;
  isUsed = false;

  private geometry: THREE.PlaneGeometry;

  constructor(tex: THREE.Texture, vp: Viewport) {
    const width = (vp.width / 10) * BRUSH_SIZE;
    const height = (vp.height / 10) * BRUSH_SIZE;
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: tex,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
  }

  resize(vp: Viewport) {
    const width = (vp.width / 10) * BRUSH_SIZE;
    const height = (vp.height / 10) * BRUSH_SIZE;
    this.geometry.dispose();
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh.geometry = this.geometry;
  }

  start(mouse: { x: number; y: number }) {
    const { mesh, material } = this;

    this.isUsed = true;
    mesh.visible = true;
    mesh.position.x = mouse.x;
    mesh.position.y = mouse.y;
    mesh.scale.set(START_SCALE, START_SCALE, 1);
    material.opacity = START_OPACITY;
    mesh.rotation.z = 2 * Math.PI * Math.random();
  }

  tick() {
    if (!this.isUsed) return;

    const { mesh, material } = this;
    const nextScale = mesh.scale.x + SCALE_SPEED;
    mesh.scale.set(nextScale, nextScale, 1);
    material.opacity *= FADE_RATE;
    mesh.rotation.z += ROTATION_SPEED;

    if (material.opacity <= 0.02) {
      this.isUsed = false;
      mesh.visible = false;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
