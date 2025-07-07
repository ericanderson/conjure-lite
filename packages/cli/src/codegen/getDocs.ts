export function getDocs(docs: string | null | undefined): string | undefined {
  if (!docs) {
    return "";
  }

  const cleanedDocs = docs.trim().split("\n").map(docLine => ` * ${sanitize(docLine)}`).join("\n");

  return `
/**
${cleanedDocs}
 */
`;
}

function sanitize(docLine: string): string {
  return docLine.replace("*/", "*\\/").trim();
}
