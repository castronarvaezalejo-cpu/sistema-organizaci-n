import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  tone?: "blue" | "red" | "amber" | "green";
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "blue",
}: StatCardProps) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      {icon && (
        <div
          className={`
            mb-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            ${tones[tone]}
          `}
        >
          {icon}
        </div>
      )}

      <h3 className="text-xs font-semibold text-slate-600">
        {title}
      </h3>

      <p className="mt-1 text-xl font-black text-slate-800">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
