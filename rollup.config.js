import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

// Leemos el package.json manualmente porque 'require' no existe en ESM
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const banner = `/*!
 * p5.shadershapes v${pkg.version}
 * Beautiful fluid shaders for p5.js without WebGL knowledge
 * 
 * Copyright (c) ${new Date().getFullYear()} Tu Nombre
 * Licensed under MIT (https://github.com/tuuser/p5.shadershapes/blob/main/LICENSE)
 */`;

const config = [
  // ========================================
  // UMD build (para <script src="...">)
  // ========================================
  {
    input: "src/index.js",
    output: {
      file: "dist/p5.shadershapes.js",
      format: "iife",
      name: "p5ShaderShapes",
      banner: banner,
      globals: {
        p5: "p5",
      },
    },
    external: ["p5"],
    plugins: [resolve(), commonjs()],
  },

  // ========================================
  // UMD minificado
  // ========================================
  {
    input: "src/index.js",
    output: {
      file: "dist/p5.shadershapes.min.js",
      format: "iife",
      name: "p5ShaderShapes",
      banner: banner,
      globals: {
        p5: "p5",
      },
    },
    external: ["p5"],
    plugins: [
      resolve(),
      commonjs(),
      terser({
        format: {
          comments: /^!/, // Mantener comentarios que empiezan con !
        },
      }),
    ],
  },

  // ========================================
  // ESM build (para import moderno)
  // ========================================
  {
    input: "src/index.js",
    output: {
      file: "dist/p5.shadershapes.esm.js",
      format: "es",
      banner: banner,
    },
    external: ["p5", "earcut"],
    plugins: [resolve(), commonjs()],
  },
];

export default config;
