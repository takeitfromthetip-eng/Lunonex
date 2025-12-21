import fs from "fs";

export function dropProtocol(name, content) {
  const timestamp = Date.now();
  const filename = `protocol_${name}_${timestamp}.md`;
  fs.writeFileSync(`protocols/${filename}`, content);
  return filename;
}
