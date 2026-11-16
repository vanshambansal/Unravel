// Adapted from user-supplied React Bits SideRays, Copyright 2026 David Haz.
import { RayMotion } from './ray-motion';
// Original shader retained; MIT + Commons Clause notice: /landing/licenses/react-bits.txt.
const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBlend;
uniform float uIntensity;
uniform float uSpread;
uniform float uDensity;
uniform float uSharpness;
uniform float uFalloff;
uniform float uGlow;
uniform float uSaturation;
uniform float uDust;
uniform float uOpacity;
uniform float uReveal;
uniform float uLight;
uniform vec3 uFrame;
uniform vec3 uSource;
uniform float uAim;
uniform vec3 uFocus;
uniform float uSway;
uniform vec3 uMaskRect;
uniform vec2 uMaskFade;
uniform float uOpening;
out vec4 fragColor;

// Apply the same CSS-space aperture in this existing draw. Two intersecting CSS
// masks otherwise require additional full-canvas compositor surfaces each frame.
float aperture() {
  vec2 p = vec2(gl_FragCoord.x / uResolution.x, 1.0 - gl_FragCoord.y / uResolution.y);
  if (uOpening > 0.5) {
    return clamp((p.x - uMaskRect.x) / uMaskFade.x, 0.0, 1.0)
      * clamp((uMaskRect.y - p.x) / uMaskFade.x, 0.0, 1.0)
      * clamp((uMaskRect.z - p.y) / uMaskFade.y, 0.0, 1.0);
  }
  return clamp((p.y - 0.08) / 0.14, 0.0, 1.0) * clamp((0.94 - p.y) / 0.19, 0.0, 1.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float shafts(float u, float t, float seed, float aa) {
  float sway = (0.4 * sin(t * 0.31 + seed) + 0.24 * sin(t * 0.17 + seed * 2.3)) * uSway;
  float n = 0.7 * noise(vec2(u + sway + seed, t * 0.3)) + 0.3 * noise(vec2(u * 2.4 + sway * 1.5 + seed * 1.7, t * 0.45 + 3.0));
  float width = mix(0.5, 0.1, uSharpness);
  float s = mix(smoothstep(0.5 - width, 0.5 + width, n), 0.5, aa);
  return mix(0.05, 1.0, s);
}

float motes(vec2 p, float cell, float t, float seed) {
  p += vec2(t * 0.021, -t * 0.013) + seed * 7.31;
  vec2 grid = p / cell;
  vec2 id = floor(grid);
  vec2 f = grid - id;
  float h = hash(id + seed);
  if (h > 0.5) return 0.0;
  vec2 center = 0.25 + 0.5 * vec2(hash(id + 1.7 + seed), hash(id + 3.1 + seed));
  center += 0.1 * vec2(sin(t * 0.7 + h * 31.0), cos(t * 0.6 + h * 23.0));
  float size = mix(0.035, 0.09, hash(id + 5.3 + seed));
  float edge = length(fwidth(grid)) * 0.7;
  float twinkle = 0.55 + 0.45 * sin(t * 1.9 + h * 41.0);
  return (1.0 - smoothstep(size - edge, size + edge, length(f - center))) * twinkle;
}

void main() {
  float mask = aperture();
  if (mask <= 0.0) { fragColor = vec4(0.0); return; }
  float aspect = uResolution.x / uResolution.y;
  vec2 q = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  if (uFrame.x > 0.5) q.x = -q.x;
  if (uFrame.y > 0.5) q.y = -q.y;
  vec2 source = uSource.xy;
  float heading = uSource.z + uAim + 0.035 * sin(uTime * 0.21) * uSway;
  vec2 v = q - source;
  float r = length(v);
  float angle = mod(atan(v.y, v.x) - heading + 3.14159265, 6.28318531) - 3.14159265;
  float t = uTime;
  float u = angle * uDensity;
  float aa = smoothstep(0.12, 0.45, fwidth(u));
  float offset = uSpread * 0.22;
  float fanA = exp(-pow((angle + offset) / uSpread, 2.0) * 1.4);
  float fanB = exp(-pow((angle - offset) / (uSpread * 1.15), 2.0) * 1.4);
  float focus = 1.0 + uFocus.z * exp(-pow((angle - uFocus.x) / uFocus.y, 2.0));
  float lightA = fanA * shafts(u, t, 0.0, aa) * focus;
  float lightB = fanB * shafts(u * 0.83, t * 0.6, 17.0, aa) * focus;
  float reach = 1.0 / (1.0 + pow(r / 0.4, uFalloff));
  vec3 glowColor = mix(uColorA, uColorB, uBlend);
  vec3 light = (uColorA * lightA * (1.0 - uBlend) + uColorB * lightB * uBlend) * 2.0 * reach;
  light += glowColor * uGlow * exp(-pow(r / 0.4, 2.0));
  if (uDust > 0.0) {
    float sparkle = motes(q, 0.06, t, 0.0) + 0.7 * motes(q, 0.038, t * 0.8, 9.0);
    light += mix(glowColor, vec3(1.0), 0.6) * sparkle * (lightA + lightB) * reach * uDust * 2.5;
  }
  light *= uIntensity * (1.0 - smoothstep(uReveal * 2.6 - 0.45, uReveal * 2.6, r)) * smoothstep(0.0, 0.35, uReveal);
  float gray = dot(light, vec3(0.2126, 0.7152, 0.0722));
  light = max(mix(vec3(gray), light, uSaturation), 0.0);
  float peak = max(light.r, max(light.g, light.b));
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 ink = pow(light / max(peak, 1e-4), vec3(2.0)) * 0.75;
    float alpha = clamp(pow(1.0 - exp(-peak * 2.6), 2.5) * 0.9 * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(pow(ink, vec3(1.0 / 2.2)) * alpha, alpha) * mask;
    return;
  }
  float mapped = 1.0 - exp(-peak);
  vec3 tone = light * (mapped / max(peak, 1e-4));
  tone = mix(tone, vec3(mapped), smoothstep(0.7, 1.0, mapped) * 0.55);
  vec3 shown = clamp(tone * uOpacity, 0.0, 1.0);
  float alpha = max(shown.r, max(shown.g, shown.b));
  vec3 color = clamp(shown * alpha + grain, 0.0, 1.0);
  fragColor = vec4(min(color, vec3(alpha)), alpha) * mask;
}`;

export async function initializeHeroRays(canvas: HTMLCanvasElement, cancelled = () => false) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    depth: false,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return undefined;
  const compile = (kind: number, source: string) => {
    const shader = gl.createShader(kind)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX),
    fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return undefined;
  }
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  // A synchronous status query forces driver compilation onto the main thread.
  // Link status below still validates both shaders after parallel work completes.
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (parallel) {
    while (
      !gl.isContextLost() &&
      !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)
    ) {
      if (cancelled()) {
        gl.deleteProgram(program);
        return undefined;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  if (gl.isContextLost()) {
    gl.deleteProgram(program);
    return undefined;
  }
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return undefined;
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  const vao = gl.createVertexArray();
  let time = 0,
    disposed = false,
    opening = true;
  const motion = new RayMotion();
  let aspect = 1,
    needsPaint = true,
    paintedAim = Number.NaN,
    paintedFocus = Number.NaN;
  let cssWidth = 1,
    cssHeight = 1;
  let clip = { left: 0, right: 1e6, bottom: 1e6 };
  // The shader's colors and shape settings are constant during a frame sequence.
  gl.useProgram(program);
  const constants = {
    uBlend: 0.55,
    uDensity: 5,
    uSharpness: 0.35,
    uGlow: 0.85,
    uSaturation: 1,
    uDust: 0,
    uOpacity: 0.8,
    uReveal: 1,
    uLight: 0,
    uSway: 0,
  };
  for (const [name, value] of Object.entries(constants)) gl.uniform1f(uniforms[name], value);
  gl.uniform3f(uniforms.uColorA, 0.73, 0.79, 0.85);
  gl.uniform3f(uniforms.uColorB, 0.92, 0.94, 0.96);
  gl.uniform3f(uniforms.uFrame, 0, 0, 0);
  const updateShape = () => {
    needsPaint = true;
    gl.useProgram(program);
    gl.uniform3f(
      uniforms.uColorA,
      ...((opening ? [0.73, 0.79, 0.85] : [0.94, 0.54, 0.61]) as [number, number, number]),
    );
    gl.uniform3f(
      uniforms.uColorB,
      ...((opening ? [0.92, 0.94, 0.96] : [0.86, 0.89, 0.94]) as [number, number, number]),
    );
    gl.uniform1f(uniforms.uIntensity, opening ? 2.2 : 1.8);
    gl.uniform1f(uniforms.uSpread, opening ? 0.28 : 0.45);
    gl.uniform1f(uniforms.uFalloff, opening ? 1.2 : 1.6);
    const rasterAspect = canvas.width / canvas.height;
    gl.uniform3f(
      uniforms.uSource,
      opening ? -0.28 * rasterAspect : rasterAspect * 0.5 + 0.1,
      opening ? 0.7 : 0.62,
      opening ? -Math.PI / 2 : -2.48,
    );
    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uOpening, opening ? 1 : 0);
    gl.uniform3f(
      uniforms.uMaskRect,
      clip.left / cssWidth,
      clip.right / cssWidth,
      clip.bottom / cssHeight,
    );
    gl.uniform2f(uniforms.uMaskFade, 70 / cssWidth, 70 / cssHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const size = () => {
    const rect = canvas.getBoundingClientRect();
    cssWidth = Math.max(1, rect.width);
    cssHeight = Math.max(1, rect.height);
    aspect = rect.width / Math.max(1, rect.height);
    const ratio = Math.min(devicePixelRatio, 1, Math.sqrt(1300000 / (rect.width * rect.height)));
    const w = Math.max(1, Math.round(rect.width * ratio)),
      h = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    updateShape();
  };
  size();
  const resizeObserver = new ResizeObserver(size);
  resizeObserver.observe(canvas);
  return {
    clip(left: number, right: number, bottom: number) {
      clip = { left, right, bottom };
      updateShape();
    },
    opening(value: boolean) {
      if (opening !== value) {
        opening = value;
        motion.point(0, 0, false);
        updateShape();
      }
    },
    pointer(x: number, y: number, inside: boolean) {
      const qx = (x - 0.5) * aspect,
        qy = 0.5 - y;
      const sourceX = opening ? -0.28 * aspect : aspect * 0.5 + 0.1;
      let angle =
        Math.atan2(qy - (opening ? 0.7 : 0.62), qx - sourceX) - (opening ? -Math.PI / 2 : -2.48);
      angle = ((((angle + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
      motion.point(Math.max(-0.45, Math.min(0.45, angle)), 0, inside);
    },
    render(delta: number, paused: boolean) {
      if (disposed || gl.isContextLost()) return;
      const dt = paused ? 0 : Math.min(0.05, delta);
      time += dt;
      motion.update(dt);
      const aim = opening ? 0 : motion.x,
        focus = opening ? 0 : motion.focus;
      if (
        !needsPaint &&
        Math.abs(aim - paintedAim) < 0.0001 &&
        Math.abs(focus - paintedFocus) < 0.0001
      )
        return;
      needsPaint = false;
      paintedAim = aim;
      paintedFocus = focus;
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform1f(uniforms.uTime, 0);
      gl.uniform1f(uniforms.uAim, aim);
      gl.uniform3f(uniforms.uFocus, 0, 0.1125, focus * 1.4);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    metrics: () => ({ time, aim: motion.x, focus: motion.focus, opening }),
    dispose() {
      disposed = true;
      resizeObserver.disconnect();
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
