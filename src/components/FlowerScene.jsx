import { OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const DISPLAY_POSITIONS = {
  rose: [-2.05, 0, 0],
  tulip: [0, 0, 0],
  lily: [2.12, 0, 0],
};

const FLOATING_PARTICLES = [
  [8, 18, 0],
  [17, 70, 1.1],
  [28, 30, 0.5],
  [39, 79, 1.7],
  [48, 20, 0.9],
  [58, 68, 2.2],
  [68, 34, 1.4],
  [78, 78, 0.4],
  [88, 26, 1.9],
  [92, 62, 0.8],
];

const BUTTERFLY_LANDING_SPOTS = [
  [-2.05, 2.5, 0.08],
  [-2.9, 1.9, -0.05],
  [-1.48, 1.88, -0.18],
  [-0.9, 2.24, 0.08],
  [0.74, 2.42, -0.04],
  [0.98, 1.2, 0.06],
  [2.37, 2.2, -0.08],
  [1.72, 1.24, 0.32],
  [3.02, 1.9, 0.1],
];

const BUTTERFLIES = [
  { phase: 0.2, period: 6.4, rest: 1.1, centerX: -1.7, radiusX: 1.9, baseZ: 0.44, scale: 0.72, color: "#f7b7de", spotOffset: 0 },
  { phase: 2.1, period: 7.2, rest: 1.35, centerX: 0.2, radiusX: 2.4, baseZ: -0.12, scale: 0.64, color: "#b8e9ff", spotOffset: 3 },
  { phase: 3.6, period: 6.8, rest: 1.2, centerX: 1.45, radiusX: 2.0, baseZ: 0.28, scale: 0.68, color: "#ffe1a8", spotOffset: 5 },
  { phase: 5.0, period: 8.1, rest: 1.45, centerX: 0.6, radiusX: 2.8, baseZ: -0.48, scale: 0.58, color: "#d7c6ff", spotOffset: 7 },
];

function easeInOut(value) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function FlowerScene({ selectedFlower, openedFlowerInfo, focusToken, onFlowerOpen }) {
  return (
    <section className="visual-art-scene frozen-botanical-scene orbital-flower-scene">
      <div className="pastel-cloud-field" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="cloud cloud-three" />
        <span className="cloud cloud-four" />
      </div>

      <Canvas
        className="flower-canvas"
        camera={{ position: [0, 1.72, 7.2], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <SceneContent
          selectedFlower={selectedFlower}
          openedFlowerInfo={openedFlowerInfo}
          focusToken={focusToken}
          onFlowerOpen={onFlowerOpen}
        />
      </Canvas>

      <div className="floating-crystals" aria-hidden="true">
        {FLOATING_PARTICLES.map(([x, y, delay], index) => (
          <span key={index} style={{ "--x": `${x}%`, "--y": `${y}%`, "--delay": `${delay}s` }} />
        ))}
      </div>

      <div className="scene-light-leak" aria-hidden="true" />
    </section>
  );
}

function SceneContent({ selectedFlower, openedFlowerInfo, focusToken, onFlowerOpen }) {
  const controlsRef = useRef(null);
  const stageRef = useRef(null);
  const focusRef = useRef({
    until: 0,
    target: new THREE.Vector3(0, 1.18, 0),
    camera: new THREE.Vector3(0, 1.72, 7.2),
  });
  const { camera, size } = useThree();
  const isMobile = size.width < 700;

  useEffect(() => {
    if (selectedFlower) {
      return;
    }

    camera.position.set(0, isMobile ? 1.72 : 1.72, isMobile ? 8.6 : 7.2);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.18, 0);
      controlsRef.current.update();
    }
  }, [camera, isMobile, selectedFlower]);

  useEffect(() => {
    if (!selectedFlower) {
      return;
    }

    const position = DISPLAY_POSITIONS[selectedFlower];
    if (!position) {
      return;
    }

    const focusY = selectedFlower === "rose" ? 1.5 : selectedFlower === "lily" ? 1.58 : 1.24;
    focusRef.current.target.set(position[0], focusY, 0);
    focusRef.current.camera.set(position[0] * 0.42, isMobile ? 1.86 : 1.7, isMobile ? 7.15 : 5.05);
    focusRef.current.until = performance.now() + 1200;
  }, [selectedFlower, focusToken, isMobile]);

  useFrame((_, delta) => {
    if (stageRef.current) {
      stageRef.current.position.y = Math.sin(performance.now() * 0.001) * 0.018;
    }

    if (performance.now() < focusRef.current.until && controlsRef.current) {
      camera.position.lerp(focusRef.current.camera, Math.min(1, delta * 2.9));
      controlsRef.current.target.lerp(focusRef.current.target, Math.min(1, delta * 3.2));
      controlsRef.current.update();
    }
  });

  const roseActive = selectedFlower === "rose" || openedFlowerInfo === "rose";
  const tulipActive = selectedFlower === "tulip" || openedFlowerInfo === "tulip";
  const lilyActive = selectedFlower === "lily" || openedFlowerInfo === "lily";

  return (
    <>
      <ambientLight intensity={1.85} />
      <directionalLight position={[2.8, 5.8, 4.2]} intensity={2.65} castShadow />
      <directionalLight position={[-4.4, 3.4, 2.2]} intensity={0.9} color="#fff1f5" />
      <pointLight position={[-1.8, 2.4, 2.2]} intensity={2.8} color="#ffd0da" distance={5.5} />
      <pointLight position={[2.2, 2.1, 1.8]} intensity={2.1} color="#fff3c2" distance={5} />
      <pointLight position={[2.2, 2.5, 1.4]} intensity={2.6} color="#ffb4d7" distance={4.8} />

      <group ref={stageRef} position={[0, isMobile ? -0.52 : -0.86, 0]} scale={isMobile ? 0.42 : 0.9}>
        <GalleryBase />
        <RoseDisplay active={roseActive} onOpen={() => onFlowerOpen("rose")} />
        <TulipArrangement active={tulipActive} onOpen={() => onFlowerOpen("tulip")} />
        <LilyArrangement active={lilyActive} onOpen={() => onFlowerOpen("lily")} />
        <ButterflySwarm />
      </group>

      <Sparkles count={48} scale={[7.2, 3.0, 4.2]} size={1.6} speed={0.18} color="#ffffff" opacity={0.35} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        makeDefault
        minDistance={3.0}
        maxDistance={10.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.72}
        target={[0, 1.18, 0]}
      />
    </>
  );
}

function GalleryBase() {
  const grassBlades = useMemo(
    () =>
      Array.from({ length: 280 }, (_, index) => {
        const angle = index * 2.399963;
        const radius = Math.sqrt(((index * 37) % 100) / 100);
        const x = Math.cos(angle) * radius * 4.08;
        const z = Math.sin(angle) * radius * 1.18;
        const height = 0.105 + (index % 8) * 0.018;
        const lean = ((index % 13) - 6) * 0.016;
        return [x, z, height, lean];
      }),
    [],
  );

  return (
    <group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.72, 140]} />
        <meshStandardMaterial color="#f2e7ec" roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh position={[0, -0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.78, 4.72, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.48} />
      </mesh>
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.58, 130]} />
        <meshBasicMaterial color="#c7b5d7" transparent opacity={0.12} />
      </mesh>

      <mesh position={[0, -0.018, 0]} scale={[4.18, 0.088, 1.28]} receiveShadow>
        <sphereGeometry args={[1, 58, 16]} />
        <meshStandardMaterial
          color="#6b4428"
          roughness={0.84}
          metalness={0.01}
          emissive="#241107"
          emissiveIntensity={0.03}
        />
      </mesh>

      <mesh position={[0, 0.038, 0]} scale={[3.82, 0.046, 1.08]} receiveShadow>
        <sphereGeometry args={[1, 58, 14]} />
        <meshStandardMaterial
          color="#2f8f3f"
          roughness={0.7}
          metalness={0.01}
          emissive="#123d18"
          emissiveIntensity={0.06}
        />
      </mesh>

      {grassBlades.map(([x, z, height, lean], index) => (
        <mesh
          key={`base-grass-${index}`}
          position={[x, 0.045 + height * 0.5, z]}
          rotation={[lean * 1.5, 0, lean]}
        >
          <cylinderGeometry args={[0.004, 0.008, height, 5]} />
          <meshStandardMaterial color={index % 4 === 0 ? "#65d775" : "#1e8d35"} roughness={0.54} />
        </mesh>
      ))}
    </group>
  );
}

