import { useCallback, useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container, Float, G, Stage } from "./PaperSpace.styles";
import { arrayToObject, CPoint, toWorldGlobal } from "../../utils/utils";
import { nanoid } from "nanoid";
import { useDrag, useGesture } from "@use-gesture/react";
import Color from "color";
import {
  RectangleProps,
  getRandomRects,
  getRects,
  isRectangle,
  test_rectangles,
} from "../../modules/itemz/RectangleForm";
import {
  EllipseProps,
  getRandomEllipses,
  isEllipse,
  test_ellipses,
} from "../../modules/itemz/EllipseForm";
import {
  BrushProps,
  createBrush,
  getRandomBrushes,
  isBrush,
  test_brushes,
} from "../../modules/itemz/Brush";
import throttle from "lodash.throttle";

import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";

type ItemProps = RectangleProps | EllipseProps | BrushProps;

type ItemMap = {
  [id: string]: ItemProps;
};

const PaperSpace = () => {
  const { loadFromStorage, drawBackground } = usePaperState();
  const containerRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const acvRef = useRef<HTMLCanvasElement>(null);
  const bgcvRef = useRef<HTMLCanvasElement>(null);
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  const cvCtx = useRef<CanvasRenderingContext2D | null>(null);
  const acvCtx = useRef<CanvasRenderingContext2D | null>(null);
  const bgcvCtx = useRef<CanvasRenderingContext2D | null>(null);

  const [dpr, setDpr] = useState(window ? window.devicePixelRatio || 1 : 1);
  const [stageTransforms, setStageTransforms] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [items, setItems] = useState<ItemMap>({});
  const [activeItems, setActiveItems] = useState<ItemMap>({});
  const [debugValue, setDebugValue] = useState<any>({});

  const toWorld = useCallback(
    (point: CPoint) => {
      const { x, y, scale } = stageTransforms;
      return toWorldGlobal(point, { x, y }, scale);
    },
    [stageTransforms]
  );

  const toScreen = useCallback(
    (point: CPoint) => {
      const { x: ox, y: oy, scale } = stageTransforms;
      const nx = point.x * scale + ox;
      const ny = point.y * scale + oy;
      return { x: nx, y: ny };
    },
    [stageTransforms]
  );

  const zoomTo = useCallback(
    (point: CPoint, newScale: number) => {
      const { x, y, scale } = stageTransforms;

      const pw = toWorldGlobal(point, { x, y }, scale);
      const nx = point.x - pw.x * newScale;
      const ny = point.y - pw.y * newScale;
      return { x: nx, y: ny, scale: newScale };
    },
    [stageTransforms]
  );

  const updateBrush = useCallback(
    (brush: BrushProps) => {
      const updatedBrush = createBrush(brush);

      setActiveItems((map) => {
        const copy = { ...map };
        copy[updatedBrush.id] = updatedBrush;
        return copy;
      });
    },
    [setActiveItems]
  );

  const throttleUpdateBrush = useCallback(throttle(updateBrush, 20), [
    updateBrush,
  ]);

  const drawBrush = useCallback(
    (
      brush: BrushProps,
      currentPoint: CPoint,
      stageTransforms: { x: number; y: number; scale: number }
    ) => {
      const { x, y } = toWorldGlobal(
        currentPoint,
        { x: stageTransforms.x, y: stageTransforms.y },
        stageTransforms.scale
      );
      brush.points.push([x, y]);
      throttleUpdateBrush(brush);
    },
    [throttleUpdateBrush]
  );

  useGesture(
    {
      onDrag: ({
        xy: [x, y],
        movement: [mx, my],
        buttons,
        active,
        memo,
        first,
        last,
        event,
        cancel,
        touches,
        ...rest
      }) => {
        // console.log("dragging");
        if (first) memo = { offset: stageTransforms, brush: createBrush() };
        // console.log(stageTransforms);
        const e = event as PointerEvent;
        const touch = e.pointerType === "touch";

        if (touches > 1) cancel();
        // pan:
        // if (active && buttons === 4 && !touch) {
        //   const ox = memo.offset.x;
        //   const oy = memo.offset.y;
        //   setStageTransforms((v) => {
        //     return { ...v, x: ox + mx, y: oy + my };
        //   });
        // }
        // tools:
        else if (active && buttons === 1 && !last) {
          const { brush } = memo;
          drawBrush(brush, { x, y }, stageTransforms);
        }

        return memo;
      },

      onDragEnd: ({ canceled }) => {
        throttleUpdateBrush.flush();
        if (canceled) setActiveItems({});
        else
          setActiveItems((activeItems) => {
            setItems((v) => {
              const copy = { ...v };
              for (let id in activeItems) copy[id] = activeItems[id];
              return copy;
            });
            return {};
          });
      },
      // onWheel: ({ initial, active, direction: [, dy], event, ...rest }) => {
      //   if (active) {
      //     const [x, y] = [event.clientX, event.clientY];
      //     const step = dy < 0 ? 1.1 : 1 / 1.1;

      //     setStageTransforms((value) => {
      //       const newScale = value.scale * step;
      //       const t = zoomTo({ x, y }, newScale);
      //       return { x: t.x, y: t.y, scale: newScale };
      //     });
      //   }
      // },
      // onPinch: ({
      //   origin: [ox, oy],
      //   offset: [scale],
      //   active,
      //   touches,
      //   first,
      //   memo,
      //   da: [d, a],
      // }) => {
      //   if (first)
      //     memo = { canvasTransforms: stageTransforms, ox, oy, distance: d };

      //   if (active && touches === 2) {
      //     setStageTransforms((v) => {
      //       const newScale = scale;
      //       const t = zoomTo({ x: ox, y: oy }, newScale);

      //       return {
      //         ...v,
      //         x: t.x,
      //         y: t.y,
      //         scale: newScale,
      //       };
      //     });
      //   } else if (active && touches === 3) {
      //     setStageTransforms((v) => {
      //       const OX = memo.canvasTransforms.x;
      //       const OY = memo.canvasTransforms.y;
      //       const MX = ox - memo.ox;
      //       const MY = oy - memo.oy;
      //       const fx = OX + MX;
      //       const fy = OY + MY;

      //       return {
      //         ...v,
      //         x: fx,
      //         y: fy,
      //       };
      //     });
      //   }

      //   return memo;
      // },
    },
    {
      target: containerRef,
      drag: {
        pointer: { buttons: [1, 4] }, // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      },
      pinch: { from: () => [stageTransforms.scale, 1] },
    }
  );

  const setupCanvas = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    dpr: number
  ) => {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    return ctx;
  };

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D | null,
      canvasTransforms: { x: number; y: number; scale: number },
      items: ItemMap,
      dpr: number,
      id = "noone"
    ) => {
      if (!ctx) return;

      const { width, height } = ctx.canvas.getBoundingClientRect();
      const { scale, x: ox, y: oy } = canvasTransforms;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

      for (let id in items) {
        const item = items[id];

        if (isRectangle(item)) {
          const { position, width, height, fill, angle } = item;
          const { x, y } = position;
          const center = { x: x + width / 2, y: y + height / 2 };

          ctx.save();
          ctx.fillStyle = fill.color;

          ctx.translate(center.x, center.y);
          ctx.rotate(angle);
          ctx.translate(-center.x, -center.y);

          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.fill();
          ctx.closePath();
          ctx.restore();
        } else if (isEllipse(item)) {
          const { position, rx, ry, fill, angle } = item;
          const { x, y } = position;
          ctx.save();
          ctx.fillStyle = fill.color;
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, angle, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();
          ctx.restore();
        } else if (isBrush(item)) {
          ctx.save();
          ctx.fillStyle = item.fill.color;
          ctx.translate(item.position.x, item.position.y);
          ctx.fill(item.pfPath);
          ctx.restore();
        }
      }
    },
    []
  );

  const throttleDraw = useCallback(throttle(draw, 20), [draw]);

  useEffect(() => {
    if (!containerRef.current) return;

    let skipped = false;
    let lastValidTransform = zoomIdentity;
    const selection = select<HTMLDivElement, {}>(containerRef.current);
    const zoomer = zoom<HTMLDivElement, {}>()
      .scaleExtent([0.1, 10])
      .filter((e) => {
        const { type, touches, buttons } = e;
        const touch = type.toLowerCase().includes("touch");
        const middleClick = buttons === 4;
        const touchPan = touch && touches > 1;
        const mouseWheel = type === "wheel";
        const leftClick = !touch ? buttons === 1 : true;
        const allow = leftClick || middleClick || touchPan || mouseWheel;

        return allow;
      })
      .on("zoom", (e) => {
        // console.log("--------------------------");
        // console.log("zoom");
        const { sourceEvent, transform } = e;
        // setDebugValue((v: any) => ({ ...v, transform }));

        if (skipped) {
          // console.log("skipped");
          skipped = false;
          const { x, y, k } = transform;
          lastValidTransform = transform;
          setStageTransforms((t) => {
            if (t.x === x && t.y === y && t.scale === k) return t;
            return { x, y, scale: k };
          });

          return;
        }

        // if (!sourceEvent) console.warn("SOURCE EVENT", sourceEvent);

        const touch = sourceEvent.type.toLowerCase().includes("touch");
        const touches = touch ? sourceEvent.touches.length : 1;

        const middleClick = sourceEvent.buttons === 4;
        const touchPan = touch && touches > 1;
        const mouseWheel = sourceEvent.type === "wheel";

        const allow = touchPan || mouseWheel || middleClick;

        // console.log(allow);

        if (!allow) {
          skipped = true;
          // reverting the transform:
          selection.call(e.target.transform, lastValidTransform);
        } else {
          const { x, y, k } = transform;
          lastValidTransform = transform;
          setStageTransforms({ x, y, scale: k });
        }
      });

    selection
      .call(zoomer)

      .on("wheel", (event) => {
        event.preventDefault();
        console.log("--------");
        console.log(event.ctrlKey);
        console.log(event.wheelDeltaX, event.wheelDeltaY);
        console.log(event.deltaX, event.deltaY);
        // console.log(event);
        skipped = true;

        if (!event.ctrlKey) {
          zoomer.translateBy(selection, event.wheelDeltaX, event.wheelDeltaY);
        } else {
          const cursorPosition: [number, number] = [
            event.clientX,
            event.clientY,
          ];

          const delta = event.wheelDeltaY > 0 ? 1.1 : 1 / 1.1;
          zoomer.scaleBy(selection, delta, cursorPosition);
        }
      })
      .on("wheel.zoom", (event) => {
        event.preventDefault();
        console.log("wheel.zoom");
      });

    const { width, height } = containerRef.current.getBoundingClientRect();
    const grids = getRects(width, height);
    const rects = getRandomRects(10, width, height);
    const ellipses = getRandomEllipses(10, width, height);
    const paths = getRandomBrushes(10, width, height);

    setItems(
      arrayToObject([
        // ...grids,
        ...rects,
        ...ellipses,
        ...paths,
        ...test_brushes,
        // ...test_ellipses,
        // ...test_rectangles,
      ])
    );

    setDpr(window.devicePixelRatio || 1);
  }, []);

  useEffect(() => {
    if (!acvRef.current || !cvRef.current || !bgcvRef.current) return;
    cvCtx.current = setupCanvas(cvRef.current, width, height, dpr);
    acvCtx.current = setupCanvas(acvRef.current, width, height, dpr);
    bgcvCtx.current = setupCanvas(bgcvRef.current, width, height, dpr);
  }, [width, height, dpr]);

  useEffect(() => {
    if (!bgcvCtx.current) return;
    drawBackground(bgcvCtx.current, stageTransforms, dpr);
  }, [width, height, stageTransforms, dpr]);

  useEffect(() => {
    draw(cvCtx.current, stageTransforms, items, dpr, "items");
  }, [width, height, stageTransforms, dpr, items]);

  useEffect(() => {
    draw(acvCtx.current, stageTransforms, activeItems, dpr, "activeItems");
  }, [width, height, stageTransforms, dpr, activeItems]);

  return (
    <Container ref={containerRef}>
      <Canvas ref={bgcvRef} />
      <Canvas ref={cvRef} />
      <Canvas ref={acvRef} />
      <Float>
        {JSON.stringify(
          {
            offset: stageTransforms,
            items: Object.keys(items).length,
            activeItems: Object.keys(activeItems).length,
            debugValue,
          },
          null,
          2
        )}
      </Float>
    </Container>
  );
};

export default PaperSpace;
