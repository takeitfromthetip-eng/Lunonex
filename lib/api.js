// API Manager for ForTheWeebs - Integrates with Jikan API (MyAnimeList)
const https = require('https');

class APIManager {
  constructor() {
    this.baseURL = 'https://api.jikan.moe/v4';
    this.cache = new Map();
    this.lastRequest = 0;
    this.requestDelay = 1000; // 1 second delay between requests to respect rate limits
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequest = Date.now();
  }

  // Generic API request helper
  async makeRequest(endpoint) {
    await this.waitForRateLimit();
    
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}${endpoint}`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
    });
  }

  // Search for anime by title
  async searchAnime(query, limit = 10) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const cacheKey = `search_${query}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await this.makeRequest(`/anime?q=${encodedQuery}&limit=${limit}`);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const results = response.data.map(anime => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english || '',
        japaneseTitle: anime.title_japanese || '',
        synopsis: anime.synopsis || '',
        episodes: anime.episodes || 0,
        score: anime.score || 0,
        scored_by: anime.scored_by || 0,
        rank: anime.rank || null,
        popularity: anime.popularity || null,
        status: anime.status || 'Unknown',
        aired: {
          from: anime.aired?.from || null,
          to: anime.aired?.to || null,
          string: anime.aired?.string || ''
        },
        duration: anime.duration || '',
        rating: anime.rating || '',
        source: anime.source || '',
        genres: anime.genres?.map(g => g.name) || [],
        themes: anime.themes?.map(t => t.name) || [],
        demographics: anime.demographics?.map(d => d.name) || [],
        studios: anime.studios?.map(s => s.name) || [],
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        trailer: anime.trailer?.youtube_id || null,
        url: anime.url || '',
        type: anime.type || '',
        year: anime.year || null
      }));

      // Cache for 10 minutes
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), 10 * 60 * 1000);

      return results;
    } catch (error) {
      console.error('API search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // Get anime details by ID
  async getAnimeDetails(animeId) {
    const cacheKey = `details_${animeId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(`/anime/${animeId}/full`);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const anime = response.data;
      const details = {
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english || '',
        japaneseTitle: anime.title_japanese || '',
        synopsis: anime.synopsis || '',
        episodes: anime.episodes || 0,
        score: anime.score || 0,
        scored_by: anime.scored_by || 0,
        rank: anime.rank || null,
        popularity: anime.popularity || null,
        status: anime.status || 'Unknown',
        aired: {
          from: anime.aired?.from || null,
          to: anime.aired?.to || null,
          string: anime.aired?.string || ''
        },
        duration: anime.duration || '',
        rating: anime.rating || '',
        source: anime.source || '',
        genres: anime.genres?.map(g => g.name) || [],
        themes: anime.themes?.map(t => t.name) || [],
        demographics: anime.demographics?.map(d => d.name) || [],
        studios: anime.studios?.map(s => s.name) || [],
        producers: anime.producers?.map(p => p.name) || [],
        licensors: anime.licensors?.map(l => l.name) || [],
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        trailer: anime.trailer?.youtube_id || null,
        url: anime.url || '',
        type: anime.type || '',
        year: anime.year || null,
        season: anime.season || null,
        broadcast: anime.broadcast || {},
        relations: anime.relations || [],
        external: anime.external || [],
        streaming: anime.streaming || []
      };

      // Cache for 1 hour
      this.cache.set(cacheKey, details);
      setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

      return details;
    } catch (error) {
      console.error('API details error:', error);
      throw new Error(`Failed to get anime details: ${error.message}`);
    }
  }

  // Get top anime
  async getTopAnime(type = 'all', limit = 25) {
    const cacheKey = `top_${type}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(`/top/anime?type=${type}&limit=${limit}`);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const results = response.data.map(anime => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english || '',
        score: anime.score || 0,
        rank: anime.rank || null,
        episodes: anime.episodes || 0,
        status: anime.status || 'Unknown',
        genres: anime.genres?.map(g => g.name) || [],
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        year: anime.year || null,
        type: anime.type || ''
      }));

      // Cache for 30 minutes
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), 30 * 60 * 1000);

      return results;
    } catch (error) {
      console.error('API top anime error:', error);
      throw new Error(`Failed to get top anime: ${error.message}`);
    }
  }

  // Get seasonal anime
  async getSeasonalAnime(year, season, limit = 25) {
    const cacheKey = `seasonal_${year}_${season}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(`/seasons/${year}/${season}?limit=${limit}`);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const results = response.data.map(anime => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english || '',
        score: anime.score || 0,
        episodes: anime.episodes || 0,
        status: anime.status || 'Unknown',
        genres: anime.genres?.map(g => g.name) || [],
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        type: anime.type || '',
        studios: anime.studios?.map(s => s.name) || []
      }));

      // Cache for 2 hours
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), 2 * 60 * 60 * 1000);

      return results;
    } catch (error) {
      console.error('API seasonal anime error:', error);
      throw new Error(`Failed to get seasonal anime: ${error.message}`);
    }
  }

  // Get random anime recommendations
  async getRandomAnime() {
    try {
      const response = await this.makeRequest('/random/anime');
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const anime = response.data;
      return {
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english || '',
        synopsis: anime.synopsis || '',
        score: anime.score || 0,
        episodes: anime.episodes || 0,
        status: anime.status || 'Unknown',
        genres: anime.genres?.map(g => g.name) || [],
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        year: anime.year || null,
        type: anime.type || ''
      };
    } catch (error) {
      console.error('API random anime error:', error);
      throw new Error(`Failed to get random anime: ${error.message}`);
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = APIManager;