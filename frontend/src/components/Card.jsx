export function Card({ children, className = "" }) {
  return <div className={`rounded-lg border border-line bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}