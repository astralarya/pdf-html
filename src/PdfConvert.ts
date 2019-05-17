import {createCanvas} from "canvas";
import fs from "fs";
import pdfjsLib, { PDFPageProxy } from "pdfjs-dist";

import NodeCanvasFactory from "./NodeCanvasFactory";
import PdfXml from "./PdfXml";


export function convertPdfFile(file: string) {
    fs.readFile(file, (err, buffer) =>{
        if (err) {
            console.error(err);
        } else {
            convertPdfBuffer(buffer, {filename: file});
        }
    })
}

interface pdfParameters {
    filename?: string;
    scale?: number;
}

interface pdfPageParameters {
    scale: number;
}

export function convertPdfBuffer(buffer: Buffer, parameters?: pdfParameters ) {
    // Initialize parameters
    const defaultPageParams = {
        scale: 4,
    };
    let pageParams: pdfPageParameters;
    if(parameters) {
        pageParams = {...defaultPageParams, ...parameters};
    } else {
        pageParams = defaultPageParams;
    }
    const filename = parameters ? parameters.filename : undefined;

    // Parse PDF
    const xml = new PdfXml();
    pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
    }).promise.then(pdfDocument =>{
        pdfDocument.getMetadata().then(metadata =>{
            xml.setMetadata({...metadata, filename});
        })
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            pdfDocument.getPage(i).then(pdfPage=>{
                convertPdfPage(pdfPage, pageParams)
            });
            break;
        }
    })
}

function convertPdfPage(pdfPage: PDFPageProxy, {scale}: pdfPageParameters) {
    // Get Viewport
    const viewport = pdfPage.getViewport(scale);
    const pageInfo = {
        num: pdfPage.pageNumber,
        scale: viewport.scale,
        width: viewport.width,
        height: viewport.height,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
        rotation: viewport.rotation,
    };

    // Get TextContent
    pdfPage.getTextContent().then(content => {
        console.log(content);
    });

    // Get Canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    pdfPage.render({
        canvasContext: ctx,
        viewport: viewport,
        canvasFactory: new NodeCanvasFactory(),
        intent: "print",
    }).promise.then(()=>{
        return canvas.toBuffer();
    });
}
