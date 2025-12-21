import express from "express";
import { getRemixLineage } from "./RemixLineageStore.js";
import { render } from "viz.js/full.render.js";

const router = express.Router();

router.get("/lineage-graph/:artifactId", async (req, res) => {
  const { artifactId } = req.params;
  try {
    const lineage = await getRemixLineage(artifactId);
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
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: "Failed to render remix graph." });
  }
});

export default router;
