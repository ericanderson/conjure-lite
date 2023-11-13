import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { HandleGenerateArgs } from "./cli/HandleGenerateArgs.js";

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
      });
    },
    handler: async (argv) => (await import("./cli/handleGenerate.js")).handleGenerate(argv),
  };

  await yargs(hideBin(process.argv))
    
    .command(generate).demandCommand().parseAsync();
}
