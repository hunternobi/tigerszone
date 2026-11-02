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

uniform sampler2D uSharp;
uniform sampler2D uBlur;
uniform vec2 uView;
uniform vec2 uRegion;
uniform float uTop;
uniform int uCount;
uniform vec4 uRect[${MAX_CARDS}];
uniform vec2 uMeta[${MAX_CARDS}];
uniform float uK;

// ---------------------------------------------------------------------------------------------------------
// The fragment shader of ybouane/liquidglass (FS_GLASS, MIT), with its default settings (refraction 0.85,
// chromatic aberration 0.05, edge highlight 0.05, fresnel 1, bevel 40), ported to run for many rectangles in
// one pass. All its pixel constants are multiplied by uK, because the library tunes them for big panels
// and a phone card is much smaller.
// ---------------------------------------------------------------------------------------------------------
const float REFRACT = 0.85;
const float CHROMA = 0.05;
const float EDGE_HL = 0.05;
const float FRESNEL = 1.0;

float rrSDF(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r;
}

float bevelHeight(float d, float zR) {
  if (d <= 0.0) return 0.0;
  if (d >= zR) return zR;
  return sqrt(d * (2.0 * zR - d));
}

vec3 sharpAt(vec2 css) {
  return texture(uSharp, clamp(css / uView, vec2(0.001), vec2(0.999))).rgb;
}
vec3 blurAt(vec2 css) {
  return texture(uBlur, clamp(css / uView, vec2(0.001), vec2(0.999))).rgb;
}

void main() {
  // The canvas covers uRegion px of the page, starting uTop px from the top of the screen; positions are
  // screen coordinates at the moment of drawing (the photo behind is fixed to the screen).
  vec2 pos = vec2(vUv.x * uRegion.x, uTop + vUv.y * uRegion.y);

  int hit = -1;
  for (int i = 0; i < ${MAX_CARDS}; i++) {
    if (i >= uCount) break;
    vec2 hs = uRect[i].zw * 0.5;
    float rr = min(uMeta[i].x, min(hs.x, hs.y));
    if (rrSDF(pos - (uRect[i].xy + hs), hs, rr) < 0.6) {
      hit = i;
      break;
    }
  }
  if (hit < 0) {
    outColor = vec4(0.0);
    return;
  }

  vec2 half_ = uRect[hit].zw * 0.5;
  vec2 localPx = pos - (uRect[hit].xy + half_);
  float r = min(uMeta[hit].x, min(half_.x, half_.y));
  float sdf = rrSDF(localPx, half_, r);

  float mask = 1.0 - smoothstep(-1.5, 0.5, sdf);
  float maxD = min(half_.x, half_.y);
  float inside = -sdf;
  float edge = smoothstep(maxD * 0.35, 0.0, inside);

  float zR = 40.0 * uK;
  float e = 2.0 * uK;
  float dC = inside;
  float dR = -rrSDF(localPx + vec2(e, 0.0), half_, r);
  float dL = -rrSDF(localPx - vec2(e, 0.0), half_, r);
  float dU = -rrSDF(localPx + vec2(0.0, e), half_, r);
  float dD = -rrSDF(localPx - vec2(0.0, e), half_, r);
  float hC = bevelHeight(dC, zR);
  vec2 hGrad = vec2(
    bevelHeight(dR, zR) - bevelHeight(dL, zR),
    bevelHeight(dU, zR) - bevelHeight(dD, zR)
  ) / (2.0 * e);
  vec3 N = normalize(vec3(-hGrad, 1.0));
  float depth = smoothstep(0.0, zR, inside);

  // Refraction (biconvex: entry + exit surface + a little through the glass), as in the library
  float ior = 1.5;
  float refrPow = 1.0 - 1.0 / ior;
  float thickNorm = (hC * 2.0) / max(zR * 2.0, 1.0);
  vec2 exitRefr = hGrad * refrPow;
  vec2 entryRefr = hGrad * refrPow;
  vec2 throughRefr = entryRefr * thickNorm * 0.5;
  vec2 refrPx = (exitRefr + entryRefr + throughRefr) * REFRACT * 30.0 * uK;
  vec2 centerDir = -localPx / max(half_, vec2(1.0));
  refrPx += centerDir * REFRACT * 4.0 * uK * depth;

  float caS = CHROMA * 18.0 * (edge * 0.7 + 0.3) * 2.0 * uK;
  vec2 caD = N.xy * caS;
  vec2 base = pos + refrPx;

  vec3 sharp = vec3(sharpAt(base + caD).r, sharpAt(base).g, sharpAt(base - caD).b);
  vec3 blur = vec3(blurAt(base + caD).r, blurAt(base).g, blurAt(base - caD).b);
  float edgeMix = 1.0 - edge * 0.15;
  vec3 col = mix(sharp, blur, edgeMix);
  col *= 1.0 + 0.06 * depth;

  float fres = pow(1.0 - abs(N.z), 4.0) * FRESNEL;

  float borderWidth = 1.5;
  float innerStroke = smoothstep(-borderWidth - 1.0, -borderWidth, sdf) * (1.0 - smoothstep(-1.0, 0.0, sdf));
  float topBias = 0.5 + 0.5 * (-localPx.y / half_.y);
  innerStroke *= (0.4 + 0.6 * topBias);

  float rim = edge * EDGE_HL * 0.22;
  float innerGlow = smoothstep(5.0, 0.0, -sdf) * EDGE_HL * 0.15;
  float envRefl = (N.y * 0.5 + 0.5) * fres * 0.08;

  vec3 fin = col;
  fin += vec3(rim + innerGlow);
  fin += vec3(innerStroke * EDGE_HL * 0.55);
  fin += vec3(envRefl);
  fin = mix(fin, vec3(1.0), fres * 0.2);

  float a = mask * uMeta[hit].y;
  outColor = vec4(fin * a, a);
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
  private sharpTexture: WebGLTexture;
  private blurTexture: WebGLTexture;
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
      "uSharp",
      "uBlur",
      "uK",
      "uView",
      "uRegion",
      "uTop",
      "uCount",
      "uRect",
      "uMeta",
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

    const makeTexture = (unit: number, uniform: string) => {
      const texture = gl.createTexture();
      if (!texture) throw new Error("createTexture failed");
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(this.loc[uniform], unit);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };
    this.sharpTexture = makeTexture(0, "uSharp");
    this.blurTexture = makeTexture(1, "uBlur");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.loc.uK, 0.55);

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

  /** Uploads the backdrop (the page photo as it looks on screen) and a lightly blurred copy of it, once. */
  setBackdrop(sharp: HTMLCanvasElement, blurred: HTMLCanvasElement) {
    const { gl } = this;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sharpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sharp);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.blurTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      blurred,
    );
  }

  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  /**
   * Draws the canvas region: `regionW` x `regionH` px of the page whose top edge lies `top` px from the top
   * of the screen (usually negative: the region reaches above the screen). `rects` are in screen coordinates.
   */
  draw(
    viewW: number,
    viewH: number,
    regionW: number,
    regionH: number,
    top: number,
    rects: GlassRect[],
  ) {
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
    gl.uniform2f(loc.uRegion, regionW, regionH);
    gl.uniform1f(loc.uTop, top);
    gl.uniform1i(loc.uCount, count);
    gl.uniform4fv(loc.uRect, rectData);
    gl.uniform2fv(loc.uMeta, metaData);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    if (!this.lost) {
      this.gl.deleteTexture(this.sharpTexture);
      this.gl.deleteTexture(this.blurTexture);
      this.gl.deleteProgram(this.program);
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
}
