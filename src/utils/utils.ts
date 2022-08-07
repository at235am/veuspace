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

export const colorToNumber = (color: string | number) => {
  return new Color(color).rgbNumber();
};

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
