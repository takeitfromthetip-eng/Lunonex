/**
 * Policy Overrides - Runtime policy management
 * Allows owner to override moderation thresholds, pause lanes, and adjust agent authority
 * All changes are tracked in governance ledger
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Set a policy override
 */
async function setOverride(override) {
  const {
    overrideKey,
    overrideType,
    overrideValue,
    active = true,
    expiresAt,
    setBy,
    reason
  } = override;

  const overrideId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const record = {
    id: overrideId,
    override_key: overrideKey,
    override_type: overrideType,
    override_value: overrideValue,
    active,
    expires_at: expiresAt || null,
    set_by: setBy,
    reason,
    created_at: timestamp,
    updated_at: timestamp
  };

  const { data, error } = await supabase
    .from('policy_overrides')
    .upsert(record, { onConflict: 'override_key' })
    .select()
    .single();

  if (error) {
    console.error('Failed to set policy override:', error);
    throw new Error(`Override creation failed: ${error.message}`);
  }

  console.log(`⚙️  [Policy] Override set: ${overrideKey} = ${JSON.stringify(overrideValue)}`);
  return overrideId;
}

/**
 * Get a specific override by key
 */
async function getOverride(overrideKey) {
  const { data, error} = await supabase
    .from('policy_overrides')
    .select('*')
    .eq('override_key', overrideKey)
    .eq('active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Failed to get policy override:', error);
    throw new Error(`Override query failed: ${error.message}`);
  }

  // Check expiration
  if (data && data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      await deactivateOverride(overrideKey, 'Expired');
      return null;
    }
  }

  return data || null;
}

/**
 * Get all active overrides
 */
async function getAllOverrides() {
  const { data, error } = await supabase
    .from('policy_overrides')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get all overrides:', error);
    throw new Error(`Overrides query failed: ${error.message}`);
  }

  return data || [];
}

/**
 * Deactivate an override
 */
async function deactivateOverride(overrideKey, reason) {
  const { error } = await supabase
    .from('policy_overrides')
    .update({
      active: false,
      deactivated_at: new Date().toISOString(),
      deactivation_reason: reason
    })
    .eq('override_key', overrideKey);

  if (error) {
    console.error('Failed to deactivate override:', error);
    throw new Error(`Override deactivation failed: ${error.message}`);
  }

  console.log(`⚙️  [Policy] Override deactivated: ${overrideKey} (${reason})`);
  return true;
}

/**
 * Set moderation threshold override
 */
async function setModerationThreshold(contentType, flagType, threshold, reason, setBy) {
  const overrideKey = `moderation_threshold_${contentType}_${flagType}`;

  return await setOverride({
    overrideKey,
    overrideType: 'moderation_threshold',
    overrideValue: { contentType, flagType, threshold },
    active: true,
    setBy,
    reason
  });
}

/**
 * Get all priority lanes
 */
async function getPriorityLanes() {
  const { data, error } = await supabase
    .from('policy_overrides')
    .select('*')
    .eq('override_type', 'priority_lane')
    .eq('active', true);

  if (error) {
    console.error('Failed to get priority lanes:', error);
    return [];
  }

  return data || [];
}

/**
 * Pause a priority lane
 */
async function pausePriorityLane(laneName, reason) {
  const overrideKey = `priority_lane_${laneName}`;

  return await setOverride({
    overrideKey,
    overrideType: 'priority_lane',
    overrideValue: { laneName, paused: true },
    active: true,
    setBy: 'system',
    reason
  });
}

/**
 * Resume a priority lane
 */
async function resumePriorityLane(laneName) {
  const overrideKey = `priority_lane_${laneName}`;
  return await deactivateOverride(overrideKey, 'Lane resumed');
}

module.exports = {
  setOverride,
  getOverride,
  getAllOverrides,
  deactivateOverride,
  setModerationThreshold,
  getPriorityLanes,
  pausePriorityLane,
  resumePriorityLane
};
