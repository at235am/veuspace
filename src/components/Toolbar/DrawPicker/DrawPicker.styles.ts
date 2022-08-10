import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { PresetOptions } from "./DrawPicker.component";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Header = styled.h2``;

export const Presets = styled.div`
  padding: 0.5rem;

  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;

  background-color: rgba(70, 70, 70, 0.75);
  backdrop-filter: blur(15px);

  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  /* gap: 2px; */
`;

export const Modify = styled.div`
  padding: 0.5rem;
  background-color: #ffffff20;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;

  background-color: rgba(70, 70, 70, 0.75);
  backdrop-filter: blur(15px);

  display: flex;
  gap: 0.5rem;

  /* flex-direction: column; */
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
}>`
  border-radius: 50%;

  ${({ presetOptions }) => css`
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

  color: ${({ theme }) => theme.colors.onBackground.main};
  font-size: 10px;
  font-weight: 500;
`;

export const StrokeContainer = styled.div`
  /* border: 1px solid red; */

  overflow: hidden;
  border-radius: 5px;

  background-color: #ffffff20;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SmallButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.onBackground.main};
  padding: 10px 6px;
`;

export const NumInput = styled.input`
  /* border: 1px solid blue; */

  border-radius: 50%;
  width: 2rem;
  height: 2rem;

  color: ${({ theme }) => theme.colors.background.main};

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
