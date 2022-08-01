import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  DragGesture,
  MoveGesture,
  PinchGesture,
  ScrollGesture,
} from "@use-gesture/vanilla";
import paper from "paper";
import { nanoid } from "nanoid";

// utils:
import { clamp, paperColor, roundIntToNearestMultiple } from "../utils/utils";

export type Tools =
  | "notebook"
  | "select"
  | "temp_select"
  | "draw"
  | "pan"
  | "temp_pan"
  | "circle"
  | "rectangle"
  | "text_add"
  | "text_edit"
  | "reset"
  | "eraser";

export const TOOL: Record<Tools, Tools> = {
  notebook: "notebook",
  select: "select",
  temp_select: "temp_select",
  draw: "draw",
  pan: "pan",
  temp_pan: "temp_pan",
  circle: "circle",
  rectangle: "rectangle",
  text_add: "text_add",
  text_edit: "text_edit",
  reset: "reset",
  eraser: "eraser",
};

export type CircleOptions = {
  name?: string;
  x?: number;
  y?: number;
  radius?: number;
  color?: string | number;
};

export type RectangleOptions = CircleOptions & {
  width?: number;
  height?: number;
};

export class CustomTool extends paper.Tool {
  name: Tools;
  constructor(name: Tools) {
    super();
    this.name = name;
  }
}

type State = {
  app: React.MutableRefObject<paper.PaperScope>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  init: (canvas: HTMLCanvasElement) => void;
  activeTool: Tools;
  activateTool: (name: Tools) => void;
  setCanvasSize: (width: number, height: number) => void;
  drawBackground: () => void;
  zoom: (
    dir: number,
    point?: {
      x: number;
      y: number;
    }
  ) => void;
};

type Props = {
  children: React.ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);

