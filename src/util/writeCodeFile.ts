import * as fs from "node:fs";
import { format } from "prettier";

export async function formatTs(code: string) {
  try {
    return await format(code, {
      parser: "typescript",

      tabWidth: 2,
      printWidth: 80,
    });
  } catch (e) {
    console.log(e);
    return code;
  }
}

export async function writeCodeFile(path: string, code: string) {
  return await fs.promises.writeFile(
    path,
    await formatTs(code),
    "utf-8",
  );
}
