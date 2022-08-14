import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// consumer use:
export type Keybind = {
  id: string;
  description?: string;
  keys: string[];
  actionId: string;
};

export type KeyAction = {
  actionId: string;
  action: () => any;
};

// for internal hook use:
type TransformedKeybind = {
  key: string;
  action: () => any;
};

type KeyActionMap = {
  [actionId: string]: KeyAction;
};

type KeybindMap = {
  [key: string]: TransformedKeybind;
};

const mapKeybindActions = (
  keybinds: Keybind[],
  keyActions: KeyActionMap
): KeybindMap => {
  const map: KeybindMap = {};

  keybinds.forEach((key) => {
    key.keys.forEach((k) => {
      map[k] = {
        key: k,
        action:
          keyActions[key.actionId]?.action ??
          (() =>
            console.warn(`No key action found for actionId='${key.actionId}'`)),
      };
    });
  });

  return map;
};

const mapKeyActions = (keyActions: KeyAction[]): KeyActionMap => {
  const map: KeyActionMap = {};

  keyActions.forEach((action) => {
    map[action.actionId] = action;
  });

  return map;
};

export const useHotkeys = (keybinds: Keybind[], keyActions: KeyAction[]) => {
  const paused = useRef(false);

  const keyActionsMap = useMemo(() => mapKeyActions(keyActions), [keyActions]);
  const keybindsMap = useMemo(
    () => mapKeybindActions(keybinds, keyActionsMap),
    [keybinds, keyActionsMap]
  );

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (paused.current) return;
      const keybind = keybindsMap[e.key];
      if (keybind) keybind.action();
    },
    [keybindsMap]
  );

  const setHotkeyPaused = (value: boolean) => (paused.current = value);

  useEffect(() => {
    window.addEventListener("keypress", handler);
    return () => {
      window.removeEventListener("keypress", handler);
    };
  }, [handler]);

  return { setHotkeyPaused };
};
