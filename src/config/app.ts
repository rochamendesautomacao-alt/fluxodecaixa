export const appConfig = {
  name: "Fluxo de Caixa",
  description: "Sistema de gestão de fluxo de caixa multiempresa",
  url:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const paginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100] as const,
} as const;
