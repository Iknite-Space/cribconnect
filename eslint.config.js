// eslint.config.js
import eslintPluginReact from "eslint-plugin-react";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.jsx", "**/*.tsx"],
    plugins: {
      react: eslintPluginReact
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
];
