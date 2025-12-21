// promptEngine.ts
export async function interpretPrompt(
  prompt: string,
  domain: 'design' | 'music' | 'video' | 'cgi',
  tier: string
) {
  const fidelity =
    tier === 'mythic' ? 'ultra' :
    tier === 'standard' ? 'high' :
    tier === 'legacy' ? 'medium' :
    'basic';

  const response = await fetch(`/api/prompt/${domain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, fidelity }),
  });

  if (!response.ok) throw new Error(`Prompt engine failed: ${response.statusText}`);
  return await response.json(); // returns domain-specific blueprint
}
export interface PromptRequest {
  promptId: string;
  creatorId: string;
  promptText: string;
  type: 'canvas' | 'sound' | 'video' | 'cgi';
  timestamp: number;
}

const promptLog: PromptRequest[] = [];

export function logPrompt(request: PromptRequest) {
  promptLog.push(request);
}

export function getPromptsByCreator(creatorId: string): PromptRequest[] {
  return promptLog.filter(p => p.creatorId === creatorId);
}
