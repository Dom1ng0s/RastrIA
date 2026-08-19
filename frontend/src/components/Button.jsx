export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-md bg-seafoam px-4 py-2 font-medium text-white transition hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
