import { parseCommandArgs } from "../utils/argParser.js";
import { currentWorkingDirectory, resolvePath } from "../utils/pathResolver.js";
import { Transform } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";

const csvToJsonOptions = {
 input: { type: "string" },
 output: { type: "string" },
};

export const runCsvToJsonCommand = async (args) => {
 const { values } = parseCommandArgs(args, csvToJsonOptions);

 const sourceFilePath = await resolvePath(values.input);
 const targetFilePath = resolve(currentWorkingDirectory, values.output);

 let linesCount = 0;
 let headers = [];
 let buffer = "";
 const jsonLines = [];

 const transformStream = new Transform({
  transform(chunk, _, callback) {
   buffer += chunk.toString();

   const lines = buffer.split("\n");
   buffer = lines.pop();

   for (const line of lines) {
    linesCount++;

    if (linesCount === 1) {
     headers = line.split(",").map((header) => header.trim());
     continue;
    }

    const mainValues = line.split(",").map((value) => value.trim());

    const mainResult = {};
    headers.forEach((header, index) => {
     mainResult[header] = mainValues[index] || "";
    });

    const jsonLine = JSON.stringify(mainResult) + ",\n";

    jsonLines.push(jsonLine);
    callback();
   }
  },

  flush(callback) {
   if (buffer.trim() !== "") {
    const buffervalues = buffer.split(",").map((value) => value.trim());
    const bufferResult = {};
    headers.forEach((header, index) => {
     bufferResult[header] = buffervalues[index] || "";
    });

    const jsonLine = JSON.stringify(bufferResult);
    jsonLines.push(jsonLine);

    const finalJson = "[\n" + jsonLines.join("") + "\n]";
    this.push(finalJson);
    callback();
   }
  },
 });

 const readableStream = createReadStream(sourceFilePath);
 const writableStream = createWriteStream(targetFilePath);

 try {
  await pipeline(readableStream, transformStream, writableStream);
  console.log("Converted to JSON");
 } catch {
  console.log("Operation failed");
 }
};
