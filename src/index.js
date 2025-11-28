/**
 * p5.shadershapes - Beautiful fluid shaders for p5.js
 * @version 1.0.0
 * @author Tu Nombre
 * @license MIT
 */

import "./core.js";
import "./geometry.js";
import "./curves.js";
import "./shaderCompiler.js";
import "./uniforms.js";
import "./presets/builtin.js";

if (typeof window !== "undefined") {
  window.P5_SHADERSHAPES_VERSION = "1.0.0";
}

if (typeof console !== "undefined" && console.log) {
  console.log(
    "%cp5.shadershapes v1.0.0",
    "color: #ed225d; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%cBeautiful fluid shaders without WebGL knowledge",
    "color: #888; font-size: 11px;"
  );
}
