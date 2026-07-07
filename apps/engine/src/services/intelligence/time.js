function getLocalParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    timeKey: `${parts.hour}:${parts.minute}`,
  };
}

function compareTime(left, right) {
  return left.localeCompare(right);
}

function zonedDateTimeToUtc(dateKey, timeValue, timeZone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute, second = 0] = timeValue.split(":").map(Number);
  const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute, second);
  let candidate = new Date(desiredWallTime);

  for (let i = 0; i < 3; i += 1) {
    const parts = getLocalParts(candidate, timeZone);
    const actualWallTime = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );
    candidate = new Date(candidate.getTime() + (desiredWallTime - actualWallTime));
  }

  return candidate;
}

function buildDailyWindow(setting, type, now = new Date()) {
  const timeZone = setting.timezone || "Asia/Karachi";
  const localNow = getLocalParts(now, timeZone);
  let runTime = setting.risk_run_time;
  if (type === "evaluation") runTime = setting.evaluation_run_time;
  if (type === "jira") runTime = setting.jira_run_time;

  const normalizedRunTime = String(runTime || "18:00").slice(0, 5);

  if (compareTime(localNow.timeKey, normalizedRunTime) < 0) {
    return null;
  }

  const windowEnd = zonedDateTimeToUtc(localNow.dateKey, `${normalizedRunTime}:00`, timeZone);
  if (now.getTime() < windowEnd.getTime()) return null;

  const lookbackHours = Number(setting.lookback_hours || 24);
  const windowStart = new Date(windowEnd.getTime() - lookbackHours * 60 * 60 * 1000);

  return {
    scheduledForDate: localNow.dateKey,
    windowStart,
    windowEnd,
    idempotencyKey: `${setting.user_id}:${type}:${localNow.dateKey}:${windowStart.toISOString()}:${windowEnd.toISOString()}`,
  };
}

module.exports = {
  getLocalParts,
  buildDailyWindow,
  zonedDateTimeToUtc,
};
