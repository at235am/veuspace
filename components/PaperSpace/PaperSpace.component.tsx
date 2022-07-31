import { useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container } from "./PaperSpace.styles";

const PaperSpace = () => {
  const { app, containerRef, canvasRef, init, setCanvasSize, zoom } =
    usePaperState();
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("initilized");
    init(canvasRef.current);

    return () => {};
  }, []);

  useEffect(() => {
    setCanvasSize(width, height);
  }, [width, height]);

  return (
    <Container
      ref={containerRef}
      onWheel={(e) => {
        zoom(e.deltaY, { x: e.clientX, y: e.clientY });
      }}
    >
      <Canvas ref={canvasRef}></Canvas>
    </Container>
  );
};

export default PaperSpace;
