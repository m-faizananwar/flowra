import geminiJsonClient from "./gemini-json-client";
import { JiraResponseSchema } from "./schemas";
import { buildJiraPrompt } from "./prompt-builders";
import logger from "../lib/logger";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

class JiraSkill {
  async assess(context) {
    // Prefer Gemini if configured
    if (geminiJsonClient.isConfigured()) {
      return geminiJsonClient.generateJson(buildJiraPrompt(context), JiraResponseSchema);
    }

    // No evidence — skip immediately
    if (!context.chunks || !context.chunks.length) {
      logger.warn("JiraSkill: No context chunks found, skipping analysis.");
      return { transitions: [] };
    }

    // Fallback: Use Groq (Llama 3.1) — same model used in the test chatbot
    if (!GROQ_API_KEY) {
      logger.warn("JiraSkill: Neither Gemini nor Groq API keys are configured. Skipping Jira analysis.");
      return { transitions: [] };
    }

    try {
      logger.info("JiraSkill: Gemini not configured, falling back to Groq (Llama 3.1-8b)...");
      const { default: Groq } = await import("groq-sdk");
      const groq = new Groq({ apiKey: GROQ_API_KEY });

      const prompt = buildJiraPrompt(context);
      
      // DEBUG: Log the evidence being sent
      logger.info(`[DEBUG] Sending ${context.chunks.length} chunks to AI for Jira analysis.`);
      context.chunks.forEach((c, i) => {
        const preview = (c.content || c.text || JSON.stringify(c)).slice(0, 100);
        logger.info(`  Chunk ${i+1}: [${c.type || 'unknown'}] ${preview}...`);
      });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON matching the schema. No markdown, no extra text.`,
          },
          {
            role: "user",
            content: "Analyze the provided evidence and return the JSON transitions array.",
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices?.[0]?.message?.content || "{}";
      logger.info(`[DEBUG] AI Raw Response: ${raw}`);
      
      const parsed = JSON.parse(raw);

      // Normalize: ensure transitions is always an array
      const transitions = Array.isArray(parsed.transitions) ? parsed.transitions : [];
      logger.info(`JiraSkill (Groq): Generated ${transitions.length} transition suggestion(s).`);
      return { transitions };
    } catch (err) {
      logger.error(`JiraSkill (Groq) failed: ${err.message}`);
      return { transitions: [] };
    }
  }
}

export default new JiraSkill();
