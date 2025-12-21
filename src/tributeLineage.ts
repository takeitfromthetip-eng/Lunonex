// tributeLineage.ts
export interface TributeLink {
  parentId: string;
  childId: string;
  depth: number;
  timestamp: number;
}

const lineageMap: TributeLink[] = [];

export function addTributeLink(parentId: string, childId: string) {
  const depth = lineageMap.find(l => l.childId === parentId)?.depth ?? 0;
  lineageMap.push({
    parentId,
    childId,
    depth: depth + 1,
    timestamp: Date.now(),
  });
}

export function getLineage(artifactId: string): TributeLink[] {
  return lineageMap.filter(l => l.parentId === artifactId);
}
