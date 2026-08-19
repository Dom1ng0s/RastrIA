import { Logo } from "./Logo";

export function AuthBrandPanel({ heading, subtitle }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 md:flex">
      <svg
        className="pulse-motif absolute inset-0 h-full w-full"
        viewBox="0 0 500 560"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -20 300 C 40 300 60 260 100 260 C 130 260 140 300 160 300 C 180 300 190 80 220 80 C 250 80 260 460 290 460 C 310 460 320 300 350 300 C 380 300 400 260 520 260"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <Logo reverse className="relative z-10" />

      <div className="relative z-10">
        <h1 className="mb-3 text-3xl font-semibold leading-tight text-white">{heading}</h1>
        <p className="max-w-[280px] text-sm text-[#CFEAE3]">{subtitle}</p>
      </div>

      <p className="relative z-10 text-xs text-[#9FCFC4]">Programa Centelha 3 · Alagoas</p>
    </div>
  );
}
