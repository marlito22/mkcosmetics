import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-center text-2xl font-bold">Panel de administración</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Ingresa la contraseña para continuar
      </p>
      <LoginForm />
    </div>
  );
}
