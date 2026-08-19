export function Card({ children, className = "" }) {
  return <div className={`rounded-lg border border-slate-200 p-4 shadow-sm ${className}`}>{children}</div>;
}
