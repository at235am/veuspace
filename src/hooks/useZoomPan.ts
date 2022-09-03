import { select, Selection } from "d3-selection";
import { zoom, zoomIdentity, ZoomTransform } from "d3-zoom";
import { useEffect, useRef, useState } from "react";

import { mat2d, vec2 } from "gl-matrix";
import { multiply } from "lodash";

export type Transform = {
  x: number;
  y: number;
  scale: number;
};

export type VPoint = [number, number];

export const useZoomPan = () => {
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const transformMatrix = useRef<mat2d>(mat2d.create());

  const pan = (point: VPoint) => {
    console.log(point);
    const tm = transformMatrix.current;
    const scale = tm[3];

    const txy = mat2d.translate(
      tm,
      mat2d.fromScaling(mat2d.create(), [1, 1]),
      vec2.fromValues(point[0], point[1])
    );

    mat2d.scale(tm, txy, [scale, scale]);

    const k = tm[3];
    const x = tm[4];
    const y = tm[5];
    // console.log(tm.toString());

    setTransform({ x, y, scale: k });
  };

  const panTo = (point: VPoint) => {
    const tm = transformMatrix.current;

    // const one = mat2d.identity(mat2d.create());
    const des = mat2d.create();
    const txy = mat2d.fromTranslation(mat2d.create(), [-point[0], -point[1]]);
    const sc = mat2d.fromScaling(mat2d.create(), [tm[3], tm[3]]);

    mat2d.multiply(des, txy, des);
    mat2d.multiply(des, sc, des);

    transformMatrix.current = des;

    const k = des[3];
    const x = des[4];
    const y = des[5];

    setTransform({ x, y, scale: k });
  };

  const zoomBy = (point: VPoint, amount: number) => {
    const tm = transformMatrix.current;
    // Translation matrix that moves the world such that the mouse point is at
    // the top of the canvas (where 0,0 would normally be).
    const toPoint = mat2d.fromTranslation(
      mat2d.create(),
      vec2.fromValues(-point[0], -point[1])
    );

    // Scale (zoom) matrix.
    const scale = mat2d.fromScaling(
      mat2d.create(),
      vec2.fromValues(amount, amount)
    );

    // Translation matrix which translates the world back to where it started.
    const fromPoint = mat2d.fromTranslation(mat2d.create(), point);

    // The new world transformation matrix is:
    // fromPoint * scale * toPoint * worldTrans.
    // Matrix multiplication is _not_ commutative and operates right to left.
    mat2d.multiply(tm, toPoint, tm);
    mat2d.multiply(tm, scale, tm);
    mat2d.multiply(tm, fromPoint, tm);
    // mat2d.multiply(transformMatrix.current, toPoint, transformMatrix.current);
    // mat2d.multiply(transformMatrix.current, scale, transformMatrix.current);
    // mat2d.multiply(transformMatrix.current, fromPoint, transformMatrix.current);

    // console.log(transformMatrix.current.toString());

    const k = tm[3];
    const x = tm[4];
    const y = tm[5];

    setTransform({ x, y, scale: k });

    return tm.toString();
  };

  const zoomToo = (point: VPoint, amount: number) => {
    const tm = transformMatrix.current;

    // Translation matrix that moves the world such that the mouse point is at
    // the top of the canvas (where 0,0 would normally be).
    const toPoint = mat2d.fromTranslation(
      mat2d.create(),
      vec2.fromValues(-point[0], -point[1])
    );

    // Scale (zoom) matrix.
    const scale = mat2d.fromScaling(
      mat2d.create(),
      vec2.fromValues(amount, amount)
    );

    // Translation matrix which translates the world back to where it started.
    const fromPoint = mat2d.fromTranslation(mat2d.create(), point);

    // The new world transformation matrix is:
    // fromPoint * scale * toPoint * worldTrans.
    // Matrix multiplication is _not_ commutative and operates right to left.
    mat2d.multiply(tm, toPoint, tm);
    mat2d.multiply(tm, scale, tm);
    mat2d.multiply(tm, fromPoint, tm);
    // mat2d.multiply(transformMatrix.current, toPoint, transformMatrix.current);
    // mat2d.multiply(transformMatrix.current, scale, transformMatrix.current);
    // mat2d.multiply(transformMatrix.current, fromPoint, transformMatrix.current);

    // console.log(transformMatrix.current.toString());

    const k = tm[3];
    const x = tm[4];
    const y = tm[5];
  };

  return { transform, zoomBy, pan, panTo };
};
// const selectionRef =
//   useRef<Selection<HTMLDivElement, {}, HTMLElement, any>>();

// useEffect(() => {
// if (!containerRef.current) return;
// let skipped = false;
// let lastValidTransform = zoomIdentity;
// const selection = select<HTMLDivElement, {}>(containerRef.current);
// const zoomer = zoom<HTMLDivElement, {}>()
//   .scaleExtent([0.1, 10])
//   .filter((e) => {
//     const { type, touches, buttons } = e;
//     const touch = type.toLowerCase().includes("touch");
//     const middleClick = buttons === 4;
//     const touchPan = touch && touches > 1;
//     const mouseWheel = type === "wheel";
//     const leftClick = !touch ? buttons === 1 : true;
//     const allow = leftClick || middleClick || touchPan || mouseWheel;
//     return allow;
//   })
//   .on("zoom", (e) => {
//     // console.log("--------------------------");
//     // console.log("zoom");
//     const { sourceEvent, transform } = e;
//     // setDebugValue((v: any) => ({ ...v, transform }));
//     if (skipped) {
//       // console.log("skipped");
//       skipped = false;
//       const { x, y, k } = transform;
//       lastValidTransform = transform;
//       setTransform((t) => {
//         if (t.x === x && t.y === y && t.scale === k) return t;
//         return { x, y, scale: k };
//       });
//       return;
//     }
//     // if (!sourceEvent) console.warn("SOURCE EVENT", sourceEvent);
//     const touch = sourceEvent.type.toLowerCase().includes("touch");
//     const touches = touch ? sourceEvent.touches.length : 1;
//     const middleClick = sourceEvent.buttons === 4;
//     const touchPan = touch && touches > 1;
//     const mouseWheel = sourceEvent.type === "wheel";
//     const allow = touchPan || mouseWheel || middleClick;
//     // console.log(allow);
//     if (!allow) {
//       skipped = true;
//       // reverting the transform:
//       selection.call(e.target.transform, lastValidTransform);
//     } else {
//       const { x, y, k } = transform;
//       lastValidTransform = transform;
//       setTransform({ x, y, scale: k });
//     }
//   });
// selection
//   .call(zoomer)
//   .on("wheel", (event) => {
//     event.preventDefault();
//     console.log("--------");
//     console.log(event.ctrlKey);
//     console.log(event.wheelDeltaX, event.wheelDeltaY);
//     console.log(event.deltaX, event.deltaY);
//     // console.log(event);
//     skipped = true;
//     if (!event.ctrlKey) {
//       zoomer.translateBy(selection, event.wheelDeltaX, event.wheelDeltaY);
//     } else {
//       const cursorPosition: [number, number] = [
//         event.clientX,
//         event.clientY,
//       ];
//       // zoomer.transform()
//       const delta = event.wheelDeltaY > 0 ? 1.1 : 1 / 1.1;
//       zoomer.scaleBy(selection, delta, cursorPosition);
//     }
//   })
//   .on("wheel.zoom", (event) => {
//     event.preventDefault();
//     console.log("wheel.zoom");
//   });
// }, []);
