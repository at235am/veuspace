import { nanoid } from "nanoid";
import {
  getRandomColor,
  getRandomIntInclusive,
  rotate2,
} from "../../utils/utils";
import { BaseProps, DerivedProps, PropColor, StrokeColor } from "./BaseItem";

export interface EllipseProps extends BaseProps {
  type: "ellipse";
  fill: PropColor;
  stroke: StrokeColor;

  rx: number;
  ry: number;
}

export interface EllipsePropsFull extends EllipseProps, DerivedProps {}

export const isEllipse = (item: any): item is EllipseProps =>
  (item as EllipseProps).type === "ellipse";

export const calculateCenterEllipse = (ellipse: EllipseProps) => {
  const {
    position: { x, y },
    rx,
    ry,
  } = ellipse;
  return { x: x + rx, y: y + ry };
};

export const getEllipses = (width: number, height: number): EllipseProps[] => {
  const boxes: EllipseProps[] = [];

  return boxes;
};

export const getRandomEllipses = (
  num = 50,
  width: number,
  height: number
): EllipseProps[] =>
  [...Array(num).keys()].map(() => {
    return {
      id: nanoid(),
      type: "ellipse",
      position: {
        x: getRandomIntInclusive(-width * 3, width * 3),
        y: getRandomIntInclusive(-height * 3, height * 3),
      },
      angle: getRandomIntInclusive(0, 2 * Math.PI),
      rx: getRandomIntInclusive(10, 200),
      ry: getRandomIntInclusive(10, 200),
      fill: { color: getRandomColor().hex() },
      stroke: {
        color: getRandomColor().hex(),
        size: getRandomIntInclusive(0, 5),
      },
      zIndex: 0,
    };
  });

export const test_ellipses: EllipseProps[] = [
  {
    id: "ellipse-1",
    type: "ellipse",
    position: { x: 200, y: 200 },
    rx: 100,
    ry: 50,
    angle: 10 * (Math.PI / 180),
    fill: { color: "#ff0000" },
    stroke: { color: "#000000", size: 0 },
    zIndex: 0,
  },

  {
    id: "ellipse-2",
    type: "ellipse",
    position: { x: 400, y: 400 },
    rx: 30,
    ry: 50,
    angle: 22 * (Math.PI / 180),
    fill: { color: "#00ff00" },
    stroke: { color: "#000000", size: 0 },
    zIndex: 0,
  },
];
