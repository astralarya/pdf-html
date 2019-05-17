import {createCanvas, Canvas, CanvasRenderingContext2D} from "canvas";


interface CanvasAndContext {
    canvas: Canvas | null,
    context: CanvasRenderingContext2D | null,
}

class NodeCanvasFactory {
    create(width: number, height: number) {
        if (width <= 0 || height <= 0) {
            throw new Error("Invalid canvas size");
        }
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return {
            canvas,
            context,
        };
    }
    reset(canvasAndContext: CanvasAndContext, width: number, height: number) {
        if (!canvasAndContext.canvas) {
            throw new Error("Canvas is not specified");
        }
        if (width <= 0 || height <= 0) {
            throw new Error("Invalid canvas size");
        }
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: CanvasAndContext) {
        if (!canvasAndContext.canvas) {
            throw new Error("Canvas is not specified");
        }
        // Zeroing the width and height cause Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

export default NodeCanvasFactory;