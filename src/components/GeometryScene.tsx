import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  models,
  type ShapeDefinition,
  type ShapeFace,
  type ShapeId,
  type ShapeVertex,
} from "../data/models";
import type { FreePoint } from "./FreePointsPanel";

interface GeometrySceneProps {
  shape: ShapeId;
  fold: number;
  side: number;
  theme: "light" | "dark";
  autoRotate: boolean;
  showVertices: boolean;
  customPoints: FreePoint[];
  placingPoint: boolean;
  onPlacePoint: (point: [number, number, number]) => void;
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

const cuboidHinges = [
  { face: 1, parent: 0, edge: [[1, -0.75], [1, 0.75]] },
  { face: 2, parent: 1, edge: [[2, -0.75], [2, 0.75]] },
  { face: 3, parent: 0, edge: [[-1, -0.75], [-1, 0.75]] },
  { face: 4, parent: 0, edge: [[-1, 0.75], [1, 0.75]] },
  { face: 5, parent: 0, edge: [[-1, -0.75], [1, -0.75]] },
] as const;

function findFacePoint(face: ShapeFace, net: readonly [number, number]) {
  const found = face.points.find((point) => point.net[0] === net[0] && point.net[1] === net[1]);
  if (!found) throw new Error(`Missing hinge point on face "${face.name}".`);
  return found;
}

function faceNormal(face: ShapeFace) {
  const origin = new THREE.Vector3(...face.points[0].solid);
  const first = new THREE.Vector3(...face.points[1].solid).sub(origin);
  const second = new THREE.Vector3(...face.points[2].solid).sub(origin);
  return first.cross(second).normalize();
}

function getCuboidFaceTransforms(model: ShapeDefinition, fold: number) {
  const transforms: THREE.Matrix4[] = [];
  const rootPoint = model.faces[0].points[0];
  transforms[0] = new THREE.Matrix4().makeTranslation(
    (rootPoint.solid[0] - rootPoint.net[0]) * fold,
    (rootPoint.solid[1] - rootPoint.net[1]) * fold,
    rootPoint.solid[2] * fold,
  );

  cuboidHinges.forEach(({ face: faceIndex, parent: parentIndex, edge }) => {
    const parentTransform = transforms[parentIndex];
    if (!parentTransform) throw new Error(`Missing parent transform for cuboid face ${faceIndex}.`);

    const parentFace = model.faces[parentIndex];
    const currentStart = new THREE.Vector3(edge[0][0], edge[0][1], 0).applyMatrix4(parentTransform);
    const currentEnd = new THREE.Vector3(edge[1][0], edge[1][1], 0).applyMatrix4(parentTransform);
    const currentAxis = currentEnd.sub(currentStart).normalize();
    const solidStart = new THREE.Vector3(...findFacePoint(parentFace, edge[0]).solid);
    const solidEnd = new THREE.Vector3(...findFacePoint(parentFace, edge[1]).solid);
    const finalAxis = solidEnd.sub(solidStart).normalize();
    const parentNormal = faceNormal(parentFace);
    const childNormal = faceNormal(model.faces[faceIndex]);
    const angle = Math.atan2(
      finalAxis.dot(parentNormal.clone().cross(childNormal)),
      parentNormal.dot(childNormal),
    );
    const pivot = new THREE.Matrix4().makeTranslation(currentStart.x, currentStart.y, currentStart.z);
    const unpivot = new THREE.Matrix4().makeTranslation(-currentStart.x, -currentStart.y, -currentStart.z);
    const rotation = new THREE.Matrix4().makeRotationAxis(currentAxis, angle * fold);

    transforms[faceIndex] = pivot.multiply(rotation).multiply(unpivot).multiply(parentTransform);
  });

  return transforms;
}

function transformedPoint(
  net: readonly [number, number],
  transform: THREE.Matrix4,
  scale: number,
) {
  return new THREE.Vector3(net[0], net[1], 0).applyMatrix4(transform).multiplyScalar(scale);
}

function findVertexAnchor(model: ShapeDefinition, vertex: ShapeVertex) {
  for (const [faceIndex, face] of model.faces.entries()) {
    const point = face.points.find((candidate) =>
      candidate.solid.every((coordinate, index) => coordinate === vertex.point[index]),
    );
    if (point) return { faceIndex, net: point.net };
  }
  return null;
}

function createVertexTexture(label: string, theme: "light" | "dark") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create a canvas context for vertex labels.");

  context.beginPath();
  context.arc(64, 64, 59, 0, Math.PI * 2);
  context.fillStyle = theme === "dark" ? "#e8eefb" : "#ffffff";
  context.fill();
  context.lineWidth = 6;
  context.strokeStyle = theme === "dark" ? "#778fe0" : "#7189df";
  context.stroke();
  context.fillStyle = "#263957";
  context.font = "700 54px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, 64, 67, 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface VertexAnnotationProps {
  model: ShapeDefinition;
  vertex: ShapeVertex;
  scale: number;
  theme: "light" | "dark";
  foldRef?: React.MutableRefObject<number>;
  foldTransformsRef?: React.MutableRefObject<THREE.Matrix4[]>;
}

