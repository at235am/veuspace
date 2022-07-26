import { MutableRefObject, useRef, useState } from "react";

const useUpdatedState = <T>(
  state: T
): [MutableRefObject<T>, T, (val: T) => void] => {
  const [value, setValue] = useState<T>(state);
  const valueRef = useRef<T>(state);

  const setState = (val: T) => {
    valueRef.current = val;
    setValue(val);
  };

  return [valueRef, value, setState];
};

export default useUpdatedState;
