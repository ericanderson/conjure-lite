import type { CommandModule } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { HandleGenerateArgs } from "./cli/HandleGenerateArgs.js";
import type {} from "node:process";
import { handleGenerate } from "./cli/handleGenerate.js";

export async function cli() {
  const generate: CommandModule<{}, HandleGenerateArgs> = {
    command: "generate",
    describe: "Generate code from IR",
    builder: (yargs) => {
      return yargs.options({
        outDir: {
          type: "string",
          required: true,
        },
        ir: {
          type: "string",
          required: true,
        },
        includeExtensions: {
          type: "boolean",
          default: true,
        },
        header: {
          type: "string",
        },
      });
    },
    handler: handleGenerate,
  };

  await yargs(hideBin(process.argv))
    .command(generate).demandCommand().parseAsync();
}
