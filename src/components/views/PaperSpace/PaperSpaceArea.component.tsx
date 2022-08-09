import { Toolbar } from "../../Toolbar";
import { PaperSpace } from "../../PaperSpace";

// contexts:
import { PaperStateProvider } from "../../../contexts/PaperContext";
import { Wrapper, Float } from "./PaperSpace.styles";
import { useResizeDetector } from "react-resize-detector";
import { useEffect, useRef, useState } from "react";

export const PaperSpaceArea = () => {
  const { ref, width = 0 } = useResizeDetector();

  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <PaperStateProvider>
      <Wrapper>
        <Float ref={ref} widthOffset={Math.round(width)}>
          <Toolbar />
        </Float>
        <PaperSpace />
      </Wrapper>
    </PaperStateProvider>
  );
};
