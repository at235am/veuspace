// styling:
import { css, jsx, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { contentCenter } from "../../styles/content-centerer";
import { fabric } from "fabric";
import useResizeObserver from "use-resize-observer/polyfilled";

import { clamp } from "../../utils/utils";
import useUpdatedState from "../../hooks/useUpdatedState";
import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";

const Container = styled.div`
  /* border: 1px solid blue; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Viewbox = styled.canvas`
  border-radius: 5px;
`;

const Float = styled.div`
  z-index: 5;
  position: absolute;

  top: 0;
  left: 0;
  margin: 1rem;

  display: flex;
  gap: 1rem;
`;

const B = styled.button<{ selected?: boolean }>`
  color: white;
  background-color: black;

  border: 1px solid ${({ selected }) => (selected ? "red" : "white")};
`;

type CanvasMode =
  | "select"
  | "draw"
  | "pan"
  | "text_add"
  | "text_edit"
  | "reset";

const MODES: Record<CanvasMode, CanvasMode> = {
  select: "select",
  draw: "draw",
  pan: "pan",
  text_add: "text_add",
  text_edit: "text_edit",
  reset: "reset",
};

const PaperSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver({ ref: containerRef });
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
    canvas.current.setDimensions({
      width: width ?? 500,
      height: height ?? 500,
    });
  }, [width, height]);

  return (
    <Container ref={containerRef}>
      {/* <Float>
        <B
          selected={renderMode === MODES.select}
          onClick={() => toggleMode(MODES.select)}
        >
          select
        </B>
        <B
          selected={renderMode === MODES.draw}
          onClick={() => toggleMode(MODES.draw)}
        >
          draw
        </B>
        <B
          selected={renderMode === MODES.pan}
          onClick={() => toggleMode(MODES.pan)}
        >
          pan
        </B>
        <B
          selected={renderMode === MODES.text_add}
          onClick={() => toggleMode(MODES.text_add)}
        >
          text_add
        </B>
        <B
          selected={renderMode === MODES.text_edit}
          onClick={() => toggleMode(MODES.text_edit)}
        >
          text_edit
        </B>
        <B onClick={() => setBackground("dot", "white", "#292929")}>dot</B>
        <B onClick={() => setBackground("grid", "white", "#292929")}>grid</B>
        <B onClick={() => setBackground("hline", "white", "#292929")}>hline</B>
        <B onClick={() => setBackground("vline", "white", "#292929")}>vline</B>
      </Float> */}
      <Viewbox id="canvas"></Viewbox>
    </Container>
  );
};

export default PaperSpace;
