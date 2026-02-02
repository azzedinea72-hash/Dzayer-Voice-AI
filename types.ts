
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Zephyr = 'Zephyr',
  Fenrir = 'Fenrir',
  Aoede = 'Aoede'
}

export type AlgerianRegion = 'alger' | 'oran' | 'constantine' | 'sahara' | 'neutral';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  gender: 'male' | 'female';
  description: string;
  persona: string;
}

export interface RegionOption {
  id: AlgerianRegion;
  name: string;
  icon: string;
  description: string;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  audioUrl: string | null;
}
