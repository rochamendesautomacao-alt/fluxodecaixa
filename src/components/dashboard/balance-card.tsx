import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown,Wallet } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  isLoading: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Wallet className="size-4" />
          Saldo atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-3xl font-bold tracking-tight",
                isPositive ? "text-emerald-600" : "text-red-600",
              )}
            >
              {balance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            {isPositive ? (
              <TrendingUp className="size-5 text-emerald-500" />
            ) : (
              <TrendingDown className="size-5 text-red-500" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
