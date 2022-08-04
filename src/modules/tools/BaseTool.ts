import { Point } from "framer-motion";
import { InteractionManager, InteractionManagerOptions } from "pixi.js-legacy";
import { PixiApplication, TOOL } from "../PixiApplication";

export class BaseTool {
  protected pixi: PixiApplication;
  protected interaction?: InteractionManager;

  constructor(pixi: PixiApplication) {
    this.pixi = pixi;
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
    this.interaction?.on("pointerdown", this.onClick);
  }

  onClick() {
    console.log("YOU KNOW ITS BASE TOOL");
  }
}
