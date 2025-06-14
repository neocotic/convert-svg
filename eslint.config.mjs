import jsPlugin from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { createNodeResolver, importX } from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tsPlugin from "typescript-eslint";

export default defineConfig([
  globalIgnores(["packages/*/dist/"]),
  jsPlugin.configs.recommended,
  // eslint-disable-next-line import-x/no-named-as-default-member
  tsPlugin.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver(),
        createNodeResolver(),
      ],
    },
  },
  prettierPlugin,
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "import-x/order": [
        "error",
        {
          alphabetize: { order: "asc" },
          named: true,
        },
      ],
    },
  },
]);
