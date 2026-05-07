const test = require("node:test");
const assert = require("node:assert/strict");
const { readSource } = require("../helpers/source.cjs");

test("Frontend engine-forwarding routes require Supabase user authentication before engine calls", () => {
  for (const file of [
    "src/app/api/analysis/run/route.js",
    "src/app/api/jira/execute-approval/route.js",
  ]) {
    const source = readSource(file);
    const authIndex = source.indexOf("auth.getUser()");
    const fetchIndex = source.indexOf("fetch(");
    assert.ok(authIndex >= 0, `${file} should authenticate the user`);
    assert.ok(fetchIndex > authIndex, `${file} should call engine only after authentication`);
    assert.match(source, /Unauthorized/);
  }
});

test("Jira approval execution route does not trust client-provided user_id", () => {
  const source = readSource("src/app/api/jira/execute-approval/route.js");

  assert.match(source, /user_id: user\.id/);
  assert.doesNotMatch(source, /const \{ user_id/);
});
