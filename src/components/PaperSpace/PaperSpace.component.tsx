import { useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container } from "./PaperSpace.styles";
import { PixiApplication } from "../../modules/PixiApplication";

const PaperSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { pixim, loadFromStorage } = usePaperState();
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  useEffect(() => {
    console.log("=======================================================");

    console.log("UE mounted");
    if (!canvasRef.current || !containerRef.current) return;
    console.log("UE setup");

    console.log("prevID", pixim.current?.uid);

    pixim.current = new PixiApplication(
      canvasRef.current,
      containerRef.current
    );

    console.log(pixim.current.uid);

    // pixim.current.setup(canvasRef.current, containerRef.current);

    loadFromStorage();

    return () => {
      console.log("UE destroy");
      pixim.current?.destroy();
      console.log("=======================================================");
    };
  }, []);

  useEffect(() => {
    console.log("UE setscreensize");
    if (width === 0 || height === 0) return;
    pixim.current?.setScreenSize(width, height);
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      <Canvas ref={canvasRef} tabIndex={-1} />
    </Container>
  );
};

export default PaperSpace;
