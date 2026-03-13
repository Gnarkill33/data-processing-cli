import { parseCommandArgs } from "../utils/argParser.js";
import { resolvePath } from "../utils/pathResolver.js";
import { calculateHash, availableAlgorithms } from "./hash.js";
import { readFile } from "node:fs/promises";

const hashCompareOptions = {
 input: { type: "string" },
 hash: { type: "string" },
 algorithm: { type: "string", default: "sha256" },
};

export const runHashCompareCommand = async (args) => {
 const { values } = parseCommandArgs(args, hashCompareOptions);

 const isValidAlgorithm = availableAlgorithms.includes(values.algorithm);
 const sourceFilePath = await resolvePath(values.input);
 const filePathToCompare = await resolvePath(values.hash);

 if (!isValidAlgorithm) {
  console.log("Operation failed");
  return;
 }

 try {
  const actualHash = await calculateHash(sourceFilePath, values.algorithm);

  const expectedHash = await readFile(filePathToCompare, "utf8");

  const normalizedExpectedHash = expectedHash.trim().toLowerCase();
  const normalizedActualHash = actualHash.toLowerCase();

  if (normalizedActualHash === normalizedExpectedHash) {
   console.log("OK");
  } else {
   console.log("MISMATCH");
  }
 } catch {
  console.log("Operation failed");
 }
};
