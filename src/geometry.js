import earcut from "earcut";
import { smoothCurve } from "./curves.js";

/**
 *
 * @param {Array|Object} coords
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {Object} options - { smooth, smoothness, closed }
 * @returns {Object} { vertices, count, buffer }
 */
export function prepareShape(coords, canvasWidth, canvasHeight, options = {}) {
  let finalCoords;

  if (coords.type && coords.points) {
    finalCoords = coords.points;
    options.smooth = coords.type === "curve";
    options.closed = coords.closed !== undefined ? coords.closed : true;
  } else {
    finalCoords = coords;
  }

  if (options.smooth) {
    const segments = Math.floor((options.smoothness || 0.5) * 20);
    const closed = options.closed !== undefined ? options.closed : true;
    finalCoords = smoothCurve(finalCoords, segments, closed);
  }

  const flat = [];
  finalCoords.forEach(([x, y]) => flat.push(x, y));
  const indices = earcut(flat);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  finalCoords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  const wShape = maxX - minX || 1;
  const hShape = maxY - minY || 1;

  const vertices = [];
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i] * 2;
    const x = flat[idx];
    const y = flat[idx + 1];

    const u = (x - minX) / wShape;
    const v = (y - minY) / hShape;

    const nx = (x / canvasWidth) * 2 - 1;
    const ny = 1 - (y / canvasHeight) * 2;

    vertices.push(nx, ny, u, v);
  }

  return {
    vertices: new Float32Array(vertices),
    count: indices.length,
  };
}

export function createGeometryBuffer(gl, vertices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  return buffer;
}
