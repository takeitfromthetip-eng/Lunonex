import { supabase } from '../lib/supabase';

export const pingProtocol = async (userId) => {
  await supabase.from('protocol_pings').insert([{ user_id: userId }]);
};