function BotanicalGroup({ id, position, active, onOpen, children }) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    const target = active || hovered ? 1.045 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
  });

  return (
    <group
      ref={groupRef}
      name={id}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {children}
      {(active || hovered) && <pointLight position={[0, 1.7, 0.3]} intensity={2.4} color="#fff7fb" distance={2.9} />}
    </group>
  );
}

function SwayGroup({ children, phase = 0, strength = 0.025 }) {
  const ref = useRef(null);

  useFrame(() => {
    if (!ref.current) {
      return;
    }

    const time = performance.now() * 0.001;
    ref.current.rotation.z = Math.sin(time * 0.82 + phase) * strength;
    ref.current.rotation.x = Math.sin(time * 0.54 + phase * 0.7) * strength * 0.35;
  });

  return <group ref={ref}>{children}</group>;
}

function ButterflySwarm() {
  return (
    <group>
      {BUTTERFLIES.map((butterfly, index) => (
        <Butterfly key={`butterfly-${index}`} config={butterfly} landingSpots={BUTTERFLY_LANDING_SPOTS} />
      ))}
    </group>
  );
}

function Butterfly({ config, landingSpots }) {
  const groupRef = useRef(null);
  const leftWingRef = useRef(null);
  const rightWingRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !leftWingRef.current || !rightWingRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime() + config.phase;
    const cycle = elapsed % config.period;
    const approachTime = 0.55;
    const leaveTime = 0.5;
    const restStart = config.period * 0.52;
    const restEnd = restStart + config.rest;
    const spotIndex = (Math.floor(elapsed / config.period) + config.spotOffset) % landingSpots.length;
    const spot = landingSpots[spotIndex];
    const flyX = config.centerX + Math.sin(elapsed * 0.72 + config.phase) * config.radiusX + Math.sin(elapsed * 1.9) * 0.16;
    const flyY = 1.38 + Math.sin(elapsed * 1.05 + config.phase) * 0.45 + Math.sin(elapsed * 2.25) * 0.08;
    const flyZ = config.baseZ + Math.cos(elapsed * 0.58 + config.phase) * 0.78;
    const exitX = config.centerX + Math.sin((elapsed + 0.8) * 0.72 + config.phase) * config.radiusX;
    const exitY = 1.45 + Math.sin((elapsed + 0.8) * 1.05 + config.phase) * 0.42;
    const exitZ = config.baseZ + Math.cos((elapsed + 0.8) * 0.58 + config.phase) * 0.78;
    let landingAmount = 0;

    if (cycle >= restStart && cycle < restStart + approachTime) {
      landingAmount = easeInOut((cycle - restStart) / approachTime);
      groupRef.current.position.set(
        lerp(flyX, spot[0], landingAmount),
        lerp(flyY, spot[1], landingAmount),
        lerp(flyZ, spot[2], landingAmount),
      );
    } else if (cycle >= restStart + approachTime && cycle < restEnd) {
      landingAmount = 1;
      groupRef.current.position.set(
        spot[0] + Math.sin(elapsed * 5.2) * 0.01,
        spot[1] + Math.sin(elapsed * 4.1) * 0.012,
        spot[2] + Math.cos(elapsed * 4.4) * 0.01,
      );
    } else if (cycle >= restEnd && cycle < restEnd + leaveTime) {
      const t = easeInOut((cycle - restEnd) / leaveTime);
      landingAmount = 1 - t;
      groupRef.current.position.set(
        lerp(spot[0], exitX, t),
        lerp(spot[1], exitY, t),
        lerp(spot[2], exitZ, t),
      );
    } else {
      groupRef.current.position.set(flyX, flyY, flyZ);
    }

    const nextX = config.centerX + Math.sin((elapsed + 0.06) * 0.72 + config.phase) * config.radiusX;
    const nextZ = config.baseZ + Math.cos((elapsed + 0.06) * 0.58 + config.phase) * 0.78;
    const yaw = Math.atan2(nextX - groupRef.current.position.x, nextZ - groupRef.current.position.z);
    groupRef.current.rotation.set(
      Math.sin(elapsed * 1.4) * 0.12,
      yaw,
      Math.sin(elapsed * 1.8 + config.phase) * 0.16,
    );
    groupRef.current.scale.setScalar(config.scale * (landingAmount > 0.7 ? 0.88 : 1));

    const wingOpen =
      landingAmount > 0.7
        ? 0.42 + Math.sin(elapsed * 5.5) * 0.06
        : 0.48 + Math.sin(elapsed * 23 + config.phase) * 0.42;
    leftWingRef.current.rotation.y = wingOpen;
    rightWingRef.current.rotation.y = -wingOpen;
  });

  return (
    <group ref={groupRef}>
      <mesh raycast={null} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.011, 0.18, 8]} />
        <meshStandardMaterial color="#5a3659" roughness={0.42} metalness={0.04} />
      </mesh>
      <mesh raycast={null} position={[0, 0.105, 0]} scale={[0.026, 0.026, 0.026]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#4a294f" roughness={0.42} />
      </mesh>
      <group ref={leftWingRef} position={[-0.018, 0.025, 0]}>
        <ButterflyWing side={-1} color={config.color} />
      </group>
      <group ref={rightWingRef} position={[0.018, 0.025, 0]}>
        <ButterflyWing side={1} color={config.color} />
      </group>
    </group>
  );
}

