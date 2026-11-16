export type ActiveScreen = 'video' | 'stress-test' | '3d-viewer' | 'map' | 'specs';

export interface VideoScene {
  id: number;
  stageName: string;
  stageNameEn: string;
  durationSec: number;
  startTimeSec: number;
  endTimeSec: number;
  summary: string;
  voiceoverScript: string;
  technicalHighlights: string[];
  specs: {
    temperature?: string;
    pressure?: string;
    speed?: string;
    tolerance?: string;
    material?: string;
  };
  visualIcon: string;
  accentColor: string;
}

export interface FactoryBranch {
  id: string;
  name: string;
  type: 'factory' | 'distribution_center' | 'authorized_dealer';
  region: 'southern' | 'central' | 'western' | 'eastern';
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  capacity?: string;
  availableProducts: string[];
}

export interface PlumberChallenge {
  id: string;
  title: string;
  category: string;
  description: string;
  metricLabel: string;
  metricUnit: string;
  defaultVal: number;
  minVal: number;
  maxVal: number;
  authenticOutcome: string;
  counterfeitOutcome: string;
}
