import geminiJsonClient from "./gemini-json-client";
import { RiskResponseSchema } from "./schemas";
import { buildRiskPrompt } from "./prompt-builders";

class RiskSkill {
  async assess(context) {
    if (geminiJsonClient.isConfigured()) {
      return geminiJsonClient.generateJson(buildRiskPrompt(context), RiskResponseSchema);
    }

    if (!context.chunks.length) {
      return {
        risks: [{
          title: "No daily evidence captured",
          description: "Flowra did not capture chat or GitHub evidence in the assessment window, so project visibility is limited.",
          category: "process",
          severity: "medium",
          confidence: 0.65,
          affected_member_ids: [],
          affected_repo_ids: [],
          recommendations: ["Check channel integrations and GitHub webhook delivery before relying on daily assessment output."],
          evidence_refs: [],
        }],
      };
    }

    return { risks: [] };
  }
}

export default new RiskSkill();
