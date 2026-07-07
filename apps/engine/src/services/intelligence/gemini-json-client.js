const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MODEL_NAME } = require("./constants");
const { extractJson } = require("./json-utils");

class GeminiJsonClient {
  constructor() {
    this.genAI = process.env.GOOGLE_GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
      : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: MODEL_NAME }) : null;
  }

  isConfigured() {
    return Boolean(this.model);
  }

  async generateJson(prompt, schema) {
    if (!this.model) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    try {
      const firstText = await this.generateText(prompt);
      const firstValidation = this.parseAndValidate(firstText, schema);
      if (firstValidation.ok) return firstValidation.data;

      // Retry/Repair logic for Gemini
      const repairPrompt = `
The previous response was invalid for this schema.
Return repaired strict JSON only. Do not include markdown.

VALIDATION ERROR:
${firstValidation.error}

ORIGINAL RESPONSE:
${firstText}
`.trim();

      const repairedText = await this.generateText(repairPrompt);
      const repairedValidation = this.parseAndValidate(repairedText, schema);
      if (repairedValidation.ok) return repairedValidation.data;

      throw new Error(`Gemini JSON validation failed after retry: ${repairedValidation.error}`);
    } catch (error) {
      const logger = require("../lib/logger");
      const isRetryable = error.message.includes("503") || error.message.includes("429") || error.message.includes("Service Unavailable");
      
      if (isRetryable && process.env.GROQ_API_KEY) {
        logger.warn(`[AI] Gemini is unavailable (503/429). Falling back to GROQ...`);
        return this.generateJsonWithGroq(prompt, schema);
      }
      throw error;
    }
  }

  async generateJsonWithGroq(prompt, schema) {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const logger = require("../lib/logger");

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const text = completion.choices[0]?.message?.content || "";
      const validation = this.parseAndValidate(text, schema);
      if (validation.ok) {
        logger.info(`[AI] Successfully recovered using GROQ (Llama-3).`);
        return validation.data;
      }
      throw new Error(`Groq JSON validation failed: ${validation.error}`);
    } catch (groqError) {
      logger.error(`[AI] Both Gemini and Groq failed: ${groqError.message}`);
      throw groqError;
    }
  }

  async generateText(prompt) {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  parseAndValidate(text, schema) {
    try {
      const json = extractJson(text);
      const result = schema.safeParse(json);
      if (!result.success) {
        return { ok: false, error: result.error.message };
      }
      return { ok: true, data: result.data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}

module.exports = new GeminiJsonClient();
