package dev.fortheweebs.mico.agent.analyzer

import dev.fortheweebs.mico.agent.model.CodebaseContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.File

@Service
class CodebaseAnalyzerImpl(
    private val fileTreeBuilder: FileTreeBuilder,
    private val dependencyExtractor: DependencyExtractor
) : CodebaseAnalyzer {

    private val logger = LoggerFactory.getLogger(CodebaseAnalyzerImpl::class.java)

    override fun analyze(projectPath: String, onProgress: (String) -> Unit): CodebaseContext {
        logger.info("Starting full analysis of: $projectPath")
        onProgress("Starting codebase analysis...")

        val projectDir = File(projectPath)
        if (!projectDir.exists() || !projectDir.isDirectory) {
            throw IllegalArgumentException("Invalid project path: $projectPath")
        }

        // Build file tree
        onProgress("Analyzing project structure...")
        val fileTree = fileTreeBuilder.buildTree(projectPath, onProgress)

        // Get statistics
        val (totalFiles, totalLines) = fileTreeBuilder.getStats(fileTree)
        val languages = fileTreeBuilder.countLanguages(fileTree)

        onProgress("Found $totalFiles files, $totalLines lines of code")
        onProgress("Languages: ${languages.keys.joinToString(", ")}")

        // Extract dependencies
        val dependencies = dependencyExtractor.extractDependencies(projectPath, onProgress)

        // Detect build system
        val buildSystem = detectBuildSystem(dependencies.buildFiles)
        if (buildSystem != null) {
            onProgress("Build system: $buildSystem")
        }

        // Find entry points
        val entryPoints = findEntryPoints(fileTree)
        if (entryPoints.isNotEmpty()) {
            onProgress("Entry points: ${entryPoints.joinToString(", ")}")
        }

        onProgress("Analysis complete")

        return CodebaseContext(
            projectPath = projectPath,
            projectName = projectDir.name,
            fileTree = fileTree,
            languages = languages,
            dependencies = dependencies,
            buildSystem = buildSystem,
            entryPoints = entryPoints,
            totalFiles = totalFiles,
            totalLines = totalLines
        )
    }

    override fun quickAnalyze(projectPath: String): CodebaseContext {
        logger.info("Starting quick analysis of: $projectPath")

        val projectDir = File(projectPath)
        if (!projectDir.exists() || !projectDir.isDirectory) {
            throw IllegalArgumentException("Invalid project path: $projectPath")
        }

        val fileTree = fileTreeBuilder.buildTree(projectPath)
        val (totalFiles, totalLines) = fileTreeBuilder.getStats(fileTree)
        val languages = fileTreeBuilder.countLanguages(fileTree)

        return CodebaseContext(
            projectPath = projectPath,
            projectName = projectDir.name,
            fileTree = fileTree,
            languages = languages,
            dependencies = dev.fortheweebs.mico.agent.model.Dependencies(emptyList(), emptyList()),
            buildSystem = null,
            entryPoints = emptyList(),
            totalFiles = totalFiles,
            totalLines = totalLines
        )
    }

    private fun detectBuildSystem(buildFiles: List<String>): String? {
        return when {
            buildFiles.any { it.startsWith("build.gradle") } -> "Gradle"
            buildFiles.contains("pom.xml") -> "Maven"
            buildFiles.contains("package.json") -> "npm/yarn"
            buildFiles.contains("Cargo.toml") -> "Cargo"
            buildFiles.contains("go.mod") -> "Go Modules"
            buildFiles.contains("requirements.txt") || buildFiles.contains("Pipfile") -> "Python"
            buildFiles.contains("Gemfile") -> "Bundler"
            else -> null
        }
    }

    private fun findEntryPoints(fileTree: dev.fortheweebs.mico.agent.model.FileTree): List<String> {
        val entryPoints = mutableListOf<String>()

        fun traverse(node: dev.fortheweebs.mico.agent.model.FileNode) {
            if (!node.isDirectory) {
                val name = node.name.lowercase()
                when {
                    // Java/Kotlin mains
                    name.endsWith("application.kt") || name.endsWith("application.java") -> entryPoints.add(node.path)
                    name.endsWith("main.kt") || name.endsWith("main.java") -> entryPoints.add(node.path)

                    // JavaScript/TypeScript
                    name == "index.js" || name == "index.ts" || name == "main.js" -> entryPoints.add(node.path)
                    name == "app.js" || name == "app.ts" || name == "server.js" -> entryPoints.add(node.path)

                    // Python
                    name == "__main__.py" || name == "main.py" || name == "app.py" -> entryPoints.add(node.path)

                    // Go
                    name == "main.go" -> entryPoints.add(node.path)

                    // Ruby
                    name == "application.rb" || name == "main.rb" -> entryPoints.add(node.path)

                    // Rust
                    name == "main.rs" -> entryPoints.add(node.path)
                }
            }
            node.children.forEach { traverse(it) }
        }

        traverse(fileTree.root)
        return entryPoints
    }
}
