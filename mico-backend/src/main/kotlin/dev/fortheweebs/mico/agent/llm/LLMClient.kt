package dev.fortheweebs.mico.agent.llm

/**
 * Interface for LLM communication.
 * Implementations handle Claude, OpenAI, or other providers.
 */
interface LLMClient {

    /**
     * Sends a prompt to the LLM and gets a complete response.
     */
    fun complete(prompt: String): LLMResponse

    /**
     * Streams a response from the LLM, calling onChunk for each token.
     * Returns the complete response when done.
     */
    fun streamComplete(prompt: String, onChunk: (String) -> Unit): LLMResponse
}

data class LLMResponse(
    val content: String,
    val model: String,
    val usage: TokenUsage,
    val finishReason: String? = null
)

data class TokenUsage(
    val promptTokens: Int,
    val completionTokens: Int,
    val totalTokens: Int
)
