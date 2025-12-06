import { prepareShape, createGeometryBuffer } from "./geometry.js";
import { compileProgram, registerPreset } from "./shaderCompiler.js";
import { setUniforms, validateUniforms } from "./uniforms.js";
import { BUILTIN_PRESETS } from "./presets/builtin.js";

function initShaderShapes() {
  this._shaderShapes = {
    shapes: [],
    gl: null,
    programCache: {},
    presets: new Map(),
  };

  Object.entries(BUILTIN_PRESETS).forEach(([name, preset]) => {
    this._shaderShapes.presets.set(name, preset);
  });
}

/**
 * Crea una shape con shader
 * @param {string} type - Nombre del preset ('lava', 'fluid', etc)
 * @param {Array|Object} coords - Coordenadas o configuración
 * @param {Object} options - Opciones del shader y geometría
 * @returns {string} ID de la shape para manipulación posterior
 */
function createShaderShape(type, coords, options = {}) {
  if (!this._shaderShapes) {
    console.error(
      "ShaderShapes not initialized. Make sure p5 is in WEBGL mode."
    );
    return null;
  }

  if (!this._shaderShapes.gl) {
    this._shaderShapes.gl = this._renderer.GL;

    const gl = this._shaderShapes.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  const gl = this._shaderShapes.gl;

  validateUniforms(options, type, this._shaderShapes);

  const geometry = prepareShape(coords, this.width, this.height, options);
  const buffer = createGeometryBuffer(gl, geometry.vertices);

  const shape = {
    id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    coords,
    options,
    geometry,
    buffer,
  };

  this._shaderShapes.shapes.push(shape);

  return shape.id;
}

/**
 * Dibuja todas las shapes creadas
 * @param {number} time - Tiempo en segundos (opcional, usa millis() si no se provee)
 */
function drawShaderShapes(time) {
  if (!this._shaderShapes || !this._shaderShapes.gl) return;

  const gl = this._shaderShapes.gl;
  const t = time !== undefined ? time : this.millis() * 0.001;

  for (const shape of this._shaderShapes.shapes) {
    const program = compileProgram(gl, shape.type, this._shaderShapes);
    if (!program) {
      console.warn(`Shader preset "${shape.type}" not found`);
      continue;
    }

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aPos);

    const aUv = gl.getAttribLocation(program, "a_uv");
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(aUv);

    setUniforms(gl, program, shape.type, shape.options, t, this._shaderShapes);

    gl.drawArrays(gl.TRIANGLES, 0, shape.geometry.count);
  }
}

function drawShaderShape(id, time) {
  if (!this._shaderShapes || !this._shaderShapes.gl) return;

  const shape = this._shaderShapes.shapes.find((s) => s.id === id);
  if (!shape) {
    console.warn(`Shape with id "${id}" not found`);
    return;
  }

  const gl = this._shaderShapes.gl;
  const t = time !== undefined ? time : this.millis() * 0.001;

  const program = compileProgram(gl, shape.type, this._shaderShapes);
  if (!program) return;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);

  const aPos = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aPos);

  const aUv = gl.getAttribLocation(program, "a_uv");
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
  gl.enableVertexAttribArray(aUv);

  setUniforms(gl, program, shape.type, shape.options, t, this._shaderShapes);
  gl.drawArrays(gl.TRIANGLES, 0, shape.geometry.count);
}

function removeShaderShape(id) {
  if (!this._shaderShapes) return false;

  const index = this._shaderShapes.shapes.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const shape = this._shaderShapes.shapes[index];
  this._shaderShapes.gl.deleteBuffer(shape.buffer);

  this._shaderShapes.shapes.splice(index, 1);
  return true;
}

function clearShaderShapes() {
  if (!this._shaderShapes) return;

  const gl = this._shaderShapes.gl;
  this._shaderShapes.shapes.forEach((shape) => {
    gl.deleteBuffer(shape.buffer);
  });

  this._shaderShapes.shapes = [];
}

function registerShaderPreset(name, definition) {
  if (!this._shaderShapes) {
    console.error("ShaderShapes not initialized");
    return false;
  }

  return registerPreset(name, definition, this._shaderShapes);
}

