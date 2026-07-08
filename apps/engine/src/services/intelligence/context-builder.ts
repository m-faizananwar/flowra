import supabase from "../lib/supabase";
import { CONTEXT_LIMITS } from "./constants";

function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

function pushFact(groups, key, item) {
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
}

function trimText(text, max = 700) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

class ContextBuilder {
  async buildAndStore({ userId, runId, windowStart, windowEnd, evidence }) {
    const chunkDate = windowEnd.toISOString().slice(0, 10);
    const chunks = [
      ...this.buildChatChunks({ userId, runId, chunkDate, windowStart, windowEnd, messages: evidence.messages }),
      ...this.buildGithubChunks({ userId, runId, chunkDate, windowStart, windowEnd, githubEvents: evidence.githubEvents }),
    ];

    const storedChunks = [];
    for (const chunk of chunks) {
      const { data, error } = await supabase
        .from("daily_context_chunks")
        .insert(chunk)
        .select("*")
        .single();
      if (error) throw error;
      storedChunks.push(data);
    }

    return storedChunks.slice(0, CONTEXT_LIMITS.maxChunksForPrompt).map((chunk) => ({
      id: chunk.id,
      source_type: chunk.source_type,
      source_id: chunk.source_id,
      topic: chunk.topic,
      summary: chunk.summary,
      facts: chunk.facts,
      evidence_refs: chunk.evidence_refs,
      token_estimate: chunk.token_estimate,
    }));
  }

  buildChatChunks({ userId, runId, chunkDate, windowStart, windowEnd, messages }) {
    const groups = new Map();
    for (const message of messages) {
      const channelName = message.channels?.name || "unknown";
      const key = `${message.channel_id || "unknown"}:${channelName}`;
      pushFact(groups, key, message);
    }

    const chunks = [];
    for (const [key, groupMessages] of groups) {
      const [channelId, channelName] = key.split(":");
      let batch = [];
      let batchChars = 0;

      for (const message of groupMessages) {
        const line = `[${message.created_at}] ${message.sender_name}: ${trimText(message.content, 500)}`;
        if (batch.length > 0 && batchChars + line.length > CONTEXT_LIMITS.maxChunkChars) {
          chunks.push(this.chatChunk({ userId, runId, chunkDate, windowStart, windowEnd, channelId, channelName, batch }));
          batch = [];
          batchChars = 0;
        }
        batch.push(message);
        batchChars += line.length;
      }

      if (batch.length > 0) {
        chunks.push(this.chatChunk({ userId, runId, chunkDate, windowStart, windowEnd, channelId, channelName, batch }));
      }
    }

    return chunks;
  }

  chatChunk({ userId, runId, chunkDate, windowStart, windowEnd, channelId, channelName, batch }) {
    const facts = batch.map((message) => ({
      id: message.id,
      type: "message",
      at: message.created_at,
      sender: message.sender_name,
      member_id: message.metadata?.member_id || null,
      content: trimText(message.content, 700),
    }));
    const summary = `Chat activity in ${channelName}: ${facts.map((fact) => `${fact.sender}: ${fact.content}`).join(" | ")}`;

    return {
      user_id: userId,
      analysis_run_id: runId,
      chunk_date: chunkDate,
      source_type: "chat",
      source_id: channelId === "unknown" ? null : channelId,
      channel_id: channelId === "unknown" ? null : channelId,
      topic: `Chat: ${channelName}`,
      summary: trimText(summary, CONTEXT_LIMITS.maxChunkChars),
      facts,
      evidence_refs: facts.map((fact) => ({ type: "message", id: fact.id, summary: `${fact.sender} message` })),
      token_estimate: estimateTokens(summary),
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
    };
  }

  buildGithubChunks({ userId, runId, chunkDate, windowStart, windowEnd, githubEvents }) {
    const groups = new Map();
    for (const event of githubEvents) {
      const key = `${event.repository_id || "unknown"}:${event.repo_full_name || "unknown repo"}`;
      pushFact(groups, key, event);
    }

    return Array.from(groups.entries()).map(([key, events]) => {
      const [repositoryId, repoName] = key.split(":");
      const facts = events.map((event) => ({
        id: event.id,
        type: "github_event",
        at: event.occurred_at,
        event_type: event.event_type,
        action: event.action,
        sender: event.sender_login,
        member_id: event.member_id,
        title: event.title,
        url: event.url,
        ref: event.ref,
      }));
      const summary = `GitHub activity in ${repoName}: ${facts.map((fact) => `${fact.sender || "unknown"} ${fact.event_type}${fact.action ? `/${fact.action}` : ""} ${fact.title || fact.ref || ""}`).join(" | ")}`;

      return {
        user_id: userId,
        analysis_run_id: runId,
        chunk_date: chunkDate,
        source_type: "github",
        source_id: repositoryId === "unknown" ? null : repositoryId,
        repository_id: repositoryId === "unknown" ? null : repositoryId,
        topic: `GitHub: ${repoName}`,
        summary: trimText(summary, CONTEXT_LIMITS.maxChunkChars),
        facts,
        evidence_refs: facts.map((fact) => ({ type: "github_event", id: fact.id, summary: `${fact.event_type} event` })),
        token_estimate: estimateTokens(summary),
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
      };
    });
  }
}

export default new ContextBuilder();
