import { useCallback, useEffect, useRef, useState } from "react";

// hooks:
import { usePaperState } from "../../contexts/PaperContext";
import { useResizeDetector } from "react-resize-detector";

// styles:
import { Canvas, Container, G, Stage } from "./PaperSpace.styles";
import {
  CPoint,
  generateColors,
  getRandomColor,
  getRandomIntInclusive,
} from "../../utils/utils";
import { nanoid } from "nanoid";
import { useDrag, useGesture } from "@use-gesture/react";
import Color from "color";

type EllipseProps = {
  id: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
};

const Ellipse = ({ id, x, y, rx, ry }: EllipseProps) => {
  return (
    <ellipse
      onClick={() => console.log("hey", id)}
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
    />
  );
};

const getEllipses = (width: number, height: number) =>
  [...Array(1000).keys()].map(() => ({
    id: nanoid(10),
    x: getRandomIntInclusive(0, width),
    y: getRandomIntInclusive(0, height),
    rx: getRandomIntInclusive(5, 20),
    ry: getRandomIntInclusive(5, 20),
  }));

const PaperSpace = () => {
  //  const { loadFromStorage } = usePaperState();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width = 0, height = 0 } = useResizeDetector<HTMLDivElement>({
    targetRef: containerRef,
  });

  const [offset, setOffset] = useState<CPoint>({ x: 0, y: 0 });
  const bind = useGesture({
    onDrag: ({ down, offset: [x, y] }) => {
      setOffset({ x, y });
    },

    onWheel: ({ active, direction: [dx, dy], ...rest }) => {
      if (active) {
        // console.log(rest);
      }
    },
  });

  const [ellipses, setEllipses] = useState<EllipseProps[]>([]);

  const drawStuff = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasRef.current.getBoundingClientRect();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(offset.x, offset.y);

    const colorGen = generateColors(ellipses.length);

    ellipses.forEach(({ id, x, y, rx, ry }) => {
      const color = colorGen.next();
      const c = color.value ?? 0;
      ctx.fillStyle = Color(c).hex().toString();
      ctx.beginPath();
      // console.log(ctx.fillStyle);
      // ctx.fillStyle = "red";

      // ctx.ellipse(x, y, rx, ry, 0, 0, 0);

      ctx.rect(x, y, rx, ry);

      ctx.fill();
    });
  }, [ellipses, offset]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    setEllipses(getEllipses(width, height));

    return () => {
      // pixim.current?.destroy();
    };
  }, []);

  useEffect(() => {
    console.log("hey");
    // if (width === 0 || height === 0) return;
    // pixim.current?.setScreenSize(width, height);
    drawStuff();
  }, [width, height]);

  useEffect(() => {
    drawStuff();
  }, [ellipses]);

  useEffect(() => {
    // console.log(offset);
    // if (!canvasRef.current) return;
    // const ctx = canvasRef.current.getContext("2d");
    // if (!ctx) return;

    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    // // ctx.clearRect(0,0, )
    // ctx.translate(offset.x, offset.y);

    drawStuff();
  }, [offset]);

  // return <svg viewBox={`0, 0, ${width} ${height}={`0, 0, ${width} ${height}`}></svg>;
  return (
    <Container ref={containerRef} {...bind()}>
      {/* <Stage viewBox={`0 0 ${width} ${height}`}>
        <G transform={`translate(${offset.x}, ${offset.y})`}>
          {ellipses.map((item) => (
            <Ellipse key={item.id} {...item} />
          ))}
          <text x="20" y="35">
            My
          </text>
        </G>
      </Stage> */}
      <Canvas ref={canvasRef} width={width} height={height} />
    </Container>
  );
};

export default PaperSpace;
