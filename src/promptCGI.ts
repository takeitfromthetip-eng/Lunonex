// promptCGI.ts
// @ts-ignore
import { generateCGIScene } from './aiEngine.js';

export async function handlePromptToCGI(prompt: string, userTier: string) {
  if (userTier !== 'mythic' && userTier !== 'standard') throw new Error('CGI access restricted');
  const fidelity = userTier === 'mythic' ? 'ultra' : 'high';
  const sceneBlueprint = await generateCGIScene(prompt, fidelity);
  return sceneBlueprint; // returns renderable JSON for CGI Forge
}
