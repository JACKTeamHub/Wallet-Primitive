export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid-faint bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl animate-blob" />
      <div className="absolute top-40 right-1/4 h-80 w-80 rounded-full bg-signal-blue/10 blur-3xl animate-blob [animation-delay:4s]" />
      <div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-signal-green/5 blur-3xl animate-blob [animation-delay:8s]" />
    </div>
  );
}
