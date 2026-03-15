import { parseCommandArgs } from "../utils/argParser.js";
import { resolvePath, currentWorkingDirectory } from "../utils/pathResolver.js";
import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";
import { SALT_LENGTH, IV_LENGTH, KEY_LENGTH } from "./encrypt.js";

const decryptOptions = {
 input: { type: "string" },
 output: { type: "string" },
 password: { type: "string" },
};

const AUTH_TAG_LENGTH = 16;
const HEADER_LENGTH = SALT_LENGTH + IV_LENGTH;

export const runDecryptCommand = async (args) => {
 const { values } = parseCommandArgs(args, decryptOptions);

 try {
  const sourceFilePath = await resolvePath(values.input);
  const targetFilePath = resolve(currentWorkingDirectory, values.output);

  const stats = await stat(sourceFilePath);
  const fileSize = stats.size;

  if (fileSize < HEADER_LENGTH + AUTH_TAG_LENGTH) {
   throw new Error("Invalid encrypted file format");
  }

  const headerBuffer = Buffer.alloc(HEADER_LENGTH);
  const headerReadableStream = createReadStream(sourceFilePath, {
   start: 0,
   end: HEADER_LENGTH - 1,
  });

  await new Promise((resolve, reject) => {
   headerReadableStream.on("data", (chunk) => {
    chunk.copy(headerBuffer);
   });
   headerReadableStream.on("end", resolve);
   headerReadableStream.on("error", reject);
  });

  const salt = headerBuffer.subarray(0, SALT_LENGTH);
  const iv = headerBuffer.subarray(SALT_LENGTH, HEADER_LENGTH);

  const authTagBuffer = Buffer.alloc(AUTH_TAG_LENGTH);
  const authTagReadableStream = createReadStream(sourceFilePath, {
   start: fileSize - AUTH_TAG_LENGTH,
   end: fileSize - 1,
  });

  await new Promise((resolve, reject) => {
   authTagReadableStream.on("data", (chunk) => {
    chunk.copy(authTagBuffer);
   });
   authTagReadableStream.on("end", resolve);
   authTagReadableStream.on("error", reject);
  });

  const key = pbkdf2Sync(values.password, salt, 100000, KEY_LENGTH, "sha256");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTagBuffer);

  const dataReadableStream = createReadStream(sourceFilePath, {
   start: HEADER_LENGTH,
   end: fileSize - AUTH_TAG_LENGTH - 1,
  });

  const writableStream = createWriteStream(targetFilePath);

  await pipeline(dataReadableStream, decipher, writableStream);

  console.log("Decrypted");
 } catch (error) {
  console.log("Operation failed");
 }
};