const PaperStateProvider = ({ children }: Props) => {
  const app = useRef<paper.PaperScope>(new paper.PaperScope());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const prevActiveTool = useRef<Tools>(TOOL.select);

  // useful states for handling events
  const [activeTool, setActiveTool] = useState<Tools>(TOOL.select);
  const selectedItems = useRef<paper.Group | null>(null);
  const hitResult = useRef<paper.HitResult | null>(null);

  const transformBoxes = useRef<paper.Layer | null>(null);

  const hitOptions = {
    bounds: true, // the corners and side-centerse of the bounding rectangle of items
    fill: true,
    stroke: true,
    segments: false,
    center: true,
    tolerance: 5,
  };

  const zoom = (dir: number, point?: { x: number; y: number }) => {
    if (!point)
      point = { x: app.current.view.center.x, y: app.current.view.center.y };

    const oldZoom = app.current.view.zoom;
    const newZoom = dir > 0 ? oldZoom * 0.95 : oldZoom * 1.05;

    const beta = oldZoom / newZoom;

    const p = new app.current.Point(point.x, point.y);

    //viewToProject: gives the coordinates in the Project space from the Screen Coordinates
    const viewPosition = app.current.view.viewToProject(p);

    const mpos = viewPosition;
    const ctr = app.current.view.center;

    const pc = mpos.subtract(ctr);
    const offset = mpos.subtract(pc.multiply(beta)).subtract(ctr);

    app.current.view.zoom = newZoom;
    app.current.view.center = app.current.view.center.add(offset);
  };

  const pan = () => {};

  const drawBackground = () => {
    // console.log("bg generate");
    const bgLayer = app.current.project.layers.find(
      (layer) => layer.name === "background"
    );
    const itemLayer = app.current.project.layers.find(
      (layer) => layer.name === "items"
    );

    if (bgLayer) {
      bgLayer.removeChildren();
      bgLayer.activate();

      const path = new app.current.Path.Circle(new app.current.Point(0, 0), 1);
      path.fillColor = paperColor("#ffffff");
      const symbol = new app.current.SymbolDefinition(path);

      const viewbox_bounds = app.current.project.view.bounds;

      // const width =
      //   containerRef.current?.getBoundingClientRect().width ?? boundz.width;
      // const height =
      //   containerRef.current?.getBoundingClientRect().height ?? boundz.height;

      // console.log(boundz.topLeft.x, boundz.topLeft.y);
      // console.log(width, height);

      const d = 50; // the distances or gap between each point

      // add a buffer by subtracting d from the top left to expand the bounding box
      // add a buffer by adding d from the bottom right to expand the bounding box
      const topLeft = {
        x: viewbox_bounds.topLeft.x - d,
        y: viewbox_bounds.topLeft.y - d,
      };
      const bottomRight = {
        x: viewbox_bounds.bottomRight.x + d,
        y: viewbox_bounds.bottomRight.y + d,
      };

      const width = Math.abs(bottomRight.x - topLeft.x);
      const height = Math.abs(bottomRight.y - topLeft.y);

      // setting x,y = 0 and using the width, height divided by th
      for (let x = 0; x < width / d; x++) {
        for (let y = 0; y < height / d; y++) {
          const offset = d; // we subtract this number from the final positions to offset the bigger bounding box we created

          const offsetX = roundIntToNearestMultiple(
            viewbox_bounds.topLeft.x,
            d
          );
          const offsetY = roundIntToNearestMultiple(
            viewbox_bounds.topLeft.y,
            d
          );
          const X = offsetX + x * d - offset;
          const Y = offsetY + y * d - offset;

          // console.log({ x, y, X, Y });
          symbol.place(
            // app.current.project.view.projectToView(
            new app.current.Point(X, Y)
            // )
          );
        }
      }
    }

    if (itemLayer) itemLayer.activate();
  };

  const init = (canvasElement: HTMLCanvasElement) => {
    if (app.current.view) return;
    if (!containerRef.current) return;

    app.current = new paper.PaperScope();
    app.current.setup(canvasElement);

    // useful debug settings
    app.current.settings.handleSize = 6;
    app.current.project.activeLayer.selectedColor = paperColor("#ff0000");

    // set canvas size always based on the container size:
    const containerBox = containerRef.current.getBoundingClientRect();
    setCanvasSize(containerBox.width, containerBox.height);

    // create the background layer:
    const bgLayer = new app.current.Layer();
    bgLayer.name = "background";
    drawBackground();

    // create the layer where we keep all our items:
    const transformLayer = new app.current.Layer();
    transformLayer.name = "transform";
    transformLayer.on({
      mousedrag: (event: paper.Tool) => {
        console.log("transform drag");
      },
    });
    transformBoxes.current = transformLayer;

    // create the layer where we keep all our items:
    const itemLayer = new app.current.Layer();
    itemLayer.name = "items";
    itemLayer.activate();

    drawCircle({ x: 0, y: 0, radius: 10, color: "#ff0000" });

    // create the group where we'll group our selected items:
    const selectedItemsGroup = new app.current.Group();
    selectedItemsGroup.name = "selected";
    itemLayer.addChild(selectedItemsGroup);
    selectedItems.current = selectedItemsGroup;

    initTools();
    activateTool(TOOL.select);
  };

  const deselectAll = () => {
    app.current.project.activeLayer.selected = false;
    destroyTransfromHandles();
    if (selectedItems.current)
      removeChildrenFromGroupOnly(selectedItems.current);
  };

  const activateTool = (name: Tools) => {
    const tool = app.current.tools.find((t) => {
      const customTool = t as CustomTool;
      return customTool.name === name;
    });

    if (!tool) return;

    tool.activate();
    setActiveTool(name);
    if (name !== TOOL.temp_select) prevActiveTool.current = name;
  };

  const drawTransformHandles = (
    item: paper.Item,
    color: string | number,
    padding = 3
  ) => {
    if (!transformBoxes.current) return;

    const p = padding;
    const { topLeft, bottomRight } = item.bounds;

    const currentActiveLayer = app.current.project.activeLayer;
    transformBoxes.current.activate();

    const boundBox = new app.current.Path.Rectangle(
      new app.current.Rectangle(
        new app.current.Point(topLeft.x - p, topLeft.y - p),
        new app.current.Point(bottomRight.x + p, bottomRight.y + p)
      )
    );
    boundBox.strokeColor = paperColor(color ?? "#0000ff");
    boundBox.strokeWidth = 2;
    transformBoxes.current.addChild(boundBox);
    currentActiveLayer.activate();
  };

  const destroyTransfromHandles = () => {
    transformBoxes.current?.removeChildren();
  };

  /**
   * !!!!!!!!!!!!!! DANGEROUS !!!!!!!!!!!!!!
   * Adds a item to the group designated for holding selected item.
   * This function itself is safe, however, if you manually add an item
   * to a group with Group.addChild() instead, you can end up adding a
   * group to itself, which will cause a lot of recursion calls which is
   * caused by paper.js constructors(). This will cause a MAXIMUM STACK ERROR.
   * @param item the paper.Item to be added
   * @returns
   */
  const addItemToSelectedGroup = (item: paper.Item) => {
    if (!selectedItems.current) return;

    if (selectedItems.current.name !== item.name)
      selectedItems.current.addChild(item);
  };

  const removeChildrenFromGroupOnly = (group: paper.Group) => {
    // remove all the children from the group and re-add them to the activeLayer ("items")
    group
      .removeChildren()
      .forEach((item) => app.current.project.activeLayer.addChild(item));
  };

  const drawCircle = (options: CircleOptions) => {
    const {
      name = nanoid(),
      x = 0,
      y = 0,
      radius = 1,
      color = "#000000",
    } = options;

    const paper = app.current;
    const circle = new app.current.Path.Circle(new paper.Point(x, y), radius);

    circle.name = name;
    circle.fillColor = paperColor(color);
  };

  const drawRectangle = (options: RectangleOptions) => {
    const {
      name = nanoid(),
      x = 0,
      y = 0,
      radius = 1,
      width = 1,
      height = 1,
      color = "#000000",
    } = options;

    const rect = new app.current.Path.Rectangle(
      new paper.Rectangle(x, y, width, height),
      new paper.Size(radius, radius)
    );

    rect.name = name;
    rect.fillColor = paperColor(color);

    // rect.onKeyDown = (event: paper.ToolEvent) => {
    //   console.log("ON KEY DOWN");
    //   if (event.modifiers.control) {
    //     console.log("CHILDREN", selectedItems.current?.children);
    //   }
    // };
    // }
    // rect.on(selectListeners);
    // rect.onMouseDown = (event: any) => {
    // const toolname = (app.current.tool as CustomTool).name;
    // if (toolname !== TOOL.temp_select && toolname !== TOOL.select) {
    //   console.log("changed to tool");
    //   activateTool(TOOL.temp_select);
    //   app.current.tool.emit("mousedown", event);
    // };

    return rect;
  };

  const initTools = () => {
    if (!app.current.view) return;

    ///////////////////////////////////////////////////////////////////////////////////////
    const selectionTool = new CustomTool(TOOL.select);
    const tempSelectionTool = new CustomTool(TOOL.temp_select);

    const selectListeners = {
      mousedown: (event: paper.ToolEvent) => {
        console.log("> TOOL:select:mousedown");
        // activateTool(TOOL.temp_select);
        // deselectAll(); // everytime theres a mousedown event we just deselect all items;

        const items = app.current.project.layers.find(
          (layer) => layer.name === "items"
        );

        if (!items) return;
        hitResult.current = items.hitTest(event.point, hitOptions);

        if (!hitResult.current) deselectAll();

        if (!hitResult.current || !selectedItems.current) return;

        // deselectAll();
        const activeItem = hitResult.current.item;

        const isAlreadySelected = selectedItems.current.children.some(
          (item) => item.id === activeItem.id
        );

        const isAlreadySelected2 = selectedItems.current.isParent(activeItem);

        if (!isAlreadySelected) {
          if (event.modifiers.shift) {
            // MULTI SELECT so we can just add the item:
            addItemToSelectedGroup(activeItem);
          } else {
            // SINGLE SELECT so we have to remove all other items first:
            removeChildrenFromGroupOnly(selectedItems.current);
            addItemToSelectedGroup(activeItem);
          }
        }

        // destroy all current transform handles:
        destroyTransfromHandles();

        // draw transform handles for each individual selected items:
        selectedItems.current.children.forEach((item) => {
          drawTransformHandles(item, "#ff0000");
        });

        // draw transform handles for the group of selected items
        if (selectedItems.current.children.length > 1) {
          drawTransformHandles(selectedItems.current, "#00ff00", 5);
        }
      },
      mousedrag: (event: paper.ToolEvent) => {
        // console.log("> TOOL:select:mousedrag");

        if (!selectedItems.current) return;
        if (selectedItems.current.children.length > 0) {
          // move selected item and their transform handles:
          const { x, y } = event.delta;
          selectedItems.current.translate(new app.current.Point(x, y));
          transformBoxes.current?.translate(new app.current.Point(x, y));
        }

        if (!hitResult.current) {
          const pan_offset = event.point.subtract(event.downPoint);
          app.current.view.center =
            app.current.view.center.subtract(pan_offset);
          drawBackground();
        }
      },
      mouseup: (event: paper.ToolEvent) => {
        console.log("> TOOL:select:mouseup");
        // activateTool(prevActiveTool.current);
      },
    };

    selectionTool.on(selectListeners);
    tempSelectionTool.on({
      ...selectListeners,
      mouseup: (event: any) => {
        activateTool(prevActiveTool.current);
      },
    });

    ///////////////////////////////////////////////////////////////////////////////////////
    const circleTool = new CustomTool(TOOL.circle);

    circleTool.on({
      mousedown: (event: paper.ToolEvent) => {
        drawCircle({
          color: "#00ff00",
          x: event.downPoint.x,
          y: event.downPoint.y,
          radius: 50,
        });
      },
      mousedrag: (event: any) => {},
    });
    ///////////////////////////////////////////////////////////////////////////////////////
    const rectangeTool = new CustomTool(TOOL.rectangle);

    let preview: paper.Path.Rectangle;
    rectangeTool.on({
      mousedown: (event: paper.ToolEvent) => {
        console.log("> TOOL:RECT:mousedown");
        // deselectAll();
      },
      mousedrag: (event: any) => {
        console.log("> TOOL:RECT:mousedrag");
        preview?.remove();
        preview = drawRectangle({
          color: "#00ff00",
          x: event.downPoint.x,
          y: event.downPoint.y,
          width: event.point.x - event.downPoint.x,
          height: event.point.y - event.downPoint.y,
          radius: 0,
        });
      },
      mouseup: (event: any) => {
        console.log("> TOOL:RECT:up");

        preview?.remove();
        drawRectangle({
          color: "#00ff00",
          x: event.downPoint.x,
          y: event.downPoint.y,
          width: event.point.x - event.downPoint.x,
          height: event.point.y - event.downPoint.y,
          radius: 5,
        });
        activateTool(TOOL.select);
      },
    });
  };

  const setCanvasSize = (width: number, height: number) => {
    const Paper = app.current;
    Paper.view.viewSize = new Paper.Size(width, height);
  };

  useEffect(() => {
    const test = (event: KeyboardEvent) => {
      if (event.key === "d") {
        console.log("--------------DEBUG------------------------");
        // console.debug(app.current.project.);
        // console.log("SELECTED ITEMS", selectedItems.current);
        drawBackground();
        // console.log("CHILDREN", selectedItems.current?.children);
        console.log("-------------END DEBUG----------------------");
      }
    };

    window.addEventListener("keydown", test);
    return () => {
      window.removeEventListener("keydown", test);
    };
  }, []);

  useEffect(() => {
    console.log("!!!!! PaperContext re-rendering");
  });

  return (
    <PaperStateContext.Provider
      value={{
        app,
        containerRef,
        canvasRef,

        init,
        activeTool,
        activateTool,
        setCanvasSize,
        drawBackground,
        zoom,
      }}
    >
      {children}
    </PaperStateContext.Provider>
  );
};

const usePaperState = () => {
  const context = useContext(PaperStateContext);
  if (context === undefined)
    throw new Error(
      "usePaperState must be used within a PaperSpaceStateProvider"
    );
  return context;
};

export { PaperStateProvider, usePaperState };