function VertexAnnotation({
  model,
  vertex,
  scale,
  theme,
  foldRef,
  foldTransformsRef,
}: VertexAnnotationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const anchor = useMemo(() => findVertexAnchor(model, vertex), [model, vertex]);
  const labelOffset = useMemo(() => {
    const center = model.vertices.reduce(
      (sum, point) => sum.add(new THREE.Vector3(...point.point)),
      new THREE.Vector3(),
    ).multiplyScalar(1 / model.vertices.length);
    const offset = new THREE.Vector3(...vertex.point).sub(center);
    if (offset.lengthSq() < 0.001) offset.set(0, 1, 0);
    return offset.normalize().multiplyScalar(0.18 * scale);
  }, [model, scale, vertex]);
  const texture = useMemo(() => createVertexTexture(vertex.label, theme), [theme, vertex.label]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = foldRef?.current ?? 1;
    const transform = anchor && model.id === "cuboid"
      ? foldTransformsRef?.current[anchor.faceIndex]
      : undefined;
    const position = transform && anchor
      ? transformedPoint(anchor.net, transform, scale)
      : anchor
        ? foldedPoint(anchor.net, vertex.point, progress, scale)
        : new THREE.Vector3(...vertex.point).multiplyScalar(scale);
    groupRef.current.position.copy(position);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.055 * scale, 12, 12]} />
        <meshBasicMaterial color="#f2c65f" />
      </mesh>
      <sprite position={labelOffset} scale={[0.27 * scale, 0.27 * scale, 1]} renderOrder={10}>
        <spriteMaterial map={texture} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

function VertexLabels({
  shape,
  side,
  theme,
  foldRef,
  foldTransformsRef,
}: Pick<GeometrySceneProps, "shape" | "side" | "theme"> & {
  foldRef?: React.MutableRefObject<number>;
  foldTransformsRef?: React.MutableRefObject<THREE.Matrix4[]>;
}) {
  const model = models[shape];
  if (model.vertices.length === 0) return null;

  return (
    <group>
      {model.vertices.map((vertex) => (
        <VertexAnnotation
          key={vertex.label}
          model={model}
          vertex={vertex}
          scale={side / 4}
          theme={theme}
          foldRef={foldRef}
          foldTransformsRef={foldTransformsRef}
        />
      ))}
    </group>
  );
}

function FreePointMarker({
  point,
  side,
  theme,
}: {
  point: FreePoint;
  side: number;
  theme: "light" | "dark";
}) {
  const scale = side / 4;
  const texture = useMemo(() => createVertexTexture(point.label, theme), [point.label, theme]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[point.x / 2, point.y / 2, point.z / 2]}>
      <mesh>
        <sphereGeometry args={[0.06 * scale, 12, 12]} />
        <meshBasicMaterial color="#f2c65f" depthTest={false} />
      </mesh>
      <sprite position={[0, 0.13 * scale, 0]} scale={[0.27 * scale, 0.27 * scale, 1]} renderOrder={20}>
        <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
      </sprite>
    </group>
  );
}

