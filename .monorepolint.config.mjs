import {
  alphabeticalDependencies,
  alphabeticalScripts,
  bannedDependencies,
  consistentDependencies,
  fileContents,
  packageEntry,
  packageOrder,
  packageScript,
  requireDependency,
} from "@monorepolint/rules";

export default {
  rules: [
    // Ensure consistent field ordering in package.json files
    packageOrder({
      options: {
        order: [
          "name",
          "version",
          "description",
          "author",
          "license",
          "type",
          "exports",
          "bin",
          "main",
          "module",
          "types",
          "files",
          "scripts",
          "dependencies",
          "devDependencies",
          "peerDependencies",
          "peerDependenciesMeta",
          "publishConfig",
          "repository",
          "keywords",
          "packageManager",
        ],
      },
    }),

    // Keep dependencies sorted alphabetically for better diffs
    alphabeticalDependencies({
      includeWorkspaceRoot: true,
    }),

    // Keep scripts sorted alphabetically
    alphabeticalScripts({
      includeWorkspaceRoot: true,
    }),

    // Ensure version consistency across packages
    consistentDependencies({}),

    // Ensure all packages have required metadata
    packageEntry({
      options: {
        entries: {
          license: "Apache-2.0",
          type: "module",
        },
        entriesExist: ["name", "version"],
      },
    }),

    // Ensure example packages are private
    packageEntry({
      includePackages: ["conjure-lite.example"],
      options: {
        entries: {
          private: true,
        },
      },
    }),

    // Ensure consistent repository information for published packages
    packageEntry({
      excludePackages: ["conjure-lite-repo"], // Skip root package
      options: {
        entries: {
          repository: {
            type: "git",
            url: "https://github.com/ericanderson/conjure-lite.git",
          },
        },
      },
    }),

    // Ensure consistent TypeScript version across packages
    requireDependency({
      options: {
        devDependencies: {
          typescript: "^5.8.3",
        },
      },
    }),

    // Ensure consistent build tooling
    requireDependency({
      excludePackages: ["@conjure-lite/tsconfig", "conjure-lite-repo"],
      options: {
        devDependencies: {
          "@conjure-lite/tsconfig": "workspace:*",
          unbuild: "^3.5.0",
          vitest: "^3.2.4",
          "@vitest/coverage-v8": "^3.2.4",
        },
      },
    }),

    // Ensure consistent linting setup
    requireDependency({
      excludePackages: ["@conjure-lite/tsconfig"],
      options: {
        devDependencies: {
          eslint: "^9.30.1",
          "@eslint/js": "^9.30.1",
          "@typescript-eslint/eslint-plugin": "^8.36.0",
          "@typescript-eslint/parser": "^8.36.0",
          "typescript-eslint": "^8.36.0",
        },
      },
    }),

    // Ensure consistent API checking tools for published packages
    requireDependency({
      includePackages: ["@conjure-lite/cli", "conjure-lite"],
      options: {
        devDependencies: {
          "@microsoft/api-extractor": "^7.52.8",
          "@arethetypeswrong/cli": "^0.18.2",
        },
      },
    }),

    // Ensure consistent scripts across packages
    packageScript({
      excludePackages: ["@conjure-lite/tsconfig", "conjure-lite.example", "conjure-lite-repo"],
      options: {
        scripts: {
          build: "unbuild",
          clean: "rm -rf lib tsconfig.tsbuildinfo dist",
          "check:types": "tsc --build --noEmit",
          "check:lint": "eslint .",
          test: "vitest run --reporter=verbose --coverage",
        },
      },
    }),

    // API checking scripts for published packages
    packageScript({
      includePackages: ["@conjure-lite/cli", "conjure-lite"],
      options: {
        scripts: {
          "check:api": "api-extractor run",
          "check:attw": "attw --pack",
        },
      },
    }),

    // Ensure consistent exports structure for published packages
    packageEntry({
      includePackages: ["@conjure-lite/cli", "conjure-lite"],
      options: {
        entries: {
          exports: {
            ".": {
              import: {
                types: "./dist/index.d.mts",
                default: "./dist/index.mjs",
              },
              require: {
                types: "./dist/index.d.cts",
                default: "./dist/index.cjs",
              },
            },
          },
          main: "./dist/index.cjs",
          module: "./dist/index.mjs",
          types: "./dist/index.d.mts",
          files: ["package.json", "dist"],
        },
      },
    }),

    // Ensure publishConfig for public packages
    packageEntry({
      includePackages: ["@conjure-lite/cli", "@conjure-lite/tsconfig"],
      options: {
        entries: {
          publishConfig: {
            access: "public",
          },
        },
      },
    }),

    // Ban problematic dependencies
    bannedDependencies({
      options: {
        bannedDependencies: [
          // Prefer specific alternatives
          "lodash", // Use individual lodash functions or native alternatives
          "moment", // Use date-fns or native Date
          "request", // Use fetch or axios
        ],
      },
    }),

    // Ensure consistent Node.js types
    requireDependency({
      excludePackages: ["@conjure-lite/tsconfig"],
      options: {
        devDependencies: {
          "@types/node": "^22.16.0",
        },
      },
    }),

    // Generate consistent vitest config for packages that need it
    fileContents({
      excludePackages: ["@conjure-lite/tsconfig", "conjure-lite-repo"],
      options: {
        file: "vitest.config.ts",
        template: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*"],
      exclude: ["src/schemas/**/*", "dist/", "node_modules/", "examples/"],
    },
  },
});
`,
      },
    }),
  ],
};
