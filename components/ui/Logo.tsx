type LogoProps = {
  className?: string;
  variant?: "default" | "inverted"; // 'inverted' is for dark backgrounds
};

export function Logo({ className = "text-2xl", variant = "default" }: LogoProps) {
  // Define colors based on variant
  const cColor = variant === "inverted" ? "text-white" : "text-slate-900";
  const hColor = variant === "inverted" ? "text-teal-400" : "text-teal-600"; // Teal-400 pops better on dark

  return (
    <div className={`font-heading font-black tracking-tighter select-none ${className}`}>
      <span className={cColor}>C</span>
      <span className={hColor}>H</span>
    </div>
  );
}
