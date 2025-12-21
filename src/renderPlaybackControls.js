export function renderPlaybackControls(artifact) {
  const mediaPath = `/media/${artifact.filename}`;
  const type = artifact.type;

  if (type === "audio") {
    return `<audio controls src="${mediaPath}"></audio>`;
  }
  if (type === "video") {
    return `<video controls width="600" src="${mediaPath}"></video>`;
  }
  if (type === "image") {
    return `<img src="${mediaPath}" alt="${artifact.name}" style="max-width:100%">`;
  }
  if (type === "text") {
    return `<iframe src="${mediaPath}" width="100%" height="400"></iframe>`;
  }
  return `<p>Unsupported media type: ${type}</p>`;
}
