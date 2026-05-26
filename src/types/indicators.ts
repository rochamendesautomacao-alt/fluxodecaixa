export interface IndicatorsInput {
  monthlyFixedCosts: number;
  profitMarginPercentage: number;
  operatingDaysPerMonth: number;
  monthlyRevenueGoal: number;
  actualMonthlyIncome: number;
  actualMonthlyExpense: number;
}

export interface IndicatorsResult {
  /** Receita real do mês */
  actualRevenue: number;
  /** Custo fixo total do mês */
  fixedCosts: number;
  /** Margem de contribuição (%) */
  contributionMargin: number;
  /** Faturamento necessário para atingir o ponto de equilíbrio */
  breakEvenRevenue: number;
  /** Meta diária de faturamento (breakEven / dias uteis) */
  dailyTarget: number;
  /** Faturamento necessário por dia útil para atingir a meta mensal */
  dailyGoalTarget: number;
  /** Meta mensal de faturamento */
  monthlyGoal: number;
  /** Progresso da meta mensal (%) */
  goalProgress: number;
  /** Valor já realizado em relação à meta */
  goalProgressValue: number;
  /** Diferença entre meta e realizado (quanto falta) */
  revenueGap: number;
  /** Lucro estimado no mês (receita - despesas - custos fixos) */
  estimatedProfit: number;
  /** Margem de lucro real (%) */
  actualProfitMargin: number;
  /** Dias úteis no mês */
  operatingDays: number;
  /** Faturamento necessário para o mês fechar no azul */
  minimumRequiredRevenue: number;
}
