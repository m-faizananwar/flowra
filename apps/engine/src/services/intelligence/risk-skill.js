const geminiJsonClient = require("./gemini-json-client");
const { RiskResponseSchema } = require("./schemas");
const { buildRiskPrompt } = require("./prompt-builders");

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

module.exports = new RiskSkill();
