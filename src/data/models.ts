export type ShapeId = "cube" | "pyramid" | "prism";
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

export interface ShapeDefinition {
  id: ShapeId;
  name: string;
  shortName: string;
  description: string;
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
  cube: {
    id: "cube",
    name: "Hình lập phương",
    shortName: "Lập phương",
    description: "6 mặt vuông bằng nhau",
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
  },
  pyramid: {
    id: "pyramid",
    name: "Chóp tứ giác đều",
    shortName: "Chóp tứ giác",
    description: "Đáy vuông · 4 mặt bên",
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
  },
  prism: {
    id: "prism",
    name: "Lăng trụ tam giác",
    shortName: "Lăng trụ tam giác",
    description: "2 đáy tam giác song song",
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
  },
};

export const shapeOrder: ShapeId[] = ["cube", "pyramid", "prism"];
