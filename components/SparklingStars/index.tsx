// styling:
import { css, jsx, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";

// libraries:
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import { getRandomIntInclusive } from "../../utils/utils";

const Container = styled.div<{ z: number }>`
  /* z-index: ${({ z }) => z}; */
  z-index: -1;

  position: absolute;
  width: 100%;
  height: 100%;

  /* background-color: #222; */

  &:hover {
    /* background-color: red; */
  }
`;

const Star = styled(motion.span)`
  position: absolute;

  background-color: white;
  top: 0;
  left: 0;

  width: 1rem;
  height: 1rem;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.caution.main};
  }
`;

const getRandomPosition = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => ({
  x: getRandomIntInclusive(minX, maxX),
  y: getRandomIntInclusive(minY, maxY),
});

const getRandomDimensions = (min: number, max: number) => {
  const d = getRandomIntInclusive(min, max);
  return { width: d, height: d };
};

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

  if (disable) return null;

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
