import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground text-sm">
          Cadastre-se no Fluxo de Caixa
        </p>
      </div>

      <AuthForm mode="register" />

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