function ButterflyWing({ side, color }) {
  return (
    <group rotation={[0, 0, side * 0.42]}>
      <mesh raycast={null} position={[side * 0.08, 0.04, 0]} rotation={[0, 0, side * 0.16]}>
        <planeGeometry args={[0.16, 0.24, 2, 2]} />
        <meshPhysicalMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.78}
          roughness={0.34}
          metalness={0.02}
          clearcoat={0.45}
          clearcoatRoughness={0.22}
        />
      </mesh>
      <mesh raycast={null} position={[side * 0.06, -0.08, 0.004]} rotation={[0, 0, side * -0.12]}>
        <planeGeometry args={[0.12, 0.16, 2, 2]} />
        <meshPhysicalMaterial
          color="#fff4fb"
          side={THREE.DoubleSide}
          transparent
          opacity={0.64}
          roughness={0.38}
          clearcoat={0.34}
        />
      </mesh>
    </group>
  );
}

function RoseDisplay({ active, onOpen }) {
  return (
    <BotanicalGroup id="rose" position={[-2.05, 0, 0.03]} active={active} onOpen={onOpen}>
      <SwayGroup phase={0.3} strength={0.016}>
        <CurvedStem
          points={[
            [0, 0.02, 0],
            [0.015, 0.78, 0.015],
            [-0.02, 1.52, -0.005],
            [0, 2.22, 0.02],
          ]}
          radius={0.028}
          color="#426f20"
          roughness={0.44}
        />

        <RoseThorns />
        <RoseLeafSystem />

        <group position={[0, 2.27, 0.03]} rotation={[0.92, -0.18, 0.02]}>
          <RoseBloom />
          <RoseSepals />
        </group>
        <RoseSideBloom
          points={[
            [0, 0.58, 0.01],
            [-0.22, 0.96, -0.03],
            [-0.55, 1.33, -0.05],
            [-0.78, 1.62, -0.04],
          ]}
          head={[-0.84, 1.67, -0.04]}
          rotation={[0.84, -0.48, -0.16]}
          scale={0.48}
        />
        <RoseSideBloom
          points={[
            [0.02, 0.42, 0.02],
            [0.28, 0.74, 0.04],
            [0.48, 1.05, 0.06],
            [0.62, 1.32, 0.04],
          ]}
          head={[0.66, 1.37, 0.04]}
          rotation={[0.9, 0.34, 0.14]}
          scale={0.42}
        />
        <RoseSideBloom
          points={[
            [-0.01, 0.34, 0.0],
            [-0.18, 0.62, 0.14],
            [-0.42, 0.86, 0.2],
            [-0.56, 1.05, 0.22],
          ]}
          head={[-0.6, 1.08, 0.23]}
          rotation={[0.8, -0.28, -0.28]}
          scale={0.34}
        />
        <RoseSideBloom
          points={[
            [0.02, 0.76, -0.02],
            [0.22, 1.06, -0.1],
            [0.38, 1.34, -0.16],
            [0.52, 1.62, -0.18],
          ]}
          head={[0.56, 1.68, -0.18]}
          rotation={[0.82, 0.52, 0.18]}
          scale={0.36}
        />
        <RoseExtraStem
          offset={[-0.38, 0, -0.24]}
          points={[
            [0, 0.02, 0],
            [-0.1, 0.58, 0.02],
            [-0.18, 1.0, 0.04],
            [-0.28, 1.36, 0.06],
          ]}
          head={[-0.3, 1.42, 0.06]}
          rotation={[0.86, -0.38, -0.1]}
          scale={0.44}
          leafSide={-1}
        />
        <RoseExtraStem
          offset={[0.36, 0, -0.26]}
          points={[
            [0, 0.02, 0],
            [0.08, 0.46, -0.02],
            [0.2, 0.88, -0.04],
            [0.32, 1.22, -0.06],
          ]}
          head={[0.34, 1.28, -0.06]}
          rotation={[0.78, 0.48, 0.18]}
          scale={0.4}
          leafSide={1}
        />
        <RoseExtraStem
          offset={[0.02, 0, 0.32]}
          points={[
            [0, 0.02, 0],
            [-0.02, 0.48, 0.08],
            [0.08, 0.88, 0.14],
            [0.18, 1.18, 0.18],
          ]}
          head={[0.2, 1.22, 0.2]}
          rotation={[0.82, 0.16, 0.05]}
          scale={0.36}
          leafSide={1}
        />
      </SwayGroup>
    </BotanicalGroup>
  );
}

function RoseSideBloom({ points, head, rotation, scale }) {
  return (
    <group>
      <CurvedStem points={points} radius={0.014} color="#426f20" roughness={0.45} />
      <group position={head} rotation={rotation} scale={scale}>
        <RoseBloom />
        <RoseSepals />
      </group>
    </group>
  );
}

function RoseExtraStem({ offset, points, head, rotation, scale, leafSide = 1 }) {
  const leafStem = [
    [0.02 * leafSide, 0.56, 0.01],
    [0.18 * leafSide, 0.66, 0.04],
    [0.34 * leafSide, 0.74, 0.06],
  ];

  return (
    <group position={offset}>
      <CurvedStem points={points} radius={0.013} color="#426f20" roughness={0.45} />
      <CurvedStem points={leafStem} radius={0.008} color="#456d22" roughness={0.48} />
      <SerratedRoseLeaf
        position={[0.38 * leafSide, 0.76, 0.07]}
        rotation={[0.42, leafSide > 0 ? -0.28 : 0.16, leafSide > 0 ? -0.92 : 0.92]}
        scale={[0.58, 0.58, 0.58]}
      />
      <group position={head} rotation={rotation} scale={scale}>
        <RoseBloom />
        <RoseSepals />
      </group>
    </group>
  );
}

function RoseBloom() {
  const petals = useMemo(() => {
    const layers = [
      { count: 7, radius: 0.07, y: -0.05, length: 0.42, width: 0.2, pitch: 0.22, curl: 0.2, fold: 0.075, roll: 0.28 },
      { count: 9, radius: 0.15, y: -0.1, length: 0.55, width: 0.3, pitch: 0.5, curl: 0.23, fold: 0.095, roll: 0.12 },
      { count: 11, radius: 0.24, y: -0.18, length: 0.68, width: 0.42, pitch: 0.82, curl: 0.28, fold: 0.12, roll: -0.06 },
      { count: 13, radius: 0.34, y: -0.27, length: 0.78, width: 0.52, pitch: 1.08, curl: 0.34, fold: 0.145, roll: -0.16 },
    ];

    return layers.flatMap((layer, layerIndex) =>
      Array.from({ length: layer.count }, (_, index) => {
        const angle = (index / layer.count) * Math.PI * 2 + layerIndex * 0.43;
        const shade = (index + layerIndex) % 4;
        return {
          ...layer,
          key: `rose-petal-${layerIndex}-${index}`,
          angle,
          roll: layer.roll + Math.sin(index * 1.38 + layerIndex) * 0.16,
          baseColor: shade === 0 ? "#5f020d" : "#870817",
          tipColor: shade === 2 ? "#df0e24" : "#b9071d",
          edgeColor: shade === 1 ? "#ff3347" : "#5f0612",
          opacity: 1,
        };
      }),
    );
  }, []);

  return (
    <group>
      <mesh position={[0, 0.02, 0]} scale={[0.16, 0.11, 0.16]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#6b020e" emissive="#8f0618" emissiveIntensity={0.08} roughness={0.68} />
      </mesh>
      <RoseSpiralCore />
      {petals.map((petal) => (
        <RadialPetal
          key={petal.key}
          angle={petal.angle}
          radius={petal.radius}
          y={petal.y}
          pitch={petal.pitch}
          roll={petal.roll}
        >
          <PetalSurface
            length={petal.length}
            width={petal.width}
            curl={petal.curl}
            fold={petal.fold}
            baseColor={petal.baseColor}
            tipColor={petal.tipColor}
            edgeColor={petal.edgeColor}
            veinColor="#5c0612"
            opacity={petal.opacity}
            roundedTip
            sheen={0.42}
            roughness={0.62}
            veinCount={3}
          />
        </RadialPetal>
      ))}
    </group>
  );
}

function RoseSpiralCore() {
  const core = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const angle = index * 0.72;
        return {
          key: `core-${index}`,
          angle,
          radius: 0.006 + index * 0.0048,
          y: 0.01 + index * 0.0018,
          pitch: 0.02 + index * 0.012,
          roll: 0.9 - index * 0.035,
          length: 0.28 + index * 0.004,
          width: 0.105 + index * 0.0028,
        };
      }),
    [],
  );

  return (
    <group>
      {core.map((petal) => (
        <RadialPetal
          key={petal.key}
          angle={petal.angle}
          radius={petal.radius}
          y={petal.y}
          pitch={petal.pitch}
          roll={petal.roll}
        >
          <PetalSurface
            length={petal.length}
            width={petal.width}
            curl={0.22}
            fold={0.055}
            baseColor="#4f020a"
            tipColor="#b2081d"
            edgeColor="#f42a3e"
            veinColor="#4b0610"
            roundedTip
            opacity={1}
            roughness={0.64}
            sheen={0.38}
            veinCount={1}
          />
        </RadialPetal>
      ))}
    </group>
  );
}

