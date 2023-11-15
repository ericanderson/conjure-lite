export function findCommonPrefix(strings: Array<string>) {
  const splitStrings = strings.map(s => s.split("."));

  for (let i = 0; i < splitStrings[0].length; i++) {
    for (let j = 1; j < splitStrings.length; j++) {
      if (splitStrings[0][i] != splitStrings[j][i]) {
        return splitStrings[0].slice(0, i).join(".");
      }
    }
  }
  return strings[0];
}
