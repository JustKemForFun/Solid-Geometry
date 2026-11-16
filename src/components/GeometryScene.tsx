import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { models, type ShapeDefinition, type ShapeFace, type ShapeId } from "../data/models";

interface GeometrySceneProps {
  shape: ShapeId;
  fold: number;
  side: number;
  theme: "light" | "dark";
  autoRotate: boolean;
  resetRef: React.MutableRefObject<(() => void) | null>;
}

function foldedPoint(
  net: readonly [number, number],
  solid: readonly [number, number, number],
  fold: number,
  scale: number,
) {
  return new THREE.Vector3(
    THREE.MathUtils.lerp(net[0], solid[0], fold) * scale,
    THREE.MathUtils.lerp(net[1], solid[1], fold) * scale,
    THREE.MathUtils.lerp(0, solid[2], fold) * scale,
  );
}

function getModelVertices(model: ShapeDefinition, fold: number, scale: number) {
  return model.faces.flatMap((face) =>
    face.points.map((point) => foldedPoint(point.net, point.solid, fold, scale)),
  );
}

function sceneCenter(vertices: THREE.Vector3[]) {
  const bounds = new THREE.Box3().setFromPoints(vertices);
  return bounds.getCenter(new THREE.Vector3());
}

function CameraFit({ shape, fold, side }: Pick<GeometrySceneProps, "shape" | "fold" | "side">) {
  const { camera, size } = useThree();
  const targetHalfHeight = useRef(4);
  const model = models[shape];
  const unitScale = side / 4;

  useEffect(() => {
    camera.position.set(7, 6, 9);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
  }, [camera]);

  useEffect(() => {
    camera.updateMatrixWorld(true);
    const vertices = getModelVertices(model, fold / 100, unitScale);
    const center = sceneCenter(vertices);
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const horizontal = vertices.map((vertex) => vertex.clone().sub(center).dot(right));
    const vertical = vertices.map((vertex) => vertex.clone().sub(center).dot(up));
    const aspect = size.width / Math.max(size.height, 1);
    const width = Math.max(...horizontal) - Math.min(...horizontal);
    const height = Math.max(...vertical) - Math.min(...vertical);
    targetHalfHeight.current = Math.max(height / 2, width / (2 * aspect), 1.5) * 1.3;
  }, [camera, fold, model, shape, side, size.height, size.width, unitScale]);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const halfHeight = THREE.MathUtils.damp(camera.top, targetHalfHeight.current, 5, delta);
    const halfWidth = halfHeight * (size.width / Math.max(size.height, 1));
    // Three.js cameras are imperative objects; update the projection in the render loop.
    // oxlint-disable-next-line react/immutability
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.updateProjectionMatrix();
  });

  return null;
}

interface FoldingFaceProps {
  face: ShapeFace;
  fold: number;
  foldRef: React.MutableRefObject<number>;
  scale: number;
}

function FoldingFace({ face, fold, foldRef, scale }: FoldingFaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(face.points.length * 3), 3);
    face.points.forEach((point, index) => {
      const vertex = foldedPoint(point.net, point.solid, fold / 100, scale);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    });
    result.setAttribute("position", positions);
    const indices: number[] = [];
    for (let index = 1; index < face.points.length - 1; index += 1) {
      indices.push(0, index, index + 1);
    }
    result.setIndex(indices);
    result.computeVertexNormals();
    result.computeBoundingSphere();
    return result;
  }, [face, fold, scale]);
  const outlineGeometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(face.points.length * 3), 3);
    face.points.forEach((point, index) => {
      const vertex = foldedPoint(point.net, point.solid, fold / 100, scale);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    });
    result.setAttribute("position", positions);
    result.computeBoundingSphere();
    return result;
  }, [face, fold, scale]);

  useEffect(
    () => () => {
      geometry.dispose();
      outlineGeometry.dispose();
    },
    [geometry, outlineGeometry],
  );

  useFrame(() => {
    const progress = foldRef.current;
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const outline = outlineGeometry.getAttribute("position") as THREE.BufferAttribute;
    face.points.forEach((point, index) => {
      const vertex = foldedPoint(point.net, point.solid, progress, scale);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
      outline.setXYZ(index, vertex.x, vertex.y, vertex.z);
    });
    positions.needsUpdate = true;
    outline.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={face.color} roughness={0.48} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      <lineLoop geometry={outlineGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </lineLoop>
    </group>
  );
}

function ShapeMesh({ shape, fold, side }: Omit<GeometrySceneProps, "autoRotate" | "resetRef" | "theme">) {
  const model = models[shape];
  const foldRef = useRef(fold / 100);
  const scale = side / 4;
  const center = useMemo(
    () => sceneCenter(getModelVertices(model, fold / 100, scale)),
    [fold, model, scale],
  );

  useFrame((_, delta) => {
    foldRef.current = THREE.MathUtils.damp(foldRef.current, fold / 100, 5, delta);
  });

  return (
    <group position={center.clone().negate()}>
      {model.faces.map((face, index) => (
        <FoldingFace
          key={`${shape}-${index}`}
          face={face}
          fold={fold}
          foldRef={foldRef}
          scale={scale}
        />
      ))}
    </group>
  );
}

export function GeometryScene({
  shape,
  fold,
  side,
  theme,
  autoRotate,
  resetRef,
}: GeometrySceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    // Let R3F's ResizeObserver attach before triggering its initial measurement.
    const timer = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    resetRef.current = () => controlsRef.current?.reset();
    return () => {
      resetRef.current = null;
    };
  }, [resetRef]);

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true }}
      aria-label={`Mô hình ${models[shape].name} 3D`}
      orthographic
      camera={{ position: [7, 6, 9], zoom: 1, near: 0.1, far: 100 }}
    >
      <color attach="background" args={[theme === "dark" ? "#111a29" : "#f9fbff"]} />
      <ambientLight intensity={1.75} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} castShadow />
      <directionalLight position={[-5, 2, -4]} intensity={0.8} color="#c6d3ff" />
      <CameraFit shape={shape} fold={fold} side={side} />
      <ShapeMesh shape={shape} fold={fold} side={side} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.75}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
        minZoom={0.55}
        maxZoom={3}
      />
    </Canvas>
  );
}
