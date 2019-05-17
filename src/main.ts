import {createCanvas} from "canvas";
import fs from "fs";
import pdfjsLib, { PDFPageProxy } from "pdfjs-dist";
import { js2xml } from "xml-js";

import NodeCanvasFactory from "./NodeCanvasFactory";


function main() {
    const files = process.argv.slice(2)
    console.log(files);
    for(const file of files) {
        console.log(`Converting ${file}:`)
        convertPdfFile(file);
    }
}

function convertPdfFile(file: string) {
    fs.readFile(file, (err, buffer) =>{
        if (err) {
            console.error(err);
        } else {
            convertPdfBuffer(buffer, {title: file});
        }
    })
}

interface conversionParameters {
    title?: string;
    scale?: number;
}

function convertPdfBuffer(buffer: Buffer, parameters?: conversionParameters ) {
    // Initialize parameters
    const defaultParams = {
        title: "",
        scale: 4,
    };
    let params: conversionParameters;
    if(parameters) {
        params = {...defaultParams, ...parameters};
    } else {
        params = defaultParams;
    }

    // Create document
    const body = {
        type: "element",
        name: "body",
        elements: []
    };
    const html = { type: "element", name: "html", elements: [
        { type: "element", name: "head", elements: [
            { type: "element", name: "meta", attributes: { charset: "UTF-8" }},
            { type: "element", name: "title", elements: [
                { type: "text", text: params.title },
            ]}
        ]},
        body,
    ]};
    const document = {
        elements: [
            { type: "doctype", doctype: "HTML"},
            html,
        ]
    };
    console.log(js2xml(document));

    // Parse PDF
    pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
    }).promise.then(pdfDocument =>{
        pdfDocument.getMetadata().then(metadata =>{
            console.log(metadata);
        })
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            pdfDocument.getPage(i).then(pdfPage=>{
                convertPdfPage(pdfPage, params)
            });
            break;
        }
    })
}

function convertPdfPage(pdfPage: PDFPageProxy, {scale}: conversionParamters) {
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