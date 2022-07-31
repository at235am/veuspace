import styled from "@emotion/styled";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
// import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";

const Container = styled.div`
  /* border: 1px solid blue; */

  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;
  position: relative;
  touch-action: none;

  /* max-width: 100vw; */
  /* max-height: 100vh; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Canvas = styled.canvas`
  position: absolute;
  background-color: #333;
`;

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
