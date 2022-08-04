import {
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";
import { PixiApplication, TOOL } from "../PixiApplication";
import { BaseTool } from "./BaseTool";

export class SelectTool extends BaseTool {
  constructor(pixi: PixiApplication) {
    super(pixi);
  }

  activate(options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    this.interaction?.on("pointerdown", this.onPointerDown);
    this.interaction?.on("pointerup", this.onPointerUp);
  }

  onPointerDown = (event: InteractionEvent) => {
    // THIS IS ONLY TRUE if the original event is NOT a TouchEvent
    // event.data.button returns 1 on touch devices WHICH IS NOT the middle click
    let isMiddleClick = event.data.button === 1;
    let touches = 1;

    if (window.TouchEvent) {
      // firefox does not have TouchEvent so we need to check
      // if window.TouchEvent existts before referencing it
      if (event.data.originalEvent instanceof window.TouchEvent) {
        const touchEvent = event.data.originalEvent as TouchEvent;
        touches = touchEvent.touches.length;
        isMiddleClick = false; // since this is
      }
    }
    if (isMiddleClick) return; // to stop the hit test

    // do a hit test:
    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    const hit = im.hitTest(event.data.global, this.pixi.items);

    if (hit) this.pixi.disablePanning();
  };

  onPointerUp = (event: InteractionEvent) => {
    if (this.pixi.mode === TOOL.SELECT) this.pixi.enablePanning();
    else this.pixi.disablePanning();
  };
}
