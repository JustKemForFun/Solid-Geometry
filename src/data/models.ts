export type ShapeId = "cuboid" | "cube" | "prism" | "pyramid" | "cylinder" | "cone" | "sphere";
export type GeometryKind = "polyhedron" | "cylinder" | "cone" | "sphere";
export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];

export interface ShapePoint {
  net: Point2;
  solid: Point3;
}

export interface ShapeFace {
  name: string;
  color: string;
  points: ShapePoint[];
}

export interface ShapeVertex {
  label: string;
  point: Point3;
}

export interface ShapeDefinition {
  id: ShapeId;
  geometry: GeometryKind;
  name: string;
  shortName: string;
  description: string;
  parameterLabel: string;
  parameterContext: (side: number) => string;
  faceSummary: string;
  edgeSummary: string;
  surfaceFormula: string;
  volumeFormula: string;
  area: (side: number) => number;
  volume: (side: number) => number;
  quiz: {
    question: string;
    answers: string[];
    correct: number;
  };
  faces: ShapeFace[];
  vertices: ShapeVertex[];
}

const point = (net: Point2, solid: Point3): ShapePoint => ({ net, solid });
const palette = {
  blue: "#7292F6",
  mint: "#66C9A6",
  yellow: "#F1C86D",
  lilac: "#A99AE8",
  coral: "#E8A18A",
  slate: "#A5B2CC",
};

const formatDimension = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value);

const cuboidFaces: ShapeFace[] = [
  {
    name: "Mặt trước",
    color: palette.blue,
    points: [
      point([-1, -0.75], [-1, -0.75, 0.5]),
      point([1, -0.75], [1, -0.75, 0.5]),
      point([1, 0.75], [1, 0.75, 0.5]),
      point([-1, 0.75], [-1, 0.75, 0.5]),
    ],
  },
  {
    name: "Mặt phải",
    color: palette.mint,
    points: [
      point([1, -0.75], [1, -0.75, 0.5]),
      point([2, -0.75], [1, -0.75, -0.5]),
      point([2, 0.75], [1, 0.75, -0.5]),
      point([1, 0.75], [1, 0.75, 0.5]),
    ],
  },
  {
    name: "Mặt sau",
    color: palette.lilac,
    points: [
      point([2, -0.75], [1, -0.75, -0.5]),
      point([4, -0.75], [-1, -0.75, -0.5]),
      point([4, 0.75], [-1, 0.75, -0.5]),
      point([2, 0.75], [1, 0.75, -0.5]),
    ],
  },
  {
    name: "Mặt trái",
    color: palette.slate,
    points: [
      point([-2, -0.75], [-1, -0.75, -0.5]),
      point([-1, -0.75], [-1, -0.75, 0.5]),
      point([-1, 0.75], [-1, 0.75, 0.5]),
      point([-2, 0.75], [-1, 0.75, -0.5]),
    ],
  },
  {
    name: "Mặt trên",
    color: palette.yellow,
    points: [
      point([-1, 0.75], [-1, 0.75, 0.5]),
      point([1, 0.75], [1, 0.75, 0.5]),
      point([1, 1.75], [1, 0.75, -0.5]),
      point([-1, 1.75], [-1, 0.75, -0.5]),
    ],
  },
  {
    name: "Mặt đáy",
    color: palette.coral,
    points: [
      point([-1, -1.75], [-1, -0.75, -0.5]),
      point([1, -1.75], [1, -0.75, -0.5]),
      point([1, -0.75], [1, -0.75, 0.5]),
      point([-1, -0.75], [-1, -0.75, 0.5]),
    ],
  },
];

