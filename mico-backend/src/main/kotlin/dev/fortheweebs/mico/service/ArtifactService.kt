package dev.fortheweebs.mico.service

import dev.fortheweebs.mico.entity.Artifact
import dev.fortheweebs.mico.model.SlabRequest
import dev.fortheweebs.mico.repository.ArtifactRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@Service
class ArtifactService(
    private val artifactRepository: ArtifactRepository
) {

    private val logger = LoggerFactory.getLogger(ArtifactService::class.java)

    /**
     * Creates a new artifact record for a slab execution.
     * Returns the artifact ID.
     */
    @Transactional
    fun createArtifact(request: SlabRequest): Long {
        val artifact = Artifact(
            projectName = request.projectName,
            projectPath = request.projectPath,
            status = "in_progress",
            createdAt = LocalDateTime.now()
        )

        val saved = artifactRepository.save(artifact)
        logger.info("Created artifact ${saved.id} for project: ${request.projectName}")

        return saved.id!!
    }

    /**
     * Appends a log line to an existing artifact.
     */
    @Transactional
    fun appendLog(artifactId: Long, logLine: String) {
        val artifact = artifactRepository.findById(artifactId).orElse(null)
        if (artifact != null) {
            artifact.logs.add(logLine)
            artifactRepository.save(artifact)
        }
    }

    /**
     * Marks an artifact as complete and updates duration.
     */
    @Transactional
    fun completeArtifact(artifactId: Long, status: String = "success") {
        val artifact = artifactRepository.findById(artifactId).orElse(null)
        if (artifact != null) {
            val completedAt = LocalDateTime.now()
            val duration = ChronoUnit.MILLIS.between(artifact.createdAt, completedAt)

            val updated = artifact.copy(
                status = status,
                completedAt = completedAt,
                durationMs = duration
            )

            artifactRepository.save(updated)
            logger.info("Completed artifact $artifactId with status: $status (duration: ${duration}ms)")
        }
    }

    /**
     * Retrieves an artifact by ID.
     */
    fun getArtifact(artifactId: Long): Artifact? {
        return artifactRepository.findById(artifactId).orElse(null)
    }

    /**
     * Retrieves all artifacts for a project.
     */
    fun getArtifactsByProject(projectName: String): List<Artifact> {
        return artifactRepository.findByProjectNameOrderByCreatedAtDesc(projectName)
    }

    /**
     * Retrieves recent artifacts (last N executions).
     */
    fun getRecentArtifacts(limit: Int = 50): List<Artifact> {
        return artifactRepository.findRecentArtifacts().take(limit)
    }

    /**
     * Gets statistics about artifact executions.
     */
    fun getStats(): Map<String, Any> {
        val total = artifactRepository.count()
        val successCount = artifactRepository.countByStatus("success")
        val errorCount = artifactRepository.countByStatus("error")
        val inProgressCount = artifactRepository.countByStatus("in_progress")

        return mapOf(
            "total" to total,
            "success" to successCount,
            "error" to errorCount,
            "in_progress" to inProgressCount
        )
    }
}
