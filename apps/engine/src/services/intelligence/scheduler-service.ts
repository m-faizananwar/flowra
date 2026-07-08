import supabase from "../lib/supabase";
import logger from "../lib/logger";
import analysisRunner from "./analysis-runner";
import { buildDailyWindow } from "./time";

class SchedulerService {
  interval: any;
  isRunning: any;
  intervalMs: any;
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.intervalMs = Number(process.env.ANALYSIS_SCHEDULER_INTERVAL_MS || 60 * 1000);
  }

  async start() {
    logger.info(`Starting Flowra Intelligence Scheduler (${this.intervalMs / 1000}s interval).`);
    await this.ensureSettingsForKnownUsers();
    await this.tick();
    this.interval = setInterval(() => this.tick(), this.intervalMs);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  async ensureSettingsForKnownUsers() {
    const { data, error } = await supabase
      .from("integrations")
      .select("user_id")
      .not("user_id", "is", null);
    if (error) {
      logger.error(`Failed to inspect integrations for analysis settings: ${error.message}`);
      return;
    }

    const userIds = Array.from(new Set((data || []).map((row) => row.user_id).filter(Boolean)));
    for (const userId of userIds) {
      const { error: upsertError } = await supabase
        .from("analysis_settings")
        .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
      if (upsertError) {
        logger.error(`Failed to create default analysis settings for ${userId}: ${upsertError.message}`);
      }
    }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const { data: settings, error } = await supabase
        .from("analysis_settings")
        .select("*");
      
      if (error) throw error;

      for (const setting of settings || []) {
        await this.runDueSetting(setting);
      }
    } catch (error) {
      logger.error(`Intelligence scheduler tick failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  async runDueSetting(setting) {
    const tasks = [];
    if (setting.risk_enabled) {
      const window = buildDailyWindow(setting, "risk");
      if (window) tasks.push({ analysisType: "risk", window });
    }
    if (setting.evaluation_enabled) {
      const window = buildDailyWindow(setting, "evaluation");
      if (window) tasks.push({ analysisType: "evaluation", window });
    }
    if (setting.jira_enabled) {
      const window = buildDailyWindow(setting, "jira");
      if (window) tasks.push({ analysisType: "jira", window });
    }

    for (const task of tasks) {
      await analysisRunner.run({
        userId: setting.user_id,
        analysisType: task.analysisType,
        window: task.window,
      });
    }
  }

  async runNow(userId, analysisType = "risk", syncOnly = false) {
    const { data: setting, error } = await supabase
      .from("analysis_settings")
      .upsert({ user_id: userId }, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;

    const now = new Date();
    const windowEnd = now;
    const lookbackHours = Number(setting.lookback_hours || 24);
    const windowStart = new Date(windowEnd.getTime() - lookbackHours * 60 * 60 * 1000);
    const dateKey = windowEnd.toISOString().slice(0, 10);

    return analysisRunner.run({
      userId,
      analysisType,
      window: {
        scheduledForDate: dateKey,
        windowStart,
        windowEnd,
        idempotencyKey: `${userId}:${analysisType}:manual:${windowStart.toISOString()}:${windowEnd.toISOString()}`,
      },
      syncOnly,
    });
  }
}

export default new SchedulerService();
