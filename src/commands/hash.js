import { parseCommandArgs } from "../utils/argParser.js";
import { currentWorkingDirectory, resolvePath } from "../utils/pathResolver.js";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { resolve } from "node:path";

const hashOptions = {
 input: { type: "string" },
 algorithm: { type: "string", default: "sha256" },
 save: { type: "boolean", default: false },
};

export const availableAlgorithms = ["sha256", "md5", "sha512"];

export const calculateHash = (filePath, algorithm) => {
 return new Promise((resolve, reject) => {
  const hash = createHash(algorithm);
  const readableStream = createReadStream(filePath);

  readableStream.on("data", (chunk) => hash.update(chunk));
  readableStream.on("end", () => resolve(hash.digest("hex")));
  readableStream.on("error", () => {
   console.log("Operation failed");
   reject();
  });
 });
};

export const runHashCommand = async (args) => {
 const { values } = parseCommandArgs(args, hashOptions);

 const sourceFilePath = await resolvePath(values.input);
 const targetFilePath = resolve(
  currentWorkingDirectory,
  `${values.input}.${values.algorithm}`,
 );

 const isValidAlgorithm = availableAlgorithms.includes(values.algorithm);

 if (!isValidAlgorithm) {
  console.log("Operation failed");
  return;
 }

 try {
  const hexHash = await calculateHash(sourceFilePath, values.algorithm);

  if (values.save) {
   const writableStream = createWriteStream(targetFilePath);

   writableStream.on("error", () => {
    console.log("Operation failed");
   });

   writableStream.write(hexHash, () => {
    writableStream.end();
    console.log("Hash saved");
   });
  } else {
   console.log(`${values.algorithm}: ${hexHash}`);
  }
 } catch {
  console.log("Operation failed");
 }
};
