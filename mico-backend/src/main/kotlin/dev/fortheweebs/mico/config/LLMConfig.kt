package dev.fortheweebs.mico.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "mico.llm")
data class LLMConfig(
    var provider: String = "claude",
    var apiKey: String = "",
    var model: String = "claude-3-5-sonnet-20241022",
    var maxTokens: Int = 4096,
    var temperature: Double = 0.7,
    var timeoutSeconds: Long = 60
)
