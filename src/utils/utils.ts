import { nanoid } from "nanoid";
import Color from "color";

export interface HasId {
  id: string;
}

export const getRandomIntInclusive = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

export const loadImage = (
  setImageDimensions: React.Dispatch<
    React.SetStateAction<{
      width: number;
      height: number;
    }>
  >,
  imageUrl: string
) => {
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    setImageDimensions({
      width: img.width,
      height: img.height,
    });
  };
  img.onerror = (err) => {
    console.log("img error");
    console.error(err);
  };
};

export const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

export const prettyNumber = (num: number) =>
  num.toFixed(2).replace(/[.,]00$/, "");

export const colorToNumber = (color: string | number) =>
  new Color(color).rgbNumber();

export const getRandomColor = () =>
  colorToNumber(getRandomIntInclusive(0, 0xffffff));

export function* generateColors(num_of_colors: number) {
  const step = num_of_colors < 360 ? 360 / num_of_colors : 1;

  const colors = [...Array(num_of_colors).keys()].map((i) =>
    new Color(`hsla(${(i * step) % 360}, 100%, 50%, 1)`).rgbNumber()
  );

  for (let color of colors) {
    yield color;
  }
}

/**
 * Turns an array of item objects with type T into
 * an object with key value (k, v) pairs of (id, T)
 * @param arr an array of objects with atleast an "id" key
 * @returns an object with id strings as its keys and the item object as the values
 */
export const arrayToObject = <T extends HasId>(arr: T[]) => {
  const objects: { [id: string]: T } = {};
  arr.forEach((item) => {
    objects[item.id] = item;
  });

  return objects;
};

export const mapToArray = <T>(map: { [id: string]: T }) =>
  Object.entries(map).map(([id, item]) => item);

export const roundIntToNearestMultiple = (num: number, multiple: number) =>
  Math.round(num / multiple) * multiple;

export const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

export const midpoint = (p1: number[], p2: number[]) => [
  p1[0] + (p2[0] - p1[0]) / 2,
  p1[1] + (p2[1] - p1[1]) / 2,
];

export const normalPoint = (a: number[], b: number[], r: number) => {
  // midpoint between b and a:
  const px = (b[0] + a[0]) / 2;
  const py = (b[1] + a[1]) / 2;

  // slope components (rise / run) = (dy / dx):
  const dx = b[0] - a[0]; // run
  const dy = b[1] - a[1]; // rise

  // magnitude of slope vector:
  const V = Math.sqrt(dx * dx + dy * dy);

  // (dx / V) or (dy / V) represents a unit vector
  // and r represents the scalar for that unit vector
  const vx = (dy / V) * r; // notice x-comp is dy (see explanation below)
  const vy = -(dx / V) * r; // notice y-comp is -dx

  // Slope between two points b and a is m = dy / dx
  // However we want a point PERPENDICULAR aka NORMAL to that slope.
  // To get the slope normal to another slope is the negative reciprocal:
  // Let n be the normal slope:
  // n = -1 / m
  //   = -1 / (dy / dx)
  //   = -dx / dy
  // So for a vector v with components vx and vy where:
  // vy = rise = -dx (-dx is in the numerator; remember slope is rise OVER run)
  // vx = run = dy (dy is in the denominator so its run)

  // theres TWO normals to the midpoint of b and a (aka point p)
  return [
    [px + vx, py + vy],
    [px - vx, py - vy],
  ];
};

export const extraPoint = (a: number[], b: number[], r: number) => {
  // point to extend:
  const px = a[0];
  const py = a[1];

  // slope components (rise / run) = (dy / dx):
  const dx = b[0] - a[0]; // run
  const dy = b[1] - a[1]; // rise

  // magnitude of slope vector:
  const V = Math.sqrt(dx * dx + dy * dy);

  // (dx / V) or (dy / V) represents a unit vector
  // and r represents the scalar for that unit vector
  const vx = (dx / V) * r;
  const vy = (dy / V) * r;

  // theres TWO normals:
  return [
    [px + vx, py + vy],
    [px - vx, py - vy],
  ];
};

