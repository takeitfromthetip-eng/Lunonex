package dev.fortheweebs.mico.agent.llm

import dev.fortheweebs.mico.agent.model.CodebaseContext
import org.springframework.stereotype.Component

@Component
class PromptBuilder {

    /**
     * Builds a comprehensive prompt from codebase context and user intent.
     */
    fun buildPrompt(context: CodebaseContext, userIntent: String? = null): String {
        return buildString {
            appendLine("You are Mico, a sovereign coding agent with full context of this codebase.")
            appendLine()
            appendLine("=== CODEBASE ANALYSIS ===")
            appendLine()
            appendLine("Project: ${context.projectName}")
            appendLine("Path: ${context.projectPath}")
            appendLine("Files: ${context.totalFiles}")
            appendLine("Lines of Code: ${context.totalLines}")
            appendLine()

            if (context.languages.isNotEmpty()) {
                appendLine("Languages:")
                context.languages.entries
                    .sortedByDescending { it.value }
                    .forEach { (lang, count) ->
                        appendLine("  - $lang: $count files")
                    }
                appendLine()
            }

            if (context.buildSystem != null) {
                appendLine("Build System: ${context.buildSystem}")
                appendLine()
            }

            if (context.dependencies.direct.isNotEmpty()) {
                appendLine("Dependencies (${context.dependencies.direct.size} total):")
                context.dependencies.direct.take(10).forEach { dep ->
                    appendLine("  - ${dep.name}${dep.version?.let { ":$it" } ?: ""} (${dep.scope})")
                }
                if (context.dependencies.direct.size > 10) {
                    appendLine("  ... and ${context.dependencies.direct.size - 10} more")
                }
                appendLine()
            }

            if (context.entryPoints.isNotEmpty()) {
                appendLine("Entry Points:")
                context.entryPoints.forEach { entry ->
                    appendLine("  - $entry")
                }
                appendLine()
            }

            appendLine("Project Structure:")
            appendProjectTree(context.fileTree.root, indent = 0)
            appendLine()

            appendLine("=== YOUR TASK ===")
            appendLine()
            if (userIntent != null) {
                appendLine(userIntent)
            } else {
                appendLine("Analyze this codebase and suggest improvements or next steps.")
            }
            appendLine()
            appendLine("Provide your response as actionable code changes, build commands, or architectural suggestions.")
        }
    }

    /**
     * Builds a simpler prompt for quick tasks.
     */
    fun buildSimplePrompt(context: CodebaseContext, task: String): String {
        return buildString {
            appendLine("Project: ${context.projectName}")
            appendLine("Languages: ${context.languages.keys.joinToString(", ")}")
            if (context.buildSystem != null) {
                appendLine("Build: ${context.buildSystem}")
            }
            appendLine()
            appendLine("Task: $task")
        }
    }

    private fun StringBuilder.appendProjectTree(
        node: dev.fortheweebs.mico.agent.model.FileNode,
        indent: Int,
        maxDepth: Int = 3,
        maxFiles: Int = 100
    ) {
        if (indent > maxDepth) return

        val prefix = "  ".repeat(indent)

        if (node.isDirectory) {
            appendLine("$prefix${node.name}/")
            node.children.take(maxFiles).forEach { child ->
                appendProjectTree(child, indent + 1, maxDepth, maxFiles)
            }
            if (node.children.size > maxFiles) {
                appendLine("$prefix  ... ${node.children.size - maxFiles} more items")
            }
        } else {
            val langInfo = node.language?.let { " ($it)" } ?: ""
            val linesInfo = node.lines?.let { " - $it lines" } ?: ""
            appendLine("$prefix${node.name}$langInfo$linesInfo")
        }
    }

    /**
     * Builds a code generation prompt.
     */
    fun buildCodeGenerationPrompt(
        context: CodebaseContext,
        featureDescription: String
    ): String {
        return buildString {
            appendLine("You are Mico, a code generation agent.")
            appendLine()
            appendLine("Project: ${context.projectName}")
            appendLine("Primary Language: ${context.languages.entries.maxByOrNull { it.value }?.key ?: "Unknown"}")
            appendLine("Build System: ${context.buildSystem ?: "Unknown"}")
            appendLine()
            appendLine("Generate code to implement the following feature:")
            appendLine()
            appendLine(featureDescription)
            appendLine()
            appendLine("Provide:")
            appendLine("1. File paths where code should be added/modified")
            appendLine("2. Complete code blocks with proper imports")
            appendLine("3. Any build configuration changes needed")
            appendLine("4. Test cases if applicable")
            appendLine()
            appendLine("Format your response as executable code slabs.")
        }
    }
}
