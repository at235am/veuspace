import styled from "@emotion/styled";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

// hooks:
import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";

const Container = styled.div`
  /* border: 1px solid blue; */

  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;
  touch-action: none;

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Viewbox = styled.canvas``;

const PaperSpace = () => {
  const { width = 0, height = 0, ref } = useResizeDetector<HTMLDivElement>();

  const { canvas, mode, renderMode, toggleMode, setBackground, containerRef } =
    usePaperSpaceState();

  useEffect(() => {
    // init fabric canvas:
    canvas.current = new fabric.Canvas("canvas", {
      fill: "red",
      backgroundColor: "pink",
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
      // imageSmoothingEnabled: false,
      // allowTouchScrolling: true,
    });

    containerRef.current = ref.current;

    setBackground("dot", "white", "#292929");

    // fabric canvas properties:
    canvas.current.freeDrawingBrush.width = 5;

    return () => {
      canvas.current.dispose();
    };
  }, []);

  useEffect(() => {
    canvas.current.setDimensions({
      width: width,
      height: height,
    });
    canvas.current.renderAll();
  }, [width, height]);

  return (
    <Container ref={ref}>
      <Viewbox id="canvas"></Viewbox>
    </Container>
  );
};

export default PaperSpace;
