/**
 * Liquid glass for ONE pane, drawn by a small WebGL2 canvas that sits inside the pane.
 *
 * The page photo behind the pane is fixed to the screen, so the shader does not need a snapshot of the page
 * (which is what the GitHub libraries take, and what makes them heavy): it samples the photo itself at the
 * pane's position on screen. Because the canvas is a child of the pane, its outline scrolls with the page
 * natively and can never lag behind; only the picture inside is redrawn, with one draw call per frame.
 *
 * The look follows Apple's Liquid Glass and the physical model that is usually used to rebuild it
 * (kube.io, ybouane/liquidglass): a rounded bezel bends the picture by Snell's law (strong at the rim, none
 * in the middle), a slight colour fringe, a frosted centre, and a specular rim lit from the top left.
 */

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

uniform sampler2D uPhoto;
uniform vec2 uPane;        // size of the pane on screen (CSS px)
uniform vec2 uOrigin;      // its top left corner on screen
uniform float uRadius;     // corner radius
uniform float uBezel;      // width of the curved rim
uniform vec4 uCover;       // where the photo lies on screen: xy = top left, zw = size
uniform vec3 uBase;        // page colour behind the photo
uniform float uPhotoOpacity;
uniform float uTexelsPerPx;

const float IOR = 1.5;        // glass
const float THICKNESS = 1.0;  // height of the bezel, in bezel widths
const float SLAB = 0.3;       // flat glass below the bezel, in bezel widths
const float FROST = 10.0;     // blur radius of the frosted centre (px)

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r;
}

// The page as it looks behind the pane: the photo, dimmed over the page colour.
vec3 scene(vec2 p, float lod) {
  vec2 uv = clamp((p - uCover.xy) / uCover.zw, vec2(0.0), vec2(1.0));
  return mix(uBase, textureLod(uPhoto, uv, lod).rgb, uPhotoOpacity);
}

// Frost: thirteen taps from a blurred mip level (the mip does most of the blurring, two rings smooth it).
vec3 frosted(vec2 p, float radius, float lod) {
  vec3 c = scene(p, lod) * 0.16;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0471976;
    c += scene(p + vec2(cos(a), sin(a)) * radius * 0.45, lod) * 0.08;
    c += scene(p + vec2(cos(a + 0.5236), sin(a + 0.5236)) * radius * 0.9, lod) * 0.06;
  }
  return c;
}

void main() {
  vec2 halfSize = uPane * 0.5;
  vec2 local = vUv * uPane - halfSize;
  float r = min(uRadius, min(halfSize.x, halfSize.y));
  float sdf = sdRoundBox(local, halfSize, r);
  float mask = 1.0 - smoothstep(-1.0, 0.0, sdf);
  if (mask <= 0.0) {
    outColor = vec4(0.0);
    return;
  }
  float inside = max(-sdf, 0.0);

  // Direction out of the pane at this point of the rim.
  vec2 grad = vec2(
    sdRoundBox(local + vec2(1.0, 0.0), halfSize, r) - sdRoundBox(local - vec2(1.0, 0.0), halfSize, r),
    sdRoundBox(local + vec2(0.0, 1.0), halfSize, r) - sdRoundBox(local - vec2(0.0, 1.0), halfSize, r)
  );
  vec2 nOut = normalize(grad + vec2(1e-5));

  // Bezel: a quarter circle, y = sqrt(1 - (1 - t)^2), t = 0 at the edge and 1 where the glass turns flat.
  // (A squircle bends everything within the outermost pixels, which flips the picture there and shows as
  // streaks on a card this small; the circle compresses it evenly across the bezel.)
  float t = clamp(inside / uBezel, 0.0, 1.0);
  float u = 1.0 - t;
  float height = sqrt(max(1.0 - u * u, 1e-4));
  float slope = min(THICKNESS * u / height, 8.0);

  // A ray from straight above is bent towards the centre (Snell) and travels through the glass below it.
  float thetaIn = atan(slope);
  float thetaOut = asin(sin(thetaIn) / IOR);
  float shift = tan(thetaIn - thetaOut) * uBezel * (THICKNESS * height + SLAB);

  vec2 screen = uOrigin + vUv * uPane;
  vec2 inward = -nOut;
  float frost = mix(4.0, FROST, smoothstep(0.0, 0.85, t));
  float lod = log2(max(frost * uTexelsPerPx * 0.6, 1.0));
  vec3 col = frosted(screen + inward * shift, frost, lod);

  // Dispersion: red is bent a little less, blue a little more, only in the bezel.
  float fringe = u * u;
  col.r = mix(col.r, scene(screen + inward * shift * 0.9, lod).r, fringe);
  col.b = mix(col.b, scene(screen + inward * shift * 1.1, lod).b, fringe);

  // Material: richer colours, a breath of navy so white text stays readable, a soft sheen from the top left.
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, 1.35);
  col = mix(col, vec3(0.03, 0.05, 0.2), 0.12);
  vec2 q = local / uPane + vec2(0.5);
  col += 0.09 * smoothstep(0.8, 0.0, length(q - vec2(0.08, -0.1)));

  // Specular rim: a hairline along the edge and a faint glow across the bezel, brightest where the rim
  // faces the light (top left) and, weaker, where the light leaves again (bottom right).
  vec2 light = normalize(vec2(-0.55, -0.83));
  float facing = dot(nOut, light);
  float spec = pow(abs(facing), 2.2) * (facing > 0.0 ? 1.0 : 0.6);
  float line = smoothstep(1.6, 0.4, inside);
  col += line * (0.14 + 0.55 * spec);
  col += u * u * u * (0.03 + 0.1 * spec);

  outColor = vec4(col * mask, mask);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
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

