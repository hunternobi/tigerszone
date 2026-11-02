/**
 * One WebGL2 canvas for ALL glass cards of a page.
 *
 * Instead of one canvas (and one copy back into the page) per card, a single viewport-sized canvas sits behind
 * the page content. Its fragment shader gets the rectangles of the visible cards and, for every pixel inside
 * one of them, draws the glass: lens refraction at the rim, a frosted centre, a colour fringe and a lit edge.
 * Everything outside the cards stays transparent, so the fixed page photo shows through there.
 *
 * Per frame this is a handful of uniform updates and ONE draw call, which is what keeps it cheap enough for
 * a phone while the page scrolls.
 */

export const MAX_CARDS = 16;

export interface GlassRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  opacity: number;
}

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uBackdrop;
uniform vec2 uView;
uniform int uCount;
uniform vec4 uRect[${MAX_CARDS}];
uniform vec2 uMeta[${MAX_CARDS}];
uniform float uRefraction;
uniform float uBlurLod;
uniform float uSoft;
uniform float uChroma;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 backdrop(vec2 css) {
  vec2 uv = clamp(css / uView, vec2(0.002), vec2(0.998));
  return textureLod(uBackdrop, uv, uBlurLod).rgb;
}

vec3 soft(vec2 css) {
  float s = uSoft;
  vec3 c = backdrop(css) * 0.36;
  c += backdrop(css + vec2(s, s)) * 0.16;
  c += backdrop(css + vec2(-s, s)) * 0.16;
  c += backdrop(css + vec2(s, -s)) * 0.16;
  c += backdrop(css + vec2(-s, -s)) * 0.16;
  return c;
}

void main() {
  vec2 pos = vUv * uView;

  int hit = -1;
  for (int i = 0; i < ${MAX_CARDS}; i++) {
    if (i >= uCount) break;
    vec2 hs = uRect[i].zw * 0.5;
    float r = min(uMeta[i].x, min(hs.x, hs.y));
    if (roundBox(pos - (uRect[i].xy + hs), hs, r) < 0.6) {
      hit = i;
      break;
    }
  }
  if (hit < 0) {
    outColor = vec4(0.0);
    return;
  }

  vec2 halfSize = uRect[hit].zw * 0.5;
  vec2 p = pos - (uRect[hit].xy + halfSize);
  float r = min(uMeta[hit].x, min(halfSize.x, halfSize.y));
  float d = roundBox(p, halfSize, r);
  float mask = 1.0 - smoothstep(-0.8, 0.6, d);

  float inside = max(-d, 0.0);
  vec2 grad = vec2(
    roundBox(p + vec2(1.0, 0.0), halfSize, r) - roundBox(p - vec2(1.0, 0.0), halfSize, r),
    roundBox(p + vec2(0.0, 1.0), halfSize, r) - roundBox(p - vec2(0.0, 1.0), halfSize, r)
  );
  vec2 n = grad / max(length(grad), 1e-4);

  float zR = min(40.0, min(halfSize.x, halfSize.y));
  float dd = clamp(inside, 0.5, zR);
  float h = sqrt(dd * (2.0 * zR - dd));
  float slope = inside >= zR ? 0.0 : (zR - dd) / h;
  float depth = smoothstep(0.0, zR, inside);
  float edge = smoothstep(min(halfSize.x, halfSize.y) * 0.35, 0.0, inside);
  float nz = 1.0 / sqrt(1.0 + slope * slope);

  float thickNorm = inside >= zR ? 1.0 : h / zR;
  float refrK = (0.667 + 0.167 * thickNorm) * 30.0 * uRefraction;
  vec2 shift = -n * min(slope * refrK, 70.0) - p / max(halfSize, vec2(1.0)) * uRefraction * 4.0 * depth;
  vec2 ca = n * slope / sqrt(1.0 + slope * slope) * uChroma * 36.0 * (edge * 0.7 + 0.3);

  vec2 base = pos + shift;
  vec3 col;
  col.r = soft(base + ca).r;
  col.g = soft(base).g;
  col.b = soft(base - ca).b;
  col *= 1.0 + 0.06 * depth;

  float fres = pow(1.0 - nz, 4.0);
  float lit = clamp(dot(n, normalize(vec2(-0.55, -0.85))) * 0.5 + 0.5, 0.0, 1.0);
  float stroke = smoothstep(-2.5, -1.5, d) * (1.0 - smoothstep(-1.0, 0.0, d));
  col += stroke * (0.10 + 0.30 * lit);
  col += smoothstep(5.0, 0.0, inside) * 0.035;
  col = mix(col, vec3(1.0), fres * 0.2);
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

  float a = mask * uMeta[hit].y;
  outColor = vec4(col * a, a);
}`;

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "";
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log}`);
  }
  return shader;
}

export class SharedGlassGL {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private lost = false;
  onLost?: () => void;

  private constructor(
    readonly canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
  ) {
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error("createProgram failed");
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;
    gl.useProgram(program);
    for (const name of [
      "uBackdrop",
      "uView",
      "uCount",
      "uRect",
      "uMeta",
      "uRefraction",
      "uBlurLod",
      "uSoft",
      "uChroma",
    ]) {
      this.loc[name] = gl.getUniformLocation(program, name);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    if (!texture) throw new Error("createTexture failed");
    this.texture = texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.loc.uBackdrop, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.loc.uRefraction, 0.85);
    gl.uniform1f(this.loc.uBlurLod, 0.5);
    gl.uniform1f(this.loc.uSoft, 6);
    gl.uniform1f(this.loc.uChroma, 0.05);

    canvas.addEventListener("webglcontextlost", this.handleLost);
  }

  static create(canvas: HTMLCanvasElement): SharedGlassGL | null {
    try {
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
      return gl ? new SharedGlassGL(canvas, gl) : null;
    } catch (error) {
      console.warn("SharedGlassGL: could not start.", error);
      return null;
    }
  }

  private handleLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    this.onLost?.();
  };

  get isLost() {
    return this.lost;
  }

  /** Uploads the backdrop (the page photo as it looks on screen) once; mipmaps give the blur for free. */
  setBackdrop(source: HTMLCanvasElement) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw(viewW: number, viewH: number, rects: GlassRect[]) {
    if (this.lost) return;
    const { gl, loc } = this;
    const count = Math.min(rects.length, MAX_CARDS);
    const rectData = new Float32Array(MAX_CARDS * 4);
    const metaData = new Float32Array(MAX_CARDS * 2);
    for (let i = 0; i < count; i++) {
      const r = rects[i];
      rectData.set([r.x, r.y, r.width, r.height], i * 4);
      metaData.set([r.radius, r.opacity], i * 2);
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uView, viewW, viewH);
    gl.uniform1i(loc.uCount, count);
    gl.uniform4fv(loc.uRect, rectData);
    gl.uniform2fv(loc.uMeta, metaData);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    if (!this.lost) {
      this.gl.deleteTexture(this.texture);
      this.gl.deleteProgram(this.program);
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
}
