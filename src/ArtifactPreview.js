export function renderPreview(filePath, mediaType) {
  switch (mediaType) {
    case "image":
      return `<img src="${filePath}" alt="Preview" />`;
    case "video":
      return `<video controls src="${filePath}"></video>`;
    case "audio":
      return `<audio controls src="${filePath}"></audio>`;
    default:
      return `<p>Unsupported media type</p>`;
  }
}
