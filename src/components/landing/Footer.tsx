import { GITHUB_URL } from "@/constants/urls";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-paper-200/40 sm:flex-row">
        <span>© {new Date().getFullYear()} Wallet Primitive. Built on <a href="http://nomba.com" target="_blank" rel="noreferrer" className="hover:text-paper-200/70">Nomba</a>.</span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition hover:text-paper-200/70">
          Team JACK
        </a>
      </div>
    </footer>
  );
}
