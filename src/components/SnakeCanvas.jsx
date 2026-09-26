import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Color themes for Snake Skins
export const SNAKE_SKINS = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    headColor: 0x00f2fe,
    bodyColor: 0x00c49f,
    eyeColor: 0xffffff,
    glowColor: 0x00f2fe,
    metalness: 0.8,
    roughness: 0.2,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Dragon',
    headColor: 0x10b981,
    bodyColor: 0x047857,
    eyeColor: 0xfbbf24,
    glowColor: 0x34d399,
    metalness: 0.6,
    roughness: 0.3,
  },
  gold: {
    id: 'gold',
    name: 'Golden Viper',
    headColor: 0xffd700,
    bodyColor: 0xd97706,
    eyeColor: 0xffffff,
    glowColor: 0xffb703,
    metalness: 0.9,
    roughness: 0.1,
  },
  palestine: {
    id: 'palestine',
    name: 'Hero Tricolor',
    headColor: 0xe11d48, // Red head
    bodyColor: 0x15803d, // Green body
    eyeColor: 0xffffff,
    glowColor: 0xffffff,
    metalness: 0.5,
    roughness: 0.3,
  },
  magma: {
    id: 'magma',
    name: 'Magma Blaze',
    headColor: 0xff3b30,
    bodyColor: 0x991b1b,
    eyeColor: 0xfacc15,
    glowColor: 0xff4500,
    metalness: 0.7,
    roughness: 0.2,
  }
};

export const FOOD_THEMES = {
  apple: { id: 'apple', name: 'Ruby Apple', color: 0xff0055 },
  golden: { id: 'golden', name: 'Golden Fruit', color: 0xffb703 },
  virus: { id: 'virus', name: 'Virus Spore', color: 0x8b5cf6, texture: '/assets/virus_1.png' },
  palestine: { id: 'palestine', name: 'Emblem Star', color: 0x10b981, texture: '/assets/palestine_flag.png' },
  random: { id: 'random', name: 'Cosmic Mystery', color: 0x00f2fe }
};

