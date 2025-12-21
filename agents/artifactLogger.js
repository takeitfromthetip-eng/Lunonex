// Artifact Logger - Stub implementation
// Logs important artifacts and governance decisions

class ArtifactLogger {
  constructor() {
    this.artifacts = [];
  }

  /**
   * Log an artifact
   */
  log(type, data, metadata = {}) {
    const artifact = {
      id: Math.random().toString(36).substring(2, 15),
      type,
      data,
      metadata,
      timestamp: new Date().toISOString(),
      version: this.artifacts.length + 1
    };
    
    this.artifacts.push(artifact);
    
    // Optional: Write to file system or external storage
    console.log(`[ArtifactLogger] Logged: ${type}`);
    
    return artifact;
  }

  /**
   * Get all artifacts of a specific type
   */
  getByType(type) {
    return this.artifacts.filter(a => a.type === type);
  }

  /**
   * Get all artifacts
   */
  getAll() {
    return this.artifacts;
  }

  /**
   * Get artifact by ID
   */
  getById(id) {
    return this.artifacts.find(a => a.id === id) || null;
  }

  /**
   * Get recent artifacts
   */
  getRecent(limit = 10) {
    return this.artifacts.slice(-limit).reverse();
  }

  /**
   * Clear all artifacts (use with caution)
   */
  clear() {
    this.artifacts = [];
    console.log('[ArtifactLogger] All artifacts cleared');
  }
}

module.exports = new ArtifactLogger();
