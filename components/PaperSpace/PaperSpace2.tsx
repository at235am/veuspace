// import styled from "@emotion/styled";
// import { fabric } from "fabric";
// import {
//   Application,
//   Graphics,
//   InteractionEvent,
//   Sprite,
// } from "pixi.js-legacy";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { useResizeDetector } from "react-resize-detector";
// import {
//   Stage,
//   Graphics as Graphic,
//   useApp,
//   Container,
// } from "@inlet/react-pixi";

// // hooks:
// import { usePaperSpaceState } from "../../contexts/PaperSpaceContext";
// import { getRandomIntInclusive as randomInt } from "../../utils/utils";
// import { nanoid } from "nanoid";
// import { ChildProcess } from "child_process";
// import Color from "color";
// import EventEmitter from "events";

// const Wrapper = styled.div`
//   /* border: 1px dashed lightgreen; */

//   position: relative;
//   /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
//   overflow: hidden;
//   touch-action: none;

//   max-height: 100vh;
//   max-width: 100vw;

//   position: relative;
//   flex: 1;

//   display: flex;
//   flex-direction: column;
// `;

// const Canvas = styled.canvas`
//   /* background-color: #111; */
//   /* height: 100%; */
// `;

// const Float = styled.div`
//   position: absolute;
// `;

// type RectangeProps = {
//   lineWidth?: number;
//   lineColor?: number;
//   x?: number;
//   y?: number;
//   width?: number;
//   height?: number;
// };

// const Rectangle = (props: RectangeProps) => {
//   const {
//     lineWidth = 0,
//     lineColor = 0,
//     x = 0,
//     y = 0,
//     width = 0,
//     height = 0,
//   } = props;

//   const draw = useCallback(
//     (g: Graphics) => {
//       g.clear();
//       g.beginFill(lineColor);
//       // g.lineStyle(lineWidth, lineColor);
//       g.drawRect(x, y, width, height);

//       g.endFill();
//     },
//     [lineWidth, lineColor, x, y, width, height]
//   );

//   return (
//     <Graphic
//       interactive={true}
//       draw={draw}
//       mouseover={(e) => {
//         console.log("hey its me", props);
//       }}
//       mousedown={(e) => {
//         console.log("clicked");
//       }}
//       pointerover={(e) => {
//         console.log("pointer over");
//       }}
//     />
//   );
// };

// interface ShapeOptions {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   angle: number;
//   scaleX: number;
//   scaleY: number;
//   fillColor: number;
//   strokeWidth: number;
//   strokeColor: number;
// }

// const PaperSpace = () => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   const app = useRef<Application>();

//   const [objects, setObjects] = useState<RectangeProps[]>([]);

//   const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
//     targetRef: containerRef,
//   });

//   useEffect(() => {
//     console.log("UE");

//     app.current = new Application({
//       // resizeTo: containerRef.current as HTMLDivElement,

//       backgroundColor: 0x333333,
//       antialias: true,
//     });
//     containerRef.current?.appendChild(app.current.view);

//     return () => {
//       app.current?.destroy(true);
//     };
//   }, []);

//   useEffect(() => {
//     if (!app.current) return;

//     app.current.renderer.resize(width, height);
//   }, [width, height]);

//   const drawRandomRect = () => {
//     const obj = {
//       x: randomInt(0, width),
//       y: randomInt(0, height),
//       width: randomInt(10, 35),
//       height: randomInt(10, 35),
//       angle: randomInt(0, 360),
//       scaleX: 1,
//       scaleY: 1,
//       fillColor: randomInt(0x000000, 0xffffff),
//       strokeWidth: 1,
//       strokeColor: randomInt(0x000000, 0xffffff),
//     };
//     draw(obj);
//   };

//   const draw = ({
//     x = 0,
//     y = 0,
//     width = 0,
//     height = 0,
//     angle = 0,
//     scaleX = 1,
//     scaleY = 1,
//     fillColor = 0xffffff,
//     strokeWidth = 0,
//     strokeColor,
//   }: ShapeOptions) => {
//     if (!app.current) return;

//     // const obj = {
//     //   x: 50,
//     //   y: 50,
//     //   width: 200,
//     //   height: 200,
//     //   angle: 0,
//     //   scaleX: 1,
//     //   scaleY: 1,
//     //   lineWidth: randomInt(1, 10),
//     //   lineColor: randomInt(0x000000, 0xffffff),
//     // };

//     // console.log(obj);

//     const g = new Graphics();
//     // g.beginFill(obj.lineColor);
//     g.beginFill(0xffffff);
//     g.drawRect(x, y, width, height);
//     g.endFill();

