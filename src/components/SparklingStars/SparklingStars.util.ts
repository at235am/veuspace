import { getRandomIntInclusive } from "../../utils/utils";

export const getRandomPosition = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => ({
  x: getRandomIntInclusive(minX, maxX),
  y: getRandomIntInclusive(minY, maxY),
});

export const getRandomDimensions = (min: number, max: number) => {
  const d = getRandomIntInclusive(min, max);
  return { width: d, height: d };
};
