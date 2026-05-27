import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://opqmifhgasvswzipcsjj.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Defina SUPABASE_SERVICE_KEY no ambiente");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
  console.log("Verificando se as tabelas existem...");

  const { error: tablesError } = await supabase
    .from("companies")
    .select("id")
    .limit(1);

  if (tablesError && tablesError.message.includes("does not exist")) {
    console.log("Tabelas não existem. Aplique as migrations primeiro.");
    console.log("1. Vá em https://supabase.com/dashboard/project/opqmifhgasvswzipcsjj/sql/new");
    console.log("2. Copie o conteúdo de supabase/migrations/001_schema.sql");
    console.log("3. Execute");
    console.log("4. Repita para 002_security_enhancements.sql e 003_financial_foundation.sql");
    return;
  }

  console.log("Tabelas existem. Criando dados de teste...");

  const { data: existingCompanies } = await supabase
    .from("companies")
    .select("slug");

  if (existingCompanies?.some((c) => c.slug === "empresa-teste")) {
    console.log("Dados de teste já existem. Pulando...");
    return;
  }

  console.log("Criando usuário de teste...");
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: "teste@fluxodecaixa.app",
      password: "Teste@123",
      email_confirm: true,
    });

  if (authError) {
    console.log("Erro ao criar usuário:", authError.message);
    console.log("Tentando prosseguir com usuário existente...");
  }

  const userId = authUser?.user?.id;
  if (!userId) {
    console.log("Não foi possível obter ID do usuário. Abortando.");
    return;
  }
  console.log(`Usuário criado: teste@fluxodecaixa.app / Teste@123 (ID: ${userId})`);

  console.log("Criando empresa...");
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: "Empresa Teste",
      slug: "empresa-teste",
      document: "00.000.000/0001-91",
      phone: "(11) 99999-9999",
      email: "contato@empresateste.com.br",
    })
    .select()
    .single();

  if (companyError) {
    console.error("Erro ao criar empresa:", companyError.message);
    return;
  }
  console.log(`Empresa criada: ${company.name} (${company.id})`);

  console.log("Vinculando usuário à empresa...");
  const { error: linkError } = await supabase
    .from("company_users")
    .insert({
      company_id: company.id,
      user_id: userId,
      role: "owner",
    });

  if (linkError) {
    console.error("Erro ao vincular usuário:", linkError.message);
    return;
  }

  console.log("Criando loja...");
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({
      company_id: company.id,
      name: "Loja Matriz",
      slug: "loja-matriz",
      document: "00.000.000/0001-91",
      phone: "(11) 99999-9999",
    })
    .select()
    .single();

  if (storeError) {
    console.error("Erro ao criar loja:", storeError.message);
    return;
  }
  console.log(`Loja criada: ${store.name} (${store.id})`);

  console.log("Criando categorias...");
  const categories = [
    { store_id: store.id, name: "Vendas", type: "income", color: "#22c55e", sort_order: 1 },
    { store_id: store.id, name: "Serviços", type: "income", color: "#3b82f6", sort_order: 2 },
    { store_id: store.id, name: "Produtos", type: "income", color: "#8b5cf6", sort_order: 3 },
    { store_id: store.id, name: "Aluguel", type: "expense", color: "#ef4444", sort_order: 4 },
    { store_id: store.id, name: "Fornecedores", type: "expense", color: "#f59e0b", sort_order: 5 },
    { store_id: store.id, name: "Folha", type: "expense", color: "#ec4899", sort_order: 6 },
  ];

  const { data: createdCategories, error: catError } = await supabase
    .from("categories")
    .insert(categories)
    .select();

  if (catError) {
    console.error("Erro ao criar categorias:", catError.message);
    return;
  }
  console.log(`${createdCategories.length} categorias criadas`);

  console.log("Criando despesas fixas...");
  const fixedExpenses = [
    { store_id: store.id, name: "Aluguel", amount: 3500, frequency: "monthly", due_day: 5 },
    { store_id: store.id, name: "Internet", amount: 199.90, frequency: "monthly", due_day: 10 },
    { store_id: store.id, name: "Pró-Labore", amount: 5000, frequency: "monthly", due_day: 1 },
  ];

  const { error: feError } = await supabase
    .from("fixed_expenses")
    .insert(fixedExpenses);

  if (feError) {
    console.error("Erro ao criar despesas fixas:", feError.message);
  } else {
    console.log("Despesas fixas criadas");
  }

  console.log("Criando transações de exemplo...");
  const today = new Date();
  const transactions = [
    {
      store_id: store.id,
      description: "Venda de produtos",
      amount: 15000,
      type: "income",
      date: today.toISOString().split("T")[0],
    },
    {
      store_id: store.id,
      description: "Prestação de serviços",
      amount: 8500,
      type: "income",
      date: today.toISOString().split("T")[0],
    },
    {
      store_id: store.id,
      description: "Compra de insumos",
      amount: 4200,
      type: "expense",
      date: today.toISOString().split("T")[0],
    },
    {
      store_id: store.id,
      description: "Pagamento de frete",
      amount: 890,
      type: "expense",
      date: today.toISOString().split("T")[0],
    },
  ];

  const { error: txError } = await supabase
    .from("cash_transactions")
    .insert(transactions);

  if (txError) {
    console.error("Erro ao criar transações:", txError.message);
  } else {
    console.log("Transações criadas");
  }

  console.log("\n✅ Seed concluído!");
  console.log("📧 Login: teste@fluxodecaixa.app");
  console.log("🔑 Senha: Teste@123");
}

seed().catch(console.error);