export default function SnakeCanvas({
  gridSize = 20,
  snakeBody = [], // Array of [x, y]
  prevSnakeBody = [],
  lastTickTime = 0,
  tickInterval = 210,
  direction = { x: 0, y: -1 },
  food = { x: 10, y: 10, type: 'apple' },
  obstacles = [], // Array of [ox, oy] for stage challenges
  obstacleColor = 0xff0055,
  cameraMode = 'isometric', // 'isometric' | 'perspective' | 'chase' | 'topdown'
  skin = 'cyber',
  foodTheme = 'apple',
  isGameOver = false,
  isPaused = false,
  isStarted = false,
  onEatParticleTrigger = 0,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  // Snake mesh pooling & references
  const snakeGroupRef = useRef(new THREE.Group());
  const headMeshRef = useRef(null);
  const bodyMeshesRef = useRef([]);
  const foodGroupRef = useRef(new THREE.Group());
  const obstacleGroupRef = useRef(new THREE.Group());
  const particleGroupRef = useRef(new THREE.Group());
  const headLightRef = useRef(null);
  const foodLightRef = useRef(null);

  // Real-time animation states for 60/120fps smooth interpolation
  const currentHeadAngleRef = useRef(0);
  const stateRef = useRef({
    snakeBody,
    prevSnakeBody,
    lastTickTime,
    tickInterval,
    direction,
    skin,
    isGameOver,
    isPaused,
    isStarted,
    cameraMode,
    gridSize,
  });

  // Always keep stateRef up-to-date synchronously
  stateRef.current = {
    snakeBody,
    prevSnakeBody,
    lastTickTime,
    tickInterval,
    direction,
    skin,
    isGameOver,
    isPaused,
    isStarted,
    cameraMode,
    gridSize,
  };

  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const texturesRef = useRef({});

  // Helper to convert grid coordinates to 3D arena coordinates
  const to3D = (gx, gy, height = 0.5) => {
    const half = (gridSize - 1) / 2;
    return new THREE.Vector3(gx - half, height, gy - half);
  };

  // 1. Initialize Scene, Lights, Floor, Renderer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070913);
    scene.fog = new THREE.FogExp2(0x070913, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    setStaticCamera(camera, cameraMode, gridSize);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Preload Textures
    const textureLoader = new THREE.TextureLoader();
    ['/assets/virus_1.png', '/assets/virus_2.png', '/assets/palestine_flag.png', '/assets/golden_apple.jpg'].forEach(url => {
      textureLoader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        texturesRef.current[url] = tex;
      }, undefined, () => {});
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0x334155, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    const d = gridSize * 0.8;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Dynamic point light for snake head
    const headLight = new THREE.PointLight(0x00f2fe, 3.5, 9, 1.4);
    headLight.position.set(0, 1.8, 0);
    scene.add(headLight);
    headLightRef.current = headLight;

    // Dynamic point light for food
    const foodLight = new THREE.PointLight(0xff0055, 3.0, 7, 1.4);
    foodLight.position.set(0, 1.5, 0);
    scene.add(foodLight);
    foodLightRef.current = foodLight;

    // Arena Environment (Floor, Grid, Boundary Laser Posts)
    const arenaGroup = createArena(gridSize);
    scene.add(arenaGroup);

    // Background Starfield
    const starfield = createStarfield(600);
    scene.add(starfield);

    // Add Groups to Scene
    scene.add(snakeGroupRef.current);
    scene.add(foodGroupRef.current);
    scene.add(obstacleGroupRef.current);
    scene.add(particleGroupRef.current);

    // Resize & Orientation Listener for Mobile Screens
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (stateRef.current.cameraMode !== 'chase') {
        setStaticCamera(cameraRef.current, stateRef.current.cameraMode, stateRef.current.gridSize);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 60/120 FPS Real-time Render & Interpolation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const curState = stateRef.current;

      // 1. Calculate ultra-smooth interpolation fraction (0.0 -> 1.0)
      let progress = 1.0;
      if (curState.isStarted && !curState.isPaused && !curState.isGameOver && curState.lastTickTime > 0) {
        const elapsed = performance.now() - curState.lastTickTime;
        progress = Math.min(Math.max(elapsed / curState.tickInterval, 0.0), 1.0);
      }

      // 2. Smoothly update Snake Head & Segments every single frame!
      updateSnakeInterpolation(progress, delta, time, curState);

      // 3. Animate Food (Gentle floating bob & spin)
      if (foodGroupRef.current) {
        foodGroupRef.current.rotation.y += delta * 1.6;
        foodGroupRef.current.position.y = 0.5 + Math.sin(time * 3.5) * 0.14;
      }

      // 4. Animate Obstacles (beacon spin & hover)
      if (obstacleGroupRef.current) {
        obstacleGroupRef.current.children.forEach((obs, idx) => {
          if (obs.children[0]) {
            obs.children[0].rotation.y += delta * 2.2;
            obs.children[0].position.y = 0.48 + Math.sin(time * 3.5 + idx) * 0.03;
          }
        });
      }

      // 5. Animate Starfield slowly
      if (starfield) {
        starfield.rotation.y += delta * 0.02;
      }

      // 6. Update Floating Particles
      updateParticles(delta);

      // 6. Camera Follow in Chase Mode (with mobile aspect ratio support)
      if (curState.cameraMode === 'chase' && headMeshRef.current && cameraRef.current) {
        const headPos = headMeshRef.current.position;
        const aspect = cameraRef.current.aspect || 1;
        const mobileComp = aspect < 1.0 ? Math.max(1.0, 0.92 / aspect) : 1.0;
        const dist = curState.gridSize * 1.05 * mobileComp;
        const targetCamPos = new THREE.Vector3(
          headPos.x * 0.75,
          dist * 0.65,
          headPos.z + dist * 0.55
        );
        cameraRef.current.position.lerp(targetCamPos, 0.08);
        cameraRef.current.lookAt(headPos.x, 0.5, headPos.z);
      }

      // 7. Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [gridSize]);

  // Smooth Interpolation Function for Snake Mesh
  const updateSnakeInterpolation = (alpha, delta, time, curState) => {
    const { snakeBody: body, prevSnakeBody: prevBody, skin: activeSkin, direction: curDir } = curState;
    if (!body || body.length === 0) return;

    const currentSkin = SNAKE_SKINS[activeSkin] || SNAKE_SKINS.cyber;

    // Ensure Head Mesh exists
    if (!headMeshRef.current) {
      headMeshRef.current = createHeadMesh(currentSkin);
      snakeGroupRef.current.add(headMeshRef.current);
    }
    const headMesh = headMeshRef.current;

    // Interpolate Head Position
    const headCurr = body[0];
    const headPrev = (prevBody && prevBody[0]) ? prevBody[0] : headCurr;

    // Handle wrap-around gracefully (prevent flying across entire map)
    const prevAdjX = getAdjustedCoord(headPrev[0], headCurr[0], gridSize);
    const prevAdjY = getAdjustedCoord(headPrev[1], headCurr[1], gridSize);

    const prevHead3D = to3D(prevAdjX, prevAdjY, 0.5);
    const currHead3D = to3D(headCurr[0], headCurr[1], 0.5);

    const head3D = new THREE.Vector3().lerpVectors(prevHead3D, currHead3D, alpha);
    headMesh.position.copy(head3D);

    // Update dynamic head light
    if (headLightRef.current) {
      headLightRef.current.position.set(head3D.x, head3D.y + 0.8, head3D.z);
      headLightRef.current.color.setHex(currentSkin.glowColor);
    }

    // Smooth Head Rotation towards movement direction
    let targetAngle = 0;
    if (curDir.x === 1) targetAngle = Math.PI / 2;
    else if (curDir.x === -1) targetAngle = -Math.PI / 2;
    else if (curDir.y === 1) targetAngle = 0;
    else if (curDir.y === -1) targetAngle = Math.PI;

    // Normalize shortest turn angle
    let angleDiff = targetAngle - currentHeadAngleRef.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentHeadAngleRef.current += angleDiff * Math.min(delta * 22, 1.0);
    headMesh.rotation.y = currentHeadAngleRef.current;

    // Bank / tilt head slightly when turning for dynamic motion
    headMesh.rotation.z = -angleDiff * 0.35;

    // Manage Body Segment Meshes Pool
    const bodyMeshes = bodyMeshesRef.current;
    const neededSegments = body.length - 1;

    // Add extra segments if snake grew
    while (bodyMeshes.length < neededSegments) {
      const idx = bodyMeshes.length + 1;
      const progress = idx / Math.max(body.length, 1);
      const radius = THREE.MathUtils.lerp(0.42, 0.22, progress);

      const segGeo = new THREE.SphereGeometry(radius, 16, 16);
      segGeo.scale(1.0, 0.85, 1.0);

      const bodyColor = (activeSkin === 'palestine' && idx % 2 === 0) ? 0xffffff : currentSkin.bodyColor;
      const segMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: currentSkin.roughness + 0.1,
        metalness: currentSkin.metalness,
        emissive: bodyColor,
        emissiveIntensity: 0.18,
      });

      const segMesh = new THREE.Mesh(segGeo, segMat);
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      snakeGroupRef.current.add(segMesh);
      bodyMeshes.push(segMesh);
    }

    // Remove excess segments if length decreased (on restart)
    while (bodyMeshes.length > neededSegments) {
      const seg = bodyMeshes.pop();
      snakeGroupRef.current.remove(seg);
      if (seg.geometry) seg.geometry.dispose();
      if (seg.material) seg.material.dispose();
    }

    // Interpolate every body segment with organic slither wave!
    for (let i = 1; i < body.length; i++) {
      const segMesh = bodyMeshes[i - 1];
      if (!segMesh) continue;

      const segCurr = body[i];
      const segPrev = (prevBody && prevBody[i]) ? prevBody[i] : segCurr;

      const adjX = getAdjustedCoord(segPrev[0], segCurr[0], gridSize);
      const adjY = getAdjustedCoord(segPrev[1], segCurr[1], gridSize);

      const pPrev = to3D(adjX, adjY, 0.48);
      const pCurr = to3D(segCurr[0], segCurr[1], 0.48);

      const segPos = new THREE.Vector3().lerpVectors(pPrev, pCurr, alpha);

      // Fluid slithering wave animation across segments
      const wave = Math.sin((time * 8.0) - (i * 0.65)) * 0.055;
      segPos.x += wave * (1 - (i / body.length) * 0.5);

      segMesh.position.copy(segPos);
    }
  };

  // Helper for portal wrap-around interpolation
  const getAdjustedCoord = (prev, curr, size) => {
    if (curr === 0 && prev === size - 1) return -1;
    if (curr === size - 1 && prev === 0) return size;
    return prev;
  };

  // Create Head Mesh
  const createHeadMesh = (skinObj) => {
    const headGeo = new THREE.SphereGeometry(0.48, 20, 20);
    headGeo.scale(1.0, 0.75, 1.25);

    const headMat = new THREE.MeshStandardMaterial({
      color: skinObj.headColor,
      roughness: skinObj.roughness,
      metalness: skinObj.metalness,
      emissive: skinObj.headColor,
      emissiveIntensity: 0.3,
    });

    const mesh = new THREE.Mesh(headGeo, headMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: skinObj.eyeColor,
      emissive: skinObj.glowColor,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.24, 0.18, 0.32);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.24, 0.18, 0.32);
    mesh.add(leftEye);
    mesh.add(rightEye);

    return mesh;
  };

  // Update Materials when Skin Changes
  useEffect(() => {
    const currentSkin = SNAKE_SKINS[skin] || SNAKE_SKINS.cyber;

    if (headMeshRef.current) {
      headMeshRef.current.material.color.setHex(currentSkin.headColor);
      headMeshRef.current.material.emissive.setHex(currentSkin.headColor);
      headMeshRef.current.material.roughness = currentSkin.roughness;
      headMeshRef.current.material.metalness = currentSkin.metalness;

      // Update eyes
      headMeshRef.current.children.forEach(eye => {
        if (eye.material) {
          eye.material.color.setHex(currentSkin.eyeColor);
          eye.material.emissive.setHex(currentSkin.glowColor);
        }
      });
    }

    bodyMeshesRef.current.forEach((seg, idx) => {
      const segColor = (skin === 'palestine' && (idx + 1) % 2 === 0) ? 0xffffff : currentSkin.bodyColor;
      seg.material.color.setHex(segColor);
      seg.material.emissive.setHex(segColor);
      seg.material.roughness = currentSkin.roughness + 0.1;
      seg.material.metalness = currentSkin.metalness;
    });
  }, [skin]);

  // Static Camera Position updates with mobile portrait aspect ratio compensation
  const setStaticCamera = (camera, mode, gSize) => {
    if (!camera) return;
    const aspect = camera.aspect || 1;
    // On narrow / portrait mobile screens, expand camera distance so the entire 3D arena fits
    const mobileCompensation = aspect < 1.0 ? Math.max(1.0, 0.95 / aspect) : 1.0;
    const dist = gSize * 1.05 * mobileCompensation;

    if (mode === 'isometric') {
      camera.position.set(dist * 0.75, dist * 1.1, dist * 0.85);
      camera.lookAt(0, 0, 0);
    } else if (mode === 'perspective') {
      camera.position.set(0, dist * 0.8, dist * 0.95);
      camera.lookAt(0, -0.5, 0);
    } else if (mode === 'topdown') {
      camera.position.set(0, dist * 1.35, 0.001);
      camera.lookAt(0, 0, 0);
    }
  };

  useEffect(() => {
    if (cameraRef.current && cameraMode !== 'chase') {
      setStaticCamera(cameraRef.current, cameraMode, gridSize);
    }
  }, [cameraMode, gridSize]);

  // Update Food 3D Mesh
  useEffect(() => {
    const group = foodGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    if (!food) return;

    const foodPos3D = to3D(food.x, food.y, 0.5);
    group.position.set(foodPos3D.x, foodPos3D.y, foodPos3D.z);

    const activeTheme = food.type || foodTheme || 'apple';
    const isGolden = activeTheme === 'golden';
    const isVirus = activeTheme === 'virus';
    const isPalestine = activeTheme === 'palestine';

    // Update food light
    if (foodLightRef.current) {
      foodLightRef.current.position.set(foodPos3D.x, foodPos3D.y + 1.2, foodPos3D.z);
      if (isGolden) foodLightRef.current.color.setHex(0xffb703);
      else if (isVirus) foodLightRef.current.color.setHex(0xa855f7);
      else if (isPalestine) foodLightRef.current.color.setHex(0x10b981);
      else foodLightRef.current.color.setHex(0xff0055);
    }

    if (isGolden) {
      const appleGeo = new THREE.SphereGeometry(0.42, 24, 24);
      appleGeo.scale(1.0, 0.95, 1.0);
      const appleMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.45,
        metalness: 0.9,
        roughness: 0.15,
      });
      const appleMesh = new THREE.Mesh(appleGeo, appleMat);
      appleMesh.castShadow = true;

      const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(0, 0.44, 0);
      stemMesh.rotation.z = 0.2;
      appleMesh.add(stemMesh);

      const leafGeo = new THREE.SphereGeometry(0.12, 10, 10);
      leafGeo.scale(1.5, 0.2, 0.8);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(0.12, 0.48, 0);
      leafMesh.rotation.z = -0.3;
      appleMesh.add(leafMesh);

      const ringGeo = new THREE.TorusGeometry(0.58, 0.02, 12, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.8 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      appleMesh.add(ringMesh);

      group.add(appleMesh);

    } else if (isVirus) {
      const coreGeo = new THREE.IcosahedronGeometry(0.38, 2);
      const tex = texturesRef.current['/assets/virus_1.png'];
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        map: tex || null,
      });
      const virusMesh = new THREE.Mesh(coreGeo, coreMat);
      virusMesh.castShadow = true;

      const spikeGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0xc084fc });
      for (let i = 0; i < 8; i++) {
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        const phi = (i / 8) * Math.PI * 2;
        spike.position.set(Math.cos(phi) * 0.4, Math.sin(phi) * 0.4, 0);
        spike.rotation.z = phi - Math.PI / 2;
        virusMesh.add(spike);
      }
      group.add(virusMesh);

    } else if (isPalestine) {
      const badgeGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 6);
      const tex = texturesRef.current['/assets/palestine_flag.png'];
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: tex || null, color: 0xffffff, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0x111827 }),
      ];
      const badgeMesh = new THREE.Mesh(badgeGeo, materials);
      badgeMesh.rotation.x = Math.PI / 2;
      badgeMesh.castShadow = true;
      group.add(badgeMesh);

    } else {
      const appleGeo = new THREE.SphereGeometry(0.4, 24, 24);
      appleGeo.scale(1.0, 0.92, 1.0);
      const appleMat = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        emissive: 0xd90429,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.3,
      });
      const appleMesh = new THREE.Mesh(appleGeo, appleMat);
      appleMesh.castShadow = true;

      const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(0, 0.42, 0);
      appleMesh.add(stemMesh);

      const leafGeo = new THREE.SphereGeometry(0.1, 8, 8);
      leafGeo.scale(1.6, 0.2, 0.7);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(0.1, 0.45, 0);
      leafMesh.rotation.z = -0.4;
      appleMesh.add(leafMesh);

      group.add(appleMesh);
    }
  }, [food, foodTheme, gridSize]);

  // Update Obstacles 3D Meshes for Stage Challenges
  useEffect(() => {
    const group = obstacleGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    if (!obstacles || obstacles.length === 0) return;

    const obsGeo = new THREE.BoxGeometry(0.86, 0.75, 0.86);
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0x0a101f,
      emissive: obstacleColor || 0xff0055,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.25,
    });

    const beaconGeo = new THREE.OctahedronGeometry(0.18, 0);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    obstacles.forEach(([ox, oy]) => {
      const mesh = new THREE.Mesh(obsGeo, obsMat.clone());
      const p3D = to3D(ox, oy, 0.38);
      mesh.position.copy(p3D);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Glowing top beacon
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 0.48, 0);
      mesh.add(beacon);

      group.add(mesh);
    });
  }, [obstacles, obstacleColor, gridSize]);

  // Particle Explosions
  useEffect(() => {
    if (onEatParticleTrigger > 0 && food) {
      spawnEatParticles(to3D(food.x, food.y, 0.6), food.type === 'golden' ? 0xffd700 : 0x00f2fe);
    }
  }, [onEatParticleTrigger]);

  useEffect(() => {
    if (isGameOver && snakeBody && snakeBody[0]) {
      spawnDeathExplosion(to3D(snakeBody[0][0], snakeBody[0][1], 0.6));
    }
  }, [isGameOver]);

  const spawnEatParticles = (pos, colorHex) => {
    const pCount = 28;
    const pGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });

    for (let i = 0; i < pCount; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat.clone());
      mesh.position.copy(pos);

      const speed = 2.5 + Math.random() * 4.0;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.2) * Math.PI;

      const vel = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.abs(Math.sin(elevation)) * speed + 1.5,
        Math.sin(angle) * Math.cos(elevation) * speed
      );

      particlesRef.current.push({
        mesh,
        velocity: vel,
        life: 0.8,
        maxLife: 0.8,
      });

      particleGroupRef.current.add(mesh);
    }
  };

  const spawnDeathExplosion = (pos) => {
    const pCount = 60;
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff0055,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    for (let i = 0; i < pCount; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.copy(pos);

      const speed = 4.0 + Math.random() * 6.0;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        Math.random() * speed + 2.0,
        (Math.random() - 0.5) * speed
      );

      particlesRef.current.push({
        mesh,
        velocity: vel,
        life: 1.5,
        maxLife: 1.5,
      });

      particleGroupRef.current.add(mesh);
    }
  };

  const updateParticles = (delta) => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.life -= delta;

      if (p.life <= 0) {
        particleGroupRef.current.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        list.splice(i, 1);
        continue;
      }

      p.mesh.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 9.8 * delta;

      if (p.mesh.position.y < 0.1) {
        p.mesh.position.y = 0.1;
        p.velocity.y *= -0.5;
      }

      if (p.mesh.material.opacity !== undefined) {
        p.mesh.material.opacity = p.life / p.maxLife;
      }
    }
  };

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
        touchAction: 'none',
      }}
    />
  );
}

