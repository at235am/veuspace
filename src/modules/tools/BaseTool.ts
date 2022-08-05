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

  constructor(pixi: PixiApplication) {
    this.pixi = pixi;
    this.touches = 0; // the number of points pressed on a screen
    this.button = null;
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

    // handle viewport listeners:
    this.pixi.viewport
      .drag({
        mouseButtons: "middle", // can specify combos of "left" | "right" | "middle" clicks
      })
      .wheel({
        wheelZoom: true, // zooms with mouse wheel
        center: null, //    makes it zoom at the pointer position instead of the center
      })
      .clampZoom({
        minScale: 0.3, // how far in  the zoom can be
        maxScale: 10, //  how far out the zoom can be
      })
      .pinch({ noDrag: true })
      .on("zoomed", () => this.pixi.drawBackgroundPattern()) //     pixi-viewport event only
      .on("moved-end", () => this.pixi.drawBackgroundPattern()); // pixi-viewport event only

    // attack global listeners:
    this.interaction?.on("pointerdown", this.determinePannableAnd);
    this.interaction?.on("pointerup", this.pointerup);
  }

  determinePannableAnd = (event: InteractionEvent) => {
    console.log("base:pointerdown");

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

  pointerup = (event: InteractionEvent) => {
    console.log("base:pointerup");
    this.button = null;
  };
}
