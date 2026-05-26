import pkg from "pg";
const { Client } = pkg;
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const f = await c.query(
  `SELECT c.relname AS tablename, c.relrowsecurity AS rls, c.relforcerowsecurity AS force_rls FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname IN ('companies','company_users','stores','categories','cash_transactions') ORDER BY c.relname`
);
console.log("=== FORCE RLS ===");
f.rows.forEach((r) => console.log("  " + r.tablename + ": RLS=" + r.rls + ", FORCE=" + r.force_rls));

const t = await c.query(
  `SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name NOT LIKE '%updated_at' ORDER BY trigger_name`
);
console.log("\n=== TRIGGERS (excluindo updated_at) ===");
t.rows.forEach((r) => console.log("  " + r.trigger_name + " (" + r.action_timing + " " + r.event_manipulation + ")"));

const p = await c.query(
  `SELECT policyname, tablename, permissive, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`
);
console.log("\n=== POLICIES ===");
p.rows.forEach((r) => console.log("  " + r.tablename + ": " + r.policyname + " (" + r.cmd + ")"));

await c.end();