//     // g.name = nanoid(10);
//     // g.interactive = true;
//     // g.on("pointerover", (e) => console.log("pointerover"));

//     const texture = app.current.renderer.generateTexture(g);

//     const shape = new Sprite(texture);

//     shape.name = nanoid(10);
//     shape.tint = fillColor;
//     shape.angle = angle;
//     shape.position.set(x, y);
//     shape.scale.set(scaleX, scaleY);

//     shape.interactive = true;

//     let dragging = false;
//     shape.on("pointerdown", (e: InteractionEvent) => {
//       console.log("pointerdown");

//       dragging = true;
//     });
//     shape.on("pointerup", (e) => {
//       console.log("pointerup");
//       dragging = false;
//     });
//     shape.on("pointerout", (e) => {
//       console.log("pointerleave");
//       // dragging = false;
//     });
//     shape.on("pointermove", (e: InteractionEvent) => {
//       // console.log("moving");
//       if (!app.current) return;
//       if (dragging) {
//         // e.data.
//         // const pos = e.data.getLocalPosition(app.current.stage);
//         const pos1 = e.data.getLocalPosition(shape.parent);
//         const pos2 = { x: e.data.global.x, y: e.data.global.y };
//         // const pos3 = { x: pos1.x - po, y: e.data.global.y };

//         const pos = pos1;

//         console.log("----------");
//         console.log(pos1);
//         console.log(pos2);
//         // console.log(pos3);
//         // shape.position.set(e.data.global.x, e.data.global.y);
//         shape.position.set(pos.x, pos.y);
//       }
//     });

//     app.current.stage.addChild(shape);

//     g.destroy();

//     // setObjects((objs) => {
//     //   return [...objs, obj];
//     // });
//   };

//   useEffect(() => {
//     // if (!app.current) return;
//     // objects.forEach((obj) => {
//     //   const g = new Graphics();
//     //   g.clear();
//     //   g.beginFill(obj.lineColor);
//     //   g.drawRect(obj.x, obj.y, obj.width, obj.height);
//     //   g.endFill();
//     //   g.interactive = true;
//     //   g.on("pointerover", (e) => console.log("pointerover"));
//     //   app.current?.stage.addChild(g);
//     // });
//     // app.current?.stage.children.forEach((obj) => {
//     //   obj.
//     // });
//   }, [objects]);

//   const getState = () => {
//     app.current?.stage.children.forEach((obj) => {
//       console.log("-------------");
//       const { x, y, angle } = obj;
//       const scale = { x: obj.scale.x, y: obj.scale.y };
//       // const {width, height} = obj.

//       console.log({ x, y, angle, scale });

//       const g = obj as Sprite;

//       const c = new Color(g.tint);
//       console.log(c.hex());
//     });
//   };

//   // setObjects((objs) => {
//   //   const obj: RectangeProps = {
//   //     lineWidth: getRandomIntInclusive(1, 10),
//   //     lineColor: getRandomIntInclusive(0x000000, 0xffffff),
//   //     x: getRandomIntInclusive(0, width),
//   //     y: getRandomIntInclusive(0, height),
//   //     width: getRandomIntInclusive(10, 35),
//   //     height: getRandomIntInclusive(10, 35),
//   //   };
//   //   return [...objs, obj];
//   // });

//   const rect1 = () =>
//     draw({
//       x: 50,
//       y: 50,
//       width: 50,
//       height: 50,
//       scaleX: 1,
//       scaleY: 1,
//       fillColor: 0xff0000,
//       angle: 90,
//     });
//   const rect2 = () =>
//     draw({
//       x: 50,
//       y: 50,
//       width: 50,
//       height: 50,
//       scaleX: 2,
//       scaleY: 2,
//       fillColor: 0x00ff00,
//       angle: 0,
//     });

//   return (
//     // <Container ref={containerRef}>
//     //   <Float>
//     //     <button onClick={drawRectange}>rect</button>
//     //   </Float>
//     //   <Canvas ref={canvasRef} id="canvas" />
//     // </Container>

//     <Wrapper ref={containerRef}>
//       <Float>
//         <button onClick={drawRandomRect}>random</button>
//         <button onClick={getState}>state</button>
//         <button onClick={rect1}>rect1</button>
//         <button onClick={rect2}>rect2</button>
//       </Float>

//       {/* <Stage
//         raf={false}
//         renderOnComponentChange={true}
//         width={width}
//         height={height}
//         options={{ backgroundColor: 0x222222 }}
//       >
//         {objects.map((g, i) => (
//           <Rectangle key={i} {...g} />
//         ))}
//       </Stage> */}
//     </Wrapper>
//   );
// };

// export default PaperSpace;

//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------

export default () => {
  return <div>nothing</div>;
};
