import { stdin, stdout } from "node:process";
import readline from "node:readline";
import { showWorkingDirectory } from "./utils/pathResolver.js";
import { runNavCommand } from "./navigation.js";
import { runCountCommand } from "./commands/count.js";
import { runCsvToJsonCommand } from "./commands/csvToJson.js";
import { runJsonToCsvCommand } from "./commands/jsonToCsv.js";
import { runHashCommand } from "./commands/hash.js";

const commandHandlers = {
 up: () => runNavCommand("up", []),
 cd: (args) => runNavCommand("cd", args),
 ls: () => runNavCommand("ls", []),

 count: (args) => runCountCommand(args),
 hash: (args) => runHashCommand(args),
 "csv-to-json": (args) => runCsvToJsonCommand(args),
 "json-to-csv": (args) => runJsonToCsvCommand(args),
};

export const startCLI = () => {
 const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: "> ",
 });

 rl.prompt();

 rl.on("line", async (userInput) => {
  if (userInput.trim() === ".exit") {
   rl.close();
   return;
  }

  try {
   if (userInput) {
    const [command, ...args] = userInput.trim().split(" ");

    const handler = commandHandlers[command];

    if (handler) {
     await handler(args);
    } else {
     console.log("Invalid input");
    }
   }
  } catch {
   console.log("Operation failed");
   rl.prompt();
  } finally {
   showWorkingDirectory();
   rl.prompt();
  }
 });

 rl.on("close", () => {
  console.log("Thank you for using Data Processing CLI!");
 });
};