const cubeFaces: ShapeFace[] = [
  {
    name: "Mặt trước",
    color: palette.blue,
    points: [
      point([-1, -1], [-1, -1, 1]),
      point([1, -1], [1, -1, 1]),
      point([1, 1], [1, 1, 1]),
      point([-1, 1], [-1, 1, 1]),
    ],
  },
  {
    name: "Mặt phải",
    color: palette.mint,
    points: [
      point([1, -1], [1, -1, 1]),
      point([3, -1], [1, -1, -1]),
      point([3, 1], [1, 1, -1]),
      point([1, 1], [1, 1, 1]),
    ],
  },
  {
    name: "Mặt sau",
    color: palette.lilac,
    points: [
      point([3, -1], [1, -1, -1]),
      point([5, -1], [-1, -1, -1]),
      point([5, 1], [-1, 1, -1]),
      point([3, 1], [1, 1, -1]),
    ],
  },
  {
    name: "Mặt trái",
    color: palette.slate,
    points: [
      point([-3, -1], [-1, -1, -1]),
      point([-1, -1], [-1, -1, 1]),
      point([-1, 1], [-1, 1, 1]),
      point([-3, 1], [-1, 1, -1]),
    ],
  },
  {
    name: "Mặt trên",
    color: palette.yellow,
    points: [
      point([-1, 1], [-1, 1, 1]),
      point([1, 1], [1, 1, 1]),
      point([1, 3], [1, 1, -1]),
      point([-1, 3], [-1, 1, -1]),
    ],
  },
  {
    name: "Mặt đáy",
    color: palette.coral,
    points: [
      point([-1, -1], [-1, -1, 1]),
      point([-1, 1], [-1, -1, -1]),
      point([1, 1], [1, -1, -1]),
      point([1, -1], [1, -1, 1]),
    ],
  },
];

const pyramidFaces: ShapeFace[] = [
  {
    name: "Đáy vuông",
    color: palette.yellow,
    points: [
      point([-1, -1], [-1, 0, 1]),
      point([-1, 1], [-1, 0, -1]),
      point([1, 1], [1, 0, -1]),
      point([1, -1], [1, 0, 1]),
    ],
  },
  {
    name: "Mặt bên",
    color: palette.blue,
    points: [
      point([-1, -1], [-1, 0, 1]),
      point([1, -1], [1, 0, 1]),
      point([0, -2.6], [0, 2, 0]),
    ],
  },
  {
    name: "Mặt bên",
    color: palette.mint,
    points: [
      point([1, -1], [1, 0, 1]),
      point([1, 1], [1, 0, -1]),
      point([2.6, 0], [0, 2, 0]),
    ],
  },
  {
    name: "Mặt bên",
    color: palette.lilac,
    points: [
      point([1, 1], [1, 0, -1]),
      point([-1, 1], [-1, 0, -1]),
      point([0, 2.6], [0, 2, 0]),
    ],
  },
  {
    name: "Mặt bên",
    color: palette.coral,
    points: [
      point([-1, 1], [-1, 0, -1]),
      point([-1, -1], [-1, 0, 1]),
      point([-2.6, 0], [0, 2, 0]),
    ],
  },
];

const prismFaces: ShapeFace[] = [
  {
    name: "Mặt chữ nhật",
    color: palette.blue,
    points: [
      point([-1, -1], [-1, -0.65, -1]),
      point([1, -1], [1, -0.65, -1]),
      point([1, 1], [1, -0.65, 1]),
      point([-1, 1], [-1, -0.65, 1]),
    ],
  },
  {
    name: "Mặt chữ nhật",
    color: palette.mint,
    points: [
      point([1, -1], [1, -0.65, -1]),
      point([3.25, -1], [0, 1.08, -1]),
      point([3.25, 1], [0, 1.08, 1]),
      point([1, 1], [1, -0.65, 1]),
    ],
  },
  {
    name: "Mặt chữ nhật",
    color: palette.lilac,
    points: [
      point([-3.25, -1], [0, 1.08, -1]),
      point([-1, -1], [-1, -0.65, -1]),
      point([-1, 1], [-1, -0.65, 1]),
      point([-3.25, 1], [0, 1.08, 1]),
    ],
  },
  {
    name: "Đáy tam giác",
    color: palette.yellow,
    points: [
      point([1, -1], [1, -0.65, -1]),
      point([-1, -1], [-1, -0.65, -1]),
      point([0, -3], [0, 1.08, -1]),
    ],
  },
  {
    name: "Đáy tam giác",
    color: palette.coral,
    points: [
      point([-1, 1], [-1, -0.65, 1]),
      point([1, 1], [1, -0.65, 1]),
      point([0, 3], [0, 1.08, 1]),
    ],
  },
];

