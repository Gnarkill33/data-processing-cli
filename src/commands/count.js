import { parseCommandArgs } from "../utils/argParser.js";
import { resolvePath } from "../utils/pathResolver.js";
import { Transform } from "node:stream";
import { createReadStream } from "node:fs";

const countOptions = {
 input: { type: "string" },
};

export const runCountCommand = async (args) => {
 const { values } = parseCommandArgs(args, countOptions);

 let stats = {
  lines: 0,
  words: 0,
  chars: 0,
 };

 const sourceFilePath = await resolvePath(values.input);

 let inWord = false;

 const counterStream = new Transform({
  transform(chunk, _, callback) {
   const chunkStr = chunk.toString();

   stats.chars += chunkStr.length;

   for (let i = 0; i < chunkStr.length; i++) {
    const char = chunkStr[i];
    const isWhitespace = /\s/.test(char);

    if (char === "\n") {
     stats.lines++;
    }

    if (!isWhitespace && !inWord) {
     inWord = true;
     stats.words++;
    } else if (isWhitespace) {
     inWord = false;
    }
   }

   callback();
  },

  flush(callback) {
   callback();
  },
 });

 const readStream = createReadStream(sourceFilePath);

 readStream.on("error", () => {
  console.log("Operation failed");
 });

 counterStream.on("error", () => {
  console.log("Operation failed");
 });

 counterStream.on("finish", () => {
  console.log(
   `\nLines: ${stats.lines}\nWords: ${stats.words}\nCharacters: ${stats.chars}`,
  );
 });

 readStream.pipe(counterStream);
};
