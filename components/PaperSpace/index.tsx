// styling:
import { css, jsx, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { contentCenter } from "../../styles/content-centerer";
import { fabric } from "fabric";
import { useResizeDetector } from "react-resize-detector";

import { clamp } from "../../utils/utils";
import useUpdatedState from "../../hooks/useUpdatedState";
import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";

const Container = styled.div`
  /* border: 1px solid blue; */

  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Viewbox = styled.canvas`
  /* border-radius: 5px; */
  /* width: 100%; */
  /* height: 100%; */
`;

const PaperSpace = () => {
  // const containerRef = useRef<HTMLDivElement>(null);
  const { width = 500, height = 500, ref: containerRef } = useResizeDetector();
  const { canvas, renderMode, toggleMode, setBackground } =
    usePaperSpaceState();

  // SET UP:
  useEffect(() => {
    // init fabric canvas:
    canvas.current = new fabric.Canvas("canvas", {
      fill: "red",
      backgroundColor: "pink",
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
      // imageSmoothingEnabled: false,
    });

    // fabric canvas properties:
    canvas.current.freeDrawingBrush.width = 5;

    setBackground("dot", "white", "#292929");

    return () => {
      console.log("dismount");
      canvas.current.dispose();
    };
  }, []);

  useEffect(() => {
    console.log("change", width, height);
    canvas.current.setDimensions({
      width: width,
      height: height,
    });
    canvas.current.renderAll();
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      <Viewbox id="canvas"></Viewbox>
    </Container>
  );
};

export default PaperSpace;
