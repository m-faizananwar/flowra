// Deliberate build break, created to produce a real failed Vercel deployment
// for an Atlas demo. This route imports a module that does not exist, which
// fails `next build` at bundle time.
//
// SAFE TO DELETE. Nothing imports this file and it exists only on the
// atlas-demo/failing-deploy branch. It must never be merged to production.
import { missingHelper } from "@/lib/atlas-demo-this-module-does-not-exist";

export default function AtlasDemoBrokenPage() {
  return <div>{missingHelper()}</div>;
}