function PointPlacementPlane({
  onPlacePoint,
}: {
  onPlacePoint: (point: [number, number, number]) => void;
}) {
  const planeRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    if (!planeRef.current) return;
    planeRef.current.position.set(0, 0, 0);
    planeRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh
      ref={planeRef}
      onClick={(event) => {
        event.stopPropagation();
        onPlacePoint([event.point.x * 2, event.point.y * 2, event.point.z * 2]);
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="#ffffff"
        colorWrite={false}
        depthWrite={false}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

function getModelVertices(model: ShapeDefinition, fold: number, scale: number) {
  if (model.id === "cuboid") {
    const transforms = getCuboidFaceTransforms(model, fold);
    return model.faces.flatMap((face, index) =>
      face.points.map((point) => transformedPoint(point.net, transforms[index], scale)),
    );
  }

  if (model.geometry !== "polyhedron") {
    if (model.geometry === "sphere") {
      return Array.from({ length: 16 }, (_, latitude) =>
        Array.from({ length: 32 }, (_, longitude) => {
          const phi = (latitude / 15) * Math.PI;
          const theta = (longitude / 32) * Math.PI * 2;
          return new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * scale,
            Math.cos(phi) * scale,
            Math.sin(phi) * Math.sin(theta) * scale,
          );
        }),
      ).flat();
    }

    return Array.from({ length: 48 }, (_, index) => {
      const angle = (index / 48) * Math.PI * 2;
      const x = Math.cos(angle) * scale;
      const z = Math.sin(angle) * scale;
      return [
        new THREE.Vector3(x, -scale, z),
        new THREE.Vector3(model.geometry === "cone" ? 0 : x, scale, model.geometry === "cone" ? 0 : z),
      ];
    }).flat();
  }

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
  faceIndex: number;
  fold: number;
  foldRef: React.MutableRefObject<number>;
  foldTransformsRef?: React.MutableRefObject<THREE.Matrix4[]>;
  initialTransform?: THREE.Matrix4;
  scale: number;
}

function FoldingFace({
  face,
  faceIndex,
  fold,
  foldRef,
  foldTransformsRef,
  initialTransform,
  scale,
}: FoldingFaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(face.points.length * 3), 3);
    face.points.forEach((point, index) => {
      const transform = initialTransform;
      const vertex = transform
        ? transformedPoint(point.net, transform, scale)
        : foldedPoint(point.net, point.solid, fold / 100, scale);
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
  }, [face, fold, initialTransform, scale]);
  const outlineGeometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array(face.points.length * 3), 3);
    face.points.forEach((point, index) => {
      const transform = initialTransform;
      const vertex = transform
        ? transformedPoint(point.net, transform, scale)
        : foldedPoint(point.net, point.solid, fold / 100, scale);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    });
    result.setAttribute("position", positions);
    result.computeBoundingSphere();
    return result;
  }, [face, fold, initialTransform, scale]);

  useEffect(
    () => () => {
      geometry.dispose();
      outlineGeometry.dispose();
    },
    [geometry, outlineGeometry],
  );

  useFrame(() => {
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const outline = outlineGeometry.getAttribute("position") as THREE.BufferAttribute;
    face.points.forEach((point, index) => {
      const transform = foldTransformsRef?.current[faceIndex];
      const vertex = transform
        ? transformedPoint(point.net, transform, scale)
        : foldedPoint(point.net, point.solid, foldRef.current, scale);
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
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={face.color} roughness={0.48} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      <lineLoop geometry={outlineGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </lineLoop>
    </group>
  );
}

type ShapeMeshProps = Pick<GeometrySceneProps, "shape" | "fold" | "side" | "theme" | "showVertices">;

function PolyhedronMesh({ shape, fold, side, theme, showVertices }: ShapeMeshProps) {
  const model = models[shape];
  const foldRef = useRef(fold / 100);
  const initialTransforms = shape === "cuboid" ? getCuboidFaceTransforms(model, fold / 100) : [];
  const foldTransformsRef = useRef(initialTransforms);
  const scale = side / 4;
  const center = useMemo(
    () => sceneCenter(getModelVertices(model, fold / 100, scale)),
    [fold, model, scale],
  );

  useFrame((_, delta) => {
    foldRef.current = THREE.MathUtils.damp(foldRef.current, fold / 100, 5, delta);
    if (shape === "cuboid") {
      foldTransformsRef.current = getCuboidFaceTransforms(model, foldRef.current);
    }
  }, -1);

  return (
    <group position={center.clone().negate()}>
      {model.faces.map((face, index) => (
        <FoldingFace
          key={`${shape}-${index}`}
          face={face}
          faceIndex={index}
          fold={fold}
          foldRef={foldRef}
          foldTransformsRef={shape === "cuboid" ? foldTransformsRef : undefined}
          initialTransform={initialTransforms[index]}
          scale={scale}
        />
      ))}
      {showVertices && (
        <VertexLabels
          shape={shape}
          side={side}
          theme={theme}
          foldRef={foldRef}
          foldTransformsRef={shape === "cuboid" ? foldTransformsRef : undefined}
        />
      )}
    </group>
  );
}

function RoundSolidMesh({ shape, side, theme, showVertices }: ShapeMeshProps) {
  const model = models[shape];
  const scale = side / 4;

  return (
    <group>
      <mesh scale={scale} castShadow receiveShadow>
        {model.geometry === "cylinder" && <cylinderGeometry args={[1, 1, 2, 64]} />}
        {model.geometry === "cone" && <coneGeometry args={[1, 2, 64]} />}
        {model.geometry === "sphere" && <sphereGeometry args={[1, 48, 32]} />}
        <meshStandardMaterial color="#7292F6" roughness={0.42} metalness={0.03} />
      </mesh>
      {showVertices && <VertexLabels shape={shape} side={side} theme={theme} />}
    </group>
  );
}

function ShapeMesh(props: ShapeMeshProps) {
  return models[props.shape].geometry === "polyhedron"
    ? <PolyhedronMesh key={props.shape} {...props} />
    : <RoundSolidMesh key={props.shape} {...props} />;
}

export function GeometryScene({
  shape,
  fold,
  side,
  theme,
  autoRotate,
  showVertices,
  customPoints,
  placingPoint,
  onPlacePoint,
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
      {placingPoint && <PointPlacementPlane onPlacePoint={onPlacePoint} />}
      <group
        onClick={placingPoint
          ? (event) => {
            event.stopPropagation();
            onPlacePoint([event.point.x * 2, event.point.y * 2, event.point.z * 2]);
          }
          : undefined}
      >
        <ShapeMesh shape={shape} fold={fold} side={side} theme={theme} showVertices={showVertices} />
      </group>
      {customPoints.map((point) => (
        <FreePointMarker key={point.id} point={point} side={side} theme={theme} />
      ))}
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
