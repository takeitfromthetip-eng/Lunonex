package dev.fortheweebs.mico.model

data class SlabRequest(
    val projectName: String,
    val projectPath: String,
    val stream: Boolean = false
)
