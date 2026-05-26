import { readFileSync } from "fs";
import pkg from "pg";
const { Client } = pkg;

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("Variável DATABASE_URL não definida.");
  console.error(
    'Exemplo: $env:DATABASE_URL="postgresql://postgres:senha@db.ref.supabase.co:5432/postgres"',
  );
  process.exit(1);
}

const client = new Client({ connectionString: DB_URL });

try {
  await client.connect();
  console.log("Conectado ao banco.");

  const sql = readFileSync("supabase/migrations/001_schema.sql", "utf-8");
  console.log("Aplicando migração...");

  await client.query(sql);
  console.log("Migração aplicada com sucesso!");
} catch (err) {
  console.error("Erro:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
