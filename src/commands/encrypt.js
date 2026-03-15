import { parseCommandArgs } from "../utils/argParser.js";
import { resolvePath, currentWorkingDirectory } from "../utils/pathResolver.js";
import { createCipheriv, randomBytes, pbkdf2Sync } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { resolve } from "node:path";

const encryptOptions = {
 input: { type: "string" },
 output: { type: "string" },
 password: { type: "string" },
};

export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;
export const KEY_LENGTH = 32;

export const runEncryptCommand = async (args) => {
 const { values } = parseCommandArgs(args, encryptOptions);

 try {
  const sourceFilePath = await resolvePath(values.input);
  const targetFilePath = resolve(currentWorkingDirectory, values.output);

  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  const key = pbkdf2Sync(values.password, salt, 100000, KEY_LENGTH, "sha256");

  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const readableStream = createReadStream(sourceFilePath);
  const writableStream = createWriteStream(targetFilePath);

  writableStream.write(salt);
  writableStream.write(iv);

  await pipeline(readableStream, cipher, writableStream);

  const authTag = cipher.getAuthTag();

  const finalWritableStream = createWriteStream(targetFilePath, { flags: "a" });
  finalWritableStream.write(authTag);
  finalWritableStream.end();

  console.log("Encrypted");
 } catch (error) {
  console.log("Operation failed");
 }
};
