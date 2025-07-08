import { archetypes } from "@monorepolint/archetypes";
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

// Base configuration shared across all packages
const BASE_PACKAGE_CONFIG = {
  repositoryUrl: "https://github.com/ericanderson/conjure-lite.git",
  license: "Apache-2.0",
  typeScriptVersion: "^5.8.3",
  nodeTypesVersion: "^22.16.0",
};

// Common dependencies for packages that need building/testing
const BUILD_DEPENDENCIES = {
  "@conjure-lite/tsconfig": "workspace:*",
  unbuild: "^3.5.0",
  vitest: "^3.2.4",
  "@vitest/coverage-v8": "^3.2.4",
};

const LINT_DEPENDENCIES = {
  eslint: "^9.30.1",
  "@eslint/js": "^9.30.1",
  "@typescript-eslint/eslint-plugin": "^8.36.0",
  "@typescript-eslint/parser": "^8.36.0",
  "typescript-eslint": "^8.36.0",
};

const API_CHECK_DEPENDENCIES = {
  "@microsoft/api-extractor": "^7.52.8",
  "@arethetypeswrong/cli": "^0.18.2",
};

/**
 * Standard package rules for all conjure-lite packages
 */
function standardPackageRules(shared, options) {
  const rules = [
    // Base package metadata
    packageEntry({
      ...shared,
      options: {
        entries: {
          license: BASE_PACKAGE_CONFIG.license,
          type: "module",
          ...(options.private ? { private: true } : {}),
          ...(options.repositoryUrl !== false
            ? {
              repository: {
                type: "git",
                url: BASE_PACKAGE_CONFIG.repositoryUrl,
              },
            }
            : {}),
        },
        entriesExist: ["name", "version"],
      },
    }),

    // TypeScript dependency
    requireDependency({
      ...shared,
      options: {
        devDependencies: {
          typescript: BASE_PACKAGE_CONFIG.typeScriptVersion,
        },
      },
    }),
  ];

  // Add build tooling for packages that need it
  if (options.needsBuild) {
    const buildScripts = options.isExample
      ? {
        build: "tsc --build",
        clean: "rm -rf lib tsconfig.tsbuildinfo dist",
        "check:types": "tsc --build --noEmit",
        "check:lint": "eslint .",
        test: "vitest run",
      }
      : {
        build: "unbuild",
        clean: "rm -rf lib tsconfig.tsbuildinfo dist",
        "check:types": "tsc --build --noEmit",
        "check:lint": "eslint .",
        test: "vitest run --reporter=verbose --coverage",
      };

    rules.push(
      requireDependency({
        ...shared,
        options: {
          devDependencies: {
            ...(options.isExample ? {} : BUILD_DEPENDENCIES),
            "@types/node": BASE_PACKAGE_CONFIG.nodeTypesVersion,
          },
        },
      }),
      packageScript({
        ...shared,
        options: {
          scripts: buildScripts,
        },
      }),
      fileContents({
        ...shared,
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
    );
  }

  // Add linting for packages that need it
  if (options.needsLint) {
    rules.push(
      requireDependency({
        ...shared,
        options: {
          devDependencies: LINT_DEPENDENCIES,
        },
      }),
    );
  }

  // Add API checking for published packages
  if (options.needsApiCheck) {
    rules.push(
      requireDependency({
        ...shared,
        options: {
          devDependencies: API_CHECK_DEPENDENCIES,
        },
      }),
      packageScript({
        ...shared,
        options: {
          scripts: {
            "check:api": "api-extractor run",
            "check:attw": "attw --pack",
          },
        },
      }),
    );
  }

  // Add exports structure for published packages
  if (options.needsExports) {
    rules.push(
      packageEntry({
        ...shared,
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
    );
  }

  // Add publishConfig for public packages
  if (!options.private) {
    rules.push(
      packageEntry({
        ...shared,
        options: {
          entries: {
            publishConfig: {
              access: "public",
            },
          },
        },
      }),
    );
  }

  return rules;
}

// Define architypes using the archetypes helper
const archetypeRules = archetypes(standardPackageRules, {
  unmatched: "error",
})
  .addArchetype(
    "publishedLibraries",
    ["@conjure-lite/cli", "conjure-lite"],
    {
      private: false,
      needsBuild: true,
      needsLint: true,
      needsApiCheck: true,
      needsExports: true,
    },
  )
  .addArchetype(
    "configPackages",
    ["@conjure-lite/tsconfig"],
    {
      private: false,
      needsBuild: false,
      needsLint: false,
      needsApiCheck: false,
      needsExports: false,
    },
  )
  .addArchetype(
    "examplePackages",
    ["conjure-lite.example"],
    {
      private: true,
      needsBuild: true,
      needsLint: true,
      needsApiCheck: false,
      needsExports: false,
      isExample: true,
    },
  )
  .addArchetype(
    "rootPackage",
    ["conjure-lite-repo"],
    {
      private: true,
      repositoryUrl: false,
      needsBuild: false,
      needsLint: true,
      needsApiCheck: false,
      needsExports: false,
    },
  );

export default {
  rules: [
    // Apply archetype rules
    ...archetypeRules.buildRules(),

    // Global rules that apply to all packages
    packageOrder({
      options: {
        order: [
          "name",
          "version",
          "description",
          "author",
          "license",
          "private",
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

    alphabeticalDependencies({
      includeWorkspaceRoot: true,
    }),

    alphabeticalScripts({
      includeWorkspaceRoot: true,
    }),

    consistentDependencies({}),

    // Ban problematic dependencies
    bannedDependencies({
      options: {
        bannedDependencies: [
          "lodash", // Use individual lodash functions or native alternatives
          "moment", // Use date-fns or native Date
          "request", // Use fetch or axios
        ],
      },
    }),
  ],
};
