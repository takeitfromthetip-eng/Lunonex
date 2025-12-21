package dev.fortheweebs.mico.model

data class SlabResponse(
    val status: String,
    val artifactId: Int,
    val logs: List<String>
)
