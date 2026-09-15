import { cn } from "@/lib/utils";

export function Table({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border bg-white", className)}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3.5 align-middle", className)}>{children}</td>;
}
