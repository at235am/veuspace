import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import { getRandomIntInclusive } from "../../utils/utils";
import { Container, Star } from "./SparklingStars.styles";
import { getRandomDimensions, getRandomPosition } from "./SparklingStars.util";

type StarData = {
  id: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  rotate: number;
};

type SparklingStarsProps = {
  numberOfStars?: number;
  disable?: boolean;
  disableAnimation?: boolean;
  interactable?: boolean;
};

const SparklingStars = ({
  interactable,
  numberOfStars,
  disable = false,
  disableAnimation = false, // note disabling the animations currently does NOT work
}: SparklingStarsProps) => {
  const [starz, setStarz] = useState<StarData[]>([]);

  const animation = !disableAnimation
    ? {
        animate: {
          opacity: [1, 0],
          scale: [1, 1],
        },
      }
    : {};

  useEffect(() => {
    const stars = numberOfStars ?? Math.round(window.innerWidth / 10);

    const starss = [...Array(stars).keys()].map((star) => ({
      id: nanoid(6),
      position: getRandomPosition(0, window.innerWidth, 0, window.innerHeight),
      dimensions: getRandomDimensions(0, 3),
      rotate: getRandomIntInclusive(0, 45),
    }));

    setStarz(starss);
  }, []);

  if (disable) return null;

  return (
    <Container className="stars" z={interactable ? 1 : -1}>
      {starz.map((star) => (
        <Star
          key={star.id}
          style={{
            width: star.dimensions.width,
            height: star.dimensions.height,
            x: star.position.x,
            y: star.position.y,
            rotate: star.rotate,
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: getRandomIntInclusive(1, 10),
          }}
          {...animation}
          whileHover={{ scale: 5, transition: { duration: 0.2 }, opacity: 1 }}
        />
      ))}
    </Container>
  );
};

export default SparklingStars;
