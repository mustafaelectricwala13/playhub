import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';

export interface StackEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onComboUpdate: (combo: number) => void;
  onCoinUpdate: (coins: number) => void;
  onGameOver: (finalScore: number, coinsEarned: number) => void;
}

interface FallingPiece {
  mesh: THREE.Mesh;
  vy: number;
  rotX: number;
  rotZ: number;
}

export class StackEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: StackEngineCallbacks;

  // Game dimensions
  private readonly blockHeight = 0.55;
  private readonly initialSize = 3.0;

  // Stacking state
  private stack: THREE.Mesh[] = [];
  private fallingPieces: FallingPiece[] = [];
  private currentBlock: THREE.Mesh | null = null;

  // Motion properties
  private movingAxis: 'x' | 'z' = 'x';
  private direction: number = 1;
  private speed: number = 3.6;
  private prevPosition = { x: 0, z: 0 };
  private prevSize = { width: 3.0, depth: 3.0 };

  // Gameplay
  private score: number = 0;
  private combo: number = 0;
  private coinsEarned: number = 0;
  private isRunning: boolean = false;
  private isGameOver: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Lighting & Materials
  private baseHue: number = 200;
  private dirLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  constructor(container: HTMLElement, callbacks: StackEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Scene
    this.scene = new THREE.Scene();

    // Camera (Isometric Orthographic)
    const aspect = container.clientWidth / container.clientHeight;
    const d = 4.2;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      0.1,
      1000
    );
    this.camera.position.set(5, 6, 5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.reset();
  }

  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    this.dirLight.position.set(6, 12, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 30;
    const d = 6;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);
  }

  private getBlockColor(level: number): THREE.Color {
    // Smooth HSL color transition
    const hue = (this.baseHue + level * 7) % 360;
    const color = new THREE.Color();
    color.setHSL(hue / 360, 0.85, 0.55);
    return color;
  }

  public handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    const d = 4.2;

    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public reset() {
    // Clear old meshes
    for (const mesh of this.stack) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    for (const p of this.fallingPieces) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    }
    if (this.currentBlock) {
      this.scene.remove(this.currentBlock);
      this.currentBlock.geometry.dispose();
      (this.currentBlock.material as THREE.Material).dispose();
      this.currentBlock = null;
    }

    this.stack = [];
    this.fallingPieces = [];
    this.score = 0;
    this.combo = 0;
    this.coinsEarned = 0;
    this.isGameOver = false;
    this.speed = 3.6;
    this.baseHue = Math.floor(Math.random() * 360);

    this.prevPosition = { x: 0, z: 0 };
    this.prevSize = { width: this.initialSize, depth: this.initialSize };

    // Reset camera position
    this.camera.position.set(5, 6, 5);
    this.camera.lookAt(0, 0, 0);

    // Create Base Block
    const baseGeo = new THREE.BoxGeometry(this.initialSize, this.blockHeight, this.initialSize);
    const baseMat = new THREE.MeshStandardMaterial({
      color: this.getBlockColor(0),
      roughness: 0.35,
      metalness: 0.1
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0, 0);
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    this.scene.add(baseMesh);
    this.stack.push(baseMesh);

    // Spawn first moving block
    this.spawnNextBlock();

    this.callbacks.onScoreUpdate(0);
    this.callbacks.onComboUpdate(0);
    this.callbacks.onCoinUpdate(0);
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(performance.now());
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private spawnNextBlock() {
    const level = this.stack.length;
    // Alternate moving axis: X or Z
    this.movingAxis = level % 2 === 1 ? 'x' : 'z';
    this.direction = 1;

    const geo = new THREE.BoxGeometry(
      this.prevSize.width,
      this.blockHeight,
      this.prevSize.depth
    );
    const mat = new THREE.MeshStandardMaterial({
      color: this.getBlockColor(level),
      roughness: 0.35,
      metalness: 0.1
    });

    this.currentBlock = new THREE.Mesh(geo, mat);
    this.currentBlock.castShadow = true;
    this.currentBlock.receiveShadow = true;

    const posY = level * this.blockHeight;
    const spawnDist = 4.0;

    if (this.movingAxis === 'x') {
      this.currentBlock.position.set(-spawnDist, posY, this.prevPosition.z);
    } else {
      this.currentBlock.position.set(this.prevPosition.x, posY, -spawnDist);
    }

    this.scene.add(this.currentBlock);
  }

  /**
   * Primary Action: Player taps screen / clicks / hits Spacebar
   */
  public handlePlace(): boolean {
    if (!this.isRunning || this.isGameOver || !this.currentBlock) return false;

    const cur = this.currentBlock;
    const curPos = cur.position;
    const isX = this.movingAxis === 'x';
    const delta = isX ? curPos.x - this.prevPosition.x : curPos.z - this.prevPosition.z;
    const sizeOnAxis = isX ? this.prevSize.width : this.prevSize.depth;
    const absDelta = Math.abs(delta);

    // 1. Perfect Alignment Check (within threshold of ~0.08 units)
    const perfectThreshold = 0.085;

    if (absDelta <= perfectThreshold) {
      // Snaps to perfect position!
      if (isX) {
        curPos.x = this.prevPosition.x;
      } else {
        curPos.z = this.prevPosition.z;
      }

      this.combo++;
      const bonus = 1 + this.combo;
      this.score += bonus;
      this.coinsEarned += 2;

      soundManager.playPerfect(this.combo);
      this.callbacks.onComboUpdate(this.combo);
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onCoinUpdate(this.coinsEarned);

      // Reward: expand slightly if combo >= 5
      if (this.combo >= 5) {
        this.prevSize.width = Math.min(this.initialSize, this.prevSize.width + 0.15);
        this.prevSize.depth = Math.min(this.initialSize, this.prevSize.depth + 0.15);
      }

      this.prevPosition = { x: curPos.x, z: curPos.z };
      this.stack.push(cur);
      this.currentBlock = null;

      // Accelerate slightly
      this.speed = Math.min(6.5, 3.6 + this.score * 0.04);
      this.spawnNextBlock();
      return true;
    }

    // 2. Partial Overlap
    const overlap = sizeOnAxis - absDelta;

    if (overlap > 0) {
      // Successful placement with cut!
      this.combo = 0;
      this.callbacks.onComboUpdate(0);
      this.score += 1;
      this.coinsEarned += 1;
      soundManager.playStackPlace(this.stack.length);
      soundManager.playSlice();

      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onCoinUpdate(this.coinsEarned);

      // New remaining size
      const newWidth = isX ? overlap : this.prevSize.width;
      const newDepth = isX ? this.prevSize.depth : overlap;

      // New remaining center
      const newCenterX = isX ? this.prevPosition.x + delta / 2 : curPos.x;
      const newCenterZ = isX ? curPos.z : this.prevPosition.z + delta / 2;

      // Remove current moving block and replace with exact cut block
      this.scene.remove(cur);
      cur.geometry.dispose();

      const newGeo = new THREE.BoxGeometry(newWidth, this.blockHeight, newDepth);
      const placedMesh = new THREE.Mesh(newGeo, cur.material);
      placedMesh.position.set(newCenterX, curPos.y, newCenterZ);
      placedMesh.castShadow = true;
      placedMesh.receiveShadow = true;
      this.scene.add(placedMesh);
      this.stack.push(placedMesh);

      // Create falling cut piece
      const cutSize = absDelta;
      const cutWidth = isX ? cutSize : newWidth;
      const cutDepth = isX ? newDepth : cutSize;
      const cutOffset = (overlap / 2) + (cutSize / 2);
      const cutCenterX = isX
        ? newCenterX + (delta > 0 ? cutOffset : -cutOffset)
        : newCenterX;
      const cutCenterZ = isX
        ? newCenterZ
        : newCenterZ + (delta > 0 ? cutOffset : -cutOffset);

      const cutGeo = new THREE.BoxGeometry(cutWidth, this.blockHeight, cutDepth);
      const cutMesh = new THREE.Mesh(cutGeo, cur.material);
      cutMesh.position.set(cutCenterX, curPos.y, cutCenterZ);
      cutMesh.castShadow = true;
      this.scene.add(cutMesh);

      this.fallingPieces.push({
        mesh: cutMesh,
        vy: 0,
        rotX: isX ? 0 : (Math.random() - 0.5) * 4,
        rotZ: isX ? (Math.random() - 0.5) * 4 : 0
      });

      this.prevPosition = { x: newCenterX, z: newCenterZ };
      this.prevSize = { width: newWidth, depth: newDepth };
      this.currentBlock = null;

      // Speed progression
      this.speed = Math.min(6.5, 3.6 + this.score * 0.04);
      this.spawnNextBlock();
      return true;
    }

    // 3. Complete Miss -> Game Over!
    this.handleCompleteMiss();
    return false;
  }

  private handleCompleteMiss() {
    this.isGameOver = true;
    soundManager.playGameOver();

    // The whole block falls
    if (this.currentBlock) {
      this.fallingPieces.push({
        mesh: this.currentBlock,
        vy: 0,
        rotX: (Math.random() - 0.5) * 5,
        rotZ: (Math.random() - 0.5) * 5
      });
      this.currentBlock = null;
    }

    setTimeout(() => {
      this.isRunning = false;
      this.callbacks.onGameOver(this.score, this.coinsEarned);
    }, 600);
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.update(dt);
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 1. Move active block back and forth
    if (this.currentBlock && !this.isGameOver) {
      const bound = 4.2;
      const deltaMove = this.direction * this.speed * dt;

      if (this.movingAxis === 'x') {
        this.currentBlock.position.x += deltaMove;
        if (this.currentBlock.position.x >= bound) {
          this.currentBlock.position.x = bound;
          this.direction = -1;
        } else if (this.currentBlock.position.x <= -bound) {
          this.currentBlock.position.x = -bound;
          this.direction = 1;
        }
      } else {
        this.currentBlock.position.z += deltaMove;
        if (this.currentBlock.position.z >= bound) {
          this.currentBlock.position.z = bound;
          this.direction = -1;
        } else if (this.currentBlock.position.z <= -bound) {
          this.currentBlock.position.z = -bound;
          this.direction = 1;
        }
      }
    }

    // 2. Animate falling pieces with gravity & rotation
    const gravity = 18;
    for (let i = this.fallingPieces.length - 1; i >= 0; i--) {
      const p = this.fallingPieces[i];
      p.vy -= gravity * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.rotation.x += p.rotX * dt;
      p.mesh.rotation.z += p.rotZ * dt;

      // Remove when fallen far below
      if (p.mesh.position.y < -10) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.fallingPieces.splice(i, 1);
      }
    }

    // 3. Smooth Camera Follow
    const topY = this.stack.length * this.blockHeight;
    const targetCameraY = topY + 6;
    const targetLookY = topY;

    this.camera.position.y += (targetCameraY - this.camera.position.y) * 4 * dt;
    this.dirLight.position.y += (topY + 12 - this.dirLight.position.y) * 4 * dt;
  }

  public destroy() {
    this.stop();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
