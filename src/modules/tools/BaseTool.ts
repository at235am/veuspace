import {
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";
import { PixiApplication, TOOL } from "../PixiApplication";

export class BaseTool {
  protected pixi: PixiApplication;
  protected interaction?: InteractionManager;
  protected touches: number;
  protected button: number | null;
  protected cursor: string;
  public isUsing: boolean;

  // used for a long press action:
  protected longPressed: boolean;
  protected longPressCallback?: () => void;
  private timer?: NodeJS.Timeout;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    this.pixi = pixi;
    this.longPressCallback = longPressCallback;
    this.cursor = "default";
    this.isUsing = false;

    // important for classes that extend this BaseTool class:
    this.longPressed = false;
    this.touches = 0; // good for detecting muliple touches or points
    this.button = null; // see below:
    // this.button represents the button pressed/clicked/tapped
    // 0 = primary button   (usually the left click)
    // 1 = auxiliary button (usually the middle/scroll click)
    // 2 = secondary button (usually the right click)
  }

  start(blank = false, options?: InteractionManagerOptions | undefined) {
    const renderer = this.pixi.app.renderer;
    renderer.plugins.interaction.destroy();
    renderer.plugins.interaction = new InteractionManager(renderer, options);
    this.interaction = renderer.plugins.interaction;

    // appearance:
    this.pixi.viewport.cursor = this.cursor;

    // attach global listeners:
    this.interaction?.on("pointerdown", this.setTouchesAndButton);
    this.interaction?.on("pointerup", this.reset);
    this.interaction?.on("pointerupoutside", this.reset);

    // this.interaction?.on("pointerdown", this.startLongPressCount);
    // this.interaction?.on("pointermove", this.determineLongPressAction);

    this.pixi.activeTool = this;
  }

  private setTouchesAndButton = (event: InteractionEvent) => {
    // console.log("base:pointerdown");

    this.isUsing = true;
    this.touches = 1;
    this.button = event.data.button;

    // THIS IS ONLY TRUE if the original event is NOT a TouchEvent
    // event.data.button returns 1 on touch devices WHICH IS NOT the middle click
    let isMiddleClick = this.button === 1;

    if (window.TouchEvent) {
      // firefox does not have TouchEvent so we need to check
      // if window.TouchEvent exists before referencing it
      if (event.data.originalEvent instanceof window.TouchEvent) {
        this.pixi.disablePanning(); // since this is a touch event we always disable panning
        const touchEvent = event.data.originalEvent as TouchEvent;
        this.touches = touchEvent.touches.length;
        this.button = 0;
        isMiddleClick = false; // since this is
      }
    }
  };

  private startLongPressCount = (event: InteractionEvent) => {
    if (this.touches !== 1) return clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.longPressed = true;
      this.pixi.viewport.drag({
        pressDrag: true,
        mouseButtons: "left-middle",
      });
      this.pixi.viewport.emit("pointerdown", event); // must emit another pointerdown event on viewport
      if (this.longPressCallback) this.longPressCallback();
      else {
        const fn = this.pixi.longPressFn;
        if (fn) fn();
      }
      window.navigator.vibrate(15);
      this.pixi.viewport.cursor = "move";
    }, 750);
  };

  private determineLongPressAction = (event: InteractionEvent) => {
    clearTimeout(this.timer);
    if (this.longPressed) {
      this.pixi.viewport.emit("pointermove", event);
    }
  };

  private reset = (event: InteractionEvent) => {
    if (this.touches === 1) this.isUsing = false;

    this.button = null;
    this.longPressed = false;
    this.pixi.viewport.cursor = this.cursor;
    // clearTimeout(this.timer);

    this.pixi.enablePanning();
  };
}
