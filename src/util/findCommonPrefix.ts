export function findCommonPrefix(strings: Array<string>) {
  for (let stringIndex = 0; stringIndex < strings[0].length; stringIndex++) {
    for (let i = 1; i < strings.length; i++) {
      if (strings[0][stringIndex] != strings[i][stringIndex]) {
        return strings[0].substring(0, stringIndex);
      }
    }
  }
  return strings[0];
}
