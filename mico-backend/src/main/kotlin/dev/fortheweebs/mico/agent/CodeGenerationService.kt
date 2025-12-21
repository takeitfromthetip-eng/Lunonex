package dev.fortheweebs.mico.agent

import dev.fortheweebs.mico.agent.llm.LLMClient
import dev.fortheweebs.mico.agent.llm.PromptBuilder
import dev.fortheweebs.mico.agent.model.CodebaseContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class CodeGenerationService(
    private val llmClient: LLMClient,
    private val promptBuilder: PromptBuilder
) {

    private val logger = LoggerFactory.getLogger(CodeGenerationService::class.java)

    /**
     * Generates code suggestions based on codebase context and user intent.
     * Streams the response via onChunk callback.
     */
    fun generateCode(
        context: CodebaseContext,
        userIntent: String?,
        onChunk: (String) -> Unit
    ): String {
        logger.info("Generating code for project: ${context.projectName}")

        // Build prompt from context
        val prompt = if (userIntent != null) {
            promptBuilder.buildCodeGenerationPrompt(context, userIntent)
        } else {
            promptBuilder.buildPrompt(context, "Analyze this codebase and suggest improvements.")
        }

        logger.debug("Prompt length: ${prompt.length} characters")

        // Stream response from LLM
        val response = llmClient.streamComplete(prompt) { chunk ->
            onChunk(chunk)
        }

        logger.info("Code generation complete. Tokens used: ${response.usage.totalTokens}")

        return response.content
    }

    /**
     * Analyzes codebase and provides insights without code generation.
     */
    fun analyzeCodebase(
        context: CodebaseContext,
        onChunk: (String) -> Unit
    ): String {
        logger.info("Analyzing codebase: ${context.projectName}")

        val prompt = promptBuilder.buildSimplePrompt(
            context,
            "Analyze this project structure and provide architectural insights, potential issues, and improvement suggestions."
        )

        val response = llmClient.streamComplete(prompt, onChunk)

        logger.info("Analysis complete. Tokens used: ${response.usage.totalTokens}")

        return response.content
    }

    /**
     * Generates a specific feature based on description.
     */
    fun generateFeature(
        context: CodebaseContext,
        featureDescription: String,
        onChunk: (String) -> Unit
    ): String {
        logger.info("Generating feature for: ${context.projectName}")

        val prompt = promptBuilder.buildCodeGenerationPrompt(context, featureDescription)

        val response = llmClient.streamComplete(prompt, onChunk)

        logger.info("Feature generation complete. Tokens used: ${response.usage.totalTokens}")

        return response.content
    }
}
