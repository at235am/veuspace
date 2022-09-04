import { useCallback, useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container, Float, G, Stage } from "./PaperSpace.styles";
import { arrayToObject, CPoint, toWorldGlobal } from "../../utils/utils";
import { nanoid } from "nanoid";
import { useGesture } from "@use-gesture/react";
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

import { Transform, useZoomPan } from "../../hooks/useZoomPan";

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
  const [transform, setStageTransforms] = useState<Transform>({
    x: 0,
    y: 0,
    k: 1,
  });
  const [items, setItems] = useState<ItemMap>({});
  const [activeItems, setActiveItems] = useState<ItemMap>({});
  const [debugValue, setDebugValue] = useState<any>({});

  const toWorld = useCallback(
    (point: CPoint) => {
      const { x, y, k } = transform;
      return toWorldGlobal(point, { x, y }, k);
    },
    [transform]
  );

  const toScreen = useCallback(
    (point: CPoint) => {
      const { x: ox, y: oy, k: scale } = transform;
      const nx = point.x * scale + ox;
      const ny = point.y * scale + oy;
      return { x: nx, y: ny };
    },
    [transform]
  );

  const zoomTo = useCallback(
    (point: CPoint, newScale: number) => {
      const { x, y, k: scale } = transform;

      const pw = toWorldGlobal(point, { x, y }, scale);
      const nx = point.x - pw.x * newScale;
      const ny = point.y - pw.y * newScale;
      return { x: nx, y: ny, scale: newScale };
    },
    [transform]
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
    (brush: BrushProps, currentPoint: CPoint, transform: Transform) => {
      const { x, y } = toWorldGlobal(
        currentPoint,
        { x: transform.x, y: transform.y },
        transform.k
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
        if (first) memo = { transform, brush: createBrush() };

        const e = event as PointerEvent;
        const touch = e.pointerType === "touch";

        if (touches > 1) cancel();
        // pan:
        if (active && buttons === 4 && !touch) {
          const ox = memo.transform.x;
          const oy = memo.transform.y;

          setStageTransforms((v) => {
            return { ...v, x: ox + mx, y: oy + my };
          });
        }
        // tools:
        else if (active && buttons === 1 && !last) {
          const { brush } = memo;
          drawBrush(brush, { x, y }, transform);
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
      onWheel: ({ active, delta: [dx, dy], event, ctrlKey }) => {
        // event.preventDefault();
        // event.stopPropagation();
        if (active) {
          const [x, y] = [event.clientX, event.clientY];
          const step = dy < 0 ? 1.1 : 1 / 1.1;

          if (ctrlKey) {
            setStageTransforms((value) => {
              const newScale = value.k * step;
              const t = zoomTo({ x, y }, newScale);
              return { x: t.x, y: t.y, k: newScale };
            });
          } else {
            setStageTransforms((v) => {
              return { ...v, x: v.x - dx, y: v.y - dy };
            });
          }
        }
      },
      onPinch: ({
        origin: [cpx, cpy],
        offset: [newScale],
        active,
        first,
        memo,
      }) => {
        if (first) memo = { transform, cpx, cpy };

        if (active) {
          const initialX = memo.transform.x;
          const initialY = memo.transform.y;
          const initialScale = memo.transform.k;

          const initialCursorX = memo.cpx;
          const initialCursorY = memo.cpy;

          const ds = newScale / initialScale;
          const x = cpx + (initialX - initialCursorX) * ds;
          const y = cpy + (initialY - initialCursorY) * ds;

          setStageTransforms({ x, y, k: newScale });
        }

        return memo;
      },
    },
    {
      target: containerRef,
      drag: {
        pointer: { buttons: [1, 4] }, // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      },
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
      transform: Transform,
      items: ItemMap,
      dpr: number,
      id = "noone"
    ) => {
      if (!ctx) return;

      const { width, height } = ctx.canvas.getBoundingClientRect();
      const { k: scale, x: ox, y: oy } = transform;

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

    const { width, height } = containerRef.current.getBoundingClientRect();
    const grids = getRects(width, height);
    const rects = getRandomRects(50, width, height);
    const ellipses = getRandomEllipses(50, width, height);
    const paths = getRandomBrushes(50, width, height);

    setItems(
      arrayToObject([
        ...grids,
        ...rects,
        ...ellipses,
        ...paths,
        // ...test_brushes,
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
    drawBackground(bgcvCtx.current, transform, dpr);
  }, [width, height, transform, dpr]);

  useEffect(() => {
    draw(cvCtx.current, transform, items, dpr, "items");
  }, [width, height, transform, dpr, items]);

  useEffect(() => {
    draw(acvCtx.current, transform, activeItems, dpr, "activeItems");
  }, [width, height, transform, dpr, activeItems]);

  return (
    <Container
      ref={containerRef}
      onContextMenu={(e) => {
        const [x, y] = [e.clientX, e.clientY];

        setDebugValue((v: any) => ({ ...v, px: x, py: y }));
        e.preventDefault();

        // pan([500, 500]);
        // panTo([500, 500]);

        // console.log(worldCoords([x, y]));
      }}
    >
      <Canvas ref={bgcvRef} />
      <Canvas ref={cvRef} />
      <Canvas ref={acvRef} />
      <Float>
        {JSON.stringify(
          {
            offset: transform,
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
