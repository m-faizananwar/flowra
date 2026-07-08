const PROMPT_VERSION = "flowra-intelligence-v1";
const MODEL_NAME = process.env.ANALYSIS_MODEL || "gemini-2.5-flash";

const DEFAULT_METRICS = [
  {
    name: "Professionalism",
    description:
      "Ethical conduct, workspace maturity, and adherence to professional standards.",
    weight: 1.0,
  },
  {
    name: "Collaboration",
    description:
      "Cross-functional synergy, team-play, and helping teammates through reviews or coordination.",
    weight: 1.2,
  },
  {
    name: "Technical Proficiency",
    description:
      "Execution quality, skill mastery, and technical contribution value.",
    weight: 1.2,
  },
  {
    name: "Reliability",
    description:
      "Consistency, deadline adherence, and dependability in delivery.",
    weight: 1.0,
  },
  {
    name: "Communication",
    description:
      "Clarity, transparency, and effective information sharing across channels.",
    weight: 1.0,
  },
];

const CONTEXT_LIMITS = {
  maxMessageItems: Number(process.env.ANALYSIS_MAX_MESSAGES || 600),
  maxGithubItems: Number(process.env.ANALYSIS_MAX_GITHUB_EVENTS || 250),
  maxChunkChars: Number(process.env.ANALYSIS_MAX_CHUNK_CHARS || 7000),
  maxChunksForPrompt: Number(process.env.ANALYSIS_MAX_PROMPT_CHUNKS || 24),
  maxMemoryChars: Number(process.env.ANALYSIS_MAX_MEMORY_CHARS || 6000),
};

export {
  PROMPT_VERSION,
  MODEL_NAME,
  DEFAULT_METRICS,
  CONTEXT_LIMITS,
};