/** Longest side of the photo texture; the glass shows it blurred, so more would only cost memory. */
const MAX_TEXTURE_SIDE = 2048;

export interface GlassFrame {
  /** The pane on screen (CSS px, viewport coordinates). */
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
  /** Where the photo lies on screen (viewport coordinates) and its displayed size. */
  photoLeft: number;
  photoTop: number;
  photoWidth: number;
  photoHeight: number;
  photoOpacity: number;
  /** Page colour behind the photo, 0..1 per channel. */
  base: [number, number, number];
}

export class LiquidGlassRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private textureWidth = 1;
  lost = false;

  constructor(
    private canvas: HTMLCanvasElement,
    onLost: () => void,
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL2 not available");
    this.gl = gl;

    const program = gl.createProgram();
    if (!program) throw new Error("createProgram failed");
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(program) ?? ""}`);
    }
    this.program = program;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const name of [
      "uPhoto",
      "uPane",
      "uOrigin",
      "uRadius",
      "uBezel",
      "uCover",
      "uBase",
      "uPhotoOpacity",
      "uTexelsPerPx",
    ]) {
      this.loc[name] = gl.getUniformLocation(program, name);
    }

    const texture = gl.createTexture();
    if (!texture) throw new Error("createTexture failed");
    this.texture = texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.loc.uPhoto, 0);

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.lost = true;
      onLost();
    });
  }

  /** Uploads the page photo once, with mip levels (they are the blur of the frosted glass). */
  setPhoto(image: HTMLImageElement) {
    const { gl } = this;
    const limit = Math.min(MAX_TEXTURE_SIDE, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    const scale = Math.min(1, limit / Math.max(image.naturalWidth, image.naturalHeight));
    let source: TexImageSource = image;
    this.textureWidth = image.naturalWidth;
    if (scale < 1) {
      const small = document.createElement("canvas");
      small.width = Math.round(image.naturalWidth * scale);
      small.height = Math.round(image.naturalHeight * scale);
      small.getContext("2d")?.drawImage(image, 0, 0, small.width, small.height);
      source = small;
      this.textureWidth = small.width;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  /** Sets the size of the drawing buffer (device pixels); a no-op while it stays the same. */
  resize(width: number, height: number) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  draw(frame: GlassFrame) {
    if (this.lost) return;
    const { gl, loc } = this;
    const shortSide = Math.min(frame.width, frame.height);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uPane, frame.width, frame.height);
    gl.uniform2f(loc.uOrigin, frame.left, frame.top);
    gl.uniform1f(loc.uRadius, frame.radius);
    gl.uniform1f(loc.uBezel, Math.min(Math.max(shortSide * 0.18, 14), 32));
    gl.uniform4f(loc.uCover, frame.photoLeft, frame.photoTop, frame.photoWidth, frame.photoHeight);
    gl.uniform3f(loc.uBase, frame.base[0], frame.base[1], frame.base[2]);
    gl.uniform1f(loc.uPhotoOpacity, frame.photoOpacity);
    gl.uniform1f(loc.uTexelsPerPx, this.textureWidth / Math.max(frame.photoWidth, 1));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    const { gl } = this;
    gl.deleteTexture(this.texture);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
