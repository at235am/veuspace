import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Color from "color";
import { motion } from "framer-motion";
import { PresetOptions } from "./DrawPicker.component";

export const darkShadow = "rgba(0, 0, 0, 0.5) 0 0 5px";
export const lightShadow = "rgba(0, 0, 0, 0.15) 0 0 5px";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Header = styled.h2``;

// rgb(0 0 0 / 5%) 0px 20px 40px 0px,

export const Presets = styled(motion.div)`
  ${({ theme }) => css`
    z-index: 2;
    position: relative;

    padding: 0.5rem;
    border-radius: 5px;

    /* box-shadow: rgba(0, 0, 0, ${theme.id === "dark"
      ? 0.2
      : 0.05}) 0px 0px 12px; */
    box-shadow: ${theme.id === "dark"
      ? "rgba(0, 0, 0, 0.2) 0 0 12px"
      : "rgb(0 0 0 / 5%) 0px 0px 10px 0px"};

    background-color: ${theme.colors.surface.L10};
    backdrop-filter: blur(15px);

    flex-wrap: wrap;
    display: flex;
    justify-content: space-between;
    /* gap: 2px; */
  `}
`;

export const StyleEditor = styled(motion.div)`
  ${({ theme }) => css`
    z-index: 1;
    position: relative;

    padding: 0.5rem;
    border-radius: 5px;

    box-shadow: rgba(0, 0, 0, ${theme.id === "dark" ? 0.2 : 0.05}) 0px 0px 12px;

    box-shadow: ${theme.id === "dark"
      ? "rgba(0, 0, 0, 0.2) 0 0 12px"
      : "rgb(0 0 0 / 5%) 0px 0px 10px 0px"};

    background-color: ${theme.colors.surface.L10};
    backdrop-filter: blur(15px);

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  `}
`;

export const StrokeWrapper = styled.div<{
  preset: PresetOptions;
  shadow: string;
}>`
  ${({ preset, shadow }) => css`
    /* border: 1px solid red; */
    width: min-content;
    height: min-content;
    display: flex;

    svg {
      path {
        filter: drop-shadow(${shadow});
        stroke: ${preset.color};
        stroke-width: ${preset.size}px;
      }
    }
  `}
`;

//--------------------------------------------------------------------------------

export const BrushButton = styled.button`
  position: relative;

  border-radius: 5px;
  background-color: transparent;

  width: 40px;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Selector = styled(motion.span)`
  background-color: #ffffff20;
  background-color: ${({ theme }) => theme.colors.surface.L20};

  border-radius: inherit;

  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
`;

export const Circle = styled.div<{
  presetOptions: PresetOptions;
  shadow: string;
}>`
  ${({ presetOptions, shadow }) => css`
    border-radius: 50%;

    box-shadow: ${shadow};

    background-color: ${presetOptions.color};
    width: ${presetOptions.size}px;
    height: ${presetOptions.size}px;
  `}
`;

//--------------------------------------------------------------------------------

export const NumInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const NumInputLabel = styled.label`
  width: 100%;
  padding: 2px;

  color: ${({ theme }) => theme.colors.onSurface.B00};
  font-size: 10px;
  font-weight: 500;
`;

export const StrokeSizeContainer = styled.div`
  /* border: 1px solid red; */

  overflow: hidden;
  border-radius: 5px;

  /* background-color: #ffffff20; */
  /* background-color: ${({ theme }) => theme.colors.surface.L20}; */
  border: 1px solid ${({ theme }) => theme.colors.surface.D10};

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SmallButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.onSurface.B00};
  padding: 10px 6px;
`;

export const NumInput = styled.input`
  /* border: 1px solid blue; */

  border-radius: 50%;
  border-radius: 5px;
  width: 2rem;
  height: 2rem;

  background-color: ${({ theme }) => theme.colors.surface.D10};

  color: ${({ theme }) => theme.colors.onSurface.B00};

  text-align: center;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;