// Helper: Create 3D Cyber Arena
function createArena(gridSize) {
  const arena = new THREE.Group();
  const half = gridSize / 2;

  // Dark Reflective Floor
  const floorGeo = new THREE.PlaneGeometry(gridSize + 4, gridSize + 4);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x090d1a,
    roughness: 0.15,
    metalness: 0.85,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.01;
  floorMesh.receiveShadow = true;
  arena.add(floorMesh);

  // Cyan Grid
  const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x00f2fe, 0x1e293b);
  gridHelper.position.y = 0.01;
  arena.add(gridHelper);

  // Neon Laser Boundary
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00c49f,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.2,
  });

  const borderHeight = 0.4;
  const borderThickness = 0.15;

  const horizGeo = new THREE.BoxGeometry(gridSize + borderThickness, borderHeight, borderThickness);
  const vertGeo = new THREE.BoxGeometry(borderThickness, borderHeight, gridSize + borderThickness);

  const north = new THREE.Mesh(horizGeo, wallMat);
  north.position.set(0, borderHeight / 2, -half);
  north.castShadow = true;
  north.receiveShadow = true;
  arena.add(north);

  const south = new THREE.Mesh(horizGeo, wallMat);
  south.position.set(0, borderHeight / 2, half);
  south.castShadow = true;
  south.receiveShadow = true;
  arena.add(south);

  const west = new THREE.Mesh(vertGeo, wallMat);
  west.position.set(-half, borderHeight / 2, 0);
  west.castShadow = true;
  west.receiveShadow = true;
  arena.add(west);

  const east = new THREE.Mesh(vertGeo, wallMat);
  east.position.set(half, borderHeight / 2, 0);
  east.castShadow = true;
  east.receiveShadow = true;
  arena.add(east);

  // 4 Corner Laser Pylons
  const pylonGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16);
  const pylonMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00f2fe,
    emissiveIntensity: 1.2,
  });

  const corners = [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half]
  ];
  corners.forEach(([cx, cz]) => {
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(cx, 0.6, cz);
    pylon.castShadow = true;
    arena.add(pylon);
  });

  return arena;
}

// Helper: Atmospheric Space Starfield
function createStarfield(count = 500) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorOptions = [
    new THREE.Color(0x00f2fe),
    new THREE.Color(0x00ff87),
    new THREE.Color(0xffb703),
    new THREE.Color(0xffffff)
  ];

  for (let i = 0; i < count; i++) {
    const radius = 35 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(radius * Math.sin(phi) * Math.sin(theta)) + 2;
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  return new THREE.Points(geo, mat);
}
