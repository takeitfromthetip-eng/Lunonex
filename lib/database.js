// Database Manager for ForTheWeebs
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'anime-data.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    
    return {
      anime: [],
      manga: [],
      watchlist: [],
      favorites: [],
      completed: [],
      ratings: {},
      reviews: {},
      lastSync: null,
      stats: {
        totalWatched: 0,
        totalEpisodes: 0,
        totalHours: 0,
        favoriteGenres: {},
        averageRating: 0
      }
    };
  }

  saveData() {
    try {
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  // Anime operations
  addAnime(anime) {
    const id = anime.id || Date.now().toString();
    const newAnime = {
      id,
      title: anime.title,
      englishTitle: anime.englishTitle || '',
      genres: anime.genres || [],
      episodes: anime.episodes || 0,
      status: anime.status || 'Not Started', // Not Started, Watching, Completed, On Hold, Dropped
      rating: anime.rating || 0,
      dateAdded: new Date().toISOString(),
      dateCompleted: null,
      notes: anime.notes || '',
      image: anime.image || '',
      description: anime.description || ''
    };
    
    this.data.anime.push(newAnime);
    this.saveData();
    return newAnime;
  }

  updateAnime(id, updates) {
    const index = this.data.anime.findIndex(anime => anime.id === id);
    if (index !== -1) {
      this.data.anime[index] = { ...this.data.anime[index], ...updates };
      if (updates.status === 'Completed' && !this.data.anime[index].dateCompleted) {
        this.data.anime[index].dateCompleted = new Date().toISOString();
      }
      this.saveData();
      this.updateStats();
      return this.data.anime[index];
    }
    return null;
  }

  deleteAnime(id) {
    const index = this.data.anime.findIndex(anime => anime.id === id);
    if (index !== -1) {
      const deleted = this.data.anime.splice(index, 1)[0];
      this.saveData();
      this.updateStats();
      return deleted;
    }
    return null;
  }

  getAnime(id) {
    return this.data.anime.find(anime => anime.id === id);
  }

  getAllAnime() {
    return [...this.data.anime];
  }

  searchAnime(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.data.anime.filter(anime => 
      anime.title.toLowerCase().includes(lowercaseQuery) ||
      anime.englishTitle.toLowerCase().includes(lowercaseQuery) ||
      anime.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Watchlist operations
  addToWatchlist(animeId) {
    if (!this.data.watchlist.includes(animeId)) {
      this.data.watchlist.push(animeId);
      this.saveData();
    }
  }

  removeFromWatchlist(animeId) {
    const index = this.data.watchlist.indexOf(animeId);
    if (index !== -1) {
      this.data.watchlist.splice(index, 1);
      this.saveData();
    }
  }

  getWatchlist() {
    return this.data.watchlist.map(id => this.getAnime(id)).filter(Boolean);
  }

  // Favorites operations
  addToFavorites(animeId) {
    if (!this.data.favorites.includes(animeId)) {
      this.data.favorites.push(animeId);
      this.saveData();
    }
  }

  removeFromFavorites(animeId) {
    const index = this.data.favorites.indexOf(animeId);
    if (index !== -1) {
      this.data.favorites.splice(index, 1);
      this.saveData();
    }
  }

  getFavorites() {
    return this.data.favorites.map(id => this.getAnime(id)).filter(Boolean);
  }

  // Statistics
  updateStats() {
    const completed = this.data.anime.filter(anime => anime.status === 'Completed');
    const totalEpisodes = completed.reduce((sum, anime) => sum + (anime.episodes || 0), 0);
    const totalHours = totalEpisodes * 0.4; // Assuming 24min episodes
    const ratings = completed.filter(anime => anime.rating > 0).map(anime => anime.rating);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Count genres
    const genreCounts = {};
    this.data.anime.forEach(anime => {
      anime.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    this.data.stats = {
      totalWatched: completed.length,
      totalEpisodes,
      totalHours: Math.round(totalHours * 10) / 10,
      favoriteGenres: genreCounts,
      averageRating: Math.round(averageRating * 10) / 10
    };

    this.saveData();
  }

  getStats() {
    return { ...this.data.stats };
  }

  // Import/Export
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      this.data = { ...this.data, ...imported };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Backup
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(app.getPath('userData'), `backup-${timestamp}.json`);
    try {
      fs.writeFileSync(backupPath, this.exportData());
      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }
}

module.exports = DatabaseManager;