/* eslint-disable */
/**
 * API Route: Content Planner
 * Store planned, WIP, and completed content in cloud storage (Vercel Blob)
 */

import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  // GET: Load content items
  if (req.method === 'GET') {
    try {
      const { view } = req.query; // 'calendar', 'wip', 'completed'

      // In production, load from database
      // For now, return from Vercel Blob or mock data
      const statusMap = {
        'calendar': 'planned',
        'wip': 'in_progress',
        'completed': 'completed'
      };

      // Mock data for demo
      const allItems = [
        {
          id: 'cloud_1',
          userId,
          title: 'Tutorial Video Series',
          description: 'Create a 10-part tutorial series on photo editing',
          scheduledDate: '2025-12-15',
          type: 'video',
          status: 'planned',
          files: [],
          tags: ['tutorial', 'photography', 'education'],
          createdAt: '2025-11-08T10:00:00Z'
        },
        {
          id: 'cloud_2',
          userId,
          title: 'VR Experience Demo',
          description: 'Interactive VR experience for new users',
          scheduledDate: '2025-12-20',
          type: 'vr',
          status: 'in_progress',
          files: [],
          tags: ['vr', 'demo', 'interactive'],
          createdAt: '2025-11-07T14:30:00Z'
        },
        {
          id: 'cloud_3',
          userId,
          title: 'Photo Filter Pack',
          description: 'Collection of 20 unique photo filters',
          scheduledDate: '2025-11-01',
          type: 'photo',
          status: 'completed',
          files: [],
          tags: ['filters', 'photography', 'bundle'],
          createdAt: '2025-10-25T09:15:00Z'
        }
      ];

      const filteredItems = view
        ? allItems.filter(item => item.status === statusMap[view])
        : allItems;

      return res.status(200).json({ items: filteredItems });
    } catch (error) {
      console.error('Error loading content:', error);
      return res.status(500).json({ error: 'Failed to load content' });
    }
  }

  // POST: Save new content item
  if (req.method === 'POST') {
    try {
      const { item } = req.body;

      if (!item) {
        return res.status(400).json({ error: 'item required' });
      }

      // In production: Save to database
      // await db.contentPlanner.create({ ...item, userId })

      // For now, save to Vercel Blob as JSON
      const blobPath = `content-planner/${userId}/${item.id}.json`;

      // Uncomment when BLOB_READ_WRITE_TOKEN is set
      // const blob = await put(blobPath, JSON.stringify(item), {
      //   access: 'public',
      //   contentType: 'application/json'
      // });

      return res.status(200).json({
        success: true,
        message: 'Content saved successfully',
        item
      });
    } catch (error) {
      console.error('Error saving content:', error);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  // DELETE: Remove content item
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id required' });
      }

      // In production: Delete from database
      // await db.contentPlanner.delete({ id, userId })

      // Delete from Vercel Blob
      const blobPath = `content-planner/${userId}/${id}.json`;

      // Uncomment when BLOB_READ_WRITE_TOKEN is set
      // await del(blobPath);

      return res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      return res.status(500).json({ error: 'Failed to delete content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
