import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-lg" aria-label="SafeSphere home">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <ShieldCheck size={20} aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">
        Safe<span className="text-brand">Sphere</span>
      </span>
    </Link>
  );
}