function RoseSepals() {
  return (
    <group position={[0, -0.34, 0]}>
      {Array.from({ length: 7 }, (_, index) => {
        const angle = (index / 7) * Math.PI * 2 + 0.18;
        return (
          <RadialPetal
            key={`sepal-${index}`}
            angle={angle}
            radius={0.08}
            y={0.02}
            pitch={2.22}
            roll={Math.sin(index) * 0.18}
          >
            <PetalSurface
              length={0.48 + (index % 2) * 0.08}
              width={0.08}
              curl={0.1}
              fold={0.055}
              baseColor="#496f1f"
              tipColor="#203b0e"
              edgeColor="#7f9b38"
              veinColor="#1f3d10"
              opacity={0.98}
              roughness={0.5}
              sheen={0.16}
              veinCount={1}
            />
          </RadialPetal>
        );
      })}
    </group>
  );
}

function RoseThorns() {
  const thorns = [
    [-0.035, 0.62, 0.035, -1],
    [0.036, 0.86, -0.01, 1],
    [-0.04, 1.17, 0.025, -1],
    [0.035, 1.45, 0.0, 1],
    [-0.032, 1.77, -0.012, -1],
  ];

  return (
    <group>
      {thorns.map(([x, y, z, side], index) => (
        <mesh
          key={`thorn-${index}`}
          position={[x, y, z]}
          rotation={[0, 0.18 * side, side > 0 ? -Math.PI / 2 : Math.PI / 2]}
          castShadow
        >
          <coneGeometry args={[0.024, 0.105, 8]} />
          <meshStandardMaterial color="#7d301f" roughness={0.5} />
        </mesh>
      ))}
      {[0.5, 1.03, 1.54, 1.92].map((y, index) => (
        <mesh key={`node-${index}`} position={[index % 2 ? 0.012 : -0.01, y, 0.014]} scale={[0.04, 0.026, 0.04]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#355f18" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function RoseLeafSystem() {
  return (
    <group>
      <CurvedStem
        points={[
          [0, 1.1, 0.01],
          [-0.2, 1.22, 0.04],
          [-0.46, 1.28, 0.04],
        ]}
        radius={0.012}
        color="#456d22"
      />
      <SerratedRoseLeaf
        position={[-0.54, 1.29, 0.04]}
        rotation={[0.4, -0.04, 1.12]}
        scale={[1.25, 1.25, 1.25]}
      />

      <CurvedStem
        points={[
          [0.005, 0.55, 0.01],
          [0.2, 0.7, 0.08],
          [0.48, 0.78, 0.12],
        ]}
        radius={0.011}
        color="#456d22"
      />
      <SerratedRoseLeaf
        position={[0.5, 0.78, 0.12]}
        rotation={[0.34, -0.36, -0.96]}
        scale={[1.02, 1.02, 1.02]}
      />
      <SerratedRoseLeaf
        position={[0.34, 0.53, 0.08]}
        rotation={[0.46, -0.14, -0.34]}
        scale={[0.78, 0.78, 0.78]}
      />
      <SerratedRoseLeaf
        position={[0.68, 0.5, 0.1]}
        rotation={[0.52, -0.62, -1.35]}
        scale={[0.86, 0.86, 0.86]}
      />
    </group>
  );
}

function SerratedRoseLeaf({ position, rotation, scale = [1, 1, 1] }) {
  const teeth = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const t = 0.13 + Math.floor(index / 2) * 0.065;
        const edge = Math.sin(Math.PI * t) ** 0.74 * 0.12;
        return [side * edge, t * 0.54, 0.016, side, t];
      }),
    [],
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <PetalSurface
        length={0.54}
        width={0.25}
        curl={0.035}
        fold={0.055}
        baseColor="#1f5b19"
        tipColor="#2f7b25"
        edgeColor="#0f3410"
        veinColor="#b4df91"
        opacity={0.98}
        roughness={0.4}
        sheen={0.34}
        veinCount={7}
      />
      {teeth.map(([x, y, z, side], index) => (
        <mesh
          key={`leaf-tooth-${index}`}
          position={[x, y, z]}
          rotation={[0, 0, side > 0 ? -Math.PI / 2 : Math.PI / 2]}
          scale={[1, 1, 0.7]}
        >
          <coneGeometry args={[0.009, 0.032, 5]} />
          <meshStandardMaterial color="#173f12" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function TulipArrangement({ active, onOpen }) {
  const tulips = useMemo(
    () => [
      {
        id: "pink-open",
        points: [
          [-0.08, 0.02, 0.05],
          [-0.24, 0.78, 0.04],
          [-0.62, 1.44, 0.02],
          [-0.9, 2.02, 0.05],
        ],
        head: [-0.9, 2.04, 0.05],
        rotation: [0.04, -0.36, -0.12],
        baseColor: "#fff0c8",
        tipColor: "#f486ae",
        edgeColor: "#d94882",
        veinColor: "#c35d84",
        open: 0.9,
        scale: 1.02,
      },
      {
        id: "lavender-center",
        points: [
          [0, 0.02, 0],
          [-0.02, 0.75, 0.03],
          [-0.06, 1.35, 0.02],
          [-0.03, 1.82, 0.02],
        ],
        head: [-0.03, 1.85, 0.02],
        rotation: [0.02, 0.02, 0.02],
        baseColor: "#f4dccd",
        tipColor: "#9d76c5",
        edgeColor: "#76539a",
        veinColor: "#754d91",
        open: 0.5,
        scale: 1.0,
      },
      {
        id: "gold-upright",
        points: [
          [0.06, 0.02, -0.02],
          [0.22, 0.82, -0.03],
          [0.46, 1.55, -0.05],
          [0.74, 2.18, -0.06],
        ],
        head: [0.74, 2.22, -0.06],
        rotation: [-0.04, 0.28, 0.08],
        baseColor: "#f5dc6f",
        tipColor: "#f5b13d",
        edgeColor: "#d65062",
        veinColor: "#ad7935",
        open: 0.25,
        scale: 1.06,
      },
      {
        id: "magenta-cupped",
        points: [
          [-0.02, 0.02, 0.08],
          [-0.24, 0.52, 0.11],
          [-0.54, 0.93, 0.11],
          [-0.72, 1.25, 0.12],
        ],
        head: [-0.72, 1.28, 0.12],
        rotation: [0.05, -0.42, -0.18],
        baseColor: "#f0b4da",
        tipColor: "#bd2d7d",
        edgeColor: "#842060",
        veinColor: "#84305d",
        open: 0.38,
        scale: 0.86,
      },
      {
        id: "cream-blush",
        points: [
          [0.06, 0.02, 0.04],
          [0.2, 0.58, 0.02],
          [0.38, 1.15, 0.0],
          [0.5, 1.62, 0.02],
        ],
        head: [0.52, 1.66, 0.02],
        rotation: [0.04, 0.2, 0.1],
        baseColor: "#fff7cf",
        tipColor: "#f7b2c8",
        edgeColor: "#d77a9a",
        veinColor: "#c6768f",
        open: 0.58,
        scale: 0.82,
      },
      {
        id: "coral-back",
        points: [
          [0.08, 0.02, -0.06],
          [0.42, 0.74, -0.08],
          [0.82, 1.38, -0.1],
          [1.02, 1.8, -0.08],
        ],
        head: [1.04, 1.84, -0.08],
        rotation: [-0.02, 0.44, 0.18],
        baseColor: "#ffe38a",
        tipColor: "#f47f6d",
        edgeColor: "#d24a6b",
        veinColor: "#b75c4c",
        open: 0.36,
        scale: 0.76,
      },
      {
        id: "small-violet",
        points: [
          [-0.08, 0.02, 0.08],
          [-0.38, 0.5, 0.12],
          [-0.78, 0.9, 0.14],
          [-1.06, 1.18, 0.16],
        ],
        head: [-1.1, 1.22, 0.16],
        rotation: [0.05, -0.52, -0.24],
        baseColor: "#f2c8de",
        tipColor: "#9d5fba",
        edgeColor: "#6e3f98",
        veinColor: "#6f4290",
        open: 0.44,
        scale: 0.68,
      },
      {
        id: "peach-front",
        points: [
          [0.0, 0.02, 0.14],
          [0.22, 0.5, 0.24],
          [0.42, 0.9, 0.28],
          [0.54, 1.18, 0.3],
        ],
        head: [0.58, 1.22, 0.3],
        rotation: [0.08, 0.3, 0.18],
        baseColor: "#fff0bf",
        tipColor: "#f79b8d",
        edgeColor: "#db5d78",
        veinColor: "#b86666",
        open: 0.5,
        scale: 0.66,
      },
      {
        id: "pale-violet-back",
        points: [
          [0.03, 0.02, -0.12],
          [-0.18, 0.66, -0.2],
          [-0.42, 1.12, -0.26],
          [-0.54, 1.52, -0.32],
        ],
        head: [-0.58, 1.56, -0.33],
        rotation: [-0.04, -0.2, -0.08],
        baseColor: "#f8e7cf",
        tipColor: "#bfa2df",
        edgeColor: "#8a6eb5",
        veinColor: "#80639e",
        open: 0.34,
        scale: 0.7,
      },
      {
        id: "ruby-low",
        points: [
          [0.06, 0.02, 0.06],
          [0.36, 0.42, 0.04],
          [0.72, 0.76, 0.02],
          [0.94, 1.02, 0.04],
        ],
        head: [0.98, 1.06, 0.04],
        rotation: [0.02, 0.58, 0.28],
        baseColor: "#f1a0c6",
        tipColor: "#c0196b",
        edgeColor: "#7d134c",
        veinColor: "#8a2857",
        open: 0.42,
        scale: 0.6,
      },
      {
        id: "ivory-tall",
        points: [
          [-0.02, 0.02, -0.04],
          [0.08, 0.82, -0.18],
          [0.18, 1.62, -0.32],
          [0.28, 2.26, -0.42],
        ],
        head: [0.3, 2.3, -0.42],
        rotation: [-0.08, 0.12, 0.04],
        baseColor: "#fff7d9",
        tipColor: "#f4d2df",
        edgeColor: "#d78baa",
        veinColor: "#c5899f",
        open: 0.28,
        scale: 0.74,
      },
      {
        id: "blush-left-low",
        points: [
          [-0.04, 0.02, 0.12],
          [-0.36, 0.4, 0.22],
          [-0.78, 0.72, 0.28],
          [-1.12, 0.94, 0.3],
        ],
        head: [-1.16, 0.98, 0.3],
        rotation: [0.08, -0.62, -0.32],
        baseColor: "#ffe8c8",
        tipColor: "#ec7fb5",
        edgeColor: "#c44d85",
        veinColor: "#b45d86",
        open: 0.62,
        scale: 0.56,
      },
      {
        id: "soft-pink-back",
        points: [
          [-0.02, 0.02, -0.18],
          [-0.3, 0.7, -0.34],
          [-0.62, 1.28, -0.46],
          [-0.78, 1.68, -0.48],
        ],
        head: [-0.82, 1.72, -0.48],
        rotation: [-0.02, -0.44, -0.1],
        baseColor: "#ffeccf",
        tipColor: "#f0a2c5",
        edgeColor: "#c96e9a",
        veinColor: "#b76c91",
        open: 0.48,
        scale: 0.58,
      },
      {
        id: "gold-front-small",
        points: [
          [0.08, 0.02, 0.2],
          [0.3, 0.44, 0.34],
          [0.62, 0.78, 0.42],
          [0.82, 1.04, 0.44],
        ],
        head: [0.86, 1.08, 0.44],
        rotation: [0.1, 0.54, 0.28],
        baseColor: "#fff3a7",
        tipColor: "#f7b857",
        edgeColor: "#df6e68",
        veinColor: "#bd8050",
        open: 0.32,
        scale: 0.54,
      },
      {
        id: "violet-front-low",
        points: [
          [-0.08, 0.02, 0.2],
          [-0.3, 0.36, 0.34],
          [-0.56, 0.62, 0.44],
          [-0.76, 0.82, 0.48],
        ],
        head: [-0.8, 0.86, 0.5],
        rotation: [0.12, -0.58, -0.26],
        baseColor: "#f4d6dc",
        tipColor: "#ac79d0",
        edgeColor: "#7656ad",
        veinColor: "#7a5a9c",
        open: 0.56,
        scale: 0.5,
      },
      {
        id: "pearl-right",
        points: [
          [0.02, 0.02, -0.14],
          [0.28, 0.6, -0.28],
          [0.62, 1.08, -0.42],
          [0.92, 1.42, -0.5],
        ],
        head: [0.96, 1.46, -0.5],
        rotation: [-0.04, 0.38, 0.12],
        baseColor: "#fff8df",
        tipColor: "#f4bfd6",
        edgeColor: "#d889ac",
        veinColor: "#bd7c9e",
        open: 0.4,
        scale: 0.6,
      },
    ],
    [],
  );

  return (
    <BotanicalGroup id="tulip" position={[0, 0.02, 0]} active={active} onOpen={onOpen}>
      <SwayGroup phase={1.4} strength={0.018}>
        {tulips.map((tulip, index) => (
          <group key={tulip.id}>
            <CurvedStem points={tulip.points} radius={Math.max(0.008, 0.022 - index * 0.001)} color="#719c48" roughness={0.42} />
            <group position={tulip.head} rotation={tulip.rotation} scale={tulip.scale}>
              <TulipBloom {...tulip} />
            </group>
          </group>
        ))}
        <TulipLeaves />
      </SwayGroup>
    </BotanicalGroup>
  );
}

function TulipBloom({ baseColor, tipColor, edgeColor, veinColor, open }) {
  const petals = useMemo(() => {
    const outerCount = open > 0.75 ? 7 : 6;
    const outer = Array.from({ length: outerCount }, (_, index) => {
      const angle = (index / outerCount) * Math.PI * 2;
      return {
        key: `outer-${index}`,
        angle,
        radius: 0.095,
        y: -0.08,
        pitch: 0.22 + open * 0.82 + (index % 2) * 0.05,
        roll: Math.sin(index * 1.6) * 0.12,
        length: 0.68 + open * 0.12,
        width: 0.22 + open * 0.08,
      };
    });
    const inner = Array.from({ length: 3 }, (_, index) => {
      const angle = (index / 3) * Math.PI * 2 + Math.PI / 3;
      return {
        key: `inner-${index}`,
        angle,
        radius: 0.045,
        y: 0.0,
        pitch: 0.08 + open * 0.32,
        roll: Math.sin(index * 1.3) * 0.08,
        length: 0.58 + open * 0.08,
        width: 0.18 + open * 0.05,
      };
    });
    return [...outer, ...inner];
  }, [open]);

  return (
    <group>
      {petals.map((petal) => (
        <RadialPetal
          key={petal.key}
          angle={petal.angle}
          radius={petal.radius}
          y={petal.y}
          pitch={petal.pitch}
          roll={petal.roll}
        >
          <PetalSurface
            length={petal.length}
            width={petal.width}
            curl={0.13 + open * 0.1}
            fold={0.09}
            baseColor={baseColor}
            tipColor={tipColor}
            edgeColor={edgeColor}
            veinColor={veinColor}
            opacity={0.96}
            roughness={0.48}
            sheen={0.28}
            veinCount={7}
          />
        </RadialPetal>
      ))}
      <mesh position={[0, -0.02, 0]} scale={[0.055, 0.08, 0.055]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#e9d391" emissive="#fff3b0" emissiveIntensity={0.08} roughness={0.44} />
      </mesh>
    </group>
  );
}

function TulipLeaves() {
  const leaves = [
    [[-0.08, 0.14, 0.12], [0.46, -0.08, 0.36], [1.35, 1.0, 1.1], 0.84],
    [[0.1, 0.18, -0.06], [0.4, 0.12, -0.72], [1.2, 0.82, 1.0], 0.78],
    [[0.34, 0.28, -0.02], [0.52, -0.1, -0.52], [0.98, 0.75, 0.92], 0.66],
    [[-0.42, 0.2, 0.04], [0.55, 0.02, 0.95], [1.12, 0.78, 0.96], 0.72],
    [[0.58, 0.18, 0.03], [0.5, -0.06, -1.02], [1.45, 0.95, 1.05], 0.88],
    [[-0.64, 0.16, -0.12], [0.42, 0.04, 0.78], [1.02, 0.74, 0.88], 0.68],
    [[0.78, 0.14, 0.14], [0.46, -0.08, -1.08], [1.18, 0.82, 0.96], 0.72],
    [[-0.2, 0.12, 0.24], [0.38, -0.04, 0.34], [0.92, 0.66, 0.86], 0.6],
  ];

  return (
    <group>
      {leaves.map(([position, rotation, scale, length], index) => (
        <group key={`tulip-leaf-${index}`} position={position} rotation={rotation} scale={scale}>
          <PetalSurface
            length={length}
            width={0.16}
            curl={0.04}
            fold={0.055}
            baseColor={index % 2 ? "#80a957" : "#6c984a"}
            tipColor={index % 2 ? "#9dc36f" : "#5e873e"}
            edgeColor="#456f32"
            veinColor="#d7efb1"
            opacity={0.98}
            roughness={0.42}
            sheen={0.24}
            veinCount={3}
          />
        </group>
      ))}
    </group>
  );
}

function LilyArrangement({ active, onOpen }) {
  const blooms = useMemo(
    () => [
      {
        id: "lower-lily",
        points: [
          [0, 0.03, 0],
          [-0.06, 0.58, 0.04],
          [-0.34, 1.02, 0.08],
        ],
        head: [-0.4, 1.08, 0.1],
        rotation: [0.62, -0.52, -0.18],
        scale: 0.74,
      },
      {
        id: "left-lily",
        points: [
          [0, 0.08, 0],
          [-0.18, 0.9, -0.02],
          [-0.54, 1.54, 0.02],
        ],
        head: [-0.58, 1.6, 0.04],
        rotation: [0.72, -0.24, 0.08],
        scale: 0.68,
      },
      {
        id: "top-lily",
        points: [
          [0, 0.02, 0],
          [0.08, 0.88, -0.02],
          [0.22, 1.92, -0.08],
        ],
        head: [0.25, 1.98, -0.08],
        rotation: [0.66, 0.42, 0.16],
        scale: 0.7,
      },
      {
        id: "right-lily",
        points: [
          [0.02, 0.08, 0.02],
          [0.22, 0.72, 0.06],
          [0.56, 1.22, 0.08],
          [0.86, 1.66, 0.1],
        ],
        head: [0.9, 1.72, 0.1],
        rotation: [0.58, 0.56, 0.26],
        scale: 0.58,
      },
      {
        id: "center-lily",
        points: [
          [0, 0.06, 0.03],
          [0.08, 0.64, 0.02],
          [0.0, 1.08, 0.03],
          [-0.06, 1.38, 0.04],
        ],
        head: [-0.08, 1.44, 0.05],
        rotation: [0.7, 0.04, -0.06],
        scale: 0.56,
      },
      {
        id: "front-lily",
        points: [
          [0.02, 0.04, 0.08],
          [-0.16, 0.5, 0.22],
          [-0.36, 0.86, 0.3],
        ],
        head: [-0.42, 0.92, 0.32],
        rotation: [0.7, -0.66, -0.24],
        scale: 0.5,
      },
      {
        id: "back-lily",
        points: [
          [0, 0.04, -0.06],
          [0.28, 0.78, -0.18],
          [0.58, 1.44, -0.34],
        ],
        head: [0.62, 1.5, -0.36],
        rotation: [0.64, 0.76, 0.24],
        scale: 0.52,
      },
      {
        id: "side-lily",
        points: [
          [0.0, 0.04, 0.02],
          [-0.36, 0.82, -0.1],
          [-0.86, 1.3, -0.16],
        ],
        head: [-0.9, 1.36, -0.16],
        rotation: [0.6, -0.72, -0.12],
        scale: 0.48,
      },
      {
        id: "low-right-lily",
        points: [
          [0.02, 0.04, 0.08],
          [0.28, 0.5, 0.22],
          [0.54, 0.84, 0.3],
        ],
        head: [0.6, 0.9, 0.32],
        rotation: [0.68, 0.66, 0.26],
        scale: 0.46,
      },
      {
        id: "high-left-lily",
        points: [
          [-0.02, 0.04, -0.04],
          [-0.28, 0.88, -0.16],
          [-0.62, 1.76, -0.28],
          [-0.78, 2.32, -0.34],
        ],
        head: [-0.82, 2.38, -0.36],
        rotation: [0.58, -0.38, -0.08],
        scale: 0.5,
      },
      {
        id: "center-front-lily",
        points: [
          [0, 0.04, 0.12],
          [0.06, 0.62, 0.28],
          [0.02, 1.08, 0.42],
        ],
        head: [0, 1.14, 0.44],
        rotation: [0.72, 0.04, 0.04],
        scale: 0.48,
      },
    ],
    [],
  );

  const buds = useMemo(
    () => [
      {
        id: "upper-bud",
        points: [
          [0.02, 0.06, 0],
          [-0.04, 1.1, -0.04],
          [-0.34, 2.18, -0.02],
        ],
        position: [-0.36, 2.28, -0.02],
        rotation: [0.1, -0.18, -0.18],
        scale: 1.05,
      },
      {
        id: "right-bud",
        points: [
          [0.03, 0.08, 0.01],
          [0.28, 0.92, 0.04],
          [0.58, 1.5, 0.08],
        ],
        position: [0.62, 1.58, 0.08],
        rotation: [0.08, 0.35, 0.28],
        scale: 0.92,
      },
      {
        id: "left-bud",
        points: [
          [-0.02, 0.04, 0.02],
          [-0.3, 0.76, 0.02],
          [-0.72, 1.36, 0.04],
        ],
        position: [-0.76, 1.44, 0.04],
        rotation: [0.08, -0.42, -0.28],
        scale: 0.82,
      },
      {
        id: "front-bud",
        points: [
          [0.02, 0.04, 0.04],
          [0.18, 0.54, 0.22],
          [0.34, 0.94, 0.34],
        ],
        position: [0.38, 1.02, 0.36],
        rotation: [0.12, 0.52, 0.3],
        scale: 0.66,
      },
      {
        id: "back-bud",
        points: [
          [-0.02, 0.04, -0.02],
          [-0.18, 0.74, -0.2],
          [-0.42, 1.3, -0.36],
        ],
        position: [-0.46, 1.38, -0.38],
        rotation: [0.05, -0.36, -0.18],
        scale: 0.72,
      },
      {
        id: "low-left-bud",
        points: [
          [-0.02, 0.04, 0.04],
          [-0.34, 0.48, 0.14],
          [-0.58, 0.84, 0.2],
        ],
        position: [-0.62, 0.9, 0.22],
        rotation: [0.08, -0.58, -0.3],
        scale: 0.62,
      },
      {
        id: "high-right-bud",
        points: [
          [0.02, 0.04, -0.04],
          [0.24, 0.86, -0.16],
          [0.48, 1.76, -0.28],
        ],
        position: [0.52, 1.86, -0.3],
        rotation: [0.06, 0.44, 0.18],
        scale: 0.68,
      },
    ],
    [],
  );

  return (
    <BotanicalGroup id="lily" position={[2.12, 0.02, -0.04]} active={active} onOpen={onOpen}>
      <SwayGroup phase={2.2} strength={0.015}>
        <CurvedStem
          points={[
            [0, 0.02, 0],
            [-0.02, 0.72, 0.01],
            [0.02, 1.45, -0.02],
            [0.08, 2.18, -0.05],
          ]}
          radius={0.025}
          color="#405c1f"
          roughness={0.5}
        />

        {blooms.map((bloom) => (
          <group key={bloom.id}>
            <CurvedStem points={bloom.points} radius={0.015} color="#536d25" roughness={0.52} />
            <group position={bloom.head} rotation={bloom.rotation} scale={bloom.scale}>
              <LilyBloom />
            </group>
          </group>
        ))}

        {buds.map((bud) => (
          <group key={bud.id}>
            <CurvedStem points={bud.points} radius={0.014} color="#536d25" roughness={0.52} />
            <group position={bud.position} rotation={bud.rotation} scale={bud.scale}>
              <LilyBud />
            </group>
          </group>
        ))}

        <LilyLeaves />
      </SwayGroup>
    </BotanicalGroup>
  );
}

function LilyBloom() {
  const spots = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const x = -0.24 + col * 0.095 + (row % 2) * 0.025;
        const y = 0.36 + row * 0.095;
        const r = 0.008 + (index % 3) * 0.002;
        return [x, y, r];
      }),
    [],
  );

  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2 + 0.16;
        const outer = index % 2 === 0;
        return (
          <RadialPetal
            key={`lily-petal-${index}`}
            angle={angle}
            radius={outer ? 0.08 : 0.045}
            y={-0.06}
            pitch={outer ? 1.1 : 0.86}
            roll={outer ? 0.16 : -0.12}
          >
            <PetalSurface
              length={outer ? 0.72 : 0.64}
              width={outer ? 0.3 : 0.25}
              curl={outer ? 0.34 : 0.27}
              fold={0.13}
              baseColor="#fff0bd"
              tipColor={outer ? "#f35d9e" : "#f7a0c2"}
              edgeColor="#c91475"
              veinColor="#b11b6a"
              opacity={0.98}
              roughness={0.43}
              sheen={0.34}
              veinCount={5}
              spots={spots.filter((_, spotIndex) => spotIndex % 2 === index % 2).slice(0, 12)}
            />
          </RadialPetal>
        );
      })}
      <LilyStamens />
    </group>
  );
}

function LilyStamens() {
  return (
    <group position={[0, 0.0, 0]}>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <group key={`lily-stamen-${index}`} rotation={[0.58, angle, 0]}>
            <mesh position={[0.055, 0.22, 0]}>
              <cylinderGeometry args={[0.006, 0.004, 0.4, 8]} />
              <meshStandardMaterial color="#f5d867" emissive="#ffe08a" emissiveIntensity={0.08} roughness={0.38} />
            </mesh>
            <mesh position={[0.055, 0.43, 0]} rotation={[0.2, 0, 0.12]} scale={[0.018, 0.06, 0.018]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial color="#7b1d18" emissive="#4d0808" emissiveIntensity={0.2} roughness={0.46} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.28, 0]} scale={[0.016, 0.26, 0.016]}>
        <cylinderGeometry args={[1, 0.7, 1, 8]} />
        <meshStandardMaterial color="#f7d95b" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.44, 0]} scale={[0.026, 0.026, 0.026]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#c84d2b" roughness={0.38} />
      </mesh>
    </group>
  );
}

