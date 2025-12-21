package dev.fortheweebs.mico.agent.analyzer

import dev.fortheweebs.mico.agent.model.Dependencies
import dev.fortheweebs.mico.agent.model.Dependency
import org.springframework.stereotype.Component
import java.io.File

@Component
class DependencyExtractor {

    /**
     * Extracts dependencies from common build files.
     */
    fun extractDependencies(projectPath: String, onProgress: (String) -> Unit = {}): Dependencies {
        val projectDir = File(projectPath)
        val buildFiles = mutableListOf<String>()
        val dependencies = mutableListOf<Dependency>()

        onProgress("Scanning for build files...")

        // Check for Gradle
        findFile(projectDir, "build.gradle.kts")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
            dependencies.addAll(extractGradleKotlinDeps(file))
        }

        findFile(projectDir, "build.gradle")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
            dependencies.addAll(extractGradleGroovyDeps(file))
        }

        // Check for Maven
        findFile(projectDir, "pom.xml")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
            dependencies.addAll(extractMavenDeps(file))
        }

        // Check for NPM/Yarn
        findFile(projectDir, "package.json")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
            dependencies.addAll(extractNpmDeps(file))
        }

        // Check for Python
        findFile(projectDir, "requirements.txt")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
            dependencies.addAll(extractPipDeps(file))
        }

        findFile(projectDir, "Pipfile")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
        }

        // Check for Ruby
        findFile(projectDir, "Gemfile")?.let { file ->
            buildFiles.add(file.name)
            onProgress("Found ${file.name}")
        }

        onProgress("Found ${buildFiles.size} build file(s), ${dependencies.size} dependencies")

        return Dependencies(
            direct = dependencies,
            buildFiles = buildFiles
        )
    }

    private fun findFile(dir: File, fileName: String): File? {
        val file = File(dir, fileName)
        return if (file.exists()) file else null
    }

    private fun extractGradleKotlinDeps(file: File): List<Dependency> {
        val deps = mutableListOf<Dependency>()
        try {
            val content = file.readText()
            // Simple regex for Gradle Kotlin DSL dependencies
            val regex = """(implementation|api|testImplementation|runtimeOnly)\s*\(\s*"([^"]+)"\s*\)""".toRegex()
            regex.findAll(content).forEach { match ->
                val scope = match.groupValues[1]
                val dep = match.groupValues[2]
                val parts = dep.split(":")
                if (parts.size >= 2) {
                    deps.add(Dependency(
                        name = "${parts[0]}:${parts[1]}",
                        version = parts.getOrNull(2),
                        scope = scope
                    ))
                }
            }
        } catch (e: Exception) {
            // Ignore parsing errors
        }
        return deps
    }

    private fun extractGradleGroovyDeps(file: File): List<Dependency> {
        val deps = mutableListOf<Dependency>()
        try {
            val content = file.readText()
            val regex = """(implementation|api|testImplementation|runtimeOnly)\s+['"]([^'"]+)['"]""".toRegex()
            regex.findAll(content).forEach { match ->
                val scope = match.groupValues[1]
                val dep = match.groupValues[2]
                val parts = dep.split(":")
                if (parts.size >= 2) {
                    deps.add(Dependency(
                        name = "${parts[0]}:${parts[1]}",
                        version = parts.getOrNull(2),
                        scope = scope
                    ))
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
        return deps
    }

    private fun extractMavenDeps(file: File): List<Dependency> {
        val deps = mutableListOf<Dependency>()
        try {
            val content = file.readText()
            // Simple XML parsing for Maven dependencies
            val regex = """<dependency>.*?<groupId>([^<]+)</groupId>.*?<artifactId>([^<]+)</artifactId>.*?(?:<version>([^<]+)</version>)?.*?</dependency>""".toRegex(RegexOption.DOT_MATCHES_ALL)
            regex.findAll(content).forEach { match ->
                deps.add(Dependency(
                    name = "${match.groupValues[1]}:${match.groupValues[2]}",
                    version = match.groupValues.getOrNull(3)?.takeIf { it.isNotBlank() },
                    scope = "compile"
                ))
            }
        } catch (e: Exception) {
            // Ignore
        }
        return deps
    }

    private fun extractNpmDeps(file: File): List<Dependency> {
        val deps = mutableListOf<Dependency>()
        try {
            val content = file.readText()
            // Parse JSON manually (simple approach)
            val depRegex = """"([^"]+)"\s*:\s*"([^"]+)"""".toRegex()

            var inDeps = false
            var inDevDeps = false
            content.lines().forEach { line ->
                when {
                    line.contains(""""dependencies"""") -> inDeps = true
                    line.contains(""""devDependencies"""") -> { inDeps = false; inDevDeps = true }
                    line.contains("}") -> { inDeps = false; inDevDeps = false }
                    inDeps || inDevDeps -> {
                        depRegex.find(line)?.let { match ->
                            deps.add(Dependency(
                                name = match.groupValues[1],
                                version = match.groupValues[2],
                                scope = if (inDevDeps) "dev" else "runtime"
                            ))
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
        return deps
    }

    private fun extractPipDeps(file: File): List<Dependency> {
        val deps = mutableListOf<Dependency>()
        try {
            file.readLines().forEach { line ->
                val trimmed = line.trim()
                if (trimmed.isNotEmpty() && !trimmed.startsWith("#")) {
                    val parts = trimmed.split("==", ">=", "<=", "~=", "!=")
                    deps.add(Dependency(
                        name = parts[0].trim(),
                        version = parts.getOrNull(1)?.trim(),
                        scope = "runtime"
                    ))
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
        return deps
    }
}
