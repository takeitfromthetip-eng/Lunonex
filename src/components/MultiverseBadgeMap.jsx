import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { supabase } from '../lib/supabase';

export const MultiverseBadgeMap = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      const { data } = await supabase
        .from('badges')
        .select('user_id, badge, minted_at')
        .order('minted_at', { ascending: true });

      const nodes = data?.map((badge, i) => ({
        id: badge.badge,
        user: badge.user_id,
        x: 100 + (i % 10) * 80,
        y: 100 + Math.floor(i / 10) * 80,
        minted: badge.minted_at,
      })) || [];

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      svg
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 10)
        .attr('fill', '#ff6ac1');

      svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('x', (d) => d.x + 12)
        .attr('y', (d) => d.y + 4)
        .text((d) => d.user.slice(0, 6))
        .attr('font-size', '10px')
        .attr('fill', '#ffffff');
    };

    fetchAndRender();
  }, []);

  return <svg ref={svgRef} width={1000} height={600} />;
};
