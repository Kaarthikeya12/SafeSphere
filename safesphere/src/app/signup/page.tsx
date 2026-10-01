import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser, isGoogleConfigured } from "@/lib/server/auth";
import { safeNext } from "@/lib/redirect";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser().catch(() => null)) redirect(next);
  const oauthError = typeof params.error === "string" ? params.error : undefined;

  return (
    <AuthShell title="Create your account" subtitle="Set up your safety tools in under a minute.">
      <AuthForm mode="signup" next={next} googleEnabled={isGoogleConfigured()} oauthError={oauthError} />
    </AuthShell>
  );
}
