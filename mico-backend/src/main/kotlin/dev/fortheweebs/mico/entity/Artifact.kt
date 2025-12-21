package dev.fortheweebs.mico.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "artifacts")
data class Artifact(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val projectName: String,

    @Column(nullable = false, length = 1024)
    val projectPath: String,

    @Column(nullable = false)
    val status: String, // "success", "error", "in_progress"

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column
    val completedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val durationMs: Long = 0,

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "artifact_logs", joinColumns = [JoinColumn(name = "artifact_id")])
    @Column(name = "log_line", length = 2048)
    @OrderColumn(name = "line_number")
    val logs: MutableList<String> = mutableListOf(),

    @Column(length = 4096)
    val metadata: String? = null // JSON for additional context
)
