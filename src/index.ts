import { convertPdfFile } from "./PdfConvert";

const files = process.argv.slice(2)
console.log(files);
for(const file of files) {
    console.log(`Converting ${file}:`)
    convertPdfFile(file);
}