import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
        <p className="text-muted-foreground text-sm">
          Acesse sua conta Fluxo de Caixa
        </p>
      </div>

      <AuthForm mode="login" />

      <p className="text-muted-foreground text-center text-sm">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
