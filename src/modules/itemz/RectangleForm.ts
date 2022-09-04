import { nanoid } from "nanoid";
import {
  getRandomColor,
  getRandomIntInclusive,
  rotate2,
} from "../../utils/utils";
import { BaseProps, DerivedProps, PropColor, StrokeColor } from "./BaseItem";

export interface RectangleProps extends BaseProps {
  type: "rectangle";

  fill: PropColor;
  stroke: StrokeColor;
  radius: number;
  width: number;
  height: number;
}

export interface RectanglePropsFull extends RectangleProps, DerivedProps {}

export const isRectangle = (item: any): item is RectangleProps =>
  (item as RectangleProps).type === "rectangle";

export const calculateCenterRectangle = (rect: RectangleProps) => {
  const {
    position: { x, y },
    width,
    height,
  } = rect;
  return { x: x + width / 2, y: y + height / 2 };
};

export const calcRectangleBounds = (rect: RectangleProps) => {
  const { position, width, height, fill, angle } = rect;
  const { x, y } = position;

  const center = { x: x + width / 2, y: y + height / 2 };

  const topLeft = { x, y };
  const topRight = { x: x + width, y };
  const bottomRight = { x: x + width, y: y + height };
  const bottomLeft = { x, y: y + height };

  return {
    topLeft: rotate2(center, topLeft, angle),
    topRight: rotate2(center, topRight, angle),
    bottomRight: rotate2(center, bottomRight, angle),
    bottomLeft: rotate2(center, bottomLeft, angle),
  };
};

export const getRects = (width: number, height: number): RectangleProps[] => {
  const boxes: RectangleProps[] = [];
  const r = 50;
  const hboxes = Math.round(width / r);
  const vboxes = Math.round(height / r);

  for (let i = 0; i < hboxes; i++) {
    for (let j = 0; j < vboxes; j++) {
      boxes.push({
        id: nanoid(),
        type: "rectangle",
        position: {
          x: i * r,
          y: j * r,
        },
        angle: 0,
        width: r,
        height: r,
        fill: { color: (i + j) % 2 === 0 ? "#222222" : "#999999" },
        // fill: { color: getRandomColor().hex() },
        radius: getRandomIntInclusive(0, 10),

        stroke: {
          color: getRandomColor().hex(),
          size: getRandomIntInclusive(0, 5),
        },
        zIndex: 0,
      });
    }
  }

  return boxes;
};

export const getRandomRects = (
  num = 50,
  width: number,
  height: number
): RectangleProps[] =>
  [...Array(num).keys()].map(() => {
    return {
      id: nanoid(),
      type: "rectangle",
      position: {
        x: getRandomIntInclusive(-width * 3, width * 3),
        y: getRandomIntInclusive(-height * 3, height * 3),
      },
      angle: getRandomIntInclusive(0, 2 * Math.PI),
      width: getRandomIntInclusive(10, 200),
      height: getRandomIntInclusive(10, 200),
      fill: { color: getRandomColor().hex() },
      radius: getRandomIntInclusive(0, 10),
      scale: { x: 1, y: 1 },
      stroke: {
        color: getRandomColor().hex(),
        size: getRandomIntInclusive(0, 5),
      },
      zIndex: 0,
    };
  });

export const test_rectangles: RectangleProps[] = [
  {
    id: "rect-a",
    type: "rectangle",
    position: {
      x: 0,
      y: 0,
    },
    angle: 0 * (Math.PI / 180),
    width: 100,
    height: 50,
    fill: { color: "#ff0000" },
    radius: 5,

    stroke: {
      color: "#000000",
      size: 0,
    },
    zIndex: 0,
  },
  {
    id: "rect-b",
    type: "rectangle",
    position: {
      x: 500,
      y: 500,
    },
    angle: 0 * (Math.PI / 180),
    width: 60,
    height: 100,
    fill: { color: "#00ff00" },
    radius: 5,

    stroke: {
      color: "#000000",
      size: 0,
    },
    zIndex: 0,
  },
];
