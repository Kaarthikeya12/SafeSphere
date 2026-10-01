import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser, isGoogleConfigured } from "@/lib/server/auth";
import { safeNext } from "@/lib/redirect";

export const metadata: Metadata = { title: "Log in" };

const NOTICES: Record<string, string> = {
  expired: "Your session has expired. Please log in again.",
  signedout: "You’ve been signed out.",
  deleted: "Your account and data were deleted.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser().catch(() => null)) redirect(next);
  const reason = typeof params.reason === "string" ? NOTICES[params.reason] : undefined;
  const oauthError = typeof params.error === "string" ? params.error : undefined;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your safety dashboard.">
      <AuthForm mode="login" next={next} googleEnabled={isGoogleConfigured()} notice={reason} oauthError={oauthError} />
    </AuthShell>
  );
}
