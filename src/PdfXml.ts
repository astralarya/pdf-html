import { js2xml, Element } from "xml-js";
import { PDFMetadata, PDFInfo } from "pdfjs-dist";

class PdfXml {
    document: Element;
    head: Element;
    title: string | undefined;
    container: Element;

    constructor(title?: string) {
        this.title = title;
        this.head = { type: "element", name: "head", elements: [
            { type: "element", name: "meta", attributes: { charset: "UTF-8" }},
            { type: "element", name: "title", elements: [
                { type: "text", text: this.title },
            ]},
            { type: "element", name: "meta", attributes: {
                name: "generator",
                content: "pdf-html.js",
            }},
        ]}
        this.container = { type: "element", name: "div",
            attributes: {
                id: "document",
            },
            elements: [] as Element[],
        };
        this.document = {
            elements: [
                { type: "doctype", doctype: "HTML"},
                { type: "element", name: "html", elements: [
                    this.head,
                    { type: "element", name: "body", elements: [
                        this.container,
                    ]},
                ]},
            ]
        };
    }

    setMetadata({metadata, info, filename}: {metadata?: PDFMetadata, info?: PDFInfo, filename?: string}) {
        // Set title
        let title: string;
        if(metadata && metadata.has("dc:title")) {
            title = metadata.get("dc:title");
            if(title !== "Untitled") {
                this.title = title;
            }
        }
        if(!this.title && info && info["Title"]) {
            this.title = info["Title"];
        }
        if(!this.title && filename) {
            this.title = filename;
        }
    }

    serialize() {
        return js2xml(this.document);
    }
}

export default PdfXml;