function LilyBud() {
  return (
    <group>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <RadialPetal key={`bud-petal-${index}`} angle={angle} radius={0.035} y={0} pitch={0.1} roll={0.06}>
            <PetalSurface
              length={0.54}
              width={0.12}
              curl={0.05}
              fold={0.055}
              baseColor="#d0ad54"
              tipColor="#f091a9"
              edgeColor="#9d5b24"
              veinColor="#8b6d25"
              opacity={0.98}
              roughness={0.45}
              sheen={0.26}
              veinCount={3}
            />
          </RadialPetal>
        );
      })}
      <mesh position={[0, 0.18, 0]} scale={[0.055, 0.26, 0.055]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#d99c63" roughness={0.44} />
      </mesh>
    </group>
  );
}

function LilyLeaves() {
  const leaves = [
    [[-0.18, 0.34, 0.08], [0.35, -0.2, 1.08], [1.0, 1.0, 1.0], 0.62],
    [[0.12, 0.44, 0.05], [0.28, 0.08, -0.92], [0.9, 0.9, 0.9], 0.58],
    [[-0.34, 0.74, 0.05], [0.42, -0.16, 1.18], [0.88, 0.88, 0.88], 0.52],
    [[0.28, 0.86, 0.0], [0.34, 0.12, -1.05], [0.86, 0.86, 0.86], 0.5],
  ];

  return (
    <group>
      {leaves.map(([position, rotation, scale, length], index) => (
        <group key={`lily-leaf-${index}`} position={position} rotation={rotation} scale={scale}>
          <PetalSurface
            length={length}
            width={0.14}
            curl={0.035}
            fold={0.045}
            baseColor="#123d12"
            tipColor="#315f1e"
            edgeColor="#071f08"
            veinColor="#b8d98c"
            opacity={0.98}
            roughness={0.38}
            sheen={0.42}
            veinCount={3}
          />
        </group>
      ))}
    </group>
  );
}

