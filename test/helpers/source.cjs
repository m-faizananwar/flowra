const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..", "..");

function readSource(relativePath) {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

function assertContains(source, snippets, label = "source") {
  for (const snippet of snippets) {
    assert.match(source, snippet instanceof RegExp ? snippet : new RegExp(snippet), `${label} should contain ${snippet}`);
  }
}

function assertFileExists(relativePath) {
  assert.ok(fs.existsSync(path.join(appRoot, relativePath)), `${relativePath} should exist`);
}

module.exports = {
  appRoot,
  readSource,
  assertContains,
  assertFileExists,
};
