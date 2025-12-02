import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([

  // FRONTEND (React)
  {
    files: ["frontend/**/*.{js,jsx}"],
    plugins: { js, react: pluginReact },
    extends: ["js/recommended", pluginReact.configs.flat.recommended],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // BACKEND (Node)
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,   // <<--- SOLUCIONA "process is not defined"
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },

]);
