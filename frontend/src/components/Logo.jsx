export function Logo({ reverse = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 16 40 24">
        <circle cx="8" cy="30" r="5" fill="#14B892" />
        <path
          d="M8 30 C14 30 15 20 20 20 C24 20 25 34 29 34 C32 34 32 26 36 26"
          fill="none"
          stroke={reverse ? "white" : "#0C4A44"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="26" r="3.5" fill="#FF6B4A" />
      </svg>
      <span className={`font-heading text-2xl font-semibold ${reverse ? "text-white" : "text-primary"}`}>
        Rastria
      </span>
    </div>
  );
}
