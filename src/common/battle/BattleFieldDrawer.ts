import {color} from "../helpers/color";

const HEXAGON_ANGLE = 0.523598776;
const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 9;
const SIDE_LENGTH = 18;

const hexHeight = Math.round(Math.sin(HEXAGON_ANGLE) * SIDE_LENGTH);
const hexRadius = Math.round(Math.cos(HEXAGON_ANGLE) * SIDE_LENGTH);
const hexRectangleHeight = Math.round(SIDE_LENGTH + (2 * hexHeight));
const hexRectangleWidth = Math.round(2 * hexRadius);

export class BattleFieldDrawer {

    width = (FIELD_WIDTH * hexRectangleWidth) + hexRectangleWidth / 2;
    height = (FIELD_HEIGHT * (SIDE_LENGTH + hexHeight)) + (SIDE_LENGTH + hexHeight) / 2;

    private hexagonGraphic: HTMLCanvasElement;

    draw(ctx: CanvasRenderingContext2D) {
        this.hexagonGraphic = this.prepareHexagon();
        const boardGraphic = this.prepareBoard();

        ctx.globalAlpha = 0.5;

        ctx.drawImage(boardGraphic, 0, 0);
    }

    getHexagonLeft(x: number, y: number): number {
        const rowMargin = ((y + 1) % 2) * hexRadius;

        return (x * hexRectangleWidth) + rowMargin;
    }

    getHexagonTop(x: number, y: number): number {
        return y * (SIDE_LENGTH + hexHeight);
    }

    forEachBoard(callback: Function) {
        let y = FIELD_HEIGHT;

        while (y--) {
            let x = FIELD_WIDTH;

            while (x--) {
                const left = this.getHexagonLeft(x, y);
                const top = this.getHexagonTop(x, y);

                callback(left, top, x, y);
            }
        }
    }

    private makeCtx(width: number, height: number): CanvasRenderingContext2D {
        const canvas = <HTMLCanvasElement>document.createElement('canvas');

        Object.assign(canvas, {width, height});

        return canvas.getContext('2d');
    }

    private makeHexagon(): CanvasRenderingContext2D {
        let x = 0;
        let y = 0;
        let ctx = this.makeCtx(hexRectangleWidth, hexRectangleHeight);
        ctx.beginPath();
        ctx.moveTo(x + hexRadius, y);
        ctx.lineTo(x + hexRectangleWidth, y + hexHeight);
        ctx.lineTo(x + hexRectangleWidth, y + hexHeight + SIDE_LENGTH);
        ctx.lineTo(x + hexRadius, y + hexRectangleHeight);
        ctx.lineTo(x, y + SIDE_LENGTH + hexHeight);
        ctx.lineTo(x, y + hexHeight);
        ctx.closePath();

        return ctx;
    }

    private prepareHexagon(): HTMLCanvasElement {
        let ctx = this.makeHexagon();
        ctx.strokeStyle = 'rgba(118, 255, 5, 0.6)';
        ctx.stroke();

        return ctx.canvas;
    }

    private prepareBoard(): HTMLCanvasElement {
        const ctx = this.makeCtx(this.width, this.height);
        const factor = 30;
        const baseColor = color('#2b5720');
        const baseR = ((baseColor >> 16) - (factor >> 1)) & 255;
        const baseG = ((baseColor >> 8) - (factor >> 1)) & 255;
        const baseB = ((baseColor >> 0) - (factor >> 1)) & 255;

        for (let y = 0; y < 300; y += 2) {
            for (let x = 0; x < 400; x += 2) {
                let r = Math.max(0, baseR + Math.floor(Math.random() * factor)) & 255;
                let g = Math.max(0, baseG + Math.floor(Math.random() * factor)) & 255;
                let b = Math.max(0, baseB + Math.floor(Math.random() * factor)) & 255;

                const hexColor = ((r << 16) | (g << 8) | (b << 0)).toString(16).padStart(6, '0');

                ctx.fillStyle = `#${hexColor}`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        this.forEachBoard((left, top) => {
            ctx.drawImage(this.hexagonGraphic, left, top);
        });

        return ctx.canvas;
    }
}