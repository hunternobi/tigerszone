/**
 * A small WebGL2 renderer for one "liquid glass" surface: a rounded rectangle that shows a blurred, lens-
 * distorted copy of the backdrop with a bright rim.
 *
 * The backdrop is uploaded to the GPU ONCE (with mipmaps, so blurring is a texture lookup). Redrawing a
 * surface - for example while the page scrolls under a fixed photo - then only changes a few uniforms and
 * draws one quad. That is what makes it cheap enough for phones, unlike redrawing through a general
 * purpose capture/blur pipeline on every frame.
 */

export interface GlassDrawParams {
  /** Canvas size in CSS px (element size plus padding on every side). */
  canvasW: number;
  canvasH: number;
  /** Glass element size and corner radius in CSS px. */
  width: number;
  height: number;
  pad: number;
  radius: number;
  /** Position of the canvas' top-left corner inside the backdrop, and the backdrop size, in CSS px. */
  backdropX: number;
  backdropY: number;
  backdropW: number;
  backdropH: number;
  refraction: number;
  blurLod: number;
  chroma: number;
  opacity: number;
  shadow: number;
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
uniform vec2 uCanvas;
uniform vec2 uSize;
uniform vec2 uBackdropOffset;
uniform vec2 uBackdropSize;
uniform float uPad;
uniform float uRadius;
uniform float uRefraction;
uniform float uBlurLod;
uniform float uChroma;
uniform float uOpacity;
uniform float uShadow;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 backdrop(vec2 css, float lod) {
  vec2 uv = clamp(css / uBackdropSize, vec2(0.002), vec2(0.998));
  return textureLod(uBackdrop, uv, lod).rgb;
}

void main() {
  vec2 pos = vUv * uCanvas;
  vec2 halfSize = uSize * 0.5;
  vec2 p = pos - vec2(uPad) - halfSize;
  float r = min(uRadius, min(halfSize.x, halfSize.y));
  float d = roundBox(p, halfSize, r);

  float shadow = 0.0;
  if (uShadow > 0.0) {
    float ds = roundBox(p - vec2(0.0, 5.0), halfSize, r);
    shadow = uShadow * (1.0 - smoothstep(0.0, uPad * 0.9, ds)) * step(0.0, d);
  }

  float mask = 1.0 - smoothstep(-0.8, 0.6, d);
  if (mask <= 0.001 && shadow <= 0.001) {
    outColor = vec4(0.0);
    return;
  }

  float inside = max(-d, 0.0);
  vec2 grad = vec2(
    roundBox(p + vec2(1.0, 0.0), halfSize, r) - roundBox(p - vec2(1.0, 0.0), halfSize, r),
    roundBox(p + vec2(0.0, 1.0), halfSize, r) - roundBox(p - vec2(0.0, 1.0), halfSize, r)
  );
  vec2 n = grad / max(length(grad), 1e-4); // pointing out of the shape

  // Lens: close to the rim the glass shows content from further inside, stronger towards the edge.
  float band = min(34.0, min(halfSize.x, halfSize.y));
  float t = 1.0 - clamp(inside / band, 0.0, 1.0);
  float bend = t * t * t;
  vec2 shift = -n * bend * band * 0.9 * uRefraction;

  vec2 base = uBackdropOffset + pos;
  vec3 col;
  col.r = backdrop(base + shift * (1.0 - uChroma), uBlurLod).r;
  col.g = backdrop(base + shift, uBlurLod).g;
  col.b = backdrop(base + shift * (1.0 + uChroma), uBlurLod).b;

  // A little more colour and light, like frosted glass lit from above.
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 1.25) * 1.05 + 0.03;
  float sheen = 1.0 - smoothstep(0.0, 0.85, length(p / uSize - vec2(-0.35, -0.55)));
  col += sheen * 0.10;

  float rim = 1.0 - smoothstep(0.0, 2.2, inside);
  float lit = clamp(dot(n, normalize(vec2(-0.55, -0.85))) * 0.5 + 0.5, 0.0, 1.0);
  col += rim * (0.08 + 0.40 * lit);
  col += (1.0 - smoothstep(0.0, 10.0, inside)) * 0.035;

  // Dither against banding in the dark gradients.
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

  float a = mask * uOpacity;
  float alpha = a + shadow * (1.0 - mask) * uOpacity;
  outColor = vec4(col * a, alpha);
}`;

const UNIFORMS = [
  "uBackdrop",
  "uCanvas",
  "uSize",
  "uBackdropOffset",
  "uBackdropSize",
  "uPad",
  "uRadius",
  "uRefraction",
  "uBlurLod",
  "uChroma",
  "uOpacity",
  "uShadow",
] as const;

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

export class GlassGL {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private uniforms: Record<
    (typeof UNIFORMS)[number],
    WebGLUniformLocation | null
  >;
  private lost = false;
  /** Called when the browser takes the WebGL context away (memory pressure, background tab ...). */
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

    this.uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
    ) as GlassGL["uniforms"];

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
    gl.uniform1i(this.uniforms.uBackdrop, 0);
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

    canvas.addEventListener("webglcontextlost", this.handleLost);
  }

  /** Null when WebGL2 or the shader is not available. */
  static create(canvas: HTMLCanvasElement): GlassGL | null {
    try {
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
      return gl ? new GlassGL(canvas, gl) : null;
    } catch (error) {
      console.warn("GlassGL: could not start.", error);
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

  /** Uploads the backdrop (a canvas) and builds its mipmaps. Call again when the backdrop was repainted. */
  setBackdrop(source: HTMLCanvasElement) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  /** Sets the size of the drawing buffer (CSS size times pixel ratio). */
  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw(p: GlassDrawParams) {
    if (this.lost) return;
    const { gl, uniforms: u } = this;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uCanvas, p.canvasW, p.canvasH);
    gl.uniform2f(u.uSize, p.width, p.height);
    gl.uniform2f(u.uBackdropOffset, p.backdropX, p.backdropY);
    gl.uniform2f(u.uBackdropSize, p.backdropW, p.backdropH);
    gl.uniform1f(u.uPad, p.pad);
    gl.uniform1f(u.uRadius, p.radius);
    gl.uniform1f(u.uRefraction, p.refraction);
    gl.uniform1f(u.uBlurLod, p.blurLod);
    gl.uniform1f(u.uChroma, p.chroma);
    gl.uniform1f(u.uOpacity, p.opacity);
    gl.uniform1f(u.uShadow, p.shadow);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /** Frees the GPU resources and the context itself (browsers only allow a handful of live contexts). */
  destroy() {
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    const { gl } = this;
    if (!this.lost) {
      gl.deleteTexture(this.texture);
      gl.deleteProgram(this.program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
}
