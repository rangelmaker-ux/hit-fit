export interface SvgModelProps {
  phase: 'concentric' | 'eccentric';
  accentColor: string;
  isTechnicalMode?: boolean;
}

export interface FallbackModelProps {
  accentColor: string;
  exerciseName?: string;
  equipmentName?: string;
}
