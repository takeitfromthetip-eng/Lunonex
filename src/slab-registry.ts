// slab-registry.ts
/**
 * In-memory registry for confirmed slabs.
 */
const confirmedSlabs: string[] = [];

/**
 * Confirm a slab by name, adding it to the registry if not present.
 * @param slabName - The name of the slab to confirm
 */
export function confirmSlab(slabName: string): void {
  if (!confirmedSlabs.includes(slabName)) {
    confirmedSlabs.push(slabName);
  }
}

/**
 * Get all confirmed slabs.
 * @returns Array of confirmed slab names
 */
export function getConfirmedSlabs(): string[] {
  return confirmedSlabs;
}
