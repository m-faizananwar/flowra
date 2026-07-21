// Deliberate type error for an Atlas ProofPatch demo: a string is assigned to a
// number, so the engine's `tsc` build fails with TS2322. The fix is to correct
// this file (or remove it) — there is no missing module to create, which keeps
// the repair unambiguous.
//
// SAFE TO DELETE. Nothing imports this file. Branch-only; never merge.
export const atlasDemoBroken: number = "this is not a number";