function listShaderPresets() {
  if (!this._shaderShapes) return [];
  return Array.from(this._shaderShapes.presets.keys());
}

function getTexturePath(basePath) {
  return basePath.replace("presets/", "textures/");
}

/**
 * Carga un preset dinámicamente desde un archivo externo
 * Soporta carga automática de imágenes definidas en 'textures'
 */
function loadShaderPreset(name, path) {
  if (!this._shaderShapes) {
    console.error("ShaderShapes not initialized");
    return Promise.reject(new Error("ShaderShapes not initialized"));
  }

  let basePath;

  if (path !== undefined) {
    basePath = path;
  } else {
    const currentPath = window.location.pathname;
    const segments = currentPath
      .split("/")
      .filter((s) => s && s !== "index.html");
    const levelsUp = segments.length;

    if (levelsUp === 0) {
      basePath = "node_modules/p5.shadershapes/dist/presets/";
    } else {
      basePath = "../".repeat(levelsUp) + "dist/presets/";
    }
  }

  const fullPath = `${basePath}${name}.js`;

  console.log(`📦 Loading shader preset "${name}"`);

  return fetch(fullPath)
    .then((response) => {
      if (!response.ok) {
        if (basePath === "node_modules/p5.shadershapes/dist/presets/") {
          const altPath = `dist/presets/${name}.js`;
          return fetch(altPath).then((altResponse) => {
            if (!altResponse.ok) throw new Error("Preset not found");
            basePath = "dist/presets/";
            return altResponse;
          });
        }
        throw new Error(`Failed to load preset: ${response.statusText}`);
      }
      return response;
    })
    .then((response) => response.text())
    .then((code) => {
      const blob = new Blob([code], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);

      return import(url).then((module) => {
        URL.revokeObjectURL(url);
        const preset = module.default;

        if (!preset || !preset.fragment) {
          throw new Error(`Invalid preset "${name}": missing fragment shader`);
        }

        const texturePromises = [];
        const loadedTextures = {};

        if (preset.textures) {
          const texPath = getTexturePath(basePath);

          Object.entries(preset.textures).forEach(([uniformName, fileName]) => {
            const imgUrl = `${texPath}${fileName}`;
            console.log(`   🖼️ Loading texture: ${fileName}`);

            const p = new Promise((resolve, reject) => {
              const loader =
                this.loadImage || p5.prototype.loadImage || window.loadImage;
              if (loader) {
                loader.call(this, imgUrl, resolve, reject);
              } else {
                reject(new Error("p5 loadImage function not found"));
              }
            });

            texturePromises.push(
              p.then((img) => {
                loadedTextures[uniformName] = img;
              })
            );
          });
        }

        return Promise.all(texturePromises).then(() => {
          this._shaderShapes.presets.set(name, {
            vertex: preset.vertex || null,
            fragment: preset.fragment,
            uniforms: preset.uniforms || {},
            metadata: preset.metadata || {},
            cachedTextures: loadedTextures,
          });

          console.log(`✅ Preset "${name}" loaded.`);

          if (this._decrementPreload) {
            this._decrementPreload();
          }

          return preset;
        });
      });
    })
    .catch((error) => {
      console.error(`❌ Error loading preset "${name}":`, error);
      if (this._decrementPreload) this._decrementPreload();
      throw error;
    });
}

if (typeof p5 !== "undefined") {
  p5.prototype.registerMethod("init", initShaderShapes);
  p5.prototype.createShaderShape = createShaderShape;
  p5.prototype.drawShaderShapes = drawShaderShapes;
  p5.prototype.drawShaderShape = drawShaderShape;
  p5.prototype.removeShaderShape = removeShaderShape;
  p5.prototype.clearShaderShapes = clearShaderShapes;
  p5.prototype.registerShaderPreset = registerShaderPreset;
  p5.prototype.listShaderPresets = listShaderPresets;

  p5.prototype.loadShaderPreset = loadShaderPreset;
  p5.prototype.registerPreloadMethod("loadShaderPreset", p5.prototype);
}
