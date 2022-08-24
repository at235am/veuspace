import throttle from "lodash.throttle";
import {
  Graphics,
  IParticleProperties,
  ParticleContainer,
  RenderTexture,
  SCALE_MODES,
  Sprite,
} from "pixi.js-legacy";
import {
  clamp,
  colorToNumber as ctn,
  roundIntToNearestMultiple,
} from "../utils/utils";
import { PixiApplication } from "./PixiApplication";

export type BgPattern = {
  type: string;
  color: string;
  texture: RenderTexture;
};

export class Background extends ParticleContainer {
  protected pixi: PixiApplication;
  private _grid: boolean;
  private _cellSize: number;
  private _activePattern: string;
  private _patterns: { [type: string]: BgPattern };

  constructor(
    pixi: PixiApplication,
    maxSize?: number | undefined,
    properties?: IParticleProperties | undefined,
    batchSize?: number | undefined,
    autoResize?: boolean | undefined
  ) {
    super(maxSize, properties, batchSize, autoResize);

    this.pixi = pixi;
    this._cellSize = 50;
    this._grid = true;
    this._activePattern = "dot";
    this._patterns = {};
  }

  setupTextures = () => {
    // first destroy any textures that was already generated:
    Object.entries(this._patterns).forEach(([id, pattern]) => {
      pattern.texture.destroy(true);
    });

    const dotPattern = new Graphics();
    dotPattern.beginFill(0xffffff, 1);
    dotPattern.lineStyle({ width: 0 });
    dotPattern.drawCircle(0, 0, 1);
    dotPattern.endFill();
    // dotPattern.gener

    const gridPattern = new Graphics();
    gridPattern.beginFill(0xffffff, 1);
    gridPattern.lineStyle({ width: 0 });
    gridPattern.drawRect(0, 0, this._cellSize, 1);
    gridPattern.drawRect(0, 0, 1, this._cellSize);
    gridPattern.endFill();

    this._patterns = {
      dot: {
        type: "dot",
        color: "#ffffff",
        texture: this.pixi.app.renderer.generateTexture(dotPattern),
      },
      grid: {
        type: "grid",
        color: "#ffffff",
        texture: this.pixi.app.renderer.generateTexture(gridPattern),
      },
    };

    this._patterns.dot.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    this._patterns.grid.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

    dotPattern.destroy();
    gridPattern.destroy();
  };

  public get grid() {
    return this._grid;
  }

  public setGrid(value: boolean) {
    this._grid = value;
    if (value) this.drawBackgroundPattern();
    else this.removeChildren();
  }

  public get cellSize() {
    return this._cellSize;
  }

  public setCellSize(value: number) {
    if (value === this._cellSize) return;
    this._cellSize = value;
    this.setupTextures(); //
    this.drawBackgroundPattern();
  }

  public get activePattern() {
    return this._activePattern;
  }

  public setActivePattern(id: string) {
    this._activePattern = id;
    this.throttledDrawBG();
  }

  public setPatternsColors(values: { type: string; color: string }[]) {
    values.forEach(({ type, color }) => {
      const bgPattern = this._patterns[type];
      this._patterns[type] = { ...bgPattern, color };
    });

    this.throttledDrawBG();
  }

  public drawBackgroundPattern = (force = false) => {
    if (!this._grid && !force) return;

    this.removeChildren();
    // console.log(this._patterns[this._activePattern]);
    // console.log(this._activePattern);
    // console.log(this._patterns);
    const { color, texture } = this._patterns[this._activePattern];

    const cell = this._cellSize; // the gap between each cell of the grid
    const bounds = this.pixi.viewport.getVisibleBounds().pad(cell * 2);
    const hboxes = Math.round(bounds.width / cell);
    const vboxes = Math.round(bounds.height / cell);

    const zoomscale = this.pixi.viewport.scaled;
    const scale = Math.round(clamp(1 / zoomscale, 1, 2) * 100) / 100;

    for (let x = 0; x < hboxes; x++) {
      for (let y = 0; y < vboxes; y++) {
        const offsetX = roundIntToNearestMultiple(bounds.x, cell);
        const offsetY = roundIntToNearestMultiple(bounds.y, cell);
        const X = offsetX + x * cell;
        const Y = offsetY + y * cell;

        const sprite = new Sprite(texture);
        sprite.position.set(X, Y);
        sprite.scale.set(scale, scale);

        this.addChild(sprite);
      }
    }
    this.tint = ctn(color);
  };

  public throttledDrawBG = throttle(this.drawBackgroundPattern, 100);
}
