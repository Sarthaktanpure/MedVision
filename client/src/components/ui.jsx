export function Button({ className = "", variant = "default", children, ...props }) {
  const variants = {
    default: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/10",
    ghost: "bg-transparent text-slate-200 hover:bg-white/5",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  };

  return (
    <button
      type={props.type || "button"}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className = "", children }) {
  return <div className={`glass rounded-3xl p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={`text-sm text-slate-400 ${className}`}>{children}</p>;
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
      {...props}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
      {...props}
    />
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/8 text-slate-200",
    accent: "bg-cyan-400/15 text-cyan-200 border border-cyan-300/20",
    success: "bg-emerald-400/15 text-emerald-200 border border-emerald-300/20",
    warn: "bg-amber-400/15 text-amber-200 border border-amber-300/20",
    danger: "bg-rose-400/15 text-rose-200 border border-rose-300/20",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function SectionLabel({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{children}</p>;
}

export function Divider() {
  return <div className="h-px w-full bg-white/10" />;
}
