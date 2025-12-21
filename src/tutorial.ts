// tutorial.ts
export interface TutorialStep {
  step: string;
  action: string;
}

export const tutorialSteps: TutorialStep[] = [
  { step: 'Launch Canvas Forge', action: 'openCanvas' },
  { step: 'Drop First Meme', action: 'openMemeForge' },
  { step: 'Explore Vault', action: 'openVault' },
  { step: 'Export Artifact', action: 'runExportRitual' },
  { step: 'Auto-Follow Polotus', action: 'followFounder' },
];
