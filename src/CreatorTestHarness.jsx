import React, { useState } from 'react';
import { supabase } from './dashboardUtils';

export const CreatorTestHarness = () => {
  const [testResult, setTestResult] = useState('');

  const runTest = async () => {
    const { data } = await supabase
      .from('creators')
      .select('*')
      .limit(1);

    setTestResult(data?.[0]?.username || 'No data');
  };

  return (
    <div className="test-harness">
      <button onClick={runTest}>Run Creator Test</button>
      <p>Result: {testResult}</p>
    </div>
  );
};
import { CreatorBadge } from "./components/CreatorBadge";
import { getBadgeForTier } from "./utils/creatorBadges";

const tier = "Founding25";
const badge = getBadgeForTier(tier);

export function CreatorBadgeDemo() {
  return (
    <CreatorBadge
      label={badge.label}
      color={badge.color}
      icon={badge.icon}
    />
  );
}
