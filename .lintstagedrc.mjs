export default {
  "*.{ts,mjs,js,mts,json}": (filenames) => {
    return ["pnpm run check"];
  },
};
