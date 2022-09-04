import { select, Selection } from "d3-selection";
import { zoom, zoomIdentity, ZoomTransform } from "d3-zoom";
import { useEffect, useRef, useState } from "react";

import { mat2d, vec2 } from "gl-matrix";
import { multiply } from "lodash";
import { A } from "../components/Navbar/NavbarItem/NavbarItem.styles";

export type Transform = {
  x: number;
  y: number;
  k: number;
};

export type VPoint = [number, number];

export const useZoomPan = () => {
  // const [transform, setTransform] = useState<Transform>({
  //   x: 0,
  //   y: 0,
  //   k: 1,
  // });
};
