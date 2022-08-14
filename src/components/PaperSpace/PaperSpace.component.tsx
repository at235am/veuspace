import { useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container } from "./PaperSpace.styles";

const PaperSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { pixim, setup } = usePaperState();
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    setup(canvasRef.current, containerRef.current);
    return () => {};
  }, [setup]);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    pixim.current.resize(width, height);
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      <Canvas ref={canvasRef} tabIndex={-1} />
    </Container>
  );
};

export default PaperSpace;
