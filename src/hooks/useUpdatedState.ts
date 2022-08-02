import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

const useUpdatedState = <T>(
  state: T
): [MutableRefObject<T>, T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(state);
  const valueRef = useRef<T>(state);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return [valueRef, value, setValue];
};

export default useUpdatedState;
