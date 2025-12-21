import { render } from "viz.js/full.render.js";

export async function renderRemixGraph(artifactId) {
  const response = await fetch(`/lineage/${artifactId}`);
  const lineage = await response.json();

  const nodes = new Set();
  const edges = lineage.map(l => {
    nodes.add(l.actor);
    nodes.add(l.new);
    return `"${l.actor}" -> "${l.new}" [label="${l.action}"]`;
  });

  const dot = `
    digraph RemixLineage {
      node [shape=box, style=filled, color=lightblue];
      ${Array.from(nodes).map(n => `"${n}"`).join("\n")}
      ${edges.join("\n")}
    }
  `;

  const svg = await render(dot);
  return `<h3>Remix Graph</h3>${svg}`;
}
