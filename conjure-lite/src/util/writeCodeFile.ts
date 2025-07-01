import * as fs from "node:fs";

export async function writeCodeFile(path: string, code: string) {
  return await fs.promises.writeFile(
    path,
    code,
    "utf-8",
  );
}
