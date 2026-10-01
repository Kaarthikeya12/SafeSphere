"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";

type Mode = "login" | "signup";
type Errors = Partial<Record<"name" | "email" | "password" | "confirm" | "terms" | "form", string>>;

/** Maps Better Auth error codes to user-safe messages. */
function describeAuthError(error: { code?: string; status?: number; message?: string } | null | undefined, mode: Mode) {
  const code = error?.code ?? "";
  if (error?.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_PASSWORD" || code === "USER_NOT_FOUND")
    return "Email or password is incorrect.";
  if (code.startsWith("USER_ALREADY_EXISTS")) return "An account with this email already exists. Log in instead.";
  if (code === "PASSWORD_TOO_SHORT") return "Use at least 8 characters.";
  if (code === "PASSWORD_TOO_LONG") return "Use 128 characters or fewer.";
  if (code === "INVALID_EMAIL") return "Enter a valid email address.";
  return mode === "signup" ? "We couldn’t create your account. Please try again." : "We couldn’t sign you in. Please try again.";
}

/** OAuth errors arrive as ?error=… after Better Auth redirects back. */
function describeOAuthError(code: string) {
  if (code === "access_denied") return "Google sign-in was cancelled.";
  if (code === "account_not_linked")
    return "This email already has a SafeSphere password. Log in with your password instead.";
  if (code === "state_mismatch" || code === "state_not_found" || code === "please_restart_the_process") return "Google sign-in timed out. Please try again.";
  return "Google sign-in didn’t complete. Please try again.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.61h-4a12 12 0 0 0 0 10.78l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

export function AuthForm({
  mode,
  next,
  googleEnabled,
  notice,
  oauthError,
}: {
  mode: Mode;
  next: string;
  googleEnabled: boolean;
  notice?: string;
  oauthError?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>(oauthError ? { form: describeOAuthError(oauthError) } : {});
  const [pending, setPending] = useState<"form" | "google" | "done" | null>(null);

  function validate(): Errors {
    const result: Errors = {};
    if (mode === "signup") {
      const nameError = validateName(name);
      if (nameError) result.name = nameError;
    }
    const emailError = validateEmail(email);
    if (emailError) result.email = emailError;
    const passwordError = validatePassword(password, mode);
    if (passwordError) result.password = passwordError;
    if (mode === "signup") {
      if (!confirm) result.confirm = "Re-enter your password.";
      else if (!result.password && confirm !== password) result.confirm = "Passwords do not match.";
      if (!agreed) result.terms = "Please confirm you’ve read how SafeSphere handles your data.";
    }
    return result;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      event.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setPending("form");
    const { error } =
      mode === "signup"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password })
        : await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe: remember });
    if (error) {
      setErrors({ form: describeAuthError(error, mode) });
      setPending(null);
      return;
    }
    setPending("done");
    router.replace(next);
    router.refresh();
  }

  async function google() {
    setErrors({});
    setPending("google");
    const errorPage = mode === "signup" ? "/signup" : "/login";
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: errorPage,
    });
    // On success the browser navigates to Google, so we only get here on failure.
    if (error) {
      setErrors({ form: "Google sign-in couldn’t start. Please try again." });
      setPending(null);
    }
  }

  const fieldProps = (key: keyof Errors) => ({
    "aria-invalid": errors[key] ? ("true" as const) : ("false" as const),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  const busy = pending !== null;
  const nextQuery = next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div>
      {notice && !errors.form && (
        <p role="status" className="mb-5 flex gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-ink-soft">
          <Info size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          {notice}
        </p>
      )}
      {errors.form && (
        <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm text-danger">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
          {errors.form}
        </div>
      )}

      <button
        type="button"
        onClick={() => void google()}
        disabled={!googleEnabled || busy}
        className="btn btn-secondary h-12 w-full text-base"
        aria-describedby={googleEnabled ? undefined : "google-unavailable"}
      >
        {pending === "google" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <GoogleIcon />}
        {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
      </button>
      {!googleEnabled && (
        <p id="google-unavailable" className="mt-2 text-center text-xs text-muted">
          Google sign-in isn’t configured on this server yet. Use email below.
        </p>
      )}

      <div className="my-6 flex items-center gap-3 text-xs font-medium tracking-wide text-muted uppercase" aria-hidden>
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <input id="name" name="name" autoComplete="name" className="field" value={name} onChange={(e) => setName(e.target.value)} {...fieldProps("name")} />
            {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...fieldProps("email")}
          />
          {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="field pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              {...fieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-1 my-1 grid w-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="field-error">{errors.password}</p>
          ) : (
            mode === "signup" && <p className="mt-1.5 text-xs text-muted">8+ characters, with a letter and a number.</p>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label htmlFor="confirm" className="field-label">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                name="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="field pr-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                {...fieldProps("confirm")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-1 my-1 grid w-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink"
                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
            {errors.confirm && <p id="confirm-error" className="field-error">{errors.confirm}</p>}
          </div>
        )}

        {mode === "login" ? (
          <label className="flex items-center gap-2.5 text-sm text-body">
            <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me signed in for 7 days
          </label>
        ) : (
          <div>
            <label className="flex items-start gap-2.5 text-sm text-body">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                {...fieldProps("terms")}
              />
              <span>
                I understand SafeSphere is a prototype, not an emergency service, and I’ve read the{" "}
                <Link href="/privacy" className="font-semibold text-brand hover:underline" target="_blank">
                  privacy notice
                </Link>
                .
              </span>
            </label>
            {errors.terms && <p id="terms-error" className="field-error">{errors.terms}</p>}
          </div>
        )}

        <button type="submit" className="btn btn-primary h-12 w-full text-base" disabled={busy}>
          {pending === "form" || pending === "done" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
          {pending === "done"
            ? "Opening dashboard…"
            : pending === "form"
              ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          {!busy && <ArrowRight size={18} aria-hidden />}
        </button>
      </form>

      {mode === "login" && (
        <p className="mt-4 text-center text-xs text-muted">
          Forgot your password? Reset by email isn’t available in this prototype — sign in with Google or create a new account.
        </p>
      )}

      <p className="mt-6 text-center text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={`/login${nextQuery}`} className="font-semibold text-brand hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to SafeSphere?{" "}
            <Link href={`/signup${nextQuery}`} className="font-semibold text-brand hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
