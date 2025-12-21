package dev.fortheweebs.mico.agent.llm

import com.google.gson.Gson
import com.google.gson.JsonObject
import dev.fortheweebs.mico.config.LLMConfig
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.TimeUnit

@Component
@ConditionalOnProperty(prefix = "mico.llm", name = ["provider"], havingValue = "claude")
class ClaudeClient(
    private val config: LLMConfig
) : LLMClient {

    private val logger = LoggerFactory.getLogger(ClaudeClient::class.java)
    private val gson = Gson()
    private val client = OkHttpClient.Builder()
        .connectTimeout(config.timeoutSeconds, TimeUnit.SECONDS)
        .readTimeout(config.timeoutSeconds, TimeUnit.SECONDS)
        .writeTimeout(config.timeoutSeconds, TimeUnit.SECONDS)
        .build()

    private val apiUrl = "https://api.anthropic.com/v1/messages"
    private val jsonMediaType = "application/json".toMediaType()

    override fun complete(prompt: String): LLMResponse {
        logger.info("Sending complete request to Claude (${config.model})")

        val requestBody = buildRequestBody(prompt, stream = false)
        val request = buildRequest(requestBody)

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw RuntimeException("Claude API error: ${response.code} - ${response.body?.string()}")
            }

            val responseBody = response.body?.string() ?: throw RuntimeException("Empty response")
            return parseResponse(responseBody)
        }
    }

    override fun streamComplete(prompt: String, onChunk: (String) -> Unit): LLMResponse {
        logger.info("Sending streaming request to Claude (${config.model})")

        val requestBody = buildRequestBody(prompt, stream = true)
        val request = buildRequest(requestBody)

        val contentBuilder = StringBuilder()
        var usage: TokenUsage? = null
        var model: String = config.model

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw RuntimeException("Claude API error: ${response.code} - ${response.body?.string()}")
            }

            val reader = BufferedReader(InputStreamReader(response.body?.byteStream()))
            reader.useLines { lines ->
                lines.forEach { line ->
                    if (line.startsWith("data: ")) {
                        val data = line.removePrefix("data: ").trim()
                        if (data == "[DONE]") return@forEach

                        try {
                            val json = gson.fromJson(data, JsonObject::class.java)
                            val type = json.get("type")?.asString

                            when (type) {
                                "content_block_delta" -> {
                                    val delta = json.getAsJsonObject("delta")
                                    val text = delta.get("text")?.asString
                                    if (text != null) {
                                        contentBuilder.append(text)
                                        onChunk(text)
                                    }
                                }
                                "message_delta" -> {
                                    val delta = json.getAsJsonObject("delta")
                                    val usageObj = delta.getAsJsonObject("usage")
                                    if (usageObj != null) {
                                        val outputTokens = usageObj.get("output_tokens")?.asInt ?: 0
                                        usage = TokenUsage(
                                            promptTokens = 0, // Will be set from message_start
                                            completionTokens = outputTokens,
                                            totalTokens = outputTokens
                                        )
                                    }
                                }
                                "message_start" -> {
                                    val message = json.getAsJsonObject("message")
                                    model = message.get("model")?.asString ?: config.model
                                    val usageObj = message.getAsJsonObject("usage")
                                    if (usageObj != null) {
                                        val inputTokens = usageObj.get("input_tokens")?.asInt ?: 0
                                        usage = TokenUsage(
                                            promptTokens = inputTokens,
                                            completionTokens = 0,
                                            totalTokens = inputTokens
                                        )
                                    }
                                }
                            }
                        } catch (e: Exception) {
                            logger.warn("Failed to parse streaming chunk: $data", e)
                        }
                    }
                }
            }
        }

        return LLMResponse(
            content = contentBuilder.toString(),
            model = model,
            usage = usage ?: TokenUsage(0, 0, 0),
            finishReason = "end_turn"
        )
    }

    private fun buildRequestBody(prompt: String, stream: Boolean): String {
        val body = mapOf(
            "model" to config.model,
            "max_tokens" to config.maxTokens,
            "temperature" to config.temperature,
            "stream" to stream,
            "messages" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to prompt
                )
            )
        )
        return gson.toJson(body)
    }

    private fun buildRequest(body: String): Request {
        if (config.apiKey.isBlank()) {
            throw IllegalStateException("Claude API key not configured. Set ANTHROPIC_API_KEY environment variable.")
        }

        return Request.Builder()
            .url(apiUrl)
            .post(body.toRequestBody(jsonMediaType))
            .addHeader("x-api-key", config.apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .addHeader("Content-Type", "application/json")
            .build()
    }

    private fun parseResponse(responseBody: String): LLMResponse {
        val json = gson.fromJson(responseBody, JsonObject::class.java)

        val content = json.getAsJsonArray("content")
            ?.get(0)?.asJsonObject
            ?.get("text")?.asString ?: ""

        val model = json.get("model")?.asString ?: config.model

        val usageObj = json.getAsJsonObject("usage")
        val usage = TokenUsage(
            promptTokens = usageObj.get("input_tokens")?.asInt ?: 0,
            completionTokens = usageObj.get("output_tokens")?.asInt ?: 0,
            totalTokens = (usageObj.get("input_tokens")?.asInt ?: 0) +
                         (usageObj.get("output_tokens")?.asInt ?: 0)
        )

        val finishReason = json.get("stop_reason")?.asString

        return LLMResponse(
            content = content,
            model = model,
            usage = usage,
            finishReason = finishReason
        )
    }
}
