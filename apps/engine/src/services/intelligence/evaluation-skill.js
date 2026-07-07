const geminiJsonClient = require("./gemini-json-client");
const { EvaluationResponseSchema } = require("./schemas");
const { buildEvaluationPrompt } = require("./prompt-builders");

function deterministicScore(member, chunks, metrics) {
  const memberId = member.member_id;
  const memberChunks = chunks.filter((chunk) => {
    const facts = Array.isArray(chunk.facts) ? chunk.facts : [];
    return facts.some((fact) => fact.member_id === memberId);
  });
  const evidenceRefs = memberChunks.slice(0, 5).map((chunk) => ({
    type: "context_chunk",
    id: chunk.id,
    summary: chunk.topic || "member activity",
  }));
  const baseScore = 0;

  return {
    member_id: memberId,
    summary: memberChunks.length > 0
      ? `${member.name} had ${memberChunks.length} evidence chunk(s) captured, but deterministic fallback was used.`
      : `No activity was observed for ${member.name} during the assessment window.`,
    metrics: metrics.map((metric) => ({
      metric_id: metric.id,
      name: metric.name,
      score: baseScore,
      rationale: memberChunks.length > 0
        ? "Deterministic fallback: Evidence volume was too low for a nuanced AI score."
        : "No activity detected: No commits, messages, or PR events were linked to this member in the current window.",
      evidence_refs: evidenceRefs,
    })),
  };
}

class EvaluationSkill {
  async evaluate(context) {
    if (geminiJsonClient.isConfigured()) {
      return geminiJsonClient.generateJson(buildEvaluationPrompt(context), EvaluationResponseSchema);
    }

    return {
      evaluations: (context.memberEvalSpecs || context.identityMap.members.map((m) => ({
        member_id: m.member_id,
        member_name: m.name,
        role: m.role,
        applicable_metrics: context.metrics,
      }))).map((spec) => (
        deterministicScore(
          { member_id: spec.member_id, name: spec.member_name },
          context.chunks,
          spec.applicable_metrics || context.metrics,
        )
      )),
    };
  }
}

module.exports = new EvaluationSkill();
