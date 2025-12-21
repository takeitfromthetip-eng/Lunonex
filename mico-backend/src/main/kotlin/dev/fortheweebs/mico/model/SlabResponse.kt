package dev.lunonex.mico.model

data class SlabResponse(
    val status: String,
    val artifactId: Int,
    val logs: List<String>
)
