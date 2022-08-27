import { useEffect, useLayoutEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Container } from "./PaperSpace.styles";
import { PixiApplication } from "../../modules/PixiApplication";

const PaperSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { pixim, loadFromStorage } = usePaperState();
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // We manually create and render the canvas element without relying on react.
    // This is because if we unmount and remount (react double render),
    // pixi.js has trouble contructing a new application properly when reusing the same canvas element.
    // Basically there is an issue where if
    // (1) you initialize a pixi application with a canvas element
    // (2) then you destroy the application (doesn't matter if you destroy canvas element itself),
    // (3) then try to initialize another pixi application using that same canvas element
    // You'll get an error about reading null of imageSmoothingEnabled
    // (even if you know for a fact there is still a canvas element).
    // However, this only happens on mobile. I have a feeling it is because most mobile devices use WebGL 1.0
    // and the initialization of that specific renderer changes something internally with the canvas element
    // that makes reusing the same canvas element impossible because certain things are nulled.
    const canvas = document.createElement("canvas");
    canvas.tabIndex = -1;
    canvas.style.position = "absolute";
    containerRef.current.appendChild(canvas);
    pixim.current = new PixiApplication(canvas, containerRef.current);

    loadFromStorage();

    return () => {
      pixim.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    pixim.current?.setScreenSize(width, height);
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      {/* CANT USE BELOW CODE CUS OF BUG DESCRIBED IN useEffect() */}
      {/* <Canvas ref={canvasRef} tabIndex={-1} /> */}
    </Container>
  );
};

export default PaperSpace;
