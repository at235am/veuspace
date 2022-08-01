import { nanoid } from "nanoid";
import Color from "color";
import paper from "paper";

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

export const paperColor = (color: string | number) => {
  const c = new Color(color).object();
  return new paper.Color(c.r / 255, c.g / 255, c.b / 255, c.alpha);
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
