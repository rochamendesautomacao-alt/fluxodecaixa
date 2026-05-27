import { readFileSync } from "fs";
import https from "https";

const sql = readFileSync("supabase/migrations/004_fix_rls_recursion.sql", "utf-8");

const data = JSON.stringify({ query_text: sql });

const SUPABASE_URL = process.env.SUPABASE_URL || "https://opqmifhgasvswzipcsjj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Defina SUPABASE_SERVICE_KEY no ambiente");
  process.exit(1);
}

const url = new URL(SUPABASE_URL);
const options = {
  hostname: url.hostname,
  path: "/rest/v1/rpc/supabase_sql",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Length": Buffer.byteLength(data),
  },
};

console.log("Executando migration via supabase_sql...");

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(body);
        console.log("Resultado:", JSON.stringify(parsed, null, 2));
      } catch {
        console.log("Resposta:", body.substring(0, 1000));
      }
    } else {
      console.log("Erro:", body.substring(0, 2000));
    }
  });
});

req.on("error", (e) => console.error("Erro na requisição:", e.message));
req.write(data);
req.end();
