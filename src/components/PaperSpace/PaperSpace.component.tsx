import { useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container, Popup } from "./PaperSpace.styles";

const PaperSpace = () => {
  const { app, containerRef, canvasRef, init, setCanvasSize, text } =
    usePaperState();
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("calling init");
    init(canvasRef.current);

    return () => {};
  }, []);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    setCanvasSize(width, height);
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      <Canvas ref={canvasRef} />
      <Popup>{JSON.stringify(text, null, 2)}</Popup>
    </Container>
  );
};

export default PaperSpace;
