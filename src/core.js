import { prepareShape, createGeometryBuffer } from "./geometry.js";
import { compileProgram, registerPreset } from "./shaderCompiler.js";
import { setUniforms, validateUniforms } from "./uniforms.js";
import { BUILTIN_PRESETS } from "./presets/builtin.js";

/**
 * Hook de inicialización - Crea estado por-instancia
 */
function initShaderShapes() {
  this._shaderShapes = {
    shapes: [], // Shapes creadas (stateful)
    gl: null, // Contexto WebGL
    programCache: {}, // Caché de programas compilados
    presets: new Map(), // Registro de shader presets
  };

  // Registrar presets built-in
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

  // Obtener contexto WebGL si no está disponible
  if (!this._shaderShapes.gl) {
    this._shaderShapes.gl = this._renderer.GL;

    // Configurar WebGL
    const gl = this._shaderShapes.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  const gl = this._shaderShapes.gl;

  // Validar uniforms (solo warnings, no bloquea)
  validateUniforms(options, type, this._shaderShapes);

  // Preparar geometría
  const geometry = prepareShape(coords, this.width, this.height, options);
  const buffer = createGeometryBuffer(gl, geometry.vertices);

  // Crear shape object
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
    // Obtener/compilar programa
    const program = compileProgram(gl, shape.type, this._shaderShapes);
    if (!program) {
      console.warn(`Shader preset "${shape.type}" not found`);
      continue;
    }

    gl.useProgram(program);

    // Bindear geometría
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aPos);

    const aUv = gl.getAttribLocation(program, "a_uv");
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(aUv);

    // Aplicar uniforms
    setUniforms(gl, program, shape.type, shape.options, t, this._shaderShapes);

    // Dibujar
    gl.drawArrays(gl.TRIANGLES, 0, shape.geometry.count);
  }
}

/**
 * Dibuja una shape específica por su ID
 */
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

/**
 * Elimina una shape específica
 */
function removeShaderShape(id) {
  if (!this._shaderShapes) return false;

  const index = this._shaderShapes.shapes.findIndex((s) => s.id === id);
  if (index === -1) return false;

  // Liberar buffer de WebGL
  const shape = this._shaderShapes.shapes[index];
  this._shaderShapes.gl.deleteBuffer(shape.buffer);

  this._shaderShapes.shapes.splice(index, 1);
  return true;
}

/**
 * Limpia todas las shapes
 */
function clearShaderShapes() {
  if (!this._shaderShapes) return;

  // Liberar buffers
  const gl = this._shaderShapes.gl;
  this._shaderShapes.shapes.forEach((shape) => {
    gl.deleteBuffer(shape.buffer);
  });

  this._shaderShapes.shapes = [];
}

/**
 * Registra un preset custom
 */
function registerShaderPreset(name, definition) {
  if (!this._shaderShapes) {
    console.error("ShaderShapes not initialized");
    return false;
  }

  return registerPreset(name, definition, this._shaderShapes);
}

/**
 * Lista todos los presets disponibles
 */
function listShaderPresets() {
  if (!this._shaderShapes) return [];
  return Array.from(this._shaderShapes.presets.keys());
}

// Registrar métodos en p5.prototype
if (typeof p5 !== "undefined") {
  p5.prototype.registerMethod("init", initShaderShapes);
  p5.prototype.createShaderShape = createShaderShape;
  p5.prototype.drawShaderShapes = drawShaderShapes;
  p5.prototype.drawShaderShape = drawShaderShape;
  p5.prototype.removeShaderShape = removeShaderShape;
  p5.prototype.clearShaderShapes = clearShaderShapes;
  p5.prototype.registerShaderPreset = registerShaderPreset;
  p5.prototype.listShaderPresets = listShaderPresets;
}
