
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Zephyr = 'Zephyr',
  Fenrir = 'Fenrir'
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'male' | 'female';
  description: string;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  audioUrl: string | null;
}
