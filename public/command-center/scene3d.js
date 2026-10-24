/**
 * VAMOPS COMMAND CENTER — SCENE 3D V3.5 ULTRA REALISTIC MARS EXPEDITION HABITAT
 * Trụ sở Điều phối Media Đa Nền tảng Đặt Trên Sao Hoả (Ares Base Alpha — Valles Marineris)
 * 
 * Tính năng Cao Cấp:
 * 1. 12 Chuyên Gia Người Thật (Human Specialists) với giải phẫu học tự nhiên,
 *    đồng phục du hành sao hoả, ghế công thái học Herman-Miller, cử chỉ gõ phím & thở tự nhiên.
 * 2. Cửa sổ vòm Geodesic khổng lồ nhìn thẳng ra phong cảnh Sao Hoả chân thực:
 *    Cát đỏ, hẻm núi, mặt trời sao hoả, bão bụi vi mô, và Xe Thám Hiểm Rover VAM-01 rọi đèn pha.
 * 3. Sinh thái thực vật Hydroponics (vườn cây sinh học lọc oxy trên sao hoả).
 * 4. Màn hình máy tính động (Realtime Animated Canvas Textures) hiển thị code, waveform, video timeline.
 * 5. Hội đồng Chiến lược Sao Hoả (War Room): Quả địa cầu Sao Hoả 3D Hologram quay chậm với vệ tinh quỹ đạo.
 * 6. 5 Góc nhìn Camera Điện ảnh (Overview, Cửa sổ Sao Hoả, Xe Rover Cam, Hội Đồng, Isometric).
 */

