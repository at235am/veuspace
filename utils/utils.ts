import { nanoid } from "nanoid";
import { MdSyncProblem } from "react-icons/md";
import Color from "color";
import paper from "paper";

type Position = {
  x: number;
  y: number;
};

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

export const ORIGIN: Position = { x: 0, y: 0 };

export const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

export const prettyNumber = (num: number) =>
  num.toFixed(2).replace(/[.,]00$/, "");

export const paperColor = (color: string | number) => {
  const c = new Color(color).object();
  return new paper.Color(c.r / 255, c.g / 255, c.b / 255, c.alpha);
};
