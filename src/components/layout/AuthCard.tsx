import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-sm font-semibold text-paper-50">
          wallet<span className="text-blue-500">/</span>primitive
        </Link>
        <div className="rounded-2xl border border-white/10 bg-ink-800 p-8">
          <h1 className="font-display text-xl font-semibold text-paper-50">{title}</h1>
          <p className="mt-1.5 text-sm text-paper-200/55">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
