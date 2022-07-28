import styled from "@emotion/styled";
// import { fabric } from "fabric";
import {
  Graphics,

  // Renderer,
} from "pixi.js-legacy";

import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useResizeDetector } from "react-resize-detector";
import {
  Stage,
  Graphics as Graphic,
  useApp,
  Container,
  useTick,
} from "@inlet/react-pixi";

// hooks:
// import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";
// import { getRandomIntInclusive as randomInt } from "../../utils/utils";
import { nanoid } from "nanoid";
import Color from "color";

const Wrapper = styled.div`
  /* border: 1px dashed lightgreen; */

  position: relative;
  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;
  touch-action: none;

  max-height: 100vh;
  max-width: 100vw;

  /* min-height: 100vh; */
  /* min-width: 100vw; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Canvas = styled.canvas`
  /* background-color: #111; */
  /* height: 100%; */
`;

const Float = styled.div`
  position: absolute;
`;

const B = styled.button`
  background-color: white;
  color: #222;
  padding: 1rem;
`;

export const randomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

interface ShapeOptions {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  fillColor?: number;
  strokeWidth?: number;
  strokeColor?: number;
}

type ActiveObjectProps = {
  id: string;
  mouseDownPoint: { x: number; y: number };
};

type RectProps = ShapeOptions & {
  // updateState: Dispatch<SetStateAction<ShapeOptions[]>>;
  updateState: Dispatch<SetStateAction<Cobject>>;
  setActiveObjectId: Dispatch<SetStateAction<ActiveObjectProps>>;
  // options: ShapeOptions;
};

const Rectangle = memo(
  ({ updateState, setActiveObjectId, ...rest }: RectProps) => {
    const {
      id = "",
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      angle = 0,
      scaleX = 1,
      scaleY = 1,
      fillColor = 0xffffff,
      strokeWidth = 0,
      strokeColor,
    } = rest;

    useEffect(() => {
      console.log("rendering", id);
    });

    const mouseOver = useRef(false);
    const mouseDown = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    // const rotate = () => {
    //   updateState((obs) => {
    //     const index = obs.findIndex((v) => v.id === id);

    //     if (index !== -1) {
    //       const o = obs[index];
    //       const no = { ...o, angle: (o.angle ?? 0) + 1 };

    //       // console.log({ o, no });
    //       return [...obs.slice(0, index), no, ...obs.slice(index + 1)];
    //     }
    //     return obs;
    //   });
    // };

    // useTick((d) => {
    //   // if (mouseOver.current && mouseDown.current) rotate();
    // });

    const draw = useCallback(
      (g: Graphics) => {
        g.clear();
        g.beginFill(fillColor);
        // g.lineStyle(lineWidth, lineColor);
        // g.drawRect(x, y, width, height);

        // This is the point around which the object will rotate.
        g.position.x = x + width / 2;
        g.position.y = y + height / 2;

        // draw a rectangle at -width/2 and -height/2.
        // The rectangle's top-left corner will be at position x1/y1
        g.drawRect(-(width / 2), -(height / 2), width, height);
        g.angle = angle;
        g.endFill();
      },
      [fillColor, x, y, width, height, angle]
    );

    const drawRotationHandle = useCallback(
      (g: Graphics) => {
        g.clear();
        g.beginFill(0xff0000);
        g.beginFill(fillColor);
        g.lineStyle({ width: 1, color: 0xff0000 });

        g.drawCircle(x, y, 5);
        g.endFill();

        // const
      },
      [fillColor, x, y]
    );

    return (
      <>
        <Graphic
          interactive={true}
          draw={draw}
          pointerdown={(e) => {
            mouseDown.current = true;

            const mp = e.data.global;
            const dx = mp.x - x;
            const dy = mp.y - y;
            offset.current = { x: dx, y: dy };

            setActiveObjectId({ id, mouseDownPoint: { x: dx, y: dy } });
          }}
          pointerup={(e) => {
            mouseDown.current = false;
            setActiveObjectId({ id: "", mouseDownPoint: { x: 0, y: 0 } });
          }}
          pointerupoutside={(e) => {
            mouseDown.current = false;
            setActiveObjectId({ id: "", mouseDownPoint: { x: 0, y: 0 } });
          }}
          // pointerover={(e) => {
          //   mouseOver.current = true;
          // }}
          // pointerout={() => {
          //   mouseOver.current = false;
          // }}
        />
        {/* <Graphic draw={drawRotationHandle} /> */}
      </>
    );
  }
);

type Cobject = Record<string, ShapeOptions>;

const PaperSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [objects, setObjects] = useState<Cobject>({});
  const [activeObject, setActiveObject] = useState<ActiveObjectProps>({
    id: "",
    mouseDownPoint: { x: 0, y: 0 },
  });

  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  const draw = ({
    id = "",
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    angle = 0,
    scaleX = 1,
    scaleY = 1,
    fillColor = 0xffffff,
    strokeWidth = 0,
    strokeColor,
  }: ShapeOptions) => {
    setObjects((objs) => {
      const obj = {
        id,
        x,
        y,
        width,
        height,
        angle,
        scaleX,
        scaleY,
        fillColor,
        strokeWidth,
        strokeColor,
      };

      const copy = { ...objs };
      copy[obj.id] = obj;
      return copy;
    });
  };

  const drawRandomRect = () => {
    draw({
      id: nanoid(5),
      x: randomInt(0, width),
      y: randomInt(0, height),
      width: randomInt(50, 200),
      height: randomInt(50, 200),
      // angle: randomInt(0, 360),
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fillColor: randomInt(0x000000, 0xffffff),
      strokeWidth: 1,
      strokeColor: randomInt(0x000000, 0xffffff),
    });
  };

  const rect1 = () =>
    draw({
      id: nanoid(10),
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      scaleX: 1,
      scaleY: 1,
      fillColor: 0xff0000,
      angle: 90,
    });

  const rect2 = () =>
    draw({
      id: nanoid(10),
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      scaleX: 2,
      scaleY: 2,
      fillColor: 0x00ff00,
      angle: 0,
    });

  useEffect(() => {
    // console.log("main");
  });

  useEffect(() => {
    console.log("object");
  }, [objects]);

  return (
    <Wrapper
      ref={containerRef}
      onPointerMove={(e) => {
        setObjects((obs) => {
          const o = obs[activeObject.id];

          if (o) {
            const mp = { x: e.clientX, y: e.clientY };
            const np = {
              x: mp.x - activeObject.mouseDownPoint.x,
              y: mp.y - activeObject.mouseDownPoint.y,
            };

            const no = { ...o, x: np.x, y: np.y };

            const copy = { ...obs };
            delete copy[activeObject.id];
            copy[activeObject.id] = no;
            return copy;
          }
          return obs;
        });
      }}
    >
      <Float>
        <B onClick={drawRandomRect}>random</B>
        <B onClick={rect1}>rect1</B>
        <B onClick={rect2}>rect2</B>
      </Float>
      <Stage
        // raf={true}
        // raf={false}
        // renderOnComponentChange={true}

        width={width}
        height={height}
        options={{ backgroundColor: 0x222222, antialias: true }}
      >
        {/* <Renderer objects={objects} setObjects={setObjects} /> */}
        {Object.entries(objects).map(([id, g], i) => {
          // console.log(id, g);
          return (
            <Rectangle
              key={g.id}
              updateState={setObjects}
              setActiveObjectId={setActiveObject}
              // {...g}
              id={g.id}
              x={g.x}
              y={g.y}
              width={g.width}
              height={g.height}
              angle={g.angle}
              scaleX={g.scaleX}
              scaleY={g.scaleY}
              fillColor={g.fillColor}
              strokeWidth={g.strokeWidth}
              strokeColor={g.strokeColor}
            />
          );
        })}
      </Stage>
    </Wrapper>
  );
};

// const Renderer = ({
//   objects,
//   setObjects,
// }: {
//   objects: ShapeOptions[];
//   setObjects: Dispatch<SetStateAction<ShapeOptions[]>>;
// }) => {
//   // const [objects, setObjects] = useState<ShapeOptions[]>([]);
//   const app = useApp();

//   useEffect(() => {
//     // app.renderer.plugins.interaction.moveWhenInside = true;
//   }, []);

//   return (
//     <>
//       {objects.map((g, i) => (
//         <Rectangle key={g.id} options={g} updateState={setObjects} />
//       ))}
//     </>
//   );
// };

export default PaperSpace;
