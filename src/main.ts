import {createCanvas, Canvas, CanvasRenderingContext2D} from "canvas";
import fs from "fs";
import pdfjsLib, { PDFPageProxy } from "pdfjs-dist";

import NodeCanvasFactory from "./NodeCanvasFactory";


function main() {
    let files = process.argv.slice(2)
    console.log(files);
    for(let file of files) {
        console.log(`Converting ${file}:`)
        convertPdfFile(file);
    }
}

function convertPdfFile(file: string) {
    fs.readFile(file, (err, buffer) =>{
        if (err) {
            console.error(err);
        } else {
            convertPdfBuffer(buffer);
        }
    })
}

function convertPdfBuffer(buffer: Buffer) {
    pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
    }).promise.then(pdfDocument =>{
        pdfDocument.getMetadata().then(metadata =>{
            console.log(metadata);
        })
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            pdfDocument.getPage(i).then(convertPdfPage);
            break;
        }
    })
}

function convertPdfPage(pdfPage: PDFPageProxy) {
    const viewport = pdfPage.getViewport(4);
    const pageInfo = {
        num: pdfPage.pageNumber,
        scale: viewport.scale,
        width: viewport.width,
        height: viewport.height,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
        rotation: viewport.rotation,
    };
    console.log(pageInfo)
    pdfPage.getTextContent().then(content => {
        console.log(content);
    });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    pdfPage.render({
        canvasContext: ctx,
        viewport: viewport,
        canvasFactory: new NodeCanvasFactory(),
        intent: "print",
    }).promise.then(()=>{
        console.log("rendered");
        let image = canvas.toBuffer();
        fs.writeFileSync("test.png", image);
    });
}

export default main;