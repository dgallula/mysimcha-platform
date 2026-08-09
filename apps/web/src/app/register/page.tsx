import { AuthShell } from "@/components/auth-shell";
import { getRequestBrand } from "@/lib/brand";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const brand = await getRequestBrand();

  return (
    <AuthShell
      brandName={brand.displayName}
      title="Create account"
      description="Start a new organization workspace."
    >
      <RegisterForm />
    </AuthShell>
  );
}
