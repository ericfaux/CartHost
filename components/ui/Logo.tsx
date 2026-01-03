export function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <div className={`font-heading font-black tracking-tighter select-none ${className}`}>
      <span className="text-slate-900">C</span>
      <span className="text-teal-600">H</span>
    </div>
  );
}
