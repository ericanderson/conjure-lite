export default {
  "*.{ts,mjs,js,mts,json}": (_filenames) => {
    return ["pnpm run check"];
  },
};
