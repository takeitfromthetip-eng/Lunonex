package dev.fortheweebs.mico.controller

import dev.fortheweebs.mico.model.SlabRequest
import dev.fortheweebs.mico.model.SlabResponse
import dev.fortheweebs.mico.service.ArtifactService
import dev.fortheweebs.mico.service.SlabExecutionService
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.Executors

@RestController
@RequestMapping("/api/slab")
class SlabController(
    private val slabExecutionService: SlabExecutionService,
    private val artifactService: ArtifactService
) {

    private val logger = LoggerFactory.getLogger(SlabController::class.java)
    private val executor = Executors.newCachedThreadPool()

    /**
     * SSE streaming endpoint - streams logs line-by-line as they're generated.
     * IntelliJ plugin receives each log immediately.
     */
    @PostMapping("/execute", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun executeSlabStreaming(@RequestBody request: SlabRequest): SseEmitter {
        logger.info("Received streaming slab execution request: $request")

        val emitter = SseEmitter(60_000L) // 60 second timeout

        executor.execute {
            var artifactId: Long? = null
            try {
                // Create artifact record
                artifactId = artifactService.createArtifact(request)

                // Execute slab and stream each log line
                slabExecutionService.executeSlabStreaming(request) { logLine ->
                    // Persist log to database
                    artifactService.appendLog(artifactId, logLine)

                    // Stream to client
                    emitter.send(
                        SseEmitter.event()
                            .data(logLine)
                            .name("log")
                    )
                }

                // Mark artifact as complete
                artifactService.completeArtifact(artifactId, "success")

                // Send final completion event
                val artifact = artifactService.getArtifact(artifactId)
                val response = SlabResponse(
                    status = "success",
                    artifactId = artifactId.toInt(),
                    logs = artifact?.logs ?: emptyList()
                )

                emitter.send(
                    SseEmitter.event()
                        .data(response)
                        .name("complete")
                )

                emitter.complete()

            } catch (e: Exception) {
                logger.error("Error during slab execution", e)

                // Mark artifact as failed if we created one
                if (artifactId != null) {
                    artifactService.completeArtifact(artifactId, "error")
                }

                emitter.completeWithError(e)
            }
        }

        return emitter
    }

    /**
     * Non-streaming endpoint - returns all logs at once (fallback).
     */
    @PostMapping("/execute-sync")
    fun executeSlabSync(@RequestBody request: SlabRequest): SlabResponse {
        logger.info("Received sync slab execution request: $request")

        // Create artifact record
        val artifactId = artifactService.createArtifact(request)

        try {
            // Execute slab
            slabExecutionService.executeSlabStreaming(request) { logLine ->
                artifactService.appendLog(artifactId, logLine)
            }

            // Mark as complete
            artifactService.completeArtifact(artifactId, "success")

            // Return response
            val artifact = artifactService.getArtifact(artifactId)
            return SlabResponse(
                status = "success",
                artifactId = artifactId.toInt(),
                logs = artifact?.logs ?: emptyList()
            )

        } catch (e: Exception) {
            logger.error("Error during sync execution", e)
            artifactService.completeArtifact(artifactId, "error")
            throw e
        }
    }

    /**
     * Get artifact by ID
     */
    @GetMapping("/artifacts/{id}")
    fun getArtifact(@PathVariable id: Long) = artifactService.getArtifact(id)

    /**
     * Get recent artifacts
     */
    @GetMapping("/artifacts")
    fun getRecentArtifacts(@RequestParam(defaultValue = "50") limit: Int) =
        artifactService.getRecentArtifacts(limit)

    /**
     * Get artifacts by project
     */
    @GetMapping("/artifacts/project/{projectName}")
    fun getArtifactsByProject(@PathVariable projectName: String) =
        artifactService.getArtifactsByProject(projectName)

    /**
     * Get execution statistics
     */
    @GetMapping("/stats")
    fun getStats() = artifactService.getStats()
}
