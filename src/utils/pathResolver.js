import { resolve } from "node:path";
import { access } from "node:fs/promises";
import { homedir } from "node:os";

export let currentWorkingDirectory = homedir();

export const showWorkingDirectory = () => {
 console.log(`You are currently in ${currentWorkingDirectory}`);
};

export const resolvePath = async (targetPath) => {
 const resolvedPath = resolve(currentWorkingDirectory, targetPath);

 try {
  await access(resolvedPath);
  return resolvedPath;
 } catch {
  return null;
 }
};

export const changeWorkingDirectory = async (newPath) => {
 const resolvedPath = await resolvePath(newPath);

 if (resolvedPath) {
  currentWorkingDirectory = resolvedPath;
 } else {
  console.log("Operation failed");
 }
};
