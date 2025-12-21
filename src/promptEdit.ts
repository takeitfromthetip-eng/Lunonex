// promptEdit.ts
// @ts-ignore
import { generateEditSequence } from './aiEngine.js';

export async function handlePromptToEdit(prompt: string, userTier: string) {
  const fidelity = userTier === 'mythic' ? 'high' : userTier === 'legacy' ? 'medium' : 'low';
  const editSequence = await generateEditSequence(prompt, fidelity);
  return editSequence; // returns array of edit actions (cuts, transitions, FX)
}
