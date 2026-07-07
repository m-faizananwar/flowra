function extractJson(text) {
  if (!text) throw new Error("Model returned an empty response");
  const stripped = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch (firstError) {
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw firstError;
    }
    return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
  }
}

function compactJson(value) {
  return JSON.stringify(value, null, 2);
}

module.exports = {
  extractJson,
  compactJson,
};
