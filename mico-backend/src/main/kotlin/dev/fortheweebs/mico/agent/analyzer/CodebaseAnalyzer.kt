package dev.fortheweebs.mico.agent.analyzer

import dev.fortheweebs.mico.agent.model.CodebaseContext

/**
 * Core interface for analyzing a codebase.
 * Implementations provide the "vision" layer for Mico.
 */
interface CodebaseAnalyzer {

    /**
     * Analyzes a project directory and returns complete context.
     * @param projectPath Absolute path to project root
     * @param onProgress Callback for progress updates
     * @return CodebaseContext with all discovered information
     */
    fun analyze(projectPath: String, onProgress: (String) -> Unit = {}): CodebaseContext

    /**
     * Quick analysis - just file tree and languages (faster).
     */
    fun quickAnalyze(projectPath: String): CodebaseContext
}
