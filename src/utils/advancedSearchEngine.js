/* eslint-disable */
/**
 * Advanced Search Engine
 *
 * Lightning-fast search across 12,000+ files with:
 * - Full-text search with fuzzy matching
 * - Filter by type, date, tags, copyright status
 * - Smart ranking and relevance scoring
 * - Search suggestions and autocomplete
 * - Saved searches and search history
 */

import { localMediaStorage } from './localMediaStorage';

class AdvancedSearchEngine {
  constructor() {
    this.searchIndex = new Map(); // In-memory search index
    this.searchHistory = [];
    this.savedSearches = [];
    this.indexBuilt = false;
  }

  /**
   * Build search index for fast lookups
   */
  async buildIndex(files = null) {
    console.log('🔍 Building search index...');
    const startTime = Date.now();

    // Get all files if not provided
    if (!files) {
      files = await localMediaStorage.getAllFiles();
    }

    this.searchIndex.clear();

    // Index each file
    files.forEach(file => {
      // Extract searchable text
      const searchableText = this.extractSearchableText(file);
      const tokens = this.tokenize(searchableText);

      // Add to index
      tokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token).add(file.id);
      });

      // Also index by file ID for quick lookup
      this.searchIndex.set(`id:${file.id}`, new Set([file.id]));
    });

    this.indexBuilt = true;
    const duration = Date.now() - startTime;
    console.log(`✅ Search index built: ${this.searchIndex.size} tokens, ${files.length} files (${duration}ms)`);
  }

  /**
   * Search files with advanced filters
   */
  async search(query, options = {}) {
    const {
      type = null, // 'image', 'audio', 'video', 'document'
      tags = [],
      dateFrom = null,
      dateTo = null,
      minSize = null,
      maxSize = null,
      copyrightStatus = null, // 'safe', 'flagged', 'unknown'
      sortBy = 'relevance', // 'relevance', 'date', 'size', 'name'
      limit = 100,
      fuzzy = true,
      includeDeleted = false
    } = options;

    // Build index if not already built
    if (!this.indexBuilt) {
      await this.buildIndex();
    }

    console.log(`🔍 Searching for: "${query}"`);
    const startTime = Date.now();

    // Get all matching file IDs
    let matchingIds = new Set();

    if (query.trim()) {
      // Tokenize query
      const queryTokens = this.tokenize(query);

      // Find files matching any token
      queryTokens.forEach(token => {
        if (fuzzy) {
          // Fuzzy matching - find similar tokens
          const similarTokens = this.findSimilarTokens(token);
          similarTokens.forEach(similarToken => {
            const ids = this.searchIndex.get(similarToken);
            if (ids) {
              ids.forEach(id => matchingIds.add(id));
            }
          });
        } else {
          // Exact matching
          const ids = this.searchIndex.get(token);
          if (ids) {
            ids.forEach(id => matchingIds.add(id));
          }
        }
      });
    } else {
      // No query - return all files
      const allFiles = await localMediaStorage.getAllFiles();
      allFiles.forEach(file => matchingIds.add(file.id));
    }

    // Get full file objects
    let results = await Promise.all(
      Array.from(matchingIds).map(id => localMediaStorage.getFile(id))
    );

    // Filter results
    results = results.filter(file => {
      if (!file) return false;

      // Type filter
      if (type && !file.type.startsWith(type + '/')) return false;

      // Tags filter
      if (tags.length > 0) {
        const fileTags = file.tags || [];
        if (!tags.some(tag => fileTags.includes(tag))) return false;
      }

      // Date filter
      if (dateFrom && new Date(file.uploadedAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(file.uploadedAt) > new Date(dateTo)) return false;

      // Size filter
      if (minSize && file.size < minSize) return false;
      if (maxSize && file.size > maxSize) return false;

      // Copyright status filter
      if (copyrightStatus) {
        const status = file.contentScan?.copyrightStatus || 'unknown';
        if (status !== copyrightStatus) return false;
      }

      // Deleted filter
      if (!includeDeleted && file.deleted) return false;

      return true;
    });

    // Calculate relevance scores
    results = results.map(file => {
      const score = this.calculateRelevance(file, query, options);
      return { ...file, relevanceScore: score };
    });

    // Sort results
    results = this.sortResults(results, sortBy);

    // Limit results
    results = results.slice(0, limit);

    const duration = Date.now() - startTime;
    console.log(`✅ Found ${results.length} results (${duration}ms)`);

    // Save to search history
    this.addToHistory(query, results.length, options);

    return {
      query,
      results,
      total: results.length,
      duration,
      filters: options
    };
  }

  /**
   * Extract searchable text from file metadata
   */
  extractSearchableText(file) {
    const parts = [
      file.filename,
      file.type,
      file.tags?.join(' ') || '',
      file.description || '',
      file.artist || '',
      file.title || '',
      file.album || '',
      file.metadata?.exif?.ImageDescription || ''
    ];

    return parts.join(' ').toLowerCase();
  }

  /**
   * Tokenize text into searchable tokens
   */
  tokenize(text) {
    // Remove special characters and split
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2); // Min 3 chars

    return [...new Set(tokens)]; // Unique tokens
  }

  /**
   * Find similar tokens for fuzzy matching
   */
  findSimilarTokens(token, maxDistance = 2) {
    const similar = [token]; // Include exact match

    // Find tokens with Levenshtein distance <= maxDistance
    for (const indexToken of this.searchIndex.keys()) {
      if (indexToken.startsWith('id:')) continue; // Skip ID tokens

      const distance = this.levenshteinDistance(token, indexToken);
      if (distance > 0 && distance <= maxDistance) {
        similar.push(indexToken);
      }
    }

    return similar;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Calculate relevance score for ranking
   */
  calculateRelevance(file, query, options) {
    let score = 0;

    const searchableText = this.extractSearchableText(file);
    const queryLower = query.toLowerCase();

    // Exact filename match = highest score
    if (file.filename.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Title/description match
    if (file.title?.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    if (file.description?.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Tag match
    const fileTags = file.tags || [];
    if (fileTags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 40;
    }

    // Any text match
    if (searchableText.includes(queryLower)) {
      score += 20;
    }

    // Boost recent files
    const daysSinceUpload = (Date.now() - new Date(file.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpload < 7) {
      score += 10; // Recent files get bonus
    }

    // Boost safe content
    if (file.contentScan?.copyrightStatus === 'safe') {
      score += 5;
    }

    return score;
  }

  /**
   * Sort results
   */
  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      case 'date':
        return results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      case 'size':
        return results.sort((a, b) => b.size - a.size);
      case 'name':
        return results.sort((a, b) => a.filename.localeCompare(b.filename));
      default:
        return results;
    }
  }

  /**
   * Get search suggestions as user types
   */
  getSuggestions(partialQuery, limit = 10) {
    if (!partialQuery || partialQuery.length < 2) return [];

    const suggestions = new Set();
    const queryLower = partialQuery.toLowerCase();

    // Find matching tokens
    for (const token of this.searchIndex.keys()) {
      if (token.startsWith('id:')) continue;

      if (token.startsWith(queryLower)) {
        suggestions.add(token);
      }

      if (suggestions.size >= limit) break;
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Add search to history
   */
  addToHistory(query, resultCount, options) {
    this.searchHistory.unshift({
      query,
      resultCount,
      options,
      timestamp: new Date().toISOString()
    });

    // Keep last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);

    // Persist to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  /**
   * Get search history
   */
  getHistory(limit = 20) {
    // Load from localStorage if not in memory
    if (this.searchHistory.length === 0) {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    }

    return this.searchHistory.slice(0, limit);
  }

  /**
   * Save search for quick access
   */
  saveSearch(name, query, options) {
    this.savedSearches.push({
      id: Date.now().toString(),
      name,
      query,
      options,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));

    return this.savedSearches[this.savedSearches.length - 1];
  }

  /**
   * Get saved searches
   */
  getSavedSearches() {
    // Load from localStorage if not in memory
    if (this.savedSearches.length === 0) {
      const stored = localStorage.getItem('savedSearches');
      if (stored) {
        this.savedSearches = JSON.parse(stored);
      }
    }

    return this.savedSearches;
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(id) {
    this.savedSearches = this.savedSearches.filter(s => s.id !== id);
    localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  /**
   * Rebuild index (call after adding/removing files)
   */
  async rebuildIndex() {
    this.indexBuilt = false;
    await this.buildIndex();
  }
}

// Singleton instance
export const advancedSearchEngine = new AdvancedSearchEngine();

export default AdvancedSearchEngine;

/**
 * USAGE:
 *
 * import { advancedSearchEngine } from './advancedSearchEngine';
 *
 * // Build index on startup
 * await advancedSearchEngine.buildIndex();
 *
 * // Search
 * const results = await advancedSearchEngine.search('naruto', {
 *   type: 'image',
 *   tags: ['anime', 'fan-art'],
 *   dateFrom: '2024-01-01',
 *   copyrightStatus: 'safe',
 *   sortBy: 'relevance',
 *   limit: 50
 * });
 *
 * // Get suggestions as user types
 * const suggestions = advancedSearchEngine.getSuggestions('nar'); // ['naruto', 'narcos', ...]
 *
 * // Save search
 * advancedSearchEngine.saveSearch('My Anime Collection', 'naruto', { type: 'image' });
 *
 * // Get search history
 * const history = advancedSearchEngine.getHistory(10);
 */
