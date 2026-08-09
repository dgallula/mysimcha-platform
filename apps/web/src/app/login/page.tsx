import { AuthShell } from "@/components/auth-shell";
import { getRequestBrand } from "@/lib/brand";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const brand = await getRequestBrand();

  return (
    <AuthShell brandName={brand.displayName} title="Log in" description="Access your organization workspace.">
      <LoginForm />
    </AuthShell>
  );
}
