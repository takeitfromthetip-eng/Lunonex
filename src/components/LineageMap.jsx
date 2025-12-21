import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { supabase } from '../lib/supabase';

export const LineageMap = ({ userId }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      const { data } = await supabase
        .from('remix_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      const nodes = data?.map((session, i) => ({
        id: session.remix_anchor,
        x: 50 + i * 100,
        y: 200,
        timestamp: session.timestamp,
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
        .attr('r', 8)
        .attr('fill', '#7f5af0');

      svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('x', (d) => d.x + 10)
        .attr('y', (d) => d.y)
        .text((d) => d.id.slice(0, 8))
        .attr('font-size', '12px')
        .attr('fill', '#ffffff');
    };

    fetchAndRender();
  }, [userId]);

  return <svg ref={svgRef} width={800} height={400} />;
};
