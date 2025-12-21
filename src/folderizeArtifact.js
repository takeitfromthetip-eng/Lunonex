export function folderizeArtifact(artifact) {
  const base = `/media/${artifact.actor}`;
  const typeFolder = `${base}/${artifact.type}`;
  const tierFolder = `${typeFolder}/${artifact.tier}`;
  const remixFolder = artifact.remixHistory.length > 0 ? `${tierFolder}/remixed` : `${tierFolder}/original`;
  const crownFolder = artifact.crowned ? `${remixFolder}/crowned` : remixFolder;
  const graveyardFolder = artifact.graveyarded ? `${crownFolder}/graveyard` : crownFolder;

  return graveyardFolder;
}
