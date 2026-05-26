import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpFromLine, ArrowDownFromLine, EqualApproximately } from "lucide-react";

interface MonthlySummaryProps {
  income: number;
  expense: number;
  result: number;
  isLoading: boolean;
}

export function MonthlySummary({
  income,
  expense,
  result,
  isLoading,
}: MonthlySummaryProps) {
  const items = [
    {
      label: "Entradas",
      value: income,
      icon: ArrowUpFromLine,
      className: "text-emerald-600",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      label: "Saídas",
      value: expense,
      icon: ArrowDownFromLine,
      className: "text-red-600",
      bgClass: "bg-red-50 dark:bg-red-950/20",
    },
    {
      label: "Resultado",
      value: result,
      icon: EqualApproximately,
      className: result >= 0 ? "text-emerald-600" : "text-red-600",
      bgClass:
        result >= 0
          ? "bg-emerald-50 dark:bg-emerald-950/20"
          : "bg-red-50 dark:bg-red-950/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <item.icon className={cn("size-4", item.className)} />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
            ) : (
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  item.className,
                )}
              >
                {item.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
