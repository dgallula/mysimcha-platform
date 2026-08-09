import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">MySimcha Platform</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Platform operators only. Organization owners cannot access this console.</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
