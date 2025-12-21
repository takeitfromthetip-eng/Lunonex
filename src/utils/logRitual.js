import { supabase } from '../lib/supabase';

export const logRitual = async (userId, type, description) => {
  await supabase.from('rituals').insert([
    {
      user_id: userId,
      type,
      description,
    },
  ]);
};
