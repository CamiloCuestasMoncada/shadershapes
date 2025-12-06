/**
 * Presets built-in (incluidos en el bundle principal)
 */

export const BUILTIN_PRESETS = {
  solid: {
    fragment: `
        precision mediump float;
        varying vec2 v_uv;
        uniform vec3 u_color;
        uniform float u_gradient;
        
        void main() {
          float g = 1.0 - v_uv.y * u_gradient;
          gl_FragColor = vec4(u_color * g, 1.0);
        }
      `,
    uniforms: {
      u_color: { type: "vec3", default: [0.5, 0.5, 0.5] },
      u_gradient: { type: "float", default: 0.5 },
    },
    metadata: {
      name: "Solid Color",
      description: "Simple solid color with optional vertical gradient",
      author: "p5.shadershapes",
      version: "1.0.0",
    },
  },

  gradient: {
    fragment: `
        precision mediump float;
        varying vec2 v_uv;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform float u_angle;
        
        void main() {
          // Rotar UVs según ángulo
          float rad = u_angle * 3.14159 / 180.0;
          vec2 rotated = vec2(
            v_uv.x * cos(rad) - v_uv.y * sin(rad),
            v_uv.x * sin(rad) + v_uv.y * cos(rad)
          );
          
          float t = clamp(rotated.x, 0.0, 1.0);
          vec3 color = mix(u_color1, u_color2, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    uniforms: {
      u_color1: { type: "vec3", default: [1.0, 0.0, 0.0] },
      u_color2: { type: "vec3", default: [0.0, 0.0, 1.0] },
      u_angle: { type: "float", default: 0.0 },
    },
    metadata: {
      name: "Gradient",
      description: "Linear gradient between two colors with adjustable angle",
      author: "p5.shadershapes",
    },
  },

  lava: {
    fragment: `
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_time;
        uniform float u_temperature;
        uniform float u_viscosity;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          mat2 rot = mat2(1.6, -1.2, 1.2, 1.6);
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p = rot * p * 1.4;
            amplitude *= 0.55;
          }
          return value;
        }
        
        void main() {
          vec2 uv = v_uv * 2.0 - 1.0;
          uv.x *= 1.2;
          float t = u_time * (0.5 * u_viscosity);
          vec2 p = uv * 1.5;
          
          float q = fbm(p + vec2(t * 0.5, t * 0.3));
          float r = fbm(p + q + vec2(t * 0.1, -t * 0.2));
          float f = fbm(p + r);
          
          vec3 col = vec3(0.0);
          col.r = smoothstep(0.2, 0.6, f) * u_temperature * 0.2;
          col.g = pow(f, 1.5) * 0.8 * u_temperature * 0.16;
          col.b = pow(f, 3.0) * 0.3 * u_temperature * 0.06;
          
          col = mix(vec3(0.15, 0.05, 0.02), col, 1.5);
          col += 0.05 * sin(u_time + f * 10.0);
          
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    uniforms: {
      u_temperature: { type: "float", default: 5.0 },
      u_viscosity: { type: "float", default: 1.0 },
    },
    metadata: {
      name: "Lava",
      description:
        "Animated lava texture with adjustable temperature and viscosity",
      author: "p5.shadershapes",
    },
  },

  fluid: {
    fragment: `
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_time;
        uniform float u_speed;
        uniform float u_scale;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = rot * p * 2.0 + 0.2;
            a *= 0.5;
          }
          return v;
        }
        
        void main() {
          vec2 uv = v_uv;
          uv.y += 0.1;
          float t = u_time * u_speed;
          
          vec2 q = vec2(0.0);
          q.x = fbm(uv * u_scale + 0.2 * t);
          q.y = fbm(uv * u_scale + vec2(5.2, 1.3) + 0.3 * t);
          
          vec2 r = vec2(0.0);
          r.x = fbm(uv * u_scale + 4.0 * q + vec2(1.7, 9.2) + 0.5 * t);
          r.y = fbm(uv * u_scale + 4.0 * q + vec2(8.3, 2.8) + 0.4 * t);
          
          float f = fbm(uv * u_scale + 4.0 * r);
          
          vec3 col = mix(u_color1, u_color2, clamp(f * f * 2.0, 0.0, 1.0));
          col = mix(col, u_color3, clamp(length(q), 0.0, 1.0));
          col = mix(col, u_color4, clamp(r.x, 0.0, 1.0));
          
          gl_FragColor = vec4(col * 1.1, 1.0);
        }
      `,
    uniforms: {
      u_speed: { type: "float", default: 0.2 },
      u_scale: { type: "float", default: 1.0 },
      u_color1: { type: "vec3", default: [0.0, 0.05, 0.2] },
      u_color2: { type: "vec3", default: [0.1, 0.3, 0.6] },
      u_color3: { type: "vec3", default: [0.8, 0.2, 0.5] },
      u_color4: { type: "vec3", default: [1.0, 0.7, 0.1] },
    },
    metadata: {
      name: "Fluid",
      description: "Artistic fluid shader with multi-color blending",
      author: "p5.shadershapes",
    },
  },

  water: {
    fragment: `
        precision mediump float;
        varying vec2 v_uv;
        uniform float u_time;
        uniform float u_speed;
        uniform vec3 u_color;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = v_uv;
          float wave = sin(uv.x * 10.0 + u_time * u_speed) * 0.05;
          uv.y += wave;
          
          float n = noise(uv * 20.0 + u_time * 0.5);
          vec3 col = u_color + n * 0.1;
          
          gl_FragColor = vec4(col, 0.8);
        }
      `,
    uniforms: {
      u_speed: { type: "float", default: 2.0 },
      u_color: { type: "vec3", default: [0.2, 0.5, 0.8] },
    },
    metadata: {
      name: "Water",
      description: "Simple animated water effect",
      author: "p5.shadershapes",
    },
  },
};
