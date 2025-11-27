
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}


function interpolatePoint(p0, p1, p2, p3, t) {
  return [
    catmullRom(p0[0], p1[0], p2[0], p3[0], t),
    catmullRom(p0[1], p1[1], p2[1], p3[1], t),
  ];
}

/**
 * @param {Array} points - Array  [x, y]
 * @param {number} segments - Points
 * @param {boolean} closed
 */
export function smoothCurve(points, segments = 10, closed = true) {
  if (points.length < 3) return points;

  const result = [];
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p0 = closed
      ? points[(i - 1 + len) % len]
      : i === 0
      ? points[i]
      : points[i - 1];
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const p3 = closed
      ? points[(i + 2) % len]
      : i >= len - 2
      ? points[len - 1]
      : points[i + 2];

    for (let t = 0; t < 1; t += 1 / segments) {
      result.push(interpolatePoint(p0, p1, p2, p3, t));
    }
  }

  return result;
}

export function simplifyPath(points, tolerance = 1.0) {
  //algoritmo Ramer-Douglas-Peucker
  if (points.length <= 2) return points;

  function perpDistance(point, lineStart, lineEnd) {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0)
      return Math.sqrt(
        Math.pow(point[0] - lineStart[0], 2) +
          Math.pow(point[1] - lineStart[1], 2)
      );
    const u =
      ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) /
      (mag * mag);
    const x = lineStart[0] + u * dx;
    const y = lineStart[1] + u * dy;
    return Math.sqrt(Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2));
  }

  function rdp(points, start, end, tolerance) {
    let maxDist = 0;
    let maxIndex = 0;

    for (let i = start + 1; i < end; i++) {
      const dist = perpDistance(points[i], points[start], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > tolerance) {
      const left = rdp(points, start, maxIndex, tolerance);
      const right = rdp(points, maxIndex, end, tolerance);
      return [...left.slice(0, -1), ...right];
    } else {
      return [points[start], points[end]];
    }
  }

  return rdp(points, 0, points.length - 1, tolerance);
}
