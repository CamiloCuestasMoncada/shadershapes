/**
 * Compila un shader (vertex o fragment)
 */
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Crea y linkea un programa WebGL
 */
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  // Limpiar shaders (ya están linkeados)
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

/**
 * Shader vertex por defecto (usado por todos los presets)
 */
const DEFAULT_VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    
    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

/**
 * Obtiene o compila un programa shader
 * @param {WebGLRenderingContext} gl
 * @param {string} presetName - Nombre del preset
 * @param {Object} shaderShapesState - Estado de la librería
 * @returns {WebGLProgram|null}
 */
export function compileProgram(gl, presetName, shaderShapesState) {
  // Verificar caché
  if (shaderShapesState.programCache[presetName]) {
    return shaderShapesState.programCache[presetName];
  }

  // Buscar preset
  const preset = shaderShapesState.presets.get(presetName);
  if (!preset) {
    console.error(`Shader preset "${presetName}" not registered`);
    return null;
  }

  // Usar vertex shader del preset o el default
  const vertexSource = preset.vertex || DEFAULT_VERTEX_SHADER;
  const fragmentSource = preset.fragment;

  if (!fragmentSource) {
    console.error(`Preset "${presetName}" has no fragment shader`);
    return null;
  }

  // Compilar y cachear
  const program = createProgram(gl, vertexSource, fragmentSource);
  if (program) {
    shaderShapesState.programCache[presetName] = program;
  }

  return program;
}

/**
 * Registra un preset de shader
 * @param {string} name - Nombre único del preset
 * @param {Object} definition - { vertex?, fragment, uniforms?, metadata? }
 * @param {Object} shaderShapesState - Estado de la librería
 */
export function registerPreset(name, definition, shaderShapesState) {
  if (shaderShapesState.presets.has(name)) {
    console.warn(`Shader preset "${name}" already registered. Overwriting.`);
  }

  // Validar que tenga al menos fragment shader
  if (!definition.fragment) {
    console.error(`Cannot register preset "${name}": missing fragment shader`);
    return false;
  }

  shaderShapesState.presets.set(name, {
    vertex: definition.vertex || null,
    fragment: definition.fragment,
    uniforms: definition.uniforms || {},
    metadata: definition.metadata || {},
  });

  // Invalidar caché si existía
  delete shaderShapesState.programCache[name];

  return true;
}
