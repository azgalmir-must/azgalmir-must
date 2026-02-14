
export enum RenderStyle {
  REALISTIC = 'realistic',
  PHOTOREALISTIC = 'photorealistic',
  SKETCH = 'sketch',
  WATERCOLOR = 'watercolor',
  CYBERPUNK = 'cyberpunk',
  NIGHT_VIEW = 'night_view',
  CLAY_MODEL = 'clay_model'
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";
export type EnvironmentHDRI = "downtown" | "forest" | "interior";

export interface ProcessingOptions {
  style: RenderStyle;
  preserveDetails: number;
  lighting: 'natural' | 'studio' | 'dramatic' | 'warm';
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  environment: EnvironmentHDRI;
  customInstruction?: string;
}

export interface AppState {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  options: ProcessingOptions;
  error: string | null;
}
