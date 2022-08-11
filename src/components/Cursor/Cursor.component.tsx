import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Container } from "./Cursor.styles";

type Props = {};

const History = ({}: Props) => {
  const [{ x, y }, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <Container
      animate={{ x, y }}
      transition={{ duration: 0, type: "tween" }}
    ></Container>
  );
};

export default History;
