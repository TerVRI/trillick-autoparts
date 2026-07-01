export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold uppercase mb-6">{title}</h1>
      <div className="prose prose-stone space-y-4 text-stone-600">{children}</div>
    </div>
  );
}
