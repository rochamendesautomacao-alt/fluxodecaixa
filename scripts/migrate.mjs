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

const migrationFile = process.argv[2] || "001_schema.sql";
const filePath = `supabase/migrations/${migrationFile}`;

const client = new Client({ connectionString: DB_URL });

try {
  await client.connect();
  console.log("Conectado ao banco.");

  const sql = readFileSync(filePath, "utf-8");
  console.log(`Aplicando migração: ${filePath}...`);

  await client.query(sql);
  console.log("Migração aplicada com sucesso!");
} catch (err) {
  console.error("Erro:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
