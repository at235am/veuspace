import { useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container } from "./PaperSpace.styles";

const PaperSpace = () => {
  const { app, containerRef, canvasRef, init, setCanvasSize } = usePaperState();
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
    </Container>
  );
};

export default PaperSpace;