class VAMOPSScene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.agents3D = [];
    this.buildings = [];
    this.dataPackets = [];
    this.interactiveObjects = [];
    this.speechBubbles = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.clock = new THREE.Clock();
    this.isAutoRotate = false;
    this.isMeetingMode = false;
    this.activeFocus = "overview";
    this.meetingSeats = [];

    // Animated Canvases for Workstation Screens
    this.screenCanvases = [];
    this.frameCount = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Martian Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0905);
    this.scene.fog = new THREE.FogExp2(0x240e07, 0.011);

    // 2. Camera Setup (Cinematic Mars Habitat View)
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(16, 17, 22);

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
      this.controls.target.set(0, 1.8, 0);
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.controls.minDistance = 6;
      this.controls.maxDistance = 65;
    }

    // 5. Setup Animated Monitor Canvases
    this.initScreenCanvases();

    // 6. Lighting: Warm Martian Sunlight & Interior Task Lights
    this.setupMarsLighting();

    // 7. Martian Exterior Landscape (Terrain, Sunset, Moons, Rover)
    this.createMartianExterior();

    // 8. Habitat Architecture (Geodesic Observation Dome, Floor, Hydroponics)
    this.createHabitatArchitecture();

    // 9. Central Mars War Room (Holographic Mars Globe Sand-Table)
    this.createCentralMarsWarRoom();

    // 10. 12 Real Human Specialists with Workstations
    this.createHumanSpecialistsWithWorkstations();

    // 11. Data Pipeline Splines
    this.setupDataNetwork();

    // 12. Events
    window.addEventListener("resize", () => this.onWindowResize());
    this.renderer.domElement.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener("click", (e) => this.onClick(e));

    // 13. Start Render Loop
    this.animate();
  }

  // --- DYNAMIC SCREEN CANVASES FOR LIVE WORKSTATION MONITORS ---
  initScreenCanvases() {
    // Canvas 1: Live Neural Network / Scrolling Code / Prompt Data
    const c1 = document.createElement("canvas");
    c1.width = 256;
    c1.height = 128;
    const ctx1 = c1.getContext("2d");
    const tex1 = new THREE.CanvasTexture(c1);

    // Canvas 2: Live Waveform / 26s Video Playhead / Rubric Radar
    const c2 = document.createElement("canvas");
    c2.width = 256;
    c2.height = 128;
    const ctx2 = c2.getContext("2d");
    const tex2 = new THREE.CanvasTexture(c2);

    this.screenCanvases = [
      { canvas: c1, ctx: ctx1, texture: tex1, type: "code", offset: 0 },
      { canvas: c2, ctx: ctx2, texture: tex2, type: "media", offset: 0 }
    ];
  }

  updateScreenCanvases(time) {
    // Update Canvas 1 (Code & Terminal Stream)
    const s1 = this.screenCanvases[0];
    const ctx1 = s1.ctx;
    ctx1.fillStyle = "#050b14";
    ctx1.fillRect(0, 0, 256, 128);

    // Draw grid
    ctx1.strokeStyle = "rgba(0, 240, 255, 0.12)";
    ctx1.lineWidth = 1;
    for (let x = 0; x < 256; x += 32) {
      ctx1.beginPath();
      ctx1.moveTo(x, 0);
      ctx1.lineTo(x, 128);
      ctx1.stroke();
    }

    // Header bar
    ctx1.fillStyle = "rgba(0, 240, 255, 0.25)";
    ctx1.fillRect(0, 0, 256, 18);
    ctx1.fillStyle = "#00f0ff";
    ctx1.font = "bold 9px monospace";
    ctx1.fillText("VAMOPS NEURAL FEED · MARS SOL 482", 8, 12);

    // Scrolling text lines
    const lines = [
      "> DNA_VAMOPS::load_founder_corpus(v3.0)",
      "> analyzing hook retention curve [0s..3s]",
      "> prompt_gen: cinematic anamorphic lighting",
      "> rubric_check: 94.8/100 (APPROVED)",
      "> avfoundation: render_pipeline.swift --4k",
      "> sync_orbit: publishing 3 channels"
    ];
    ctx1.font = "8px monospace";
    lines.forEach((line, idx) => {
      const y = 34 + idx * 15;
      const alpha = 0.5 + Math.sin(time * 3 + idx) * 0.45;
      ctx1.fillStyle = idx === 3 ? "#10b981" : `rgba(56, 189, 248, ${alpha})`;
      ctx1.fillText(line, 10, y);
    });
    s1.texture.needsUpdate = true;

    // Update Canvas 2 (Audio Waveform & Video Playhead)
    const s2 = this.screenCanvases[1];
    const ctx2 = s2.ctx;
    ctx2.fillStyle = "#070d18";
    ctx2.fillRect(0, 0, 256, 128);

    // Header
    ctx2.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx2.fillRect(0, 0, 256, 18);
    ctx2.fillStyle = "#f59e0b";
    ctx2.font = "bold 9px monospace";
    ctx2.fillText("BEAT SHEET 26s · MULTI-TRACK AUDIO", 8, 12);

    // Waveform
    ctx2.strokeStyle = "#10b981";
    ctx2.lineWidth = 1.5;
    ctx2.beginPath();
    for (let x = 0; x < 256; x += 4) {
      const amp = Math.sin(x * 0.12 + time * 6) * Math.cos(x * 0.04) * 26;
      const y = 56 + amp;
      if (x === 0) ctx2.moveTo(x, y);
      else ctx2.lineTo(x, y);
    }
    ctx2.stroke();

    // Timeline Track
    ctx2.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx2.fillRect(10, 94, 236, 18);
    // Playhead
    const playheadX = 10 + ((time * 30) % 236);
    ctx2.fillStyle = "rgba(0, 240, 255, 0.35)";
    ctx2.fillRect(10, 94, playheadX - 10, 18);
    ctx2.fillStyle = "#00f0ff";
    ctx2.fillRect(playheadX - 1, 90, 3, 26);

    ctx2.fillStyle = "#ffffff";
    ctx2.font = "8px monospace";
    ctx2.fillText(`TC: 00:00:${Math.floor((time * 2) % 26).toString().padStart(2, "0")} / 00:00:26`, 14, 106);

    s2.texture.needsUpdate = true;
  }

  // --- LIGHTING SETUP ---
  setupMarsLighting() {
    // 1. Ambient Warm Martian Atmosphere
    const ambientLight = new THREE.AmbientLight(0x381912, 1.8);
    this.scene.add(ambientLight);

    // 2. The Martian Sun (Golden Amber Key Light, Low Angle)
    const sunLight = new THREE.DirectionalLight(0xffcaa0, 2.7);
    sunLight.position.set(28, 18, -26);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 30;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 2.2;
    this.scene.add(sunLight);
    this.sunLight = sunLight;

    // 3. Martian Atmospheric Dust Bounce Light (Burnt Orange Fill)
    const dustBounce = new THREE.DirectionalLight(0xd95328, 1.4);
    dustBounce.position.set(-24, 12, 20);
    this.scene.add(dustBounce);

    // 4. Habitat Interior Overhead Soft Task Lights (Cool Crisp White contrasting with warm Mars)
    const interiorDomeLight = new THREE.PointLight(0xe0f2fe, 2.2, 35, 1.2);
    interiorDomeLight.position.set(0, 9, 0);
    this.scene.add(interiorDomeLight);

    // 5. Bioluminescent Plant Grow Lights (Emerald Green)
    [-8, 8].forEach((x) => {
      const growLight = new THREE.PointLight(0x10b981, 2.4, 12, 1.6);
      growLight.position.set(x, 3.5, 0);
      this.scene.add(growLight);
    });

    // 6. Central War Room Projector Light (Cyan)
    const warRoomLight = new THREE.PointLight(0x00f0ff, 3.2, 16, 1.4);
    warRoomLight.position.set(0, 3.2, 0);
    this.scene.add(warRoomLight);
  }

  // --- MARTIAN EXTERIOR (LANDSCAPE, ROVER, SUNSET, MOONS) ---
  createMartianExterior() {
    const exteriorGroup = new THREE.Group();

    // 1. Martian Regolith Terrain Surface
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    // Displace vertices to create undulating dunes and craters
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const dist = Math.sqrt(vx * vx + vy * vy);
      // Keep habitat foundation flat in center
      if (dist > 14) {
        const elevation =
          Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 2.8 +
          Math.sin(vx * 0.16 + vy * 0.12) * 1.4 +
          (dist > 50 ? Math.sin(vx * 0.04) * 6 : 0);
        pos.setZ(i, elevation);
      } else {
        pos.setZ(i, -0.05);
      }
    }
    terrainGeo.computeVertexNormals();
    terrainGeo.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x9e3a1b,
      roughness: 0.95,
      metalness: 0.08,
      flatShading: true
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = -0.15;
    terrain.receiveShadow = true;
    exteriorGroup.add(terrain);

    // 2. Martian Boulders & Craters
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a1e10,
      roughness: 0.9,
      metalness: 0.15,
      flatShading: true
    });
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 16 + Math.random() * 45;
      const rx = Math.cos(angle) * dist;
      const rz = Math.sin(angle) * dist;
      const scale = 0.4 + Math.random() * 1.8;

      const rockGeo = new THREE.DodecahedronGeometry(scale, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, scale * 0.5 - 0.1, rz);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      exteriorGroup.add(rock);
    }

    // 3. Distant Olympus Mons Mountain Ridge Backdrop
    const ridgeGeo = new THREE.CylinderGeometry(85, 88, 22, 32, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
    const ridgeMat = new THREE.MeshBasicMaterial({
      color: 0x54180c,
      side: THREE.BackSide,
      fog: true
    });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(0, 8, -10);
    exteriorGroup.add(ridge);

    // 4. Low Martian Sun Flare Disk
    const sunDiskGeo = new THREE.CircleGeometry(5.5, 32);
    const sunDiskMat = new THREE.MeshBasicMaterial({
      color: 0xffe2b8,
      fog: false
    });
    const sunDisk = new THREE.Mesh(sunDiskGeo, sunDiskMat);
    sunDisk.position.set(38, 24, -38);
    sunDisk.lookAt(0, 0, 0);
    exteriorGroup.add(sunDisk);

    // 5. Martian Moons: Phobos & Deimos
    const phobosGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 });
    const phobos = new THREE.Mesh(phobosGeo, moonMat);
    phobos.position.set(-28, 38, -32);
    exteriorGroup.add(phobos);

    const deimosGeo = new THREE.DodecahedronGeometry(0.6, 1);
    const deimos = new THREE.Mesh(deimosGeo, moonMat);
    deimos.position.set(18, 42, -45);
    exteriorGroup.add(deimos);

    // 6. Realistic Mars Exploration Rover (Ares Rover VAM-01)
    const rover = this.createMarsRover();
    rover.position.set(3.5, 0.45, -22);
    rover.rotation.y = -Math.PI * 0.25;
    exteriorGroup.add(rover);
    this.roverModel = rover;

    // 7. Martian Solar Array & Deep Space Relay Tower Outside
    const solarPylon = this.createSolarPylon();
    solarPylon.position.set(-18, 0, -25);
    exteriorGroup.add(solarPylon);

    // 8. Atmospheric Dust Particles Drifting on Mars
    const dustCount = 450;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 80;
      dustPositions[i * 3 + 1] = Math.random() * 22;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xe27b58,
      size: 0.18,
      transparent: true,
      opacity: 0.65
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    exteriorGroup.add(this.dustParticles);

    this.scene.add(exteriorGroup);
  }

  createMarsRover() {
    const roverGroup = new THREE.Group();

    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.95 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.3 });

    // Chassis Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.9, 1.8);
    const body = new THREE.Mesh(bodyGeo, chassisMat);
    body.position.y = 1.1;
    body.castShadow = true;
    roverGroup.add(body);

    // Gold Multi-Layer Insulation Top Deck
    const deckGeo = new THREE.BoxGeometry(2.2, 0.08, 1.6);
    const deck = new THREE.Mesh(deckGeo, goldMat);
    deck.position.set(0, 1.58, 0);
    roverGroup.add(deck);

    // 6 Rocker-Bogie Heavy Duty Mars Wheels
    const wheelPositions = [
      [-1.3, 0.45, -1.2], [0, 0.45, -1.3], [1.3, 0.45, -1.2],
      [-1.3, 0.45, 1.2],  [0, 0.45, 1.3],  [1.3, 0.45, 1.2]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
      wGeo.rotateX(Math.PI / 2);
      const wheel = new THREE.Mesh(wGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      roverGroup.add(wheel);

      // Suspension Strut connecting to chassis
      const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const strut = new THREE.Mesh(strutGeo, darkMat);
      strut.position.set(wx * 0.7, wy + 0.35, wz * 0.6);
      roverGroup.add(strut);
    });

    // Remote Sensing Mast & Stereo NavCams
    const mastGeo = new THREE.CylinderGeometry(0.07, 0.09, 1.8, 8);
    const mast = new THREE.Mesh(mastGeo, darkMat);
    mast.position.set(0.8, 2.3, 0.5);
    mast.castShadow = true;
    roverGroup.add(mast);

    const camHeadGeo = new THREE.BoxGeometry(0.45, 0.28, 0.4);
    const camHead = new THREE.Mesh(camHeadGeo, chassisMat);
    camHead.position.set(0.8, 3.2, 0.5);
    roverGroup.add(camHead);

    // Twin High-Beam LED Headlights (Cuts through Martian dust)
    [-0.14, 0.14].forEach((off) => {
      const lensGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12);
      lensGeo.rotateZ(Math.PI / 2);
      const lens = new THREE.Mesh(lensGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      lens.position.set(1.02, 3.2, 0.5 + off);
      roverGroup.add(lens);
    });

    // Headlight Spotlights illuminating Martian soil
    const headlight = new THREE.SpotLight(0xfff7ed, 4.5, 30, Math.PI / 5, 0.4);
    headlight.position.set(1.1, 3.2, 0.5);
    headlight.target.position.set(8, 0, 0);
    roverGroup.add(headlight);
    roverGroup.add(headlight.target);

    // Robotic Science Arm with Rock Drill
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
    armGeo.rotateZ(Math.PI / 3);
    const arm = new THREE.Mesh(armGeo, darkMat);
    arm.position.set(1.3, 0.9, -0.4);
    roverGroup.add(arm);

    // High-Gain Satellite Antenna Dish
    const dishGeo = new THREE.CylinderGeometry(0.45, 0.04, 0.18, 16);
    dishGeo.rotateZ(-Math.PI / 4);
    const dish = new THREE.Mesh(dishGeo, chassisMat);
    dish.position.set(-0.8, 2.0, -0.4);
    roverGroup.add(dish);

    return roverGroup;
  }

  createSolarPylon() {
    const pylonGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.85, roughness: 0.2 });

    // Tower Mast
    const mastGeo = new THREE.CylinderGeometry(0.2, 0.35, 7.5, 8);
    const mast = new THREE.Mesh(mastGeo, metalMat);
    mast.position.y = 3.75;
    mast.castShadow = true;
    pylonGroup.add(mast);

    // Twin Angled Solar Wings
    [-2.2, 2.2].forEach((offset) => {
      const panelGeo = new THREE.BoxGeometry(3.6, 0.08, 1.8);
      const panel = new THREE.Mesh(panelGeo, solarMat);
      panel.position.set(offset, 6.5, 0);
      panel.rotation.z = offset > 0 ? 0.35 : -0.35;
      panel.rotation.x = 0.2;
      panel.castShadow = true;
      pylonGroup.add(panel);
    });

    // High-Gain Orbital Comms Dish at Top
    const dishGeo = new THREE.CylinderGeometry(1.6, 0.1, 0.45, 24);
    dishGeo.rotateX(Math.PI / 4);
    const dish = new THREE.Mesh(dishGeo, metalMat);
    dish.position.set(0, 7.8, 0);
    pylonGroup.add(dish);

    return pylonGroup;
  }

  // --- HABITAT ARCHITECTURE (GEODESIC DOME, DECK, HYDROPONICS) ---
  createHabitatArchitecture() {
    const habitat = new THREE.Group();

    // 1. Habitat Deck (Pressurized Interior Composite Floor)
    const deckGeo = new THREE.CylinderGeometry(13.5, 13.8, 0.4, 48);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x0f1523,
      roughness: 0.25,
      metalness: 0.85
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.2;
    deck.receiveShadow = true;
    habitat.add(deck);

    // Glowing Concentric Guide Tracks on Deck
    const outerTrackGeo = new THREE.TorusGeometry(12.8, 0.05, 8, 64);
    outerTrackGeo.rotateX(Math.PI / 2);
    const outerTrack = new THREE.Mesh(outerTrackGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    outerTrack.position.y = 0.42;
    habitat.add(outerTrack);

    const amberTrackGeo = new THREE.TorusGeometry(8.5, 0.04, 8, 64);
    amberTrackGeo.rotateX(Math.PI / 2);
    const amberTrack = new THREE.Mesh(amberTrackGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    amberTrack.position.y = 0.42;
    habitat.add(amberTrack);

    // 2. Geodesic Observation Dome Arches & Ribs
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.25
    });

    // 6 Structural Arches extending up to apex
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const archRibGeo = new THREE.TorusGeometry(13.2, 0.16, 8, 36, Math.PI);
      const archRib = new THREE.Mesh(archRibGeo, archMat);
      archRib.rotation.y = angle;
      archRib.position.y = 0.4;
      habitat.add(archRib);
    }

    // Horizontal Structural Rings
    [4.2, 8.5, 11.8].forEach((h, idx) => {
      const r = Math.sqrt(13.2 * 13.2 - h * h);
      const ringGeo = new THREE.TorusGeometry(r, 0.12, 8, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, archMat);
      ring.position.y = h;
      habitat.add(ring);
    });

    // Transparent Panoramic Glass Panels (Facing Mars Landscape & Rover)
    const glassGeo = new THREE.SphereGeometry(13.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88c0d0,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.45,
      side: THREE.DoubleSide
    });
    const glassDome = new THREE.Mesh(glassGeo, glassMat);
    glassDome.position.y = 0.4;
    habitat.add(glassDome);

    // 3. Biophilic Hydroponic Plant Pods (Fresh Greens Living on Mars)
    const plantLocations = [
      [-10.2, 0.4, -4.5], [-10.2, 0.4, 4.5],
      [10.2, 0.4, -4.5],  [10.2, 0.4, 4.5]
    ];
    plantLocations.forEach(([px, py, pz]) => {
      const pod = this.createHydroponicPod();
      pod.position.set(px, py, pz);
      habitat.add(pod);
    });

    // 4. Industrial Life Support Air-Scrubbers & Oxygen Tanks
    const scrubberGeo = new THREE.CylinderGeometry(0.65, 0.7, 3.8, 16);
    const scrubberMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
    [-11.5, 11.5].forEach((sx) => {
      const scrubber = new THREE.Mesh(scrubberGeo, scrubberMat);
      scrubber.position.set(sx, 2.3, 0);
      scrubber.castShadow = true;
      habitat.add(scrubber);

      // Glowing Oxygen Level Gauge
      const gaugeGeo = new THREE.BoxGeometry(0.12, 2.2, 0.05);
      const gauge = new THREE.Mesh(gaugeGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      gauge.position.set(sx > 0 ? -0.66 : 0.66, 0, 0);
      scrubber.add(gauge);
    });

    this.scene.add(habitat);
    this.habitatGroup = habitat;
  }

  createHydroponicPod() {
    const podGroup = new THREE.Group();

    // Base Hydroponic Reservoir
    const baseGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.7, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.35;
    podGroup.add(base);

    // Vertical Aeroponic Growth Column
    const colGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.8, 12);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.y = 1.9;
    podGroup.add(col);

    // Lush Green Foliage Nodes
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.5,
      metalness: 0.1
    });
    for (let j = 0; j < 14; j++) {
      const leafGeo = new THREE.SphereGeometry(0.28, 8, 8);
      leafGeo.scale(1.4, 0.3, 0.9);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const a = (j * Math.PI * 2) / 7;
      const y = 0.9 + Math.floor(j / 7) * 1.1;
      leaf.position.set(Math.cos(a) * 0.55, y, Math.sin(a) * 0.55);
      leaf.rotation.y = a;
      leaf.rotation.z = 0.3;
      podGroup.add(leaf);
    }

    // Cylindrical Bio-Glass Shield
    const shieldGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.2, 16, 1, true);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7f3d0,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      roughness: 0.1
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.y = 2.1;
    podGroup.add(shield);

    // Top LED Grow-Light Ring
    const ringGeo = new THREE.TorusGeometry(0.95, 0.06, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    ring.position.y = 3.7;
    podGroup.add(ring);

    return podGroup;
  }

  // --- CENTRAL MARS WAR ROOM (HOLOGRAPHIC 3D MARS GLOBE) ---
  createCentralMarsWarRoom() {
    const warRoom = new THREE.Group();
    warRoom.position.set(0, 0.4, 0);

    // 1. Elevated Command Dais
    const daisGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.25, 48);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.2,
      metalness: 0.92
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = 0.12;
    dais.receiveShadow = true;
    warRoom.add(dais);

    // Concentric Neon Ring at Edge
    const ringGeo = new THREE.TorusGeometry(4.8, 0.04, 12, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    ring.position.y = 0.26;
    warRoom.add(ring);

    // 2. Central Circular Tactical Table
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.75, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.25,
      metalness: 0.9
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.55;
    table.castShadow = true;
    warRoom.add(table);

    // Table Surface Glass Inset
    const topGlassGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.06, 32);
    const topGlass = new THREE.Mesh(topGlassGeo, new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.95
    }));
    topGlass.position.y = 0.95;
    warRoom.add(topGlass);

    // 3. Floating 3D Holographic Mars Globe Projector
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, 2.4, 0);

    // The Mars Hologram Sphere
    const marsGlobeGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const marsGlobeMat = new THREE.MeshStandardMaterial({
      color: 0xe25822,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x6e1b00,
      emissiveIntensity: 0.45,
      wireframe: false
    });
    const marsGlobe = new THREE.Mesh(marsGlobeGeo, marsGlobeMat);
    globeGroup.add(marsGlobe);
    warRoom.userData.marsGlobe = marsGlobe;

    // Glowing Atmospheric Halo around Mars
    const haloGeo = new THREE.SphereGeometry(0.96, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff7733,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(halo);

    // Orbital Satellite Trajectory Rings
    [
      { rx: 0.3, rz: 0.4, color: 0x00f0ff, radius: 1.35 },
      { rx: -0.5, rz: 0.2, color: 0xf59e0b, radius: 1.55 }
    ].forEach((orbit) => {
      const oGeo = new THREE.TorusGeometry(orbit.radius, 0.012, 8, 48);
      oGeo.rotateX(Math.PI / 2 + orbit.rx);
      oGeo.rotateZ(orbit.rz);
      const oMesh = new THREE.Mesh(oGeo, new THREE.MeshBasicMaterial({ color: orbit.color, transparent: true, opacity: 0.6 }));
      globeGroup.add(oMesh);
    });

    // Pulsing Base Alpha Marker Pin on Mars Globe
    const pinGeo = new THREE.ConeGeometry(0.06, 0.22, 8);
    pinGeo.rotateX(Math.PI);
    const pin = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    pin.position.set(0.65, 0.35, 0.45);
    globeGroup.add(pin);

    // Vertical Holographic Light Beam from Table
    const beamGeo = new THREE.CylinderGeometry(0.12, 1.8, 2.8, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 1.4;
    warRoom.add(beam);
    warRoom.userData.hologramBeam = beam;

    warRoom.add(globeGroup);
    this.warRoomGlobeGroup = globeGroup;

    // 4. 12 Docking Chairs arranged around the central table for Meeting Mode
    const numSeats = 12;
    const radius = 3.6;
    this.meetingSeats = [];

    for (let i = 0; i < numSeats; i++) {
      const angle = (i * Math.PI * 2) / numSeats;
      const sx = Math.cos(angle) * radius;
      const sz = Math.sin(angle) * radius;

      this.meetingSeats.push({
        x: sx,
        z: sz,
        rotY: angle + Math.PI
      });
    }

    this.scene.add(warRoom);
    this.warRoomGroup = warRoom;
  }

  // --- 12 REAL HUMAN SPECIALISTS WITH WORKSTATIONS ---
  createHumanSpecialistsWithWorkstations() {
    const agents = VAMOPS_DATA.agents;
    const numAgents = agents.length;
    const workstationRadius = 8.8;

    this.agents3D = [];
    this.workstationDesks = [];

    agents.forEach((agent, i) => {
      // Angular positioning around the habitat perimeter facing inward toward the War Room & Mars window
      const angle = (i * Math.PI * 2) / numAgents - Math.PI / 2;
      const wx = Math.cos(angle) * workstationRadius;
      const wz = Math.sin(angle) * workstationRadius;
      const deskRotY = angle + Math.PI; // Face toward central table

      // 1. High-Tech Workstation Desk
      const desk = this.createWorkstationDesk(agent, deskRotY);
      desk.position.set(wx, 0.4, wz);
      desk.rotation.y = deskRotY;
      this.scene.add(desk);
      this.workstationDesks.push(desk);

      // 2. Realistic Seated Human Specialist
      const humanSpecialist = this.createRealisticHumanSpecialist(agent, i);
      // Position seated on chair behind desk
      const chairDist = 0.95;
      const cx = wx + Math.sin(deskRotY) * chairDist;
      const cz = wz + Math.cos(deskRotY) * chairDist;

      humanSpecialist.position.set(cx, 0.4, cz);
      humanSpecialist.rotation.y = deskRotY;

      // Store home position & data for raycasting and meeting transitions
      humanSpecialist.userData = {
        type: "agent",
        data: agent,
        homePos: new THREE.Vector3(cx, 0.4, cz),
        homeRotY: deskRotY,
        meetingSeat: this.meetingSeats[i],
        animOffset: i * 0.55
      };

      this.scene.add(humanSpecialist);
      this.agents3D.push(humanSpecialist);
      this.interactiveObjects.push(humanSpecialist);
    });
  }

  // --- WORKSTATION DESK WITH DUAL ANIMATED SCREENS ---
  createWorkstationDesk(agent, rotY) {
    const deskGroup = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 });
    const deskGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0b1324,
      metalness: 0.85,
      roughness: 0.15
    });

    // Curved Ergonomic Tabletop
    const topGeo = new THREE.BoxGeometry(2.1, 0.08, 0.85);
    const top = new THREE.Mesh(topGeo, deskGlassMat);
    top.position.y = 1.05;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Titanium Legs & Support Frame
    [-0.85, 0.85].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8);
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(lx, 0.52, 0);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Dual Ultra-Wide Curved Holographic Displays (Animated Canvas Textures)
    [-0.55, 0.55].forEach((sx, idx) => {
      const screenCurvedGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.55, 24, 1, true, -0.32, 0.64);
      screenCurvedGeo.rotateY(Math.PI);
      const canvasObj = this.screenCanvases[idx % 2];
      const screenMat = new THREE.MeshBasicMaterial({
        map: canvasObj.texture,
        side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(screenCurvedGeo, screenMat);
      screen.position.set(sx * 0.95, 1.52, -0.2);
      screen.rotation.y = sx > 0 ? -0.18 : 0.18;
      deskGroup.add(screen);

      // Display Stand Arm
      const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(sx * 0.7, 1.25, -0.2);
      deskGroup.add(arm);
    });

    // Low-Profile Illuminated Mechanical Keyboard
    const kbGeo = new THREE.BoxGeometry(0.7, 0.03, 0.25);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 1.1, 0.1);
    deskGroup.add(kb);

    // Glowing Touchpad / Status Ring
    const padGeo = new THREE.BoxGeometry(0.25, 0.015, 0.18);
    const padMat = new THREE.MeshBasicMaterial({ color: agent.deptColor });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0, 1.11, 0.28);
    deskGroup.add(pad);

    // Personal Accessories: Insulated Mars Thermal Tumbler & Datapad
    const mugGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.16, 12);
    const mug = new THREE.Mesh(mugGeo, metalMat);
    mug.position.set(0.72, 1.16, 0.15);
    deskGroup.add(mug);

    const padSlateGeo = new THREE.BoxGeometry(0.22, 0.015, 0.3);
    const padSlate = new THREE.Mesh(padSlateGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    padSlate.position.set(-0.68, 1.11, 0.15);
    padSlate.rotation.y = 0.2;
    deskGroup.add(padSlate);

    // Desk Department Glow Strip
    const stripGeo = new THREE.BoxGeometry(2.1, 0.02, 0.02);
    const strip = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: agent.deptColor }));
    strip.position.set(0, 1.09, -0.42);
    deskGroup.add(strip);

    return deskGroup;
  }

  // --- REALISTIC HUMAN SPECIALIST 3D MODEL ---
  createRealisticHumanSpecialist(agent, agentIndex) {
    const specialist = new THREE.Group();

    // Natural Skin Tones across the diverse crew
    const skinTones = [0xf5d0b0, 0xd4a373, 0xe0ac69, 0xc68642, 0xfce4d6, 0xb87333];
    const skinColor = skinTones[agentIndex % skinTones.length];
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.65,
      metalness: 0.08
    });

    // Hair Colors
    const hairColors = [0x1c1917, 0x3f2e21, 0x09090b, 0x475569, 0x785934];
    const hairColor = hairColors[(agentIndex * 2) % hairColors.length];
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.85,
      metalness: 0.05
    });

    // Mars Specialist Flight Suit Uniform (Dark Slate with Department Accents)
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.75,
      metalness: 0.2
    });

    const deptAccentMat = new THREE.MeshStandardMaterial({
      color: agent.deptColor,
      roughness: 0.4,
      metalness: 0.5
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.95
    });

    // 1. Ergonomic Herman-Miller Style Operator Chair
    const chair = this.createErgonomicChair();
    specialist.add(chair);

    // 2. Human Pelvis & Hips (Seated on chair cushion)
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.16, 0.32);
    const pelvis = new THREE.Mesh(pelvisGeo, suitMat);
    pelvis.position.y = 0.62;
    specialist.add(pelvis);

    // 3. Legs & Seated Posture (Knees bent 90°, boots on footrest)
    [-0.14, 0.14].forEach((lx) => {
      // Thigh extending horizontally forward
      const thighGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.44, 10);
      thighGeo.rotateX(Math.PI / 2);
      const thigh = new THREE.Mesh(thighGeo, suitMat);
      thigh.position.set(lx, 0.62, 0.22);
      specialist.add(thigh);

      // Knee joint
      const kneeGeo = new THREE.SphereGeometry(0.075, 10, 10);
      const knee = new THREE.Mesh(kneeGeo, suitMat);
      knee.position.set(lx, 0.62, 0.44);
      specialist.add(knee);

      // Calf extending down vertically
      const calfGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.44, 10);
      const calf = new THREE.Mesh(calfGeo, suitMat);
      calf.position.set(lx, 0.38, 0.44);
      specialist.add(calf);

      // Aerospace Tactical Boot
      const bootGeo = new THREE.BoxGeometry(0.11, 0.12, 0.22);
      const boot = new THREE.Mesh(bootGeo, new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 }));
      boot.position.set(lx, 0.14, 0.48);
      specialist.add(boot);
    });

    // 4. Human Torso & Chest in Mars Jumpsuit (Breathing Animation Anchor)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.72, 0);

    // Lower abdomen
    const abdomenGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.24, 12);
    const abdomen = new THREE.Mesh(abdomenGeo, suitMat);
    abdomen.position.y = 0.12;
    abdomen.castShadow = true;
    torsoGroup.add(abdomen);

    // Upper Chest & Shoulders
    const chestGeo = new THREE.CylinderGeometry(0.26, 0.21, 0.38, 12);
    const chest = new THREE.Mesh(chestGeo, suitMat);
    chest.position.y = 0.38;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Department Color Shoulder Epaulets & Collar Piping
    const collarGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, deptAccentMat);
    collar.position.y = 0.58;
    torsoGroup.add(collar);

    [-0.24, 0.24].forEach((ex) => {
      const epauletGeo = new THREE.BoxGeometry(0.12, 0.03, 0.16);
      const epaulet = new THREE.Mesh(epauletGeo, deptAccentMat);
      epaulet.position.set(ex, 0.54, 0);
      torsoGroup.add(epaulet);
    });

    // Biometric Vital-Sign Chest Sensor (Pulses with real heart rate ~72 bpm)
    const bioSensorGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    bioSensorGeo.rotateX(Math.PI / 2);
    const bioSensorMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const bioSensor = new THREE.Mesh(bioSensorGeo, bioSensorMat);
    bioSensor.position.set(0.08, 0.42, 0.21);
    torsoGroup.add(bioSensor);
    torsoGroup.userData.bioSensor = bioSensor;

    // Mission ID Name Badge
    const badgeGeo = new THREE.BoxGeometry(0.08, 0.04, 0.015);
    const badge = new THREE.Mesh(badgeGeo, chromeMat);
    badge.position.set(-0.08, 0.42, 0.21);
    torsoGroup.add(badge);

    // 5. Human Arms & Hands in Typing Posture
    [-0.26, 0.26].forEach((side) => {
      // Shoulder Joint
      const shoulderGeo = new THREE.SphereGeometry(0.075, 12, 12);
      const shoulder = new THREE.Mesh(shoulderGeo, suitMat);
      shoulder.position.set(side, 0.52, 0);
      torsoGroup.add(shoulder);

      // Upper Arm sloped downward
      const bicepGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.32, 10);
      const bicep = new THREE.Mesh(bicepGeo, suitMat);
      bicep.position.set(side * 1.1, 0.36, 0.08);
      bicep.rotation.z = side > 0 ? -0.22 : 0.22;
      bicep.rotation.x = 0.25;
      torsoGroup.add(bicep);

      // Elbow Joint
      const elbowGeo = new THREE.SphereGeometry(0.055, 10, 10);
      const elbow = new THREE.Mesh(elbowGeo, suitMat);
      elbow.position.set(side * 1.15, 0.22, 0.16);
      torsoGroup.add(elbow);

      // Forearm extending forward onto desk towards keyboard
      const forearmGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.36, 10);
      forearmGeo.rotateX(Math.PI / 2);
      const forearm = new THREE.Mesh(forearmGeo, suitMat);
      forearm.position.set(side * 0.95, 0.24, 0.34);
      forearm.rotation.y = side > 0 ? -0.25 : 0.25;
      torsoGroup.add(forearm);

      // Realistic Human Hand with Articulated Fingers over keyboard
      const handGroup = new THREE.Group();
      handGroup.position.set(side * 0.85, 0.24, 0.54);

      const palmGeo = new THREE.BoxGeometry(0.08, 0.025, 0.09);
      const palm = new THREE.Mesh(palmGeo, skinMat);
      handGroup.add(palm);

      // 4 Fingers + Thumb poised over keys
      for (let f = 0; f < 4; f++) {
        const fingerGeo = new THREE.BoxGeometry(0.015, 0.012, 0.04);
        const finger = new THREE.Mesh(fingerGeo, skinMat);
        finger.position.set(-0.03 + f * 0.02, -0.005, 0.06);
        handGroup.add(finger);
      }
      torsoGroup.add(handGroup);
      if (side > 0) torsoGroup.userData.rightHand = handGroup;
      else torsoGroup.userData.leftHand = handGroup;
    });

    // 6. Sculpted Human Head, Hair, and AR Communicator Headset
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.72, 0);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.14, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.06;
    headGroup.add(neck);

    // Head Cranium
    const headGeo = new THREE.SphereGeometry(0.18, 20, 20);
    headGeo.scale(0.88, 1.05, 0.95);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Nose & Jawline contour
    const noseGeo = new THREE.ConeGeometry(0.025, 0.06, 6);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 0.01, 0.17);
    headGroup.add(nose);

    // Natural Hair Sculpting tailored to each specialist
    const hairStyleType = agentIndex % 4;
    if (hairStyleType === 0) {
      // Commander Style: Slick textured side-quiff
      const hairCapGeo = new THREE.SphereGeometry(0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
      hairCapGeo.scale(0.9, 1.05, 0.98);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.04, -0.01);
      headGroup.add(hairCap);
    } else if (hairStyleType === 1) {
      // Crew Cut / Short Fade
      const hairCapGeo = new THREE.SphereGeometry(0.186, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
      hairCapGeo.scale(0.9, 1.02, 0.96);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.03, 0);
      headGroup.add(hairCap);
    } else if (hairStyleType === 2) {
      // Top Knot / Ponytail (Creative lead style)
      const hairCapGeo = new THREE.SphereGeometry(0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.03, -0.01);
      headGroup.add(hairCap);

      const bunGeo = new THREE.SphereGeometry(0.07, 10, 10);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 0.14, -0.16);
      headGroup.add(bun);
    } else {
      // Modern Layered Crop
      const hairCapGeo = new THREE.SphereGeometry(0.192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
      hairCapGeo.scale(0.92, 1.06, 0.98);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.04, -0.01);
      headGroup.add(hairCap);
    }

    // Smart AR Data Glasses or Communication Headset
    if (agentIndex % 2 === 0) {
      // Ultra-sleek AR Holographic Glasses across eyes
      const visorGeo = new THREE.BoxGeometry(0.28, 0.045, 0.06);
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: agent.deptColor,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        metalness: 0.9
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.04, 0.15);
      headGroup.add(visor);
    } else {
      // Aerospace Communicator Headset with boom mic
      const earPadGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12);
      earPadGeo.rotateZ(Math.PI / 2);
      const earPad = new THREE.Mesh(earPadGeo, darkMat);
      earPad.position.set(-0.16, 0.02, 0);
      headGroup.add(earPad);

      const micBoomGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6);
      micBoomGeo.rotateZ(Math.PI / 3);
      micBoomGeo.rotateX(0.2);
      const micBoom = new THREE.Mesh(micBoomGeo, chromeMat);
      micBoom.position.set(-0.11, -0.02, 0.1);
      headGroup.add(micBoom);

      // Mic Glowing LED tip
      const micTipGeo = new THREE.SphereGeometry(0.014, 8, 8);
      const micTip = new THREE.Mesh(micTipGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      micTip.position.set(-0.04, -0.05, 0.16);
      headGroup.add(micTip);
    }

    torsoGroup.add(headGroup);
    specialist.add(torsoGroup);

    // Save references for lifelike animations
    specialist.userData.torsoGroup = torsoGroup;
    specialist.userData.headGroup = headGroup;

    return specialist;
  }

  // --- ERGONOMIC OPERATOR CHAIR (HERMAN-MILLER / SCI-FI STYLE) ---
  createErgonomicChair() {
    const chairGroup = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.95 });
    const meshMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8, metalness: 0.2 });

    // 5-Spoke Star Base on Caster Wheels
    for (let s = 0; s < 5; s++) {
      const sa = (s * Math.PI * 2) / 5;
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.03, 0.34);
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      spoke.position.set(Math.sin(sa) * 0.17, 0.06, Math.cos(sa) * 0.17);
      spoke.rotation.y = sa;
      chairGroup.add(spoke);
    }

    // Hydraulic Gas Lift Cylinder
    const postGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.48, 12);
    const post = new THREE.Mesh(postGeo, chromeMat);
    post.position.y = 0.28;
    chairGroup.add(post);

    // Ergonomic Contoured Seat Cushion
    const seatGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.09, 16);
    const seat = new THREE.Mesh(seatGeo, meshMat);
    seat.position.y = 0.54;
    chairGroup.add(seat);

    // Aerodynamic Mesh Backrest with Lumbar Arch
    const backGeo = new THREE.BoxGeometry(0.44, 0.58, 0.06);
    const back = new THREE.Mesh(backGeo, meshMat);
    back.position.set(0, 0.88, -0.22);
    back.rotation.x = -0.1;
    chairGroup.add(back);

    // Spinal Spine Support Ribbing
    const spineGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.62, 8);
    const spine = new THREE.Mesh(spineGeo, chromeMat);
    spine.position.set(0, 0.86, -0.26);
    spine.rotation.x = -0.1;
    chairGroup.add(spine);

    // 3D Articulated Armrests
    [-0.24, 0.24].forEach((ax) => {
      const armSupportGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6);
      const armSupport = new THREE.Mesh(armSupportGeo, chromeMat);
      armSupport.position.set(ax, 0.65, 0);
      chairGroup.add(armSupport);

      const armPadGeo = new THREE.BoxGeometry(0.07, 0.02, 0.22);
      const armPad = new THREE.Mesh(armPadGeo, meshMat);
      armPad.position.set(ax, 0.76, 0.04);
      chairGroup.add(armPad);
    });

    return chairGroup;
  }

  // --- DATA PIPELINE SPLINES ---
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
      if (!fromZone || !toZone) return;

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
        opacity: 0.28
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
    });
  }

  triggerDataPacket(fromZoneId, toZoneId, color = 0x00f0ff) {
    const route = this.pipelineCurves.find((r) => r.from === fromZoneId && r.to === toZoneId);
    if (!route) return;

    const packetGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: color });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    this.scene.add(packetMesh);

    this.dataPackets.push({
      mesh: packetMesh,
      curve: route.curve,
      progress: 0,
      speed: 0.024 + Math.random() * 0.012
    });
  }

  // --- FLOATING 3D SPEECH BUBBLES ---
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
      pos.y += 2.2;

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

  // --- WAR ROOM MEETING TRANSITION ---
  toggleMeetingMode() {
    if (this.isMeetingMode) {
      this.dismissToWorkstations();
    } else {
      this.conveneWarRoomMeeting();
    }
  }

  conveneWarRoomMeeting(onComplete) {
    this.isMeetingMode = true;

    // Smoothly transition camera to focus on Central War Room table
    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: 0,
        y: 8.5,
        z: 9.8,
        duration: 1.5,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: 0,
          y: 2.2,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    }

    // Brighten Central Holographic Mars Globe
    if (this.warRoomGroup && this.warRoomGroup.userData.hologramBeam) {
      this.warRoomGroup.userData.hologramBeam.material.opacity = 0.38;
    }

    // Animate each Human Specialist smoothly to the central meeting table
    this.agents3D.forEach((specialist, i) => {
      const seat = specialist.userData.meetingSeat;
      if (!seat) return;

      if (window.gsap) {
        window.gsap.to(specialist.position, {
          x: seat.x,
          z: seat.z,
          duration: 1.5,
          delay: i * 0.04,
          ease: "power2.inOut"
        });

        window.gsap.to(specialist.position, {
          y: 0.4,
          duration: 0.75,
          delay: i * 0.04,
          yoyo: true,
          repeat: 1,
          ease: "power1.out"
        });

        window.gsap.to(specialist.rotation, {
          y: seat.rotY,
          duration: 1.3,
          delay: i * 0.04,
          ease: "power2.inOut"
        });
      } else {
        specialist.position.set(seat.x, 0.4, seat.z);
        specialist.rotation.y = seat.rotY;
      }
    });

    if (onComplete) setTimeout(onComplete, 1600);
  }

  dismissToWorkstations(onComplete) {
    this.isMeetingMode = false;

    // Restore Camera to Overview
    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: 16,
        y: 17,
        z: 22,
        duration: 1.5,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: 0,
          y: 1.8,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut"
        });
      }
    }

    if (this.warRoomGroup && this.warRoomGroup.userData.hologramBeam) {
      this.warRoomGroup.userData.hologramBeam.material.opacity = 0.18;
    }

    // Animate each Human Specialist back to their personal workstation
    this.agents3D.forEach((specialist, i) => {
      const homePos = specialist.userData.homePos;
      const homeRotY = specialist.userData.homeRotY;
      if (!homePos) return;

      if (window.gsap) {
        window.gsap.to(specialist.position, {
          x: homePos.x,
          z: homePos.z,
          duration: 1.4,
          delay: i * 0.03,
          ease: "power2.inOut"
        });

        window.gsap.to(specialist.position, {
          y: 0.4,
          duration: 0.7,
          delay: i * 0.03,
          yoyo: true,
          repeat: 1,
          ease: "power1.out"
        });

        window.gsap.to(specialist.rotation, {
          y: homeRotY,
          duration: 1.2,
          delay: i * 0.03,
          ease: "power2.inOut"
        });
      } else {
        specialist.position.copy(homePos);
        specialist.rotation.y = homeRotY;
      }
    });

    if (onComplete) setTimeout(onComplete, 1500);
  }

  // --- CAMERA NAVIGATION WITH CINEMATIC PRESETS ---
  focusCameraOn(targetKey) {
    this.activeFocus = targetKey;
    let targetPos = new THREE.Vector3(0, 1.8, 0);
    let cameraPos = new THREE.Vector3(16, 17, 22);

    if (targetKey === "overview") {
      targetPos.set(0, 1.8, 0);
      cameraPos.set(16, 17, 22);
    } else if (targetKey === "mars-window") {
      // Look straight out through the huge geodesic window toward Mars dunes & Rover
      targetPos.set(0, 3.5, -24);
      cameraPos.set(0, 2.6, -4.5);
    } else if (targetKey === "rover-cam") {
      // Exterior view outside beside the Rover looking back at the illuminated dome
      targetPos.set(0, 4.5, 0);
      cameraPos.set(6.5, 3.2, -26);
    } else if (targetKey === "war-room") {
      targetPos.set(0, 2.2, 0);
      cameraPos.set(0, 8.2, 9.5);
    } else if (targetKey === "isometric") {
      targetPos.set(0, 0, 0);
      cameraPos.set(24, 24, 24);
    } else {
      // Focus on specific Zone or Specialist
      const zone = VAMOPS_DATA.zones.find((z) => z.id === targetKey);
      if (zone) {
        targetPos.set(zone.coords.x, 2.0, zone.coords.z);
        cameraPos.set(zone.coords.x + 5.5, 7.5, zone.coords.z + 7.5);
      }
    }

    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration: 1.4,
        ease: "power2.inOut"
      });
      if (this.controls) {
        window.gsap.to(this.controls.target, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.4,
          ease: "power2.inOut"
        });
      }
    } else {
      this.camera.position.copy(cameraPos);
      if (this.controls) this.controls.target.copy(targetPos);
    }
  }

  // --- INTERACTION & RAYCASTING ---
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

  // --- ANIMATION LOOP (BREATHING, TYPING, MARS GLOBE, SCREENS) ---
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    this.frameCount++;

    // 1. Orbit Controls
    if (this.controls) {
      this.controls.autoRotate = this.isAutoRotate;
      this.controls.autoRotateSpeed = 0.65;
      this.controls.update();
    }

    // 2. Update Live Animated Screen Canvases (Every 2 frames for 60fps smoothness)
    if (this.frameCount % 2 === 0) {
      this.updateScreenCanvases(elapsedTime);
    }

    // 3. Central Mars Globe Rotation & Pulsing Light Beam
    if (this.warRoomGroup && this.warRoomGroup.userData.marsGlobe) {
      this.warRoomGroup.userData.marsGlobe.rotation.y = elapsedTime * 0.25;
      if (this.warRoomGroup.userData.hologramBeam) {
        const pulse = 1.0 + Math.sin(elapsedTime * 2.8) * 0.06;
        this.warRoomGroup.userData.hologramBeam.scale.set(pulse, 1.0, pulse);
      }
    }

    // 4. Mars Exploration Rover Subtle Antenna Sweep
    if (this.roverModel) {
      this.roverModel.children.forEach((c) => {
        if (c.geometry && c.geometry.type === "CylinderGeometry" && c.position.y > 1.8) {
          c.rotation.y = Math.sin(elapsedTime * 0.8) * 0.25;
        }
      });
    }

    // 5. Atmospheric Martian Dust Particles Drift
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += 0.035; // Drift Eastward
        if (positions[i] > 40) positions[i] = -40;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Lifelike Human Specialist Micro-Animations (Natural Breathing, Head Glances, Typing)
    this.agents3D.forEach((specialist) => {
      const offset = specialist.userData.animOffset || 0;

      // Natural Human Breathing (Torso gently rises and expands on 3.5s respiratory wave)
      if (specialist.userData.torsoGroup) {
        const breath = Math.sin(elapsedTime * 1.8 + offset);
        specialist.userData.torsoGroup.position.y = 0.72 + breath * 0.018;
        specialist.userData.torsoGroup.scale.set(
          1.0 + breath * 0.015,
          1.0 + breath * 0.015,
          1.0 + breath * 0.025
        );

        // Biometric Sensor Heartbeat Glow Pulse (~72 bpm = 1.2 Hz)
        if (specialist.userData.torsoGroup.userData.bioSensor) {
          const heartPulse = (Math.sin(elapsedTime * 7.5 + offset) + 1) * 0.5;
          specialist.userData.torsoGroup.userData.bioSensor.material.opacity = 0.4 + heartPulse * 0.6;
        }

        // Active Typing Motion on Hands
        if (!this.isMeetingMode) {
          if (specialist.userData.torsoGroup.userData.rightHand) {
            specialist.userData.torsoGroup.userData.rightHand.position.y =
              0.24 + Math.sin(elapsedTime * 8.0 + offset) * 0.008;
          }
          if (specialist.userData.torsoGroup.userData.leftHand) {
            specialist.userData.torsoGroup.userData.leftHand.position.y =
              0.24 + Math.cos(elapsedTime * 7.2 + offset) * 0.008;
          }
        }
      }

      // Natural Human Head Glance (Looking between primary screen, secondary screen, and datapad)
      if (specialist.userData.headGroup) {
        if (!this.isMeetingMode) {
          const glance = Math.sin(elapsedTime * 0.65 + offset);
          specialist.userData.headGroup.rotation.y = glance * 0.28; // Look left/right at monitors
          specialist.userData.headGroup.rotation.x = (Math.cos(elapsedTime * 0.45 + offset) - 0.5) * 0.1; // Glance at desk
        } else {
          // In meeting: Look toward center table Mars hologram
          specialist.userData.headGroup.rotation.y = Math.sin(elapsedTime * 0.9 + offset) * 0.12;
          specialist.userData.headGroup.rotation.x = -0.05;
        }
      }
    });

    // 7. Data Packets Along Curves
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

    // 8. Update 3D Speech Bubbles
    this.updateSpeechBubbles();

    // 9. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