function CurvedStem({ points, radius = 0.02, color = "#567a2c", roughness = 0.48 }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    return new THREE.TubeGeometry(curve, 36, radius, 10, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.04} />
    </mesh>
  );
}

function RadialPetal({ angle, radius, y, pitch, roll = 0, children }) {
  return (
    <group rotation={[0, angle, 0]}>
      <group position={[0, y, radius]} rotation={[pitch, 0, roll]}>
        {children}
      </group>
    </group>
  );
}

function PetalSurface({
  length = 0.6,
  width = 0.24,
  curl = 0.1,
  fold = 0.08,
  baseColor = "#d92a45",
  tipColor = "#f23b4d",
  edgeColor = "#831125",
  veinColor = "#ffffff",
  opacity = 1,
  roughness = 0.5,
  sheen = 0.2,
  veinCount = 5,
  roundedTip = false,
  spots = [],
}) {
  const geometry = useMemo(
    () =>
      createPetalGeometry({
        length,
        width,
        curl,
        fold,
        baseColor,
        tipColor,
        edgeColor,
        roundedTip,
      }),
    [length, width, curl, fold, baseColor, tipColor, edgeColor, roundedTip],
  );

  const veins = useMemo(() => {
    const count = Math.max(1, veinCount);
    return Array.from({ length: count }, (_, index) => {
      const middle = (count - 1) / 2;
      const offset = count === 1 ? 0 : (index - middle) / middle;
      return offset * width * 0.34;
    });
  }, [veinCount, width]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent={opacity < 1}
          opacity={opacity}
          roughness={roughness}
          metalness={0.01}
          clearcoat={sheen}
          clearcoatRoughness={0.28}
          sheen={sheen}
          sheenRoughness={0.58}
        />
      </mesh>
      {veins.map((x, index) => (
        <mesh
          key={`vein-${index}`}
          position={[x, length * 0.5, curl * 0.38 + 0.012]}
          rotation={[0.02, 0, -x * 1.4]}
        >
          <cylinderGeometry args={[index === Math.floor(veins.length / 2) ? 0.0045 : 0.0027, 0.0022, length * 0.76, 5]} />
          <meshBasicMaterial color={veinColor} transparent opacity={index === Math.floor(veins.length / 2) ? 0.42 : 0.24} />
        </mesh>
      ))}
      {spots.map(([x, y, radius], index) => (
        <mesh key={`petal-spot-${index}`} position={[x * width, y * length, curl * 0.42 + 0.02]} scale={[radius, radius * 0.58, radius]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#8a1555" transparent opacity={0.68} />
        </mesh>
      ))}
    </group>
  );
}

function createPetalGeometry({
  length,
  width,
  curl,
  fold,
  baseColor,
  tipColor,
  edgeColor,
  roundedTip = false,
  segmentsX = 16,
  segmentsY = 30,
}) {
  const vertices = [];
  const colors = [];
  const indices = [];
  const base = new THREE.Color(baseColor);
  const tip = new THREE.Color(tipColor);
  const edge = new THREE.Color(edgeColor);

  for (let yIndex = 0; yIndex <= segmentsY; yIndex += 1) {
    const t = yIndex / segmentsY;
    const pointedTaper = Math.sin(Math.PI * t) ** 0.58;
    const roundedGrowth = Math.sin(Math.PI * Math.min(t / 0.84, 1) * 0.5) ** 0.52;
    const topSoftness = 1 - Math.max(0, t - 0.84) * 0.78;
    const taper = roundedTip ? roundedGrowth * topSoftness : pointedTaper;
    const upperFullness = 0.78 + 0.22 * Math.sin(Math.PI * Math.min(1, t * 1.12));
    const halfWidth = width * taper * upperFullness * 0.5;

    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const s = xIndex / segmentsX;
      const side = s * 2 - 1;
      const roundedCorner = roundedTip ? Math.max(0, (t - 0.78) / 0.22) * Math.abs(side) ** 2 * length * 0.08 : 0;
      const petalY = t * length - roundedCorner;
      const edgeLift = Math.abs(side) ** 1.9 * fold * 1.18 * Math.sin(Math.PI * t);
      const centerCrease = -fold * 0.5 * (1 - Math.abs(side)) ** 1.9 * Math.sin(Math.PI * t);
      const tipCurl = curl * t ** 2.15 + curl * 0.42 * Math.max(0, t - 0.72) ** 2 * Math.cos(side * Math.PI);
      const naturalWave = Math.sin(t * Math.PI * 3.4 + side * 1.2) * fold * 0.08 * Math.abs(side) * t;
      const x = side * halfWidth;
      const z = edgeLift + centerCrease + tipCurl + naturalWave;
      const color = base.clone().lerp(tip, t * 0.88);
      color.lerp(edge, Math.abs(side) ** 2.4 * 0.34);

      vertices.push(x, petalY, z);
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let yIndex = 0; yIndex < segmentsY; yIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = yIndex * (segmentsX + 1) + xIndex;
      const b = a + 1;
      const c = a + segmentsX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default FlowerScene;
