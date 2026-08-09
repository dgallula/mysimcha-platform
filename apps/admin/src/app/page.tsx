import { redirect } from "next/navigation";
import { getSession } from "@mysimcha/auth";

export default async function AdminHomePage() {
  const session = await getSession();
  if (session?.user?.platformRole) {
    redirect("/dashboard");
  }
  redirect("/login");
}