export const models: Record<ShapeId, ShapeDefinition> = {
  cuboid: {
    id: "cuboid",
    geometry: "polyhedron",
    name: "Hình hộp chữ nhật",
    shortName: "Hộp chữ nhật",
    description: "6 mặt chữ nhật · 3 kích thước",
    parameterLabel: "Chiều dài a",
    parameterContext: (side) =>
      `a = ${formatDimension(side)} cm, b = ${formatDimension(side * 0.75)} cm, c = ${formatDimension(side * 0.5)} cm`,
    faceSummary: "6 mặt chữ nhật",
    edgeSummary: "12 cạnh · 8 đỉnh",
    surfaceFormula: "2(ab + bc + ca)",
    volumeFormula: "abc",
    area: (side) => {
      const b = side * 0.75;
      const c = side * 0.5;
      return 2 * (side * b + b * c + c * side);
    },
    volume: (side) => side * (side * 0.75) * (side * 0.5),
    quiz: {
      question: "Hình hộp chữ nhật có bao nhiêu mặt?",
      answers: ["4 mặt", "6 mặt", "8 mặt"],
      correct: 6,
    },
    faces: cuboidFaces,
    vertices: [
      { label: "A", point: [-1, -0.75, 0.5] },
      { label: "B", point: [1, -0.75, 0.5] },
      { label: "C", point: [1, -0.75, -0.5] },
      { label: "D", point: [-1, -0.75, -0.5] },
      { label: "A′", point: [-1, 0.75, 0.5] },
      { label: "B′", point: [1, 0.75, 0.5] },
      { label: "C′", point: [1, 0.75, -0.5] },
      { label: "D′", point: [-1, 0.75, -0.5] },
    ],
  },
  cube: {
    id: "cube",
    geometry: "polyhedron",
    name: "Hình lập phương",
    shortName: "Lập phương",
    description: "6 mặt vuông bằng nhau",
    parameterLabel: "Độ dài cạnh a",
    parameterContext: (side) => `a = ${formatDimension(side)} cm`,
    faceSummary: "6 mặt vuông",
    edgeSummary: "12 cạnh · 8 đỉnh",
    surfaceFormula: "6a²",
    volumeFormula: "a³",
    area: (side) => 6 * side ** 2,
    volume: (side) => side ** 3,
    quiz: {
      question: "Hình lập phương có tất cả bao nhiêu cạnh?",
      answers: ["6 cạnh", "8 cạnh", "12 cạnh"],
      correct: 12,
    },
    faces: cubeFaces,
    vertices: [
      { label: "A", point: [-1, -1, 1] },
      { label: "B", point: [1, -1, 1] },
      { label: "C", point: [1, -1, -1] },
      { label: "D", point: [-1, -1, -1] },
      { label: "A′", point: [-1, 1, 1] },
      { label: "B′", point: [1, 1, 1] },
      { label: "C′", point: [1, 1, -1] },
      { label: "D′", point: [-1, 1, -1] },
    ],
  },
  pyramid: {
    id: "pyramid",
    geometry: "polyhedron",
    name: "Chóp tứ giác đều",
    shortName: "Chóp tứ giác",
    description: "Đáy vuông · 4 mặt bên",
    parameterLabel: "Độ dài cạnh đáy a",
    parameterContext: (side) => `a = ${formatDimension(side)} cm`,
    faceSummary: "5 mặt · 1 đáy vuông",
    edgeSummary: "8 cạnh · 5 đỉnh",
    surfaceFormula: "(1 + √5)a²",
    volumeFormula: "⅓a³",
    area: (side) => (1 + Math.sqrt(5)) * side ** 2,
    volume: (side) => side ** 3 / 3,
    quiz: {
      question: "Chóp tứ giác đều có bao nhiêu mặt bên?",
      answers: ["3 mặt", "4 mặt", "5 mặt"],
      correct: 4,
    },
    faces: pyramidFaces,
    vertices: [
      { label: "A", point: [-1, 0, 1] },
      { label: "B", point: [1, 0, 1] },
      { label: "C", point: [1, 0, -1] },
      { label: "D", point: [-1, 0, -1] },
      { label: "S", point: [0, 2, 0] },
    ],
  },
  prism: {
    id: "prism",
    geometry: "polyhedron",
    name: "Lăng trụ tam giác",
    shortName: "Lăng trụ tam giác",
    description: "2 đáy tam giác song song",
    parameterLabel: "Độ dài cạnh đáy a",
    parameterContext: (side) => `a = ${formatDimension(side)} cm`,
    faceSummary: "5 mặt · 2 đáy tam giác",
    edgeSummary: "9 cạnh · 6 đỉnh",
    surfaceFormula: "(3 + √3)a²",
    volumeFormula: "√3⁄4a³",
    area: (side) => (3 + Math.sqrt(3)) * side ** 2,
    volume: (side) => (Math.sqrt(3) / 4) * side ** 3,
    quiz: {
      question: "Lăng trụ tam giác có tất cả bao nhiêu mặt?",
      answers: ["3 mặt", "5 mặt", "6 mặt"],
      correct: 5,
    },
    faces: prismFaces,
    vertices: [
      { label: "A", point: [-1, -0.65, -1] },
      { label: "B", point: [1, -0.65, -1] },
      { label: "C", point: [0, 1.08, -1] },
      { label: "A′", point: [-1, -0.65, 1] },
      { label: "B′", point: [1, -0.65, 1] },
      { label: "C′", point: [0, 1.08, 1] },
    ],
  },
  cylinder: {
    id: "cylinder",
    geometry: "cylinder",
    name: "Hình trụ",
    shortName: "Hình trụ",
    description: "2 đáy tròn · 1 mặt cong",
    parameterLabel: "Bán kính đáy r",
    parameterContext: (side) => `r = ${formatDimension(side)} cm, h = ${formatDimension(side * 2)} cm`,
    faceSummary: "2 đáy tròn · 1 mặt cong",
    edgeSummary: "2 cạnh cong · 0 đỉnh",
    surfaceFormula: "2πr(r + h)",
    volumeFormula: "πr²h",
    area: (side) => 6 * Math.PI * side ** 2,
    volume: (side) => 2 * Math.PI * side ** 3,
    quiz: {
      question: "Hình trụ có bao nhiêu đáy tròn?",
      answers: ["1 đáy", "2 đáy", "3 đáy"],
      correct: 2,
    },
    faces: [],
    vertices: [],
  },
  cone: {
    id: "cone",
    geometry: "cone",
    name: "Hình nón",
    shortName: "Hình nón",
    description: "1 đáy tròn · 1 đỉnh",
    parameterLabel: "Bán kính đáy r",
    parameterContext: (side) =>
      `r = ${formatDimension(side)} cm, h = ${formatDimension(side * 2)} cm, ℓ = ${formatDimension(side * Math.sqrt(5))} cm`,
    faceSummary: "1 đáy tròn · 1 mặt cong",
    edgeSummary: "1 cạnh cong · 1 đỉnh",
    surfaceFormula: "πr(r + ℓ)",
    volumeFormula: "⅓πr²h",
    area: (side) => Math.PI * side ** 2 * (1 + Math.sqrt(5)),
    volume: (side) => (2 / 3) * Math.PI * side ** 3,
    quiz: {
      question: "Hình nón có bao nhiêu đỉnh?",
      answers: ["0 đỉnh", "1 đỉnh", "2 đỉnh"],
      correct: 1,
    },
    faces: [],
    vertices: [{ label: "S", point: [0, 1, 0] }],
  },
  sphere: {
    id: "sphere",
    geometry: "sphere",
    name: "Hình cầu",
    shortName: "Hình cầu",
    description: "1 mặt cong · không có cạnh",
    parameterLabel: "Bán kính r",
    parameterContext: (side) => `r = ${formatDimension(side)} cm`,
    faceSummary: "1 mặt cầu",
    edgeSummary: "0 cạnh · 0 đỉnh",
    surfaceFormula: "4πr²",
    volumeFormula: "⁴⁄₃πr³",
    area: (side) => 4 * Math.PI * side ** 2,
    volume: (side) => (4 / 3) * Math.PI * side ** 3,
    quiz: {
      question: "Hình cầu có bao nhiêu cạnh?",
      answers: ["0 cạnh", "1 cạnh", "2 cạnh"],
      correct: 0,
    },
    faces: [],
    vertices: [],
  },
};

export const shapeCategories: { label: string; shapes: ShapeId[] }[] = [
  { label: "Khối đa diện", shapes: ["cuboid", "cube", "prism", "pyramid"] },
  { label: "Khối tròn xoay", shapes: ["cylinder", "cone", "sphere"] },
];

export const shapeOrder: ShapeId[] = shapeCategories.flatMap((category) => category.shapes);
