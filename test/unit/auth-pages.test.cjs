const test = require("node:test");
const assert = require("node:assert/strict");
const { readSource, assertContains } = require("../helpers/source.cjs");

test("Sprint 0 login page validates required email/password and handles Supabase auth", () => {
  const source = readSource("src/app/login/page.js");

  assertContains(source, [
    /type="email"/,
    /type=\{showPassword \? "text" : "password"\}/,
    /required/,
    /supabase\.auth\.signInWithPassword/,
    /router\.push\("\/dashboard"\)/,
    /router\.push\("\/onboarding"\)/,
    /toast\.error\("Authentication Failed"/,
  ], "login page");
});

test("Sprint 0 signup page enforces password confirmation, minimum length, and email verification redirect", () => {
  const source = readSource("src/app/signup/page.js");

  assertContains(source, [
    /password !== confirmPassword/,
    /Passwords do not match/,
    /minLength=\{8\}/,
    /type="checkbox"/,
    /supabase\.auth\.signUp/,
    /router\.push\("\/verify-email"\)/,
  ], "signup page");

  assert.match(source, /required/g, "signup form should use required fields");
});

test("Auth pages expose Sprint 0 user-facing navigation between login and signup", () => {
  const login = readSource("src/app/login/page.js");
  const signup = readSource("src/app/signup/page.js");

  assert.match(login, /href="\/signup"/);
  assert.match(signup, /href="\/login"/);
});