/**
 * Calculates an array containing points representing a cardinal spline through given point array.
 * Points must be arranged as: [x1, y1, x2, y2, ..., xn, yn].
 *
 * There must be a minimum of two points in the input array but the function
 * is only useful where there are three points or more.
 *
 * The points for the cardinal spline are returned as a new array.
 *
 * @param {Array} points - point array
 * @param {Number} [tension=0.5] - tension. Typically between [0.0, 1.0] but can be exceeded
 * @param {Number} [numOfSeg=25] - number of segments between two points (line resolution)
 * @param {Boolean} [close=false] - Close the ends making the line continuous
 * @returns {Float32Array} New array with the calculated points that was added to the path
 */
export const getCurvePoints = (
  points: number[],
  tension = 0.5,
  numOfSeg = 25,
  close?: boolean
) => {
  if (typeof points === "undefined" || points.length < 2)
    return new Float32Array(0);

  // options or defaults
  // tension = typeof tension === "number" ? tension : 0.5;
  // numOfSeg = typeof numOfSeg === "number" ? numOfSeg : 25;
  // tension = tension ? tension : 0.5;
  // numOfSeg = numOfSeg ? numOfSeg : 25;

  var pts, // for cloning point array
    i = 1,
    l = points.length,
    rPos = 0,
    rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0),
    res = new Float32Array(rLen),
    cache = new Float32Array((numOfSeg + 2) << 2),
    cachePtr = 4;

  pts = points.slice(0);

  if (close) {
    pts.unshift(points[l - 1]); // insert end point as first point
    pts.unshift(points[l - 2]);
    pts.push(points[0], points[1]); // first point as last point
  } else {
    pts.unshift(points[1]); // copy 1. point and insert at beginning
    pts.unshift(points[0]);
    pts.push(points[l - 2], points[l - 1]); // duplicate end-points
  }

  // cache inner-loop calculations as they are based on t alone
  cache[0] = 1; // 1,0,0,0

  for (; i < numOfSeg; i++) {
    var st = i / numOfSeg,
      st2 = st * st,
      st3 = st2 * st,
      st23 = st3 * 2,
      st32 = st2 * 3;

    cache[cachePtr++] = st23 - st32 + 1; // c1
    cache[cachePtr++] = st32 - st23; // c2
    cache[cachePtr++] = st3 - 2 * st2 + st; // c3
    cache[cachePtr++] = st3 - st2; // c4
  }

  cache[++cachePtr] = 1; // 0,1,0,0

  // calc. points
  parse(pts, cache, l, tension);

  if (close) {
    //l = points.length;
    pts = [];
    pts.push(
      points[l - 4],
      points[l - 3],
      points[l - 2],
      points[l - 1], // second last and last
      points[0],
      points[1],
      points[2],
      points[3]
    ); // first and second
    parse(pts, cache, 4, tension);
  }

  function parse(
    pts: number[],
    cache: Float32Array,
    l: number,
    tension: number
  ) {
    for (var i = 2, t; i < l; i += 2) {
      var pt1 = pts[i], // x1
        pt2 = pts[i + 1], // y1
        pt3 = pts[i + 2], // x2
        pt4 = pts[i + 3], // y2
        t1x = (pt3 - pts[i - 2]) * tension, // x2-x0
        t1y = (pt4 - pts[i - 1]) * tension, // y2-y0
        t2x = (pts[i + 4] - pt1) * tension, // x3-x1
        t2y = (pts[i + 5] - pt2) * tension, // y3-y1
        c = 0,
        c1,
        c2,
        c3,
        c4;

      for (t = 0; t < numOfSeg; t++) {
        c1 = cache[c++];
        c2 = cache[c++];
        c3 = cache[c++];
        c4 = cache[c++];

        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
      }
    }
  }

  // add last point
  l = close ? 0 : points.length - 2;
  res[rPos++] = points[l++];
  res[rPos] = points[l];

  return res;
};
