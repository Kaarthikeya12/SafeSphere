import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getCurrentUser } from "@/lib/server/auth";
import { listContacts, listReports } from "@/lib/server/records";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Server-side check against the session table. The proxy only checked that a cookie exists.
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?reason=expired&next=/dashboard");

  return <Dashboard user={user} initialContacts={listContacts(user.id)} initialReports={listReports(user.id)} />;
}
