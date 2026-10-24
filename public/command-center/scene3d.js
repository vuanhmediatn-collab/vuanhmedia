/**
 * VAMOPS COMMAND CENTER — SCENE 3D V2.0 ULTRA HIGH-END
 * Mô phỏng Trụ sở Studio Điện ảnh Vũ trụ với Kiến trúc Chi tiết,
 * Ánh sáng PBR chân thực, Đèn Spatula Softbox, Camera Jib, và Bàn làm việc
 */

class VAMOPSScene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.buildings = [];
    this.agents3D = [];
    this.dataPackets = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.clock = new THREE.Clock();
    this.speechBubbles = [];
    this.isAutoRotate = false;
    this.isMeetingMode = false;
    this.workstationDesks = [];
    this.meetingSeats = [];
    this.activeFocus = "overview";
    this.interactiveObjects = [];

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070a12);
    this.scene.fog = new THREE.FogExp2(0x070a12, 0.018);

    // 2. Camera Setup (Isometric Angle)
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(14, 17, 20);

    // 3. Renderer with PBR & Shadow Optimization
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch (e) {
      console.warn("High-performance WebGL failed, retrying default...", e);
      this.renderer = new THREE.WebGLRenderer({ antialias: false });
    }
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 1.5, 0);
      this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
      this.controls.minDistance = 7;
      this.controls.maxDistance = 50;
    }

    // 5. Cinematic Studio Lighting
    this.setupCinematicLighting();

    // 6. Deep Space & Starfield
    this.createDeepSpace();

    // 7. Architectural Orbital Studio Platform
    this.createArchitecturalPlatform();

    // 8. 6 Detailed Architectural Studio Pavilions
    this.createDetailedPavilions();

    // 9. Central War Room Circular Conference Table
    this.createCentralWarRoom();

    // 10. Detailed 3D Robots with Workstations
    this.createDetailedAgentsWithDesks();

    // 11. Data Pipeline Spline Network
    this.setupDataNetwork();

    // 12. Event Handlers
    window.addEventListener("resize", () => this.onWindowResize());
    this.renderer.domElement.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener("click", (e) => this.onClick(e));

    // 12. Start Loop
    this.animate();
  }

  setupCinematicLighting() {
    // Ambient soft fill
    const ambientLight = new THREE.AmbientLight(0x182438, 2.0);
    this.scene.add(ambientLight);

    // Key Light: Golden Sunlight / Studio Key
    const keyLight = new THREE.DirectionalLight(0xfff1db, 2.6);
    keyLight.position.set(20, 32, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 70;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.5;
    this.scene.add(keyLight);

    // Rim Light: Electric Cyan
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
    rimLight.position.set(-22, 15, -20);
    this.scene.add(rimLight);

    // Interior Glow Spotlights for each zone
    const zoneGlows = [
      { color: 0x00f0ff, pos: [0, 5, -1.5] }, // Penthouse
      { color: 0x6366f1, pos: [-6.5, 4.5, -4] }, // Intelligence
      { color: 0xf43f5e, pos: [-6.5, 4.5, 3.5] }, // Creative
      { color: 0xf59e0b, pos: [6.5, 4.5, -4] }, // Critic
      { color: 0x10b981, pos: [6.5, 4.5, 3.5] }, // Production
      { color: 0x38bdf8, pos: [0, 5, 6.5] } // Satellite
    ];

    zoneGlows.forEach((zg) => {
      const pl = new THREE.PointLight(zg.color, 3.8, 14, 1.4);
      pl.position.set(zg.pos[0], zg.pos[1], zg.pos[2]);
      this.scene.add(pl);
    });
  }

  createDeepSpace() {
    // 2-tier Starfield (Micro stars + Bright glowing stars)
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 70 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const tint = Math.random();
      if (tint > 0.75) {
        starColors[i * 3] = 0.0; starColors[i * 3 + 1] = 0.94; starColors[i * 3 + 2] = 1.0;
      } else if (tint > 0.55) {
        starColors[i * 3] = 0.96; starColors[i * 3 + 1] = 0.65; starColors[i * 3 + 2] = 0.1;
      } else {
        starColors[i * 3] = 0.85; starColors[i * 3 + 1] = 0.92; starColors[i * 3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);
  }

  createArchitecturalPlatform() {
    this.platformGroup = new THREE.Group();

    // 1. Polished Obsidian Base Island (Hexagonal Multi-tier)
    const baseShape = new THREE.Shape();
    const hexRadius = 15.2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = hexRadius * Math.cos(angle);
      const y = hexRadius * Math.sin(angle);
      if (i === 0) baseShape.moveTo(x, y);
      else baseShape.lineTo(x, y);
    }
    baseShape.closePath();

    const extrudeSettings = {
      depth: 1.8,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.5,
      bevelThickness: 0.5
    };

    const islandGeo = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
    islandGeo.rotateX(-Math.PI / 2);

    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.25,
      metalness: 0.85
    });

    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.y = -1.8;
    islandMesh.receiveShadow = true;
    this.platformGroup.add(islandMesh);

    // 2. High-Tech Hexagonal Recessed Floor Tiles
    const floorTileGeo = new THREE.CylinderGeometry(14.8, 14.8, 0.1, 6);
    const floorTileMat = new THREE.MeshStandardMaterial({
      color: 0x0f182b,
      roughness: 0.35,
      metalness: 0.75
    });
    const floorTile = new THREE.Mesh(floorTileGeo, floorTileMat);
    floorTile.position.y = 0.05;
    floorTile.receiveShadow = true;
    this.platformGroup.add(floorTile);

    // 3. Grid Helper with Cyan & Slate Lines
    const gridHelper = new THREE.GridHelper(26, 26, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = 0.11;
    this.platformGroup.add(gridHelper);

    // 4. Perimeter Glass Railing with Neon Cyan Trim
    const railingGeo = new THREE.TorusGeometry(15.4, 0.08, 16, 64);
    railingGeo.rotateX(Math.PI / 2);
    const railingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const railing = new THREE.Mesh(railingGeo, railingMat);
    railing.position.y = 0.8;
    this.platformGroup.add(railing);

    // Glass Panels along perimeter
    const glassSkirtGeo = new THREE.CylinderGeometry(15.4, 15.4, 0.7, 48, 1, true);
    const glassSkirtMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.8,
      side: THREE.DoubleSide
    });
    const glassSkirt = new THREE.Mesh(glassSkirtGeo, glassSkirtMat);
    glassSkirt.position.y = 0.45;
    this.platformGroup.add(glassSkirt);

    // 5. Secondary Floating Ring (Rotating slowly)
    const floatRingGeo = new THREE.TorusGeometry(17.4, 0.1, 16, 64);
    floatRingGeo.rotateX(Math.PI / 2);
    const floatRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.65
    });
    this.floatRing = new THREE.Mesh(floatRingGeo, floatRingMat);
    this.floatRing.position.y = -0.6;
    this.platformGroup.add(this.floatRing);

    // 6. Under-Platform Graviton Engine Core (Pulsing Glow)
    const engineGeo = new THREE.CylinderGeometry(3.5, 7.5, 3.2, 6, 1, true);
    const engineMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.y = -3.4;
    this.platformGroup.add(engine);

    this.scene.add(this.platformGroup);
  }

  createDetailedPavilions() {
    VAMOPS_DATA.zones.forEach((zone) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(zone.coords.x, 0, zone.coords.z);
      bGroup.userData = { type: "zone", data: zone };

      // Raised Studio Podium
      const padGeo = new THREE.CylinderGeometry(3.2, 3.5, 0.4, 32);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x131d33,
        roughness: 0.25,
        metalness: 0.85
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.2;
      pad.receiveShadow = true;
      bGroup.add(pad);

      // Glowing Perimeter Neon Strip
      const stripGeo = new THREE.TorusGeometry(3.22, 0.08, 16, 48);
      stripGeo.rotateX(Math.PI / 2);
      const stripMat = new THREE.MeshBasicMaterial({ color: zone.color });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.y = 0.42;
      bGroup.add(strip);

      // Build Unique Architectural Models per Zone
      if (zone.id === "zone-penthouse") {
        this.buildRealisticPenthouse(bGroup, zone);
      } else if (zone.id === "zone-intelligence") {
        this.buildRealisticIntelligenceLab(bGroup, zone);
      } else if (zone.id === "zone-creative") {
        this.buildRealisticCreativeStudio(bGroup, zone);
      } else if (zone.id === "zone-critic") {
        this.buildRealisticCriticHall(bGroup, zone);
      } else if (zone.id === "zone-production") {
        this.buildRealisticProductionStudio(bGroup, zone);
      } else if (zone.id === "zone-satellite") {
        this.buildRealisticSatelliteArray(bGroup, zone);
      }

      this.scene.add(bGroup);
      this.buildings.push(bGroup);
      this.interactiveObjects.push(bGroup);
    });
  }

  buildRealisticPenthouse(group, zone) {
    // Curved Glass Executive Lounge Tower
    const glassGeo = new THREE.CylinderGeometry(1.6, 2.1, 4.6, 16, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.75,
      ior: 1.5,
      side: THREE.DoubleSide
    });
    const glassTower = new THREE.Mesh(glassGeo, glassMat);
    glassTower.position.y = 2.7;
    group.add(glassTower);

    // Interior Conference Table & Holographic Core
    const tableGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 16);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 1.0;
    group.add(table);

    // Floating Holographic VAMOPS Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 1.6;
    group.add(core);

    // Titanium Crown Roof
    const roofGeo = new THREE.ConeGeometry(2.3, 1.2, 16);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.6;
    group.add(roof);

    // Spire Antenna with Vertical Sky Beam
    const spireGeo = new THREE.CylinderGeometry(0.08, 0.2, 3.5, 8);
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95 });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 7.8;
    group.add(spire);

    // Pulsing Sky Laser
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 28, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 19;
    group.add(beam);

    group.userData.animator = (time) => {
      core.rotation.y = time * 1.5;
      core.rotation.x = time * 0.8;
      beam.material.opacity = 0.25 + Math.sin(time * 3.5) * 0.15;
    };
  }

  buildRealisticIntelligenceLab(group, zone) {
    // Geodesic Glass Dome
    const domeGeo = new THREE.SphereGeometry(2.4, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.4;
    group.add(dome);

    // Parabolic Satellite Radar Dish (Copper/Titanium)
    const dishMast = new THREE.CylinderGeometry(0.15, 0.25, 1.6, 8);
    const dishMastMesh = new THREE.Mesh(dishMast, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    dishMastMesh.position.y = 3.2;
    group.add(dishMastMesh);

    const dishGeo = new THREE.CylinderGeometry(1.5, 0.1, 0.45, 24);
    dishGeo.rotateX(Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xc7d2fe, metalness: 0.85, roughness: 0.3 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.y = 4.0;
    group.add(dish);

    // Floating Holographic Rings
    const ringGeo = new THREE.TorusGeometry(2.7, 0.06, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x818cf8 }));
    ring.position.y = 1.6;
    group.add(ring);

    group.userData.animator = (time) => {
      dish.rotation.y = time * 0.9;
      ring.rotation.z = -time * 0.4;
    };
  }

  buildRealisticCreativeStudio(group, zone) {
    // Hexagonal Open Glass Studio
    const studioGeo = new THREE.CylinderGeometry(2.2, 2.5, 2.8, 6, 1, true);
    const studioMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0.8,
      transmission: 0.7,
      side: THREE.DoubleSide
    });
    const studio = new THREE.Mesh(studioGeo, studioMat);
    studio.position.y = 1.8;
    group.add(studio);

    // Modern Cantilevered Roof
    const roofGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.3, 6);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9 }));
    roof.position.y = 3.3;
    group.add(roof);

    // Floating Translucent Storyboard Boards
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const boardGeo = new THREE.PlaneGeometry(0.8, 1.2);
      const boardMat = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(Math.cos(angle) * 1.2, 1.8, Math.sin(angle) * 1.2);
      board.rotation.y = -angle + Math.PI / 2;
      group.add(board);
    }

    // Floating Glowing Story Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x9f1239,
      roughness: 0.2,
      metalness: 0.9
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 4.4;
    group.add(crystal);

    group.userData.animator = (time) => {
      crystal.rotation.y = time * 1.4;
      crystal.position.y = 4.4 + Math.sin(time * 2.5) * 0.25;
    };
  }

  buildRealisticCriticHall(group, zone) {
    // Monolithic Obsidian & Gold Hall
    const hallGeo = new THREE.BoxGeometry(3.0, 3.8, 3.0);
    const hallMat = new THREE.MeshStandardMaterial({
      color: 0x14100c,
      roughness: 0.2,
      metalness: 0.92
    });
    const hall = new THREE.Mesh(hallGeo, hallMat);
    hall.position.y = 2.3;
    hall.castShadow = true;
    group.add(hall);

    // Golden Roof Pyramid
    const roofGeo = new THREE.ConeGeometry(2.1, 1.4, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.9;
    group.add(roof);

    // Floating Golden Scales of Justice Laser Beam
    const scaleBarGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8);
    scaleBarGeo.rotateZ(Math.PI / 2);
    const scaleBar = new THREE.Mesh(scaleBarGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 }));
    scaleBar.position.y = 6.2;
    group.add(scaleBar);

    // Dual Glowing Data Bowls
    [-1.2, 1.2].forEach((offset) => {
      const bowlGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide }));
      bowl.position.set(offset, 5.6, 0);
      group.add(bowl);
    });

    // Vertical Scanning Rubric Laser Ring
    const scannerGeo = new THREE.TorusGeometry(2.1, 0.06, 16, 32);
    scannerGeo.rotateX(Math.PI / 2);
    const scanner = new THREE.Mesh(scannerGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    scanner.position.y = 2.4;
    group.add(scanner);

    group.userData.animator = (time) => {
      scaleBar.rotation.z = Math.PI / 2 + Math.sin(time * 2.0) * 0.15;
      scanner.position.y = 1.2 + (Math.sin(time * 3.0) + 1) * 1.3;
    };
  }

  buildRealisticProductionStudio(group, zone) {
    // Industrial Sci-Fi Soundstage Hangar
    const hangarGeo = new THREE.BoxGeometry(3.6, 2.6, 2.8);
    const hangarMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.35,
      metalness: 0.85
    });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.position.y = 1.7;
    group.add(hangar);

    // Cinema Camera mounted on Jib Crane Arm
    const craneBaseGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
    const craneBase = new THREE.Mesh(craneBaseGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    craneBase.position.set(1.4, 3.4, 1.0);
    group.add(craneBase);

    const armGeo = new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8);
    const arm = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.9 }));
    arm.position.set(1.4, 4.2, 1.0);
    group.add(arm);

    // Cinema Camera Body
    const camGeo = new THREE.BoxGeometry(0.4, 0.35, 0.6);
    const cam = new THREE.Mesh(camGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95 }));
    cam.position.set(1.4, 5.0, 1.6);
    group.add(cam);

    // Studio Softbox Lights (Amber & Teal)
    [-1.3, 1.3].forEach((offset, idx) => {
      const softboxGeo = new THREE.BoxGeometry(0.8, 1.1, 0.15);
      const color = idx === 0 ? 0xf59e0b : 0x00f0ff;
      const softbox = new THREE.Mesh(softboxGeo, new THREE.MeshBasicMaterial({ color: color }));
      softbox.position.set(offset, 3.8, -1.2);
      softbox.rotation.y = idx === 0 ? Math.PI / 4 : -Math.PI / 4;
      group.add(softbox);
    });

    group.userData.animator = (time) => {
      arm.rotation.z = Math.sin(time * 2.2) * 0.35;
      arm.rotation.y = time * 0.8;
      cam.rotation.y = time * 0.8;
    };
  }

  buildRealisticSatelliteArray(group, zone) {
    // Comms Mast with Dual High-Gain Outward Dishes
    const mastGeo = new THREE.CylinderGeometry(0.18, 0.35, 4.2, 8);
    const mast = new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 }));
    mast.position.y = 2.5;
    group.add(mast);

    [-1.1, 1.1].forEach((offset) => {
      const dishGeo = new THREE.CylinderGeometry(1.0, 0.08, 0.35, 20);
      dishGeo.rotateZ(offset > 0 ? -Math.PI / 4 : Math.PI / 4);
      const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.9 }));
      dish.position.set(offset, 3.6, 0);
      group.add(dish);
    });

    // Orbital Photon Signal Wave
    const waveGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 48);
    waveGeo.rotateX(Math.PI / 2);
    const wave = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    wave.position.y = 4.4;
    group.add(wave);

    group.userData.animator = (time) => {
      const scale = 1.0 + (time * 1.8) % 1.6;
      wave.scale.set(scale, scale, scale);
      wave.material.opacity = Math.max(0, 1 - (scale - 1) / 1.6);
    };
  }

  createCentralWarRoom() {
    const warRoom = new THREE.Group();
    warRoom.position.set(0, 0, 0);

    // 1. Concentric Holographic Floor Dais
    const daisGeo = new THREE.CylinderGeometry(5.8, 6.2, 0.28, 48);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.92
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = 0.14;
    dais.receiveShadow = true;
    warRoom.add(dais);

    // Outer Glowing Cyan Ring
    const ring1Geo = new THREE.TorusGeometry(5.8, 0.04, 12, 64);
    ring1Geo.rotateX(Math.PI / 2);
    const ring1 = new THREE.Mesh(ring1Geo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    ring1.position.y = 0.29;
    warRoom.add(ring1);

    // Inner Glowing Amber Ring
    const ring2Geo = new THREE.TorusGeometry(3.6, 0.035, 12, 64);
    ring2Geo.rotateX(Math.PI / 2);
    const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    ring2.position.y = 0.29;
    warRoom.add(ring2);

    // 2. Central Circular Conference Table
    const tableGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.65, 36);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.15,
      metalness: 0.9
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.58;
    table.receiveShadow = true;
    warRoom.add(table);

    // Glowing Table Edge
    const tableEdgeGeo = new THREE.TorusGeometry(2.62, 0.035, 12, 48);
    tableEdgeGeo.rotateX(Math.PI / 2);
    const tableEdge = new THREE.Mesh(tableEdgeGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    tableEdge.position.y = 0.91;
    warRoom.add(tableEdge);

    // 3. Central 3D Holographic Projector
    const projectorBaseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.35, 24);
    const projectorBase = new THREE.Mesh(projectorBaseGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 }));
    projectorBase.position.y = 1.08;
    warRoom.add(projectorBase);

    // Floating 3D Wireframe Icosahedron Core
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 2.2;
    warRoom.add(core);
    warRoom.userData.hologramCore = core;

    // Upward Vertical Beam of Holographic Light
    const beamGeo = new THREE.CylinderGeometry(0.8, 2.2, 5.0, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 3.6;
    warRoom.add(beam);
    warRoom.userData.hologramBeam = beam;

    // 4. 12 Conference Docking Chairs arranged around the table
    const numSeats = 12;
    const radius = 4.2;
    this.meetingSeats = [];

    for (let i = 0; i < numSeats; i++) {
      const angle = (i * Math.PI * 2) / numSeats;
      const sx = Math.cos(angle) * radius;
      const sz = Math.sin(angle) * radius;

      const chairGroup = new THREE.Group();
      chairGroup.position.set(sx, 0.25, sz);
      chairGroup.rotation.y = angle + Math.PI;

      const seatGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.12, 16);
      const seat = new THREE.Mesh(seatGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
      chairGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(0.5, 0.5, 0.08);
      const back = new THREE.Mesh(backGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 }));
      back.position.set(0, 0.32, -0.22);
      chairGroup.add(back);

      const contourGeo = new THREE.TorusGeometry(0.36, 0.02, 8, 24);
      contourGeo.rotateX(Math.PI / 2);
      const contour = new THREE.Mesh(contourGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      contour.position.y = 0.07;
      chairGroup.add(contour);

      warRoom.add(chairGroup);
      this.meetingSeats.push({
        x: sx,
        z: sz,
        rotY: angle + Math.PI
      });
    }

    this.scene.add(warRoom);
    this.warRoomGroup = warRoom;
  }

  createRobotModel(agent) {
    const robot = new THREE.Group();
    
    // Premium PBR Materials
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.25,
      metalness: 0.88
    });
    
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: agent.deptColor
    });

    // 1. Lower Mecha Pedestal / Repulsor Base
    const baseGeo = new THREE.CylinderGeometry(0.28, 0.42, 0.65, 16);
    const baseMesh = new THREE.Mesh(baseGeo, armorMat);
    baseMesh.position.y = 0.32;
    baseMesh.castShadow = true;
    robot.add(baseMesh);

    // Glowing Thruster Ring at Base
    const ringGeo = new THREE.TorusGeometry(0.36, 0.035, 12, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, glowMat);
    ringMesh.position.y = 0.1;
    robot.add(ringMesh);

    // Dual Hydraulic Pistons
    [-0.18, 0.18].forEach((xOff) => {
      const pistonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
      const piston = new THREE.Mesh(pistonGeo, chromeMat);
      piston.position.set(xOff, 0.35, 0);
      robot.add(piston);
    });

    // 2. Articulated Robotic Torso / Chest Carapace
    const torsoGeo = new THREE.BoxGeometry(0.68, 0.65, 0.45);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.98;
    torso.castShadow = true;
    robot.add(torso);

    // Pulsing Arc Reactor Core in Chest Center
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, glowMat);
    coreMesh.position.set(0, 1.02, 0.23);
    robot.add(coreMesh);
    robot.userData.core = coreMesh;

    // Chest Armor Accent Inlay
    const chestPlateGeo = new THREE.BoxGeometry(0.42, 0.18, 0.05);
    const chestPlate = new THREE.Mesh(chestPlateGeo, chromeMat);
    chestPlate.position.set(0, 1.18, 0.22);
    robot.add(chestPlate);

    // 3. Articulated Shoulders and Arms
    [-0.44, 0.44].forEach((side) => {
      const shoulderGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const shoulder = new THREE.Mesh(shoulderGeo, chromeMat);
      shoulder.position.set(side, 1.2, 0);
      robot.add(shoulder);

      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8);
      const arm = new THREE.Mesh(armGeo, armorMat);
      arm.position.set(side * 1.08, 0.98, 0.06);
      arm.rotation.z = side > 0 ? -0.25 : 0.25;
      robot.add(arm);

      const forearmGeo = new THREE.BoxGeometry(0.1, 0.1, 0.4);
      const forearm = new THREE.Mesh(forearmGeo, chromeMat);
      forearm.position.set(side * 0.9, 0.82, 0.28);
      robot.add(forearm);

      const handGeo = new THREE.BoxGeometry(0.12, 0.04, 0.12);
      const hand = new THREE.Mesh(handGeo, glowMat);
      hand.position.set(side * 0.9, 0.8, 0.48);
      robot.add(hand);
    });

    // 4. Futuristic Cybernetic Helmet / Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);

    const helmetGeo = new THREE.BoxGeometry(0.46, 0.42, 0.46);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.castShadow = true;
    headGroup.add(helmet);

    // Horizontal Glowing Curved Visor Strip
    const visorGeo = new THREE.BoxGeometry(0.48, 0.14, 0.15);
    const visor = new THREE.Mesh(visorGeo, glowMat);
    visor.position.set(0, 0.02, 0.2);
    headGroup.add(visor);

    // Side Comms Ears / Antennas
    [-0.26, 0.26].forEach((side) => {
      const earGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
      earGeo.rotateZ(Math.PI / 2);
      const ear = new THREE.Mesh(earGeo, chromeMat);
      ear.position.set(side, 0.02, 0);
      headGroup.add(ear);

      const finGeo = new THREE.BoxGeometry(0.03, 0.22, 0.08);
      const fin = new THREE.Mesh(finGeo, glowMat);
      fin.position.set(side * 1.08, 0.1, -0.05);
      headGroup.add(fin);
    });

    robot.add(headGroup);
    robot.userData.headGroup = headGroup;

    // 5. Overhead Floating Data Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.48, 0.03, 8, 32);
    haloGeo.rotateX(Math.PI / 2);
    const halo = new THREE.Mesh(haloGeo, glowMat);
    halo.position.set(0, 2.12, 0);
    robot.add(halo);
    robot.userData.halo = halo;

    return robot;
  }

  createWorkstationDesk(agent, x, z, angle) {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(x, 0, z);
    deskGroup.rotation.y = angle;

    // 1. Sleek Command Console Desk
    const deskGeo = new THREE.BoxGeometry(1.6, 0.75, 0.75);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.35,
      metalness: 0.85
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.375, 0.35);
    desk.receiveShadow = true;
    deskGroup.add(desk);

    // Luminous Edge Trim
    const edgeGeo = new THREE.BoxGeometry(1.64, 0.04, 0.04);
    const edge = new THREE.Mesh(edgeGeo, new THREE.MeshBasicMaterial({ color: agent.deptColor }));
    edge.position.set(0, 0.76, 0.72);
    deskGroup.add(edge);

    // 2. Dual Floating Hologram Screens
    [-0.5, 0.5].forEach((xOff, i) => {
      const screenGeo = new THREE.PlaneGeometry(0.65, 0.45);
      const screenMat = new THREE.MeshBasicMaterial({
        color: agent.deptColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(xOff, 1.15, 0.45);
      screen.rotation.y = (i === 0 ? 0.22 : -0.22);
      deskGroup.add(screen);

      const frameGeo = new THREE.EdgesGeometry(screenGeo);
      const frame = new THREE.LineSegments(frameGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
      screen.add(frame);
    });

    // 3. Holographic Keyboard Grid on desk
    const kbGeo = new THREE.PlaneGeometry(0.65, 0.26);
    kbGeo.rotateX(-Math.PI / 2);
    const kb = new THREE.Mesh(kbGeo, new THREE.MeshBasicMaterial({ color: agent.deptColor, transparent: true, opacity: 0.55 }));
    kb.position.set(0, 0.76, 0.15);
    deskGroup.add(kb);

    this.scene.add(deskGroup);
    this.workstationDesks.push(deskGroup);
    return deskGroup;
  }

  createDetailedAgentsWithDesks() {
    this.workstationDesks = [];

    VAMOPS_DATA.agents.forEach((agent, index) => {
      const zone = VAMOPS_DATA.zones.find((z) => z.assignedAgents.includes(agent.id));
      if (!zone) return;

      const agentIndexInZone = zone.assignedAgents.indexOf(agent.id);
      const angle = (agentIndexInZone * Math.PI * 2) / zone.assignedAgents.length + index * 0.35;
      const dist = 3.6;
      const x = zone.coords.x + Math.cos(angle) * dist;
      const z = zone.coords.z + Math.sin(angle) * dist;
      const deskAngle = angle + Math.PI;

      // 1. Create Permanent Workstation Desk at Zone
      this.createWorkstationDesk(agent, x, z, deskAngle);

      // 2. Create Futuristic Robotic Mecha Avatar
      const robot = this.createRobotModel(agent);
      robot.position.set(x, 0, z);
      robot.rotation.y = deskAngle;
      robot.userData = {
        type: "agent",
        data: agent,
        homePos: new THREE.Vector3(x, 0, z),
        homeRotY: deskAngle,
        meetingSeatIndex: index,
        animOffset: Math.random() * Math.PI * 2
      };

      this.scene.add(robot);
      this.agents3D.push(robot);
      this.interactiveObjects.push(robot);
    });
  }

  // --- WAR ROOM MEETING TRANSITIONS ---
  toggleMeetingMode() {
    if (this.isMeetingMode) {
      this.dismissToWorkstations();
    } else {
      this.conveneWarRoomMeeting();
    }
  }

  conveneWarRoomMeeting(onComplete) {
    this.isMeetingMode = true;

    // Camera shifts to cinematic amphitheater angle (unobstructed 3/4 perspective)
    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: 7.5,
        y: 9.5,
        z: 11.5,
        duration: 1.5,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: 0,
          y: 1.2,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    }

    // Power up Central Hologram Projector
    if (this.warRoomGroup && this.warRoomGroup.userData.hologramBeam) {
      this.warRoomGroup.userData.hologramBeam.material.opacity = 0.38;
      this.warRoomGroup.userData.hologramCore.material.color.setHex(0x00f0ff);
    }

    // Animate each of the 12 robots to their meeting seat
    this.agents3D.forEach((robot, i) => {
      const seat = this.meetingSeats[i];
      if (!seat) return;

      if (window.gsap) {
        window.gsap.to(robot.position, {
          x: seat.x,
          z: seat.z,
          duration: 1.4,
          delay: i * 0.04,
          ease: "power2.inOut"
        });

        window.gsap.to(robot.position, {
          y: 0.4,
          duration: 0.7,
          delay: i * 0.04,
          yoyo: true,
          repeat: 1,
          ease: "power1.out"
        });

        window.gsap.to(robot.rotation, {
          y: seat.rotY,
          duration: 1.2,
          delay: i * 0.04,
          ease: "power2.inOut"
        });
      } else {
        robot.position.set(seat.x, 0, seat.z);
        robot.rotation.y = seat.rotY;
      }
    });

    setTimeout(() => {
      this.showFloatingBubble("agent-cmo", "12 AI Chuyên Gia đã họp mặt tại Bàn Tròn Chiến Lược!", 4500);
    }, 1500);

    if (onComplete) setTimeout(onComplete, 1600);
  }

  dismissToWorkstations(onComplete) {
    this.isMeetingMode = false;

    // Return camera to overview
    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: 14,
        y: 17,
        z: 20,
        duration: 1.5,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: 0,
          y: 1.5,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    }

    // Dim Central Hologram
    if (this.warRoomGroup && this.warRoomGroup.userData.hologramBeam) {
      this.warRoomGroup.userData.hologramBeam.material.opacity = 0.12;
    }

    // Animate each robot back to their home workstation
    this.agents3D.forEach((robot, i) => {
      const homePos = robot.userData.homePos;
      const homeRotY = robot.userData.homeRotY;
      if (!homePos) return;

      if (window.gsap) {
        window.gsap.to(robot.position, {
          x: homePos.x,
          z: homePos.z,
          duration: 1.4,
          delay: i * 0.03,
          ease: "power2.inOut"
        });

        window.gsap.to(robot.position, {
          y: 0,
          duration: 0.7,
          delay: i * 0.03,
          yoyo: true,
          repeat: 1,
          ease: "power1.out"
        });

        window.gsap.to(robot.rotation, {
          y: homeRotY,
          duration: 1.2,
          delay: i * 0.03,
          ease: "power2.inOut"
        });
      } else {
        robot.position.copy(homePos);
        robot.rotation.y = homeRotY;
      }
    });

    if (onComplete) setTimeout(onComplete, 1500);
  }

  setupDataNetwork() {
    const pipelineRoutes = [
      ["zone-penthouse", "zone-intelligence"],
      ["zone-intelligence", "zone-creative"],
      ["zone-creative", "zone-critic"],
      ["zone-critic", "zone-production"],
      ["zone-production", "zone-satellite"],
      ["zone-satellite", "zone-penthouse"]
    ];

    this.pipelineCurves = [];

    pipelineRoutes.forEach(([fromId, toId]) => {
      const fromZone = VAMOPS_DATA.zones.find((z) => z.id === fromId);
      const toZone = VAMOPS_DATA.zones.find((z) => z.id === toId);

      const p1 = new THREE.Vector3(fromZone.coords.x, 0.6, fromZone.coords.z);
      const p2 = new THREE.Vector3(
        (fromZone.coords.x + toZone.coords.x) / 2,
        2.8,
        (fromZone.coords.z + toZone.coords.z) / 2
      );
      const p3 = new THREE.Vector3(toZone.coords.x, 0.6, toZone.coords.z);

      const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
      this.pipelineCurves.push({ from: fromId, to: toId, curve });

      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
    });
  }

  triggerDataPacket(fromZoneId, toZoneId, color = 0x00f0ff) {
    const route = this.pipelineCurves.find((r) => r.from === fromZoneId && r.to === toZoneId);
    if (!route) return;

    const packetGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: color });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    this.scene.add(packetMesh);

    this.dataPackets.push({
      mesh: packetMesh,
      curve: route.curve,
      progress: 0,
      speed: 0.022 + Math.random() * 0.012
    });
  }

  showFloatingBubble(agentId, text, durationMs = 4500) {
    const agentMesh = this.agents3D.find((a) => a.userData.data.id === agentId);
    if (!agentMesh) return;

    let bubbleContainer = document.getElementById("bubble-layer");
    if (!bubbleContainer) {
      bubbleContainer = document.createElement("div");
      bubbleContainer.id = "bubble-layer";
      bubbleContainer.style.position = "absolute";
      bubbleContainer.style.top = "0";
      bubbleContainer.style.left = "0";
      bubbleContainer.style.width = "100%";
      bubbleContainer.style.height = "100%";
      bubbleContainer.style.pointerEvents = "none";
      bubbleContainer.style.zIndex = "30";
      this.container.appendChild(bubbleContainer);
    }

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "agent-speech-bubble";
    bubbleEl.innerHTML = `
      <div class="bubble-header">
        <span style="font-size: 16px;">${agentMesh.userData.data.avatar}</span>
        <span>${agentMesh.userData.data.name} · ${agentMesh.userData.data.deptName}</span>
      </div>
      <div class="bubble-body">${text}</div>
    `;
    bubbleContainer.appendChild(bubbleEl);

    this.speechBubbles.push({
      element: bubbleEl,
      targetMesh: agentMesh,
      createdAt: Date.now(),
      duration: durationMs
    });
  }

  updateSpeechBubbles() {
    const now = Date.now();
    const widthHalf = (this.container.clientWidth || window.innerWidth) / 2;
    const heightHalf = (this.container.clientHeight || window.innerHeight) / 2;

    for (let i = this.speechBubbles.length - 1; i >= 0; i--) {
      const b = this.speechBubbles[i];
      if (now - b.createdAt > b.duration) {
        b.element.classList.add("fade-out");
        setTimeout(() => {
          if (b.element.parentNode) b.element.parentNode.removeChild(b.element);
        }, 350);
        this.speechBubbles.splice(i, 1);
        continue;
      }

      const pos = new THREE.Vector3();
      b.targetMesh.getWorldPosition(pos);
      pos.y += 2.6;

      pos.project(this.camera);

      if (pos.z > 1) {
        b.element.style.display = "none";
        continue;
      }

      b.element.style.display = "block";
      const x = pos.x * widthHalf + widthHalf;
      const y = -pos.y * heightHalf + heightHalf;
      b.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    }
  }

  focusCameraOn(zoneId) {
    this.activeFocus = zoneId;
    let targetPos = new THREE.Vector3(0, 1.8, 0);
    let cameraPos = new THREE.Vector3(0, 20, 24);

    if (zoneId === "overview") {
      targetPos.set(0, 1.5, 0);
      cameraPos.set(14, 17, 20);
    } else if (zoneId === "isometric") {
      targetPos.set(0, 0, 0);
      cameraPos.set(22, 22, 22);
    } else {
      const zone = VAMOPS_DATA.zones.find((z) => z.id === zoneId);
      if (zone) {
        targetPos.set(zone.coords.x, 2.2, zone.coords.z);
        cameraPos.set(zone.coords.x + 6.5, 9, zone.coords.z + 8.5);
      }
    }

    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration: 1.3,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.3,
          ease: "power2.inOut"
        });
      }
    } else {
      this.camera.position.copy(cameraPos);
      if (this.controls) this.controls.target.copy(targetPos);
    }
  }

  onMouseMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj.parent && !topObj.userData.type && topObj !== this.scene) {
        topObj = topObj.parent;
      }

      if (topObj.userData && topObj.userData.type) {
        this.container.style.cursor = "pointer";
        this.hoveredObject = topObj;
        return;
      }
    }

    this.container.style.cursor = "default";
    this.hoveredObject = null;
  }

  onClick(e) {
    if (this.hoveredObject && this.hoveredObject.userData) {
      const item = this.hoveredObject.userData;
      if (item.type === "agent" && window.onAgentSelected) {
        window.onAgentSelected(item.data);
      } else if (item.type === "zone" && window.onZoneSelected) {
        window.onZoneSelected(item.data);
      }
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Controls
    if (this.controls) {
      this.controls.autoRotate = this.isAutoRotate;
      this.controls.autoRotateSpeed = 0.75;
      this.controls.update();
    }

    // 2. Starfield slow rotation
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.012;
    }

    // 3. Floating ring rotation
    if (this.floatRing) {
      this.floatRing.rotation.z = -elapsedTime * 0.06;
    }

    // 4. Buildings animations
    this.buildings.forEach((b) => {
      if (b.userData && b.userData.animator) {
        b.userData.animator(elapsedTime);
      }
    });

    // 4.5. Central War Room Projector Animation
    if (this.warRoomGroup && this.warRoomGroup.userData.hologramCore) {
      const core = this.warRoomGroup.userData.hologramCore;
      core.rotation.y = elapsedTime * 0.75;
      core.rotation.x = elapsedTime * 0.35;
      if (this.warRoomGroup.userData.hologramBeam) {
        const pulse = 1.0 + Math.sin(elapsedTime * 3.2) * 0.08;
        this.warRoomGroup.userData.hologramBeam.scale.set(pulse, 1.0, pulse);
      }
    }

    // 5. High-End Robotic Mecha Lifelike Micro-Animations
    this.agents3D.forEach((robot) => {
      const offset = robot.userData.animOffset || 0;

      // Gentle floating / breathing idle motion
      if (!this.isMeetingMode) {
        robot.position.y = Math.sin(elapsedTime * 2.2 + offset) * 0.045;
      }

      // Head scanning panning
      if (robot.userData.headGroup) {
        robot.userData.headGroup.rotation.y = Math.sin(elapsedTime * 1.3 + offset) * 0.16;
      }

      // Arc reactor core breathing pulse
      if (robot.userData.core) {
        const s = 1.0 + Math.sin(elapsedTime * 3.6 + offset) * 0.14;
        robot.userData.core.scale.set(s, s, s);
      }

      // Overhead spinning data halo
      if (robot.userData.halo) {
        robot.userData.halo.rotation.z = elapsedTime * 1.6;
      }
    });

    // 6. Data Packets travel
    for (let i = this.dataPackets.length - 1; i >= 0; i--) {
      const p = this.dataPackets[i];
      p.progress += p.speed;
      if (p.progress >= 1.0) {
        this.scene.remove(p.mesh);
        this.dataPackets.splice(i, 1);
      } else {
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      }
    }

    // 7. Update 3D Speech Bubbles
    this.updateSpeechBubbles();

    // 8. Render
    this.renderer.render(this.scene, this.camera);
  }
}
