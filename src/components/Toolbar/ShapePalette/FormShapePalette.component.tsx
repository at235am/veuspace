import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { usePaperState } from "../../../contexts/PaperContext";
import { clamp, isColorCloseMatch } from "../../../utils/utils";
import Stroke from "../../../../public/assets/stroke.svg";

import {
  Circle,
  BrushButton,
  Container,
  StyleEditor,
  Presets,
  Selector,
  NumInput,
  StrokeSizeContainer,
  SmallButton,
  NumInputContainer,
  NumInputLabel,
  StrokeWrapper,
  Rectangle,
} from "./FormShapePalette.styles";
import { useToolbarStore } from "../../../store/ToolbarState";
import Color from "color";
import { useTheme } from "@emotion/react";
import { useUserSettingStore } from "../../../store/UserSettingStore";
import { RectangleStyleProps } from "../../../modules/items/Rectangle";

export interface FormShapePresetOptions extends RectangleStyleProps {
  id: string;
}

export type FormShapePresetMap = { [id: string]: FormShapePresetOptions };

// ***NOTE:
// We handle animations per Palette component rather than in the parent(Toolbar)
// so that the Palette component can have its useEffects fired regardless of whether
// we want to immediately show the UI of the Palette component.
// This is to make sure the user's customization settings are loaded in to PixiApplication.
// Otherwise we would have to move all the customization state into Toolbar per Palette component.
type Props = {};
const FormShapePalette = ({}: Props) => {
  const { pixim } = usePaperState();

  const showPalette = useToolbarStore((state) => state.showPalette);

  const presets = useUserSettingStore((state) => state.formShapePresets);
  const updatePreset = useUserSettingStore(
    (state) => state.setFormShapePresets
  );

  const [activePid, setActivePid] = useState("1");
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

  useEffect(() => {
    const opt = presets[activePid];
    if (opt) pixim.current.formShapeTool.setStyles(opt);
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
  preset: FormShapePresetOptions;
  onClick: any;
};

const BrushPreview = ({ activeId, preset, onClick }: BrushPreviewProps) => {
  const highlight = activeId === preset.id;

  const { shape } = preset;

  const theme = useTheme();
  const fillColor = Color(preset.fillColor);
  const bgColor = Color(theme.colors.surface.L10);
  const isSameColor = isColorCloseMatch(fillColor, bgColor);

  return (
    <BrushButton onClick={onClick}>
      {highlight && <Selector layoutId="brush-selected" />}
      {shape === "circle" && (
        <Circle presetOptions={preset} shadow={isSameColor}></Circle>
      )}
      {shape === "rectangle" && (
        <Rectangle presetOptions={preset} shadow={isSameColor}></Rectangle>
      )}
    </BrushButton>
  );
};

//--------------------------------------------------------------------------------

type StrokePreviewProps = {
  preset: FormShapePresetOptions;
  updatePreset: (value: FormShapePresetOptions) => void;
};

const StrokePreview = ({ preset, updatePreset }: StrokePreviewProps) => {
  const theme = useTheme();
  const fillColor = Color(preset.fillColor);
  const bgColor = Color(theme.colors.surface.L10);
  const isSameColor = isColorCloseMatch(fillColor, bgColor);

  return (
    <>
      {/* <NumberInput preset={preset} updatePreset={updatePreset} /> */}
      <StrokeWrapper preset={preset} shadow={isSameColor}>
        <Stroke />
      </StrokeWrapper>
    </>
  );
};

//--------------------------------------------------------------------------------
// type NumberInputProps = {
//   preset: FormShapePresetOptions;
//   updatePreset: (value: FormShapePresetOptions) => void;
//   min?: number;
//   max?: number;
// };

// const NumberInput = ({
//   preset,
//   updatePreset,
//   min = 1,
//   max = 25,
// }: NumberInputProps) => {
//   const { id, size } = preset;

//   const stepper = (step = 1) => {
//     updatePreset({ ...preset, size: clamp(size + step, min, max) });
//   };

//   const increment = () => stepper(1);
//   const decrement = () => stepper(-1);

//   const htmlId = `draw-${id}`;

//   return (
//     <NumInputContainer>
//       <NumInputLabel htmlFor={htmlId}>SIZE</NumInputLabel>
//       <StrokeSizeContainer>
//         <SmallButton type="button" onClick={decrement}>
//           -
//         </SmallButton>
//         <NumInput id={htmlId} type="number" value={size} readOnly></NumInput>
//         <SmallButton type="button" onClick={increment}>
//           +
//         </SmallButton>
//       </StrokeSizeContainer>
//     </NumInputContainer>
//   );
// };

export default FormShapePalette;
