interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
}

export function StatCard({ title, value, delta }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {delta ? <p className="mt-2 text-xs font-medium text-emerald-600">{delta}</p> : null}
    </div>
  );
}

