import { parseCommandArgs } from "../utils/argParser.js";
import { currentWorkingDirectory, resolvePath } from "../utils/pathResolver.js";
import { Transform, Readable } from "node:stream";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

const jsonToCsvOptions = {
 input: { type: "string" },
 output: { type: "string" },
};

export const runJsonToCsvCommand = async (args) => {
 const { values } = parseCommandArgs(args, jsonToCsvOptions);

 const sourceFilePath = await resolvePath(values.input);
 const targetFilePath = resolve(currentWorkingDirectory, values.output);

 const jsonContent = await readFile(sourceFilePath, "utf-8");
 const parsedJsonContent = JSON.parse(jsonContent);

 const headers = Object.keys(parsedJsonContent[0]).join(",");

 const readableStream = Readable.from(parsedJsonContent);
 const writableStream = createWriteStream(targetFilePath);

 const transformStream = new Transform({
  objectMode: true,
  transform(chunk, _, callback) {
   const values = Object.values(chunk).join(",");
   callback(null, values + "\n");
  },
 });

 try {
  writableStream.write(headers + "\n");
  await pipeline(readableStream, transformStream, writableStream);
  console.log("Converted to CSV");
 } catch {
  console.log("Operation failed");
 }
};
