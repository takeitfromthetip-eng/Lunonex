import React, { useEffect } from 'react';
import * as d3 from 'd3';

export const MultiverseMap = ({ nodes }) => {
  useEffect(() => {
    const svg = d3.select('#multiverse-map');
    svg.selectAll('*').remove();

    svg
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 6)
      .attr('fill', '#7f5af0');
  }, [nodes]);

  return <svg id="multiverse-map" width={600} height={400} />;
};
