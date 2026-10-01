/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNext(next: string | string[] | null | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/dashboard";
}
