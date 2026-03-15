import { startCLI } from "./repl.js";
import { currentWorkingDirectory } from "./utils/pathResolver.js";

const startApp = () => {
 console.log(
  `Welcome to Data Processing CLI!\nYou are currently in ${currentWorkingDirectory}`,
 );
 startCLI();
};

startApp();
