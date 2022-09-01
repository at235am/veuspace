import { CPoint } from "../../utils/utils";

export type ItemType =
  | "brush"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "line"
  | "arrow"
  | "";

export interface BaseProps {
  id: string;
  type: ItemType;

  position: CPoint;
  angle: number;

  zIndex: number;
}

export interface DerivedProps {
  center: CPoint;
  // bounds: {
  //   topLeft: CPoint;
  //   topRight: CPoint;
  //   bottomRight: CPoint;
  //   bottomLeft: CPoint;
  // };
}

export interface PropColor {
  color: string;
  alpha?: number;
  pattern?: string;
}

export type StrokeColor = PropColor & {
  size: number;
};
