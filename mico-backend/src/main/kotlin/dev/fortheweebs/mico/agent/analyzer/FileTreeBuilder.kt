package dev.fortheweebs.mico.agent.analyzer

import dev.fortheweebs.mico.agent.model.FileNode
import dev.fortheweebs.mico.agent.model.FileTree
import org.springframework.stereotype.Component
import java.io.File

@Component
class FileTreeBuilder {

    // Common directories to ignore
    private val ignoredDirs = setOf(
        ".git", ".idea", ".vscode", "node_modules", "build", "target",
        "dist", "out", ".gradle", ".mvn", "__pycache__", ".next",
        "venv", "env", ".venv"
    )

    // Common files to ignore
    private val ignoredFiles = setOf(
        ".DS_Store", "Thumbs.db", ".gitignore", ".gitattributes"
    )

    /**
     * Builds a file tree from a project path.
     */
    fun buildTree(projectPath: String, onProgress: (String) -> Unit = {}): FileTree {
        onProgress("Building file tree...")
        val root = buildNode(File(projectPath), projectPath)
        onProgress("File tree complete")
        return FileTree(root)
    }

    private fun buildNode(file: File, rootPath: String): FileNode {
        val relativePath = file.absolutePath.removePrefix(rootPath).removePrefix(File.separator)

        return if (file.isDirectory) {
            val children = file.listFiles()
                ?.filter { shouldInclude(it) }
                ?.map { buildNode(it, rootPath) }
                ?: emptyList()

            FileNode(
                name = file.name,
                path = relativePath.ifEmpty { "/" },
                isDirectory = true,
                children = children
            )
        } else {
            val lines = countLines(file)
            val language = detectLanguage(file)

            FileNode(
                name = file.name,
                path = relativePath,
                isDirectory = false,
                language = language,
                lines = lines
            )
        }
    }

    private fun shouldInclude(file: File): Boolean {
        return when {
            file.isDirectory && file.name in ignoredDirs -> false
            file.isFile && file.name in ignoredFiles -> false
            file.isHidden -> false
            else -> true
        }
    }

    private fun countLines(file: File): Int {
        return try {
            if (file.length() > 1_000_000) return -1 // Skip very large files
            file.readLines().size
        } catch (e: Exception) {
            -1
        }
    }

    private fun detectLanguage(file: File): String? {
        return when (file.extension.lowercase()) {
            "kt" -> "Kotlin"
            "java" -> "Java"
            "js", "jsx" -> "JavaScript"
            "ts", "tsx" -> "TypeScript"
            "py" -> "Python"
            "rb" -> "Ruby"
            "go" -> "Go"
            "rs" -> "Rust"
            "c" -> "C"
            "cpp", "cc", "cxx" -> "C++"
            "h", "hpp" -> "C/C++ Header"
            "cs" -> "C#"
            "php" -> "PHP"
            "swift" -> "Swift"
            "m" -> "Objective-C"
            "scala" -> "Scala"
            "clj", "cljs" -> "Clojure"
            "ex", "exs" -> "Elixir"
            "erl" -> "Erlang"
            "hs" -> "Haskell"
            "sql" -> "SQL"
            "sh", "bash" -> "Shell"
            "yml", "yaml" -> "YAML"
            "json" -> "JSON"
            "xml" -> "XML"
            "html" -> "HTML"
            "css" -> "CSS"
            "scss", "sass" -> "SCSS"
            "md" -> "Markdown"
            "txt" -> "Text"
            else -> null
        }
    }

    /**
     * Calculates statistics from the tree.
     */
    fun getStats(tree: FileTree): Pair<Int, Int> {
        var totalFiles = 0
        var totalLines = 0

        fun traverse(node: FileNode) {
            if (!node.isDirectory) {
                totalFiles++
                totalLines += node.lines ?: 0
            }
            node.children.forEach { traverse(it) }
        }

        traverse(tree.root)
        return Pair(totalFiles, totalLines)
    }

    /**
     * Counts languages in the tree.
     */
    fun countLanguages(tree: FileTree): Map<String, Int> {
        val counts = mutableMapOf<String, Int>()

        fun traverse(node: FileNode) {
            if (!node.isDirectory && node.language != null) {
                counts[node.language] = counts.getOrDefault(node.language, 0) + 1
            }
            node.children.forEach { traverse(it) }
        }

        traverse(tree.root)
        return counts
    }
}
