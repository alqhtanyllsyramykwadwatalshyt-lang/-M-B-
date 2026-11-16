import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  RotateCcw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  Box,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

type ModelType = 'pipe' | 'elbow' | 't-joint' | 'assembled';

export const ThreeDView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<ModelType>('assembled');
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [cutaway, setCutaway] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Scene refs to communicate with Three.js render loop without re-creating canvas
  const stateRef = useRef({
    activeModel: 'assembled' as ModelType,
    explodedFactor: 0,
    wireframe: false,
    cutaway: false,
    autoRotate: true,
  });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current.activeModel = activeModel;
    stateRef.current.explodedFactor = explodedFactor;
    stateRef.current.wireframe = wireframe;
    stateRef.current.cutaway = cutaway;
    stateRef.current.autoRotate = autoRotate;
  }, [activeModel, explodedFactor, wireframe, cutaway, autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup Three.js Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071827);
    scene.fog = new THREE.FogExp2(0x071827, 0.05);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 3.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Map using RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (Warm Key + Cool Fill + Soft Rim)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x0a73c7, 0x071827, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // 5. Contact Shadow Radial Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.65)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    scene.add(shadowMesh);

    // 6. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep above floor
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.target.set(0, 0.6, 0);

    // 7. Procedural CanvasTexture for JIZAN Pipe Stamping & Arabic Logo
    const createPipeStampingTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 256;
      const ctx = c.getContext('2d')!;

      // Background white / light gray UPVC finish
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 1024, 256);

      // Stamping ribbon repeated twice
      for (let offset = 40; offset < 1024; offset += 500) {
        // Red JIZAN Logo
        ctx.fillStyle = '#C81D25';
        ctx.font = 'bold 36px Tajawal, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('جيزان JIZAN', offset + 240, 100);

        // Technical Spec text
        ctx.fillStyle = '#071827';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('UPVC PIPE PN16 2" (63mm) DIN 8062', offset + 380, 140);
        ctx.font = 'normal 15px Tajawal, sans-serif';
        ctx.fillText('مصنع جيزان لصناعة الأنابيب البلاستيكية - معتمد للمياه', offset + 380, 170);

        // Blue accent bar
        ctx.fillStyle = '#0A73C7';
        ctx.fillRect(offset, 185, 420, 6);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const logoImg = new Image();
      logoImg.src = '/assets/aistudio/image-1791387165348__1__e8778707.png';
      logoImg.onload = () => {
        for (let offset = 40; offset < 1024; offset += 500) {
          ctx.drawImage(logoImg, offset, 45, 150, 64);
        }
        tex.needsUpdate = true;
      };

      return tex;
    };

    const pipeStampingTex = createPipeStampingTexture();

    // 8. Shared Materials
    const pipeMaterial = new THREE.MeshStandardMaterial({
      map: pipeStampingTex,
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.08,
    });

    const fittingWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xededed,
      roughness: 0.35,
      metalness: 0.05,
    });

    const blueRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a73c7,
      roughness: 0.25,
      metalness: 0.15,
      emissive: 0x021b33,
    });

    const interiorDarkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6,
      side: THREE.BackSide,
    });

    // 9. Root Model Container
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Composite 3-12 Part Procedural Models
    // A: Straight Pipe Model
    const pipeGroup = new THREE.Group();
    {
      // 1. Primary body
      const bodyGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.8, 32, 1, true);
      const bodyMesh = new THREE.Mesh(bodyGeo, pipeMaterial);
      bodyMesh.castShadow = !isSoftwareGl;
      pipeGroup.add(bodyMesh);

      // 2. Interior lining
      const innerGeo = new THREE.CylinderGeometry(0.31, 0.31, 2.8, 32, 1, true);
      const innerMesh = new THREE.Mesh(innerGeo, interiorDarkMaterial);
      pipeGroup.add(innerMesh);

      // 3. Chamfered bevel at top (15-degree chamfer from manufacturing brief)
      const chamferGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.08, 32);
      const chamferMesh = new THREE.Mesh(chamferGeo, fittingWhiteMaterial);
      chamferMesh.position.y = 1.44;
      pipeGroup.add(chamferMesh);

      // 4. Socket stop collar at bottom
      const collarGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 32);
      const collarMesh = new THREE.Mesh(collarGeo, fittingWhiteMaterial);
      collarMesh.position.y = -1.35;
      pipeGroup.add(collarMesh);

      pipeGroup.position.y = 1.4;
    }

    // B: 90-Degree Elbow with M&B Blue Line Ring
    const elbowGroup = new THREE.Group();
    {
      // Curve path for torus/tube
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.6, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.6, 0, 0)
      );
      const elbowTubeGeo = new THREE.TubeGeometry(curve, 24, 0.36, 24, false);
      const elbowMesh = new THREE.Mesh(elbowTubeGeo, fittingWhiteMaterial);
      elbowMesh.castShadow = !isSoftwareGl;
      elbowGroup.add(elbowMesh);

      // Vertical Socket 1 (Collar + Iconic Blue Ring)
      const socket1Geo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 32);
      const socket1Mesh = new THREE.Mesh(socket1Geo, fittingWhiteMaterial);
      socket1Mesh.position.set(0, 0.75, 0);
      elbowGroup.add(socket1Mesh);

      const blueRing1Geo = new THREE.CylinderGeometry(0.426, 0.426, 0.07, 32);
      const blueRing1Mesh = new THREE.Mesh(blueRing1Geo, blueRingMaterial);
      blueRing1Mesh.position.set(0, 0.75, 0);
      elbowGroup.add(blueRing1Mesh);

      // Horizontal Socket 2 (Collar + Iconic Blue Ring)
      const socket2Geo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 32);
      const socket2Mesh = new THREE.Mesh(socket2Geo, fittingWhiteMaterial);
      socket2Mesh.rotation.z = Math.PI / 2;
      socket2Mesh.position.set(0.75, 0, 0);
      elbowGroup.add(socket2Mesh);

      const blueRing2Geo = new THREE.CylinderGeometry(0.426, 0.426, 0.07, 32);
      const blueRing2Mesh = new THREE.Mesh(blueRing2Geo, blueRingMaterial);
      blueRing2Mesh.rotation.z = Math.PI / 2;
      blueRing2Mesh.position.set(0.75, 0, 0);
      elbowGroup.add(blueRing2Mesh);

      elbowGroup.position.set(0, 0.6, 0);
    }

    // C: T-Joint (تيه متساوي)
    const tJointGroup = new THREE.Group();
    {
      // Main through-body
      const mainGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.8, 32);
      const mainMesh = new THREE.Mesh(mainGeo, fittingWhiteMaterial);
      tJointGroup.add(mainMesh);

      // Branch body
      const branchGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.9, 32);
      const branchMesh = new THREE.Mesh(branchGeo, fittingWhiteMaterial);
      branchMesh.rotation.z = Math.PI / 2;
      branchMesh.position.set(0.45, 0, 0);
      tJointGroup.add(branchMesh);

      // Blue Rings on the 3 Sockets
      const ringTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.43, 0.43, 0.07, 32),
        blueRingMaterial
      );
      ringTop.position.set(0, 0.7, 0);
      tJointGroup.add(ringTop);

      const ringBottom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.43, 0.43, 0.07, 32),
        blueRingMaterial
      );
      ringBottom.position.set(0, -0.7, 0);
      tJointGroup.add(ringBottom);

      const ringBranch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.43, 0.43, 0.07, 32),
        blueRingMaterial
      );
      ringBranch.rotation.z = Math.PI / 2;
      ringBranch.position.set(0.75, 0, 0);
      tJointGroup.add(ringBranch);

      tJointGroup.position.set(0, 1.0, 0);
    }

    // D: Assembled Piping System (Pipe + Elbow + Coupler with Exploded View capability)
    const assembledGroup = new THREE.Group();
    const assembledPipeA = pipeGroup.clone();
    assembledPipeA.position.set(0, 1.5, 0);
    assembledPipeA.scale.set(0.85, 0.85, 0.85);

    const assembledElbow = elbowGroup.clone();
    assembledElbow.position.set(0, 0.3, 0);
    assembledElbow.scale.set(0.85, 0.85, 0.85);

    const assembledPipeB = pipeGroup.clone();
    assembledPipeB.rotation.z = Math.PI / 2;
    assembledPipeB.position.set(1.5, 0.3, 0);
    assembledPipeB.scale.set(0.85, 0.85, 0.85);

    assembledGroup.add(assembledPipeA);
    assembledGroup.add(assembledElbow);
    assembledGroup.add(assembledPipeB);

    // Initial attach
    rootGroup.add(assembledGroup);

    // 10. Animation & Render Loop
    let frameId = 0;
    let clock = new THREE.Clock();

    const updateMaterialsState = () => {
      const isWire = stateRef.current.wireframe;
      pipeMaterial.wireframe = isWire;
      fittingWhiteMaterial.wireframe = isWire;
      blueRingMaterial.wireframe = isWire;
    };

    const updateModelSelection = () => {
      const m = stateRef.current.activeModel;
      rootGroup.clear();
      if (m === 'pipe') rootGroup.add(pipeGroup);
      else if (m === 'elbow') rootGroup.add(elbowGroup);
      else if (m === 't-joint') rootGroup.add(tJointGroup);
      else rootGroup.add(assembledGroup);
    };

    let prevModel = stateRef.current.activeModel;

    function tick() {
      const delta = clock.getDelta();

      // Check model swap
      if (stateRef.current.activeModel !== prevModel) {
        prevModel = stateRef.current.activeModel;
        updateModelSelection();
      }

      updateMaterialsState();

      // Handle Exploded factor on assembled system
      const factor = stateRef.current.explodedFactor;
      assembledPipeA.position.y = 1.5 + factor * 0.8;
      assembledPipeB.position.x = 1.5 + factor * 0.8;

      // Auto rotation
      if (stateRef.current.autoRotate) {
        rootGroup.rotation.y += delta * 0.4;
      }

      controls.update();
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(tick);
    }

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleResetCamera = () => {
    setAutoRotate(true);
    setExplodedFactor(0);
    soundEffects.playClick();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Intro Header */}
      <section className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A73C7]"></span>
            <span className="text-xs font-bold text-sky-400">Three.js Studio PBR Inspector</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            المختبر ثلاثي الأبعاد لفحص منتجات <span className="text-[#C81D25]">جيزان</span> و <span className="text-[#0A73C7]">M&B</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            فحص تفاعلي 360 درجة، تفكيك الوصلات (Exploded View)، فحص جودة الطباعة الليزرية والخط الأزرق المميز.
          </p>
        </div>

        {/* Model Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'assembled', label: 'الوصلة المجمعة الكاملة' },
            { id: 'pipe', label: 'ماسورة جيزان UPVC' },
            { id: 'elbow', label: 'كوع 90° بالخط الأزرق' },
            { id: 't-joint', label: 'تيه متساوي M&B' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModel(item.id as ModelType);
                soundEffects.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeModel === item.id
                  ? 'bg-[#C81D25] text-white shadow-md shadow-red-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3D Canvas Viewport Container */}
      <div className="relative w-full h-[580px] bg-[#071827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Top Minimal Spec Badge */}
        <div className="absolute top-4 right-4 z-20 bg-slate-900/80 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
          <Box className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white">
            {activeModel === 'pipe'
              ? 'ماسورة UPVC جيزان الأصلية - مقاس 2" (63مم)'
              : activeModel === 'elbow'
              ? 'كوع 90 درجة مع الحلقة الزرقاء M&B'
              : activeModel === 't-joint'
              ? 'تيه 3 اتجاهات مع حلقات إحكام M&B'
              : 'منظومة سباكة مجمعة متكاملة'}
          </span>
        </div>

        {/* Top-Left quick view reset */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            onClick={handleResetCamera}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
            title="إعادة ضبط زاوية الكاميرا"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>إعادة التمركز</span>
          </button>
        </div>

        {/* Stable WebGL Ref Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Ergonomic Collapsible Bottom Control Dock (Mandatory Three.js Guideline) */}
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 transition-transform duration-300 ${
            isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
          }`}
        >
          {/* Collapse / Expand Tab Button */}
          <div className="flex justify-center mb-1">
            <button
              onClick={() => {
                setIsDockCollapsed(!isDockCollapsed);
                soundEffects.playClick();
              }}
              className="bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-4 py-1 rounded-t-xl text-[11px] font-bold flex items-center gap-1 shadow-md cursor-pointer"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>إظهار لوحة التحكم 3D</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>إخفاء لوحة التحكم</span>
                </>
              )}
            </button>
          </div>

          {/* Solid Bottom Dock Surface (No backdrop-filter over WebGL to avoid frame stalls) */}
          <div className="bg-[#0b1b2b] border border-slate-700/90 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* Exploded View Slider (Active for assembled system) */}
              <div className="flex-1 min-w-[200px] space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#0A73C7]" />
                    <span>تفكيك الأجزاء (Exploded View):</span>
                  </span>
                  <span className="font-mono text-sky-400 font-bold">
                    {Math.round(explodedFactor * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedFactor}
                  onChange={(e) => {
                    setExplodedFactor(Number(e.target.value));
                    setAutoRotate(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0A73C7]"
                />
              </div>

              {/* Wireframe toggle */}
              <button
                onClick={() => {
                  setWireframe(!wireframe);
                  soundEffects.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  wireframe
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                الهيكل الشبكي (Wireframe)
              </button>

              {/* Auto Rotate toggle */}
              <button
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  soundEffects.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  autoRotate
                    ? 'bg-[#C81D25] text-white'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {autoRotate ? 'الدوران نشط' : 'إيقاف الدوران'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
