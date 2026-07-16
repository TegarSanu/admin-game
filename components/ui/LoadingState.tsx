export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
      <div className="w-12 h-12 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin" />
      <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Loading data...</p>
    </div>
  );
}
