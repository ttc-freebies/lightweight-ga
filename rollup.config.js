import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

module.exports = {
  input: "src/minimal-analytics-snippet.js",
  output: {
    file: "dist/script.js",
    format: "iife",
  },
  plugins: [
    replace({
      "XX-XXXXXXXXX-X": "$siteCodeGA",
      "anonymizeIp: true": "anonymizeIp:$anonymizedIp",
      "colorDepth: true": "colorDepth:$colorDepth",
      "characterSet: true": "characterSet:$characterSet",
      "screenSize: true": "screenSize:$screenSize",
      "language: true": "language:$language",
      delimiters: ["", ""],
    }),
    babel({
      babelrc: false,
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
          },
        ],
      ],
    }),
    terser(),
  ],
};
