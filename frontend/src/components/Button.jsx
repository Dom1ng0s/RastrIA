export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "rounded-lg px-4 py-2 text-sm font-semibold transition";
  const variants = {
    primary: "btn-primary",
    outline: "btn-outline",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}