package dev.fortheweebs.mico.agent.model

/**
 * Represents the complete context of a codebase after analysis.
 * This is what Mico "sees" when looking at your project.
 */
data class CodebaseContext(
    val projectPath: String,
    val projectName: String,
    val fileTree: FileTree,
    val languages: Map<String, Int>, // language -> file count
    val dependencies: Dependencies,
    val buildSystem: String?, // gradle, maven, npm, etc
    val entryPoints: List<String>, // main files, index files
    val totalFiles: Int,
    val totalLines: Int
)

data class FileTree(
    val root: FileNode
)

data class FileNode(
    val name: String,
    val path: String,
    val isDirectory: Boolean,
    val children: List<FileNode> = emptyList(),
    val language: String? = null,
    val lines: Int? = null
)

data class Dependencies(
    val direct: List<Dependency>,
    val buildFiles: List<String> // paths to build files found
)

data class Dependency(
    val name: String,
    val version: String?,
    val scope: String? // compile, test, runtime, etc
)
