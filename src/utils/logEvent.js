import { supabase } from '../lib/supabase';

export const logEvent = async (userId, type, description) => {
  await supabase.from('sovereign_events').insert([
    {
      user_id: userId,
      type,
      description,
    },
  ]);
};
