import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { usePaperState } from "../../../contexts/PaperContext";
import { BrushOptions } from "../../../modules/items/Brush";
import { Tool } from "../../../modules/PixiApplication";
import { clamp, isColorCloseMatch } from "../../../utils/utils";

import Stroke from "../../../../public/assets/stroke.svg";

import {
  Circle,
  BrushButton,
  Container,
  Header,
  StyleEditor,
  Presets,
  Selector,
  NumInput,
  StrokeSizeContainer,
  SmallButton,
  NumInputContainer,
  NumInputLabel,
  StrokeWrapper,
  darkShadow,
  lightShadow,
} from "./DrawPicker.styles";
import useLocalStorage from "@rehooks/local-storage";
import { useToolbarStore } from "../../../store/ToolbarState";
import Color from "color";
import { useTheme } from "@emotion/react";

export interface PresetOptions extends BrushOptions {
  id: string;
}

export type MappedPresetOptions = { [id: string]: PresetOptions };

const default_presets: MappedPresetOptions = {
  a: { id: "a", size: 3, color: "#2e8df9" },
  b: { id: "b", size: 6, color: "#c544b0" },
  c: { id: "c", size: 9, color: "#ecdf2e" },
  d: { id: "d", size: 12, color: "#ffffff" },
  e: { id: "e", size: 17, color: "#7050cc" },
  f: { id: "f", size: 18, color: "#222222" },
  g: { id: "g", size: 22, color: "#cb5151" },
  h: { id: "h", size: 25, color: "#3dc973" },
};

type Props = {};

// ***NOTE:
// We handle animations per Palette component rather than in the parent(Toolbar)
// so that the Palette component can have its useEffects fired regardless of whether
// we want to immediately show the UI of the Palette component.
// This is to make sure the user's customization settings are loaded in to PixiApplication.
// Otherwise we would have to move all the customization state into Toolbar per Palette component.
const DrawPicker = ({}: Props) => {
  const { pixim } = usePaperState();

  const showPalette = useToolbarStore((state) => state.showPalette);

  const [presets, setPresets] = useLocalStorage(
    "draw-palette",
    default_presets
  );

  const [activePid, setActivePid] = useState("a");
  const [styleEditor, setStyleEditor] = useState(false);

  // derived state:
  const currentPreset = presets[activePid];

  const presetPaletteAnim = {
    variants: {
      open: {
        y: 0,
        opacity: 1,
        transition: { type: "tween", duration: 0.25 },
      },
      close: {
        y: -50,
        opacity: 0,
        transition: {
          type: "tween",
          duration: 0.25,
          delay: styleEditor ? 0.1 : 0,
        },
      },
    },
    initial: "close",
    animate: showPalette ? "open" : "close",
    exit: "close",
  };

  const styleEditorAnim = {
    variants: {
      open: {
        y: 0,
        opacity: 1,
      },
      close: {
        y: -50,
        opacity: 0,
      },
    },
    initial: "close",
    animate: "open",
    exit: "close",
    transition: { type: "tween", duration: 0.2 },
  };

  const updatePreset = (value: PresetOptions) => {
    if (!presets[value.id]) return;
    const copy = { ...presets };
    copy[value.id] = value;
    setPresets(copy);
  };

  useEffect(() => {
    const opt = presets[activePid];
    if (opt) pixim.current.drawTool.setOptions(opt);
  }, [activePid, presets]);

  return (
    <Container>
      <AnimatePresence>
        {showPalette && (
          <Presets {...presetPaletteAnim}>
            {Object.entries(presets).map(([id, options]) => (
              <BrushPreview
                key={id}
                activeId={activePid}
                preset={options}
                onClick={() => {
                  setActivePid(id);
                  setStyleEditor((v) => (v && activePid === id ? false : true));
                }}
              />
            ))}
          </Presets>
        )}
      </AnimatePresence>
      <AnimatePresence exitBeforeEnter>
        {showPalette && styleEditor && (
          <StyleEditor key={activePid} {...styleEditorAnim}>
            <StrokePreview preset={currentPreset} updatePreset={updatePreset} />
          </StyleEditor>
        )}
      </AnimatePresence>
    </Container>
  );
};

//--------------------------------------------------------------------------------
type BrushPreviewProps = {
  activeId: string;
  preset: PresetOptions;
  onClick: any;
};

const BrushPreview = ({ activeId, preset, onClick }: BrushPreviewProps) => {
  const highlight = activeId === preset.id;

  const theme = useTheme();
  const brushColor = Color(preset.color);
  const bgColor = Color(theme.colors.surface.L10);
  const isSameColor = isColorCloseMatch(brushColor, bgColor);

  let shadow = "none";
  if (!isSameColor) shadow = "none";
  else if (brushColor.isDark()) shadow = darkShadow;
  else shadow = lightShadow;

  return (
    <BrushButton onClick={onClick}>
      {highlight && <Selector layoutId="brush-selected" />}
      <Circle presetOptions={preset} shadow={shadow}></Circle>
    </BrushButton>
  );
};

//--------------------------------------------------------------------------------

type StrokePreviewProps = {
  preset: PresetOptions;
  updatePreset: (value: PresetOptions) => void;
};

const StrokePreview = ({ preset, updatePreset }: StrokePreviewProps) => {
  const theme = useTheme();
  const brushColor = Color(preset.color);
  const bgColor = Color(theme.colors.surface.L10);
  const isSameColor = isColorCloseMatch(brushColor, bgColor);

  let shadow = "none";
  if (!isSameColor) shadow = "none";
  else if (brushColor.isDark()) shadow = darkShadow;
  else shadow = lightShadow;
  return (
    <>
      <NumberInput preset={preset} updatePreset={updatePreset} />
      <StrokeWrapper preset={preset} shadow={shadow}>
        <Stroke />
      </StrokeWrapper>
    </>
  );
};

//--------------------------------------------------------------------------------
type NumberInputProps = {
  preset: PresetOptions;
  updatePreset: (value: PresetOptions) => void;
  min?: number;
  max?: number;
};

const NumberInput = ({
  preset,
  updatePreset,
  min = 1,
  max = 25,
}: NumberInputProps) => {
  const { id, size } = preset;

  const stepper = (step = 1) => {
    updatePreset({ ...preset, size: clamp(size + step, min, max) });
  };

  const increment = () => stepper(1);
  const decrement = () => stepper(-1);

  const htmlId = `draw-${id}`;

  return (
    <NumInputContainer>
      <NumInputLabel htmlFor={htmlId}>SIZE</NumInputLabel>
      <StrokeSizeContainer>
        <SmallButton type="button" onClick={decrement}>
          -
        </SmallButton>
        <NumInput id={htmlId} type="number" value={size} readOnly></NumInput>
        <SmallButton type="button" onClick={increment}>
          +
        </SmallButton>
      </StrokeSizeContainer>
    </NumInputContainer>
  );
};

export default DrawPicker;
