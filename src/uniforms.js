/**
 * src/uniforms.js
 * Maneja la inyección de variables (uniforms) y texturas en WebGL.
 */

// Usamos WeakMap para que si la imagen de p5 se borra, la referencia aquí también se limpie.
const textureCache = new WeakMap();

function bindTexture(gl, program, uniformName, p5Image, unit) {
  const loc = gl.getUniformLocation(program, uniformName);
  if (!loc) return;

  let tex = textureCache.get(p5Image);

  if (!tex) {
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const resource = p5Image.canvas || p5Image.elt;

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      resource
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    textureCache.set(p5Image, tex);
  }

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(loc, unit);
}

function detectUniformType(value) {
  if (typeof value === "number") return "float";
  if (typeof value === "boolean") return "bool";
  if (Array.isArray(value)) {
    switch (value.length) {
      case 2:
        return "vec2";
      case 3:
        return "vec3";
      case 4:
        return "vec4";
      default:
        return "unknown";
    }
  }
  return "unknown";
}

function applyUniform(gl, location, value, type) {
  if (!location) return;

  switch (type) {
    case "float":
      gl.uniform1f(location, value);
      break;
    case "int":
    case "bool":
      gl.uniform1i(location, value);
      break;
    case "vec2":
      gl.uniform2fv(location, value);
      break;
    case "vec3":
      gl.uniform3fv(location, value);
      break;
    case "vec4":
      gl.uniform4fv(location, value);
      break;
    default:
      break;
  }
}

export function setUniforms(
  gl,
  program,
  presetName,
  userOptions,
  time,
  shaderShapesState
) {
  const preset = shaderShapesState.presets.get(presetName);
  if (!preset) return;

  const timeLocation = gl.getUniformLocation(program, "u_time");
  if (timeLocation) {
    gl.uniform1f(timeLocation, time);
  }

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  if (resolutionLocation) {
    // gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  if (preset.cachedTextures) {
    let texUnit = 0;
    Object.entries(preset.cachedTextures).forEach(([uniformName, p5Img]) => {
      bindTexture(gl, program, uniformName, p5Img, texUnit);
      texUnit++;
    });
  }

  const presetUniforms = preset.uniforms || {};

  const finalUniforms = { ...presetUniforms };

  Object.keys(userOptions).forEach((key) => {
    if (
      key === "smooth" ||
      key === "smoothness" ||
      key === "closed" ||
      key === "id"
    ) {
      return;
    }
    finalUniforms[key] = userOptions[key];
  });

  // Aplicar cada uniform
  Object.entries(finalUniforms).forEach(([name, config]) => {
    if (preset.cachedTextures && preset.cachedTextures[name]) return;

    const location = gl.getUniformLocation(program, name);
    if (!location) return;

    let value, type;

    if (config && typeof config === "object" && !Array.isArray(config)) {
      type = config.type;

      if (userOptions[name] !== undefined) {
        value = userOptions[name];
        if (!type) type = detectUniformType(value);
      } else {
        value = config.value !== undefined ? config.value : config.default;
      }
    } else {
      value = config;
      type = detectUniformType(value);
    }

    applyUniform(gl, location, value, type);
  });
}

/**
 * Valida que los uniforms del usuario coincidan con el preset
 */
export function validateUniforms(userOptions, presetName, shaderShapesState) {
  const preset = shaderShapesState.presets.get(presetName);
  if (!preset) return;

  const presetUniforms = preset.uniforms || {};
  const validKeys = new Set(Object.keys(presetUniforms));

  validKeys.add("u_time");
  validKeys.add("u_resolution");

  validKeys.add("smooth");
  validKeys.add("smoothness");
  validKeys.add("closed");
  validKeys.add("id");

  Object.keys(userOptions).forEach((key) => {
    if (!validKeys.has(key)) {
      // console.warn(`Unknown uniform...`);
    }
  });
}
