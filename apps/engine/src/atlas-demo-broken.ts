// Deliberate build break for an Atlas ProofPatch demo. This imports a module
// that does not exist, so `tsc` (the engine's build) fails to compile.
//
// SAFE TO DELETE. Nothing imports this file; it exists only on the
// atlas-demo/failing-engine branch and must never be merged.
import { missingHelper } from "./atlas-this-module-does-not-exist";

export const atlasDemoBroken = () => missingHelper();
