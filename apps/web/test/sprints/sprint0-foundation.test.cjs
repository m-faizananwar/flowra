const test = require("node:test");
const { readSource, assertContains, assertFileExists } = require("../helpers/source.cjs");

test("Sprint 0 SCRUM-23/SCRUM-24 foundation has reproducible project setup files", () => {
  [
    "package.json",
    "../../pnpm-lock.yaml",
    "next.config.mjs",
    "tsconfig.json",
    "eslint.config.mjs",
    "src/lib/supabase.js",
  ].forEach(assertFileExists);

  const pkg = readSource("package.json");
  assertContains(pkg, [/next/, /react/, /@supabase\/supabase-js/, /"dev": "next dev"/], "frontend package");
});

test("Sprint 0 SCRUM-26 landing page contains the promised product sections and calls to action", () => {
  const source = readSource("src/app/page.js");

  assertContains(source, [
    /Flowra/,
    /Features/,
    /How It Works/,
    /Integrations/,
    /Pricing/,
    /href="\/signup"/,
    /href="\/login"/,
    /Connect & Listen/,
    /Verify with Proof/,
    /Approve & Sync/,
  ], "landing page");
});

test("Sprint 0 SCRUM-27 authentication pages include complete form validation paths", () => {
  const login = readSource("src/app/login/page.js");
  const signup = readSource("src/app/signup/page.js");

  assertContains(login, [/type="email"/, /autoComplete="email"/, /autoComplete="current-password"/, /signInWithPassword/], "login page");
  assertContains(signup, [/Full Name/, /Work Email/, /Confirm Password/, /minLength=\{8\}/, /Passwords do not match/, /signUp/], "signup page");
});

test("Sprint 0 SCRUM-28 build/auth QA paths are represented by lint and test automation", () => {
  const pkg = readSource("package.json");

  assertContains(pkg, [/"lint": "eslint"/, /"test": "node --test/], "frontend scripts");
});
