import { parseArgs } from "node:util";

export const parseCommandArgs = (args, optionsConfig = {}) => {
 try {
  const { values, positionals } = parseArgs({
   args: args,
   options: optionsConfig,
   allowPositionals: true,
  });

  return { values, positionals };
 } catch (error) {
  console.log("Failed to parse args");
 }
};
