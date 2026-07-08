import supabase from "../lib/supabase";
import geminiJsonClient from "./gemini-json-client";
import { CONTEXT_LIMITS, PROMPT_VERSION, MODEL_NAME } from "./constants";
import { MemoryResponseSchema } from "./schemas";
import { buildMemoryPrompt } from "./prompt-builders";

function joinMemory(memory) {
  if (!memory) return "";
  return [
    `Project: ${memory.project_summary || ""}`,
    `Completed: ${memory.completed_work || ""}`,
    `Remaining: ${memory.remaining_work || ""}`,
    `Decisions: ${memory.decisions || ""}`,
    `Open blockers: ${memory.open_blockers || ""}`,
    `Recurring risks: ${memory.recurring_risks || ""}`,
  ].join("\n").slice(0, CONTEXT_LIMITS.maxMemoryChars);
}

function deterministicMemory(previous, chunks) {
  const summaries = chunks.map((chunk) => `- ${chunk.topic}: ${chunk.summary}`).join("\n");
  const previousText = joinMemory(previous);
  const merged = `${previousText}\n\nRecent daily evidence:\n${summaries}`.trim();
  return {
    project_summary: merged.slice(0, 1800),
    completed_work: summaries.slice(0, 1200),
    remaining_work: previous?.remaining_work || "",
    decisions: previous?.decisions || "",
    open_blockers: previous?.open_blockers || "",
    recurring_risks: previous?.recurring_risks || "",
    source_refs: chunks.slice(0, 20).map((chunk) => ({ type: "context_chunk", id: chunk.id, summary: chunk.topic || "" })),
  };
}

class MemoryService {
  async getLatest(userId) {
    const { data, error } = await supabase
      .from("project_memory_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  format(memory) {
    return joinMemory(memory);
  }

  async update({ userId, runId, previousMemory, chunks }) {
    let nextMemory;
    if (geminiJsonClient.isConfigured() && chunks.length > 0) {
      const prompt = buildMemoryPrompt({
        projectMemoryText: joinMemory(previousMemory),
        chunks,
      });
      nextMemory = await geminiJsonClient.generateJson(prompt, MemoryResponseSchema);
    } else {
      nextMemory = deterministicMemory(previousMemory, chunks);
    }

    const { data, error } = await supabase
      .from("project_memory_snapshots")
      .insert({
        user_id: userId,
        analysis_run_id: runId,
        version: (previousMemory?.version || 0) + 1,
        project_summary: nextMemory.project_summary,
        completed_work: nextMemory.completed_work,
        remaining_work: nextMemory.remaining_work,
        decisions: nextMemory.decisions,
        open_blockers: nextMemory.open_blockers,
        recurring_risks: nextMemory.recurring_risks,
        source_refs: nextMemory.source_refs,
      })
      .select("*")
      .single();

    if (error) throw error;
    return {
      snapshot: data,
      prompt_version: PROMPT_VERSION,
      model: geminiJsonClient.isConfigured() ? MODEL_NAME : "deterministic-fallback",
    };
  }
}

export default new MemoryService();
