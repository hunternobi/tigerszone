export interface GlassConfig {
  blurAmount: number;
  refraction: number;
  chromAberration: number;
  edgeHighlight: number;
  specular: number;
  fresnel: number;
  distortion: number;
  cornerRadius: number;
  zRadius: number;
  opacity: number;
  saturation: number;
  tintStrength: number;
  brightness: number;
  shadowOpacity: number;
  shadowSpread: number;
  shadowOffsetY: number;
  floating: boolean;
  button: boolean;
  bevelMode: number;
}

export interface LiquidGlassInstance {
  fps: number;
  destroy(): void;
  markChanged(element?: HTMLElement): void;
}

export const DEFAULTS: GlassConfig;

export const LiquidGlass: {
  init(options: {
    root: HTMLElement;
    glassElements?: HTMLElement[];
    defaults?: Partial<GlassConfig>;
  }): Promise<LiquidGlassInstance>;
};

export function invalidateFontEmbedCache(): void;
