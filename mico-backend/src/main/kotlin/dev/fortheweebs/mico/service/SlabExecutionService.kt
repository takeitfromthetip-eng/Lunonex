package dev.fortheweebs.mico.service

import dev.fortheweebs.mico.agent.CodeGenerationService
import dev.fortheweebs.mico.agent.analyzer.CodebaseAnalyzer
import dev.fortheweebs.mico.model.SlabRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.text.SimpleDateFormat
import java.util.Date
import java.util.concurrent.atomic.AtomicInteger

@Service
class SlabExecutionService(
    private val codebaseAnalyzer: CodebaseAnalyzer,
    private val codeGenerationService: CodeGenerationService
) {

    private val logger = LoggerFactory.getLogger(SlabExecutionService::class.java)
    private val artifactIdCounter = AtomicInteger(1)
    private val timeFormat = SimpleDateFormat("HH:mm:ss")

    /**
     * Executes a slab with real codebase analysis.
     * This is now powered by actual Mico agent logic!
     */
    fun executeSlabStreaming(request: SlabRequest, onLog: (String) -> Unit): Int {
        val artifactId = artifactIdCounter.getAndIncrement()

        logger.info("Starting slab execution for project: ${request.projectName}")

        onLog("[${timestamp()}] Mico Agent initialized")
        onLog("[${timestamp()}] Target: ${request.projectName}")
        onLog("[${timestamp()}] Path: ${request.projectPath}")

        try {
            // REAL ANALYSIS - Mico sees your codebase
            val context = codebaseAnalyzer.analyze(request.projectPath) { progress ->
                onLog("[${timestamp()}] $progress")
            }

            // Report findings
            onLog("[${timestamp()}] Analysis complete!")
            onLog("[${timestamp()}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            onLog("[${timestamp()}] 📊 Project: ${context.projectName}")
            onLog("[${timestamp()}] 📁 Files: ${context.totalFiles}")
            onLog("[${timestamp()}] 📝 Lines: ${context.totalLines}")

            if (context.languages.isNotEmpty()) {
                val langSummary = context.languages.entries
                    .sortedByDescending { it.value }
                    .take(3)
                    .joinToString(", ") { "${it.key} (${it.value})" }
                onLog("[${timestamp()}] 💻 Languages: $langSummary")
            }

            if (context.buildSystem != null) {
                onLog("[${timestamp()}] 🔧 Build System: ${context.buildSystem}")
            }

            if (context.dependencies.direct.isNotEmpty()) {
                onLog("[${timestamp()}] 📦 Dependencies: ${context.dependencies.direct.size} found")
            }

            if (context.entryPoints.isNotEmpty()) {
                onLog("[${timestamp()}] 🎯 Entry Points: ${context.entryPoints.size}")
                context.entryPoints.take(3).forEach { entry ->
                    onLog("[${timestamp()}]    → $entry")
                }
            }

            onLog("[${timestamp()}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            // MICO'S BRAIN - LLM code generation
            onLog("[${timestamp()}] 🧠 Mico analyzing project...")
            onLog("[${timestamp()}] 🤖 Generating insights...")
            onLog("")

            // Stream LLM response directly to console
            val generatedCode = codeGenerationService.analyzeCodebase(context) { chunk ->
                // Stream each token as it arrives
                onLog(chunk)
            }

            onLog("")
            onLog("[${timestamp()}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            onLog("[${timestamp()}] ✅ Mico analysis complete")
            onLog("[${timestamp()}] 💾 Slab execution finished")

        } catch (e: Exception) {
            logger.error("Error during slab execution", e)
            onLog("[${timestamp()}] ❌ Error: ${e.message}")
            throw e
        }

        logger.info("Completed slab execution. Artifact ID: $artifactId")
        return artifactId
    }

    private fun timestamp(): String = timeFormat.format(Date())
}
