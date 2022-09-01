import { Path } from "@pixi-essentials/svg";
import { nanoid } from "nanoid";
import path from "path";
import getStroke from "perfect-freehand";
import {
  CPoint,
  deepCopy,
  getRandomColor,
  getRandomIntInclusive as rint,
  getSvgPathFromStroke,
  mergeProps,
  rotate2,
} from "../../utils/utils";
import { BaseProps, DerivedProps, PropColor, StrokeColor } from "./BaseItem";

export interface BrushProps extends BaseProps {
  type: "brush";

  points: number[][];
  // path: Path2D;
  pfPath: Path2D;
  fill: StrokeColor;
  stroke: StrokeColor;
  strokePoints: number[][];
}

export interface EllipsePropsFull extends BrushProps, DerivedProps {}

export const isBrush = (item: any): item is BrushProps =>
  (item as BrushProps).type === "brush";

export const getEllipses = (width: number, height: number): BrushProps[] => {
  const boxes: BrushProps[] = [];

  return boxes;
};

const getPath2D = (position: CPoint, points: number[][]) => {
  const { x, y } = position;

  const path = new Path2D();
  path.moveTo(x, y);
  points.forEach((p) => {
    path.lineTo(p[0] + x, p[1] + y);
  });
  return path;
};

const strokeOptions = {
  size: 5,
  thinning: 0.7,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

const getPFPath = (position: CPoint, points: number[][], size: number) => {
  const strokePoints = getStroke(points, { ...strokeOptions, size });
  const d = getSvgPathFromStroke(strokePoints);
  return { path: new Path2D(d), strokePoints };

  // const strokePoints = getStroke(points, strokeOptions);
  // const { x, y } = position;
  // const path = new Path2D();
  // path.moveTo(x, y);
  // strokePoints.forEach((p) => {
  //   path.lineTo(p[0] + x, p[1] + y);
  // });
  // return { path, strokePoints };
};

export const createRandomPath = (seedPoint: CPoint) => {
  const numOfPoints = rint(20, 100);

  const { x, y } = seedPoint;
  // const points: number[][] = [[x, y]];

  let prevPoint = [x, y];
  const points: number[][] = [...Array(numOfPoints).keys()].map((value, i) => {
    // prevPoint = points[i];

    const dx = rint(-10, 10);
    const dy = rint(-10, 10);
    const np = [prevPoint[0] + dx, prevPoint[1] + dy];
    prevPoint = np;

    return [np[0] - seedPoint.x, np[1] - seedPoint.y];
  });

  return points;
};

export const getRandomBrushes = (
  num = 50,
  width: number,
  height: number
): BrushProps[] =>
  [...Array(num).keys()].map(() => {
    const w = width;
    const h = height;

    const size = rint(1, 25);
    const position = { x: rint(-w, w), y: rint(-h, h) };
    // const points = createRandomPath(position);
    const points = realPoints;
    // const path = getPath2D(position, points);
    const pfPath = getPFPath(position, points, size);

    return {
      id: nanoid(),
      type: "brush",
      position,
      angle: rint(0, 2 * Math.PI),
      points: points,
      // path,
      pfPath: pfPath.path,
      strokePoints: pfPath.strokePoints,
      fill: { color: getRandomColor().hex(), size },
      stroke: {
        color: getRandomColor().hex(),
        size: rint(0, 5),
      },
      zIndex: 0,
    };
  });

export const test_brushes: BrushProps[] = [
  (() => {
    const position = { x: 400, y: 400 };
    const points = [
      [0, 0],
      [50, 50],
      [100, 100],
      [150, 150],
      [200, 200],
      [250, 150],
      [300, 100],
      [350, 50],
      [400, 0],
    ];

    const size = 5;
    const path = getPath2D(position, points);
    const pfPath = getPFPath(position, points, size);

    return {
      id: "brush-1",
      type: "brush",
      position,
      points,
      path,
      pfPath: pfPath.path,
      strokePoints: pfPath.strokePoints,
      angle: 0 * (Math.PI / 180),
      fill: { color: "#ff0000", size },
      stroke: { color: "#000000", size: 0 },
      zIndex: 0,
    };
  })(),
  (() => {
    const size = 5;

    const position = { x: 200, y: 200 };
    const points = [
      [0, 0],
      [1, 0],
      [1, -1],
      [6, -6],
      [13, -19],
      [21, -38],
      [27, -59],
      [31, -81],
      [32, -96],
      [33, -102],
      [33, -101],
      [33, -95],
      [37, -75],
      [42, -48],
      [45, -17],
      [49, 14],
      [51, 40],
      [50, 57],
      [45, 70],
      [38, 77],
      [30, 80],
      [23, 79],
      [18, 72],
      [16, 61],
      [15, 46],
      [18, 27],
      [23, 6],
      [33, -17],
      [43, -36],
      [48, -49],
      [52, -60],
      [54, -67],
      [54, -69],
      [54, -68],
      [54, -67],
      [54, -59],
      [55, -50],
      [56, -42],
      [57, -37],
      [59, -35],
      [59, -36],
      [62, -42],
      [64, -50],
      [66, -60],
      [67, -67],
      [68, -67],
      [68, -66],
      [68, -63],
      [68, -56],
      [69, -50],
      [71, -49],
      [71, -50],
      [73, -52],
      [75, -59],
      [77, -67],
      [79, -74],
      [80, -80],
      [80, -83],
      [80, -82],
      [81, -81],
      [83, -75],
      [87, -66],
      [89, -58],
      [90, -52],
      [90, -48],
      [87, -46],
      [85, -45],
      [84, -46],
      [84, -48],
      [86, -53],
      [90, -60],
      [94, -69],
      [98, -80],
      [101, -91],
      [103, -101],
      [103, -110],
      [103, -116],
      [103, -115],
      [103, -108],
      [103, -97],
      [104, -84],
      [105, -73],
      [107, -64],
      [109, -59],
      [112, -57],
      [112, -58],
      [114, -61],
      [117, -67],
      [121, -74],
      [123, -81],
      [126, -86],
      [127, -88],
      [127, -87],
      [127, -86],
      [128, -82],
      [129, -76],
      [131, -73],
      [132, -71],
      [133, -71],
      [133, -72],
      [134, -75],
      [136, -80],
      [138, -85],
      [140, -90],
      [141, -90],
      [141, -89],
      [141, -87],
      [143, -83],
      [146, -81],
      [147, -81],
      [150, -85],
      [154, -91],
      [159, -97],
      [163, -101],
      [163, -104],
      [161, -101],
      [158, -95],
      [157, -88],
      [157, -82],
      [158, -77],
      [161, -75],
      [162, -75],
      [165, -75],
      [170, -79],
      [176, -84],
      [183, -91],
      [190, -100],
      [195, -106],
      [196, -110],
      [196, -111],
      [195, -111],
      [193, -112],
      [190, -112],
      [186, -108],
      [182, -102],
      [181, -93],
      [181, -86],
      [186, -83],
      [191, -82],
      [199, -83],
      [207, -86],
      [212, -90],
      [213, -93],
      [212, -98],
      [212, -98],
    ];
    const path = getPath2D(position, points);
    const pfPath = getPFPath(position, points, size);

    return {
      id: "brush-2",
      type: "brush",
      position,
      points,
      path,
      pfPath: pfPath.path,
      strokePoints: pfPath.strokePoints,
      angle: 0 * (Math.PI / 180),
      fill: { color: "#e91e63", size },
      stroke: { color: "#e91e63", size: 0 },
      zIndex: 0,
    };
  })(),
];

const realPoints = [
  [0, 0],
  [1, 0],
  [1, -1],
  [6, -6],
  [13, -19],
  [21, -38],
  [27, -59],
  [31, -81],
  [32, -96],
  [33, -102],
  [33, -101],
  [33, -95],
  [37, -75],
  [42, -48],
  [45, -17],
  [49, 14],
  [51, 40],
  [50, 57],
  [45, 70],
  [38, 77],
  [30, 80],
  [23, 79],
  [18, 72],
  [16, 61],
  [15, 46],
  [18, 27],
  [23, 6],
  [33, -17],
  [43, -36],
  [48, -49],
  [52, -60],
  [54, -67],
  [54, -69],
  [54, -68],
  [54, -67],
  [54, -59],
  [55, -50],
  [56, -42],
  [57, -37],
  [59, -35],
  [59, -36],
  [62, -42],
  [64, -50],
  [66, -60],
  [67, -67],
  [68, -67],
  [68, -66],
  [68, -63],
  [68, -56],
  [69, -50],
  [71, -49],
  [71, -50],
  [73, -52],
  [75, -59],
  [77, -67],
  [79, -74],
  [80, -80],
  [80, -83],
  [80, -82],
  [81, -81],
  [83, -75],
  [87, -66],
  [89, -58],
  [90, -52],
  [90, -48],
  [87, -46],
  [85, -45],
  [84, -46],
  [84, -48],
  [86, -53],
  [90, -60],
  [94, -69],
  [98, -80],
  [101, -91],
  [103, -101],
  [103, -110],
  [103, -116],
  [103, -115],
  [103, -108],
  [103, -97],
  [104, -84],
  [105, -73],
  [107, -64],
  [109, -59],
  [112, -57],
  [112, -58],
  [114, -61],
  [117, -67],
  [121, -74],
  [123, -81],
  [126, -86],
  [127, -88],
  [127, -87],
  [127, -86],
  [128, -82],
  [129, -76],
  [131, -73],
  [132, -71],
  [133, -71],
  [133, -72],
  [134, -75],
  [136, -80],
  [138, -85],
  [140, -90],
  [141, -90],
  [141, -89],
  [141, -87],
  [143, -83],
  [146, -81],
  [147, -81],
  [150, -85],
  [154, -91],
  [159, -97],
  [163, -101],
  [163, -104],
  [161, -101],
  [158, -95],
  [157, -88],
  [157, -82],
  [158, -77],
  [161, -75],
  [162, -75],
  [165, -75],
  [170, -79],
  [176, -84],
  [183, -91],
  [190, -100],
  [195, -106],
  [196, -110],
  [196, -111],
  [195, -111],
  [193, -112],
  [190, -112],
  [186, -108],
  [182, -102],
  [181, -93],
  [181, -86],
  [186, -83],
  [191, -82],
  [199, -83],
  [207, -86],
  [212, -90],
  [213, -93],
  [212, -98],
  [212, -98],
];

const realData = (position: CPoint, id: string) => {
  const size = 5;
  const points = realPoints;
  const path = getPath2D(position, points);
  const pfPath = getPFPath(position, points, size);

  return {
    id,
    type: "brush",
    position,
    points,
    path,
    pfPath: pfPath.path,
    strokePoints: pfPath.strokePoints,
    angle: 0 * (Math.PI / 180),
    fill: { color: "#e91e63", size },
    stroke: { color: "#e91e63", size: 0 },
    zIndex: 0,
  };
};

const default_brush: BrushProps = {
  id: "",
  type: "brush",
  angle: 0,
  position: { x: 0, y: 0 },
  zIndex: 0,

  fill: { color: "#e91e63", size: 5 },
  stroke: {
    color: "#000000",
    size: 0,
  },

  points: [],
  strokePoints: [],
  pfPath: new Path2D(),
};

export const createBrush = (props: Partial<BrushProps> = {}): BrushProps => {
  const defaultOptions = deepCopy(default_brush);
  const p: Partial<BrushProps> = { ...props, type: "brush" };
  const mergedProps = mergeProps(defaultOptions, p);
  const { id, points, position, fill } = mergedProps;
  const { size } = fill;

  // const points = realPoints;
  // const path = getPath2D(position, points);
  const pfPath = getPFPath(position, points, size);

  mergedProps.id = id || nanoid();
  // mergedProps.path = pfPath.path;
  mergedProps.pfPath = pfPath.path;
  mergedProps.strokePoints = pfPath.strokePoints;

  return mergedProps;
};
