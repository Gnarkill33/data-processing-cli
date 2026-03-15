import {
 changeWorkingDirectory,
 currentWorkingDirectory,
 resolvePath,
} from "./utils/pathResolver.js";
import { parseCommandArgs } from "./utils/argParser.js";
import { dirname } from "node:path";
import { readdir, stat } from "node:fs/promises";

export const checkType = async (path) => {
 try {
  const stats = await stat(path);

  if (stats.isFile()) {
   return "file";
  } else if (stats.isDirectory()) {
   return "directory";
  } else {
   return "other";
  }
 } catch (err) {
  console.error(err);
 }
};

export const runNavCommand = async (command, args) => {
 switch (command) {
  case "up": {
   if (args.length !== 0) console.log("Invalid input");

   const parentDir = dirname(currentWorkingDirectory);

   await changeWorkingDirectory(parentDir);
   break;
  }

  case "cd": {
   if (args.length !== 1) console.log("Invalid input");

   const { positionals } = parseCommandArgs(args);

   const targetDir = positionals[0];

   await changeWorkingDirectory(targetDir);
   break;
  }

  case "ls": {
   if (args.length !== 0) console.log("Invalid input");

   const dirContent = await readdir(currentWorkingDirectory);

   const filesToShow = await Promise.all(
    dirContent.map(async (item) => {
     const itemPath = await resolvePath(item);
     const itemType = await checkType(itemPath);
     return { Name: item, Type: itemType };
    }),
   );

   const sortedFiles = filesToShow.sort((a, b) => a.Type.localeCompare(b.Type));

   console.table(sortedFiles);
   break;
  }
  default: {
   console.log("Invalid input");
  }
 }
};
