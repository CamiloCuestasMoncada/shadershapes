# p5.shadershapes

Beautiful fluid shaders for p5.js without WebGL knowledge.

## 🚀 Quick Start
```html
<!-- Include p5.js -->
<script src="https://cdn.jsdelivr.net/npm/p5@1.4.1/lib/p5.min.js"></script>

<!-- Include p5.shadershapes -->
<script src="https://cdn.jsdelivr.net/npm/p5.shadershapes"></script>

<script>
function setup() {
  createCanvas(800, 600, WEBGL);
  
  // Create a lava shape
  createShaderShape('lava', [
    [100, 200], [700, 200], [700, 600], [100, 600]
  ], {
    u_temperature: 5.0,
    u_viscosity: 0.8
  });
}

function draw() {
  background(0);
  drawShaderShapes();
}
</script>
```

## 📦 Installation

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/p5.shadershapes"></script>
```

### npm
```bash
npm install p5.shadershapes
```

### Manual Download
Download from [releases](https://github.com/tuuser/p5.shadershapes/releases)

## 🎨 Built-in Presets

- **solid** - Solid color with gradient
- **gradient** - Linear gradient between two colors
- **lava** - Animated lava texture
- **fluid** - Artistic fluid shader
- **water** - Animated water effect

## 📚 API Reference

### `createShaderShape(type, coords, options)`

Creates a new shader shape.

**Parameters:**
- `type` (String) - Preset name ('lava', 'fluid', etc.)
- `coords` (Array) - Array of [x, y] coordinates
- `options` (Object) - Shader parameters and geometry options

**Returns:** String (shape ID)

**Example:**
```javascript
let id = createShaderShape('lava', [
  [100, 100], [200, 100], [200, 200], [100, 200]
], {
  smooth: true,
  smoothness: 0.7,
  u_temperature: 5.0
});
```

### `drawShaderShapes(time)`

Draws all created shapes.

**Parameters:**
- `time` (Number, optional) - Time in seconds

### `removeShaderShape(id)`

Removes a specific shape.

### `clearShaderShapes()`

Removes all shapes.

### `listShaderPresets()`

Returns array of available preset names.

## 🌊 Smooth Curves

Create organic shapes with smooth curves:
```javascript
createShaderShape('water', [
  [100, 200],
  [300, 180],
  [500, 220],
  [600, 300]
], {
  smooth: true,        // Enable smoothing
  smoothness: 0.8,     // 0-1, higher = smoother
  closed: true         // Close the shape
});
```

## 🎯 Examples

See the `examples/` folder for:
- Basic landscape with lava
- Curved lake shapes
- Gradient grids
- And more!

## 📖 Documentation

Full documentation: [Link to docs site]

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT © Tu Nombre

## 🙏 Credits

- Built with [p5.js](https://p5js.org/)
- Uses [earcut](https://github.com/mapbox/earcut) for triangulation
```

---

## **10. LICENSE**

Crea el archivo `LICENSE`:
```
MIT License

Copyright (c) 2025 Tu Nombre

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.