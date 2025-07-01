export default {
  "*.{ts,mjs,js,mts,json}": (_filenames) => {
    return ["pnpm exec turbo check"];
  },
};
