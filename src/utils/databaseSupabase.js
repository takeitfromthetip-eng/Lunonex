// SUPABASE DATABASE UTILITIES - Complete database abstraction layer

import { supabase } from '../lib/supabase';

// ============ USERS ============

export async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserBalance(userId, amount) {
  // Get current balance
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  const newBalance = (user?.balance || 0) + amount;

  return updateUser(userId, { balance: newBalance });
}

// ============ ARTWORKS ============

export async function createArtwork(artworkData) {
  const { data, error } = await supabase
    .from('artworks')
    .insert([{
      ...artworkData,
      created_at: new Date().toISOString(),
      likes: 0,
      views: 0,
      comments_count: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getArtwork(artworkId) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', artworkId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateArtwork(artworkId, updates) {
  const { data, error } = await supabase
    .from('artworks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', artworkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArtwork(artworkId) {
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', artworkId);

  if (error) throw error;
}

export async function getUserArtworks(userId) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function incrementArtworkViews(artworkId) {
  const { data, error } = await supabase.rpc('increment_artwork_views', {
    artwork_id: artworkId
  });

  if (error) {
    // Fallback if RPC not available
    const artwork = await getArtwork(artworkId);
    return updateArtwork(artworkId, { views: (artwork.views || 0) + 1 });
  }

  return data;
}

export async function likeArtwork(artworkId, userId) {
  // Add to likes table
  const { error: likeError } = await supabase
    .from('artwork_likes')
    .insert([{
      artwork_id: artworkId,
      user_id: userId,
      created_at: new Date().toISOString()
    }]);

  if (likeError) throw likeError;

  // Increment likes count
  const artwork = await getArtwork(artworkId);
  return updateArtwork(artworkId, { likes: (artwork.likes || 0) + 1 });
}

export async function unlikeArtwork(artworkId, userId) {
  // Remove from likes table
  const { error: unlikeError } = await supabase
    .from('artwork_likes')
    .delete()
    .match({ artwork_id: artworkId, user_id: userId });

  if (unlikeError) throw unlikeError;

  // Decrement likes count
  const artwork = await getArtwork(artworkId);
  return updateArtwork(artworkId, { likes: Math.max(0, (artwork.likes || 0) - 1) });
}

// ============ COMMISSIONS ============

export async function createCommission(commissionData) {
  const { data, error } = await supabase
    .from('commissions')
    .insert([{
      ...commissionData,
      created_at: new Date().toISOString(),
      status: 'open'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCommission(commissionId) {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', commissionId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommission(commissionId, updates) {
  const { data, error } = await supabase
    .from('commissions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', commissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllCommissions() {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserCommissions(userId) {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============ COMMISSION ORDERS ============

export async function createCommissionOrder(orderData) {
  const { data, error } = await supabase
    .from('commission_orders')
    .insert([{
      ...orderData,
      created_at: new Date().toISOString(),
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommissionOrder(orderId, updates) {
  const { data, error } = await supabase
    .from('commission_orders')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ SUBSCRIPTIONS ============

export async function createSubscription(subscriptionData) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscriptionData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function updateSubscription(subscriptionId, updates) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(subscriptionId) {
  return updateSubscription(subscriptionId, {
    status: 'canceled',
    canceled_at: new Date().toISOString()
  });
}

// ============ TIPS ============

export async function createTip(tipData) {
  const { data, error } = await supabase
    .from('tips')
    .insert([{
      ...tipData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTips(userId, type = 'received') {
  const field = type === 'sent' ? 'sender_id' : 'creator_id';

  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq(field, userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============ TRANSACTIONS ============

export async function createTransaction(transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transactionData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`creator_id.eq.${userId},buyer_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============ COMMENTS ============

export async function createComment(commentData) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      ...commentData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;

  // Increment artwork comment count
  const artwork = await getArtwork(commentData.artwork_id);
  await updateArtwork(commentData.artwork_id, {
    comments_count: (artwork.comments_count || 0) + 1
  });

  return data;
}

export async function getArtworkComments(artworkId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users(*)')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============ FOLLOWS ============

export async function followUser(followerId, followingId) {
  const { data, error } = await supabase
    .from('follows')
    .insert([{
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unfollowUser(followerId, followingId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: followerId, following_id: followingId });

  if (error) throw error;
}

export async function getUserFollowers(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:users(*)')
    .eq('following_id', userId);

  if (error) throw error;
  return data.map(f => f.follower);
}

export async function getUserFollowing(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following:users(*)')
    .eq('follower_id', userId);

  if (error) throw error;
  return data.map(f => f.following);
}

// ============ ANALYTICS ============

export async function getCreatorAnalytics(creatorId) {
  // Get follower count
  const { count: followers } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', creatorId);

  // Get artworks
  const artworks = await getUserArtworks(creatorId);

  // Calculate total likes and views
  const totalLikes = artworks.reduce((sum, art) => sum + (art.likes || 0), 0);
  const totalViews = artworks.reduce((sum, art) => sum + (art.views || 0), 0);

  return {
    followers: followers || 0,
    artworkCount: artworks.length,
    totalLikes,
    totalViews
  };
}

export default {
  // Users
  createUser,
  getUser,
  updateUser,
  updateUserBalance,

  // Artworks
  createArtwork,
  getArtwork,
  updateArtwork,
  deleteArtwork,
  getUserArtworks,
  incrementArtworkViews,
  likeArtwork,
  unlikeArtwork,

  // Commissions
  createCommission,
  getCommission,
  updateCommission,
  getAllCommissions,
  getUserCommissions,

  // Commission Orders
  createCommissionOrder,
  updateCommissionOrder,

  // Subscriptions
  createSubscription,
  getUserSubscription,
  updateSubscription,
  cancelSubscription,

  // Tips
  createTip,
  getUserTips,

  // Transactions
  createTransaction,
  getUserTransactions,

  // Comments
  createComment,
  getArtworkComments,

  // Follows
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,

  // Analytics
  getCreatorAnalytics
};
