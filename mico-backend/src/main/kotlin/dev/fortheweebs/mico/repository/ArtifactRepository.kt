package dev.fortheweebs.mico.repository

import dev.fortheweebs.mico.entity.Artifact
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface ArtifactRepository : JpaRepository<Artifact, Long> {

    // Find artifacts by project name
    fun findByProjectNameOrderByCreatedAtDesc(projectName: String): List<Artifact>

    // Find recent artifacts (last N executions)
    @Query("SELECT a FROM Artifact a ORDER BY a.createdAt DESC")
    fun findRecentArtifacts(): List<Artifact>

    // Find artifacts by status
    fun findByStatusOrderByCreatedAtDesc(status: String): List<Artifact>

    // Find artifacts within date range
    fun findByCreatedAtBetweenOrderByCreatedAtDesc(start: LocalDateTime, end: LocalDateTime): List<Artifact>

    // Count artifacts by status
    fun countByStatus(status: String): Long
}
