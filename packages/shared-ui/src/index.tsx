import type { ComponentType, ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Landmark,
  MoreHorizontal,
  Search,
  ShieldAlert
} from "lucide-react";
import type { ChartPoint, Merchant, Tone } from "@mp/mock-data";

export type { Merchant };

export type RemoteProps = {
  merchant: Merchant;
  pathname: string;
  navigate: (pathname: string) => void;
};

export type RemoteComponent = ComponentType<RemoteProps>;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Logo({ compact = false, href = "/", onNavigate }: { compact?: boolean; href?: string; onNavigate?: (pathname: string) => void }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!onNavigate) return;
        event.preventDefault();
        onNavigate(href);
      }}
      className="mp-tracking-zero inline-flex min-h-[44px] items-center gap-3 text-[20px] font-bold leading-[28px] text-white no-underline"
      aria-label="Merchant Portal"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#2f6bed] text-white shadow-[0_12px_24px_rgba(47,107,237,0.25)]">
        <Landmark className="size-5" />
      </span>
      <span className={compact ? "sr-only" : ""}>
        Merchant<span className="text-[#3b82f6]">Portal</span>
      </span>
    </a>
  );
}

export function Page({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return <section className={full ? "w-full" : "mx-auto max-w-[1440px]"}>{children}</section>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="mb-7 flex items-start justify-between gap-6 max-md:block">
      <div>
        <h1 className="mp-tracking-zero m-0 text-[28px] font-bold leading-[36px] text-mp-content-strong">{title}</h1>
        <p className="mt-2 text-mp-content-muted">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 max-md:mt-4">{actions}</div> : null}
    </header>
  );
}

export function Button({
  children,
  variant = "default",
  href,
  icon,
  onNavigate,
  onPress,
  disabled,
  ariaLabel
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "danger" | "ghost";
  href?: string;
  icon?: ReactNode;
  onNavigate?: (pathname: string) => void;
  onPress?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const className = cn(
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold leading-5 no-underline shadow-sm transition",
    !disabled && "hover:-translate-y-px active:translate-y-0",
    disabled && "cursor-not-allowed opacity-60",
    variant === "primary" && "border-[#2f6bed] bg-[#2f6bed] text-white",
    variant === "danger" && "border-red-300 bg-white text-mp-feedback-danger",
    variant === "ghost" && "border-transparent bg-transparent text-mp-brand-primary shadow-none",
    variant === "default" && "border-mp-border-subtle bg-white text-mp-content-strong"
  );

  if (href) {
    return (
      <a
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className={className}
        href={disabled ? undefined : href}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onPress?.();
          if (!onNavigate) return;
          event.preventDefault();
          onNavigate(href);
        }}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      onClick={onPress}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  disabled,
  onPress,
  className
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={cn("grid size-10 place-items-center rounded-lg border border-mp-border-subtle bg-white text-mp-content-strong shadow-sm transition", !disabled && "hover:-translate-y-px", disabled && "cursor-not-allowed opacity-45", className)}
      disabled={disabled}
      onClick={onPress}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function MetricCard({
  title,
  value,
  delta,
  variant = "default",
  icon,
  onPress
}: {
  title: string;
  value: string;
  delta?: string;
  variant?: Tone;
  icon?: ReactNode;
  onPress?: () => void;
}) {
  const iconTone = variant === "positive"
    ? "bg-mp-feedback-success-subtle text-mp-feedback-success"
    : variant === "danger" || variant === "failed"
      ? "bg-mp-feedback-danger-subtle text-mp-feedback-danger"
      : variant === "dark"
        ? "bg-[#143a62] text-white"
        : "bg-mp-brand-primary-subtle text-mp-brand-primary";
  const deltaTone = variant === "danger" || variant === "failed"
    ? "bg-mp-feedback-danger-subtle text-mp-feedback-danger"
    : "bg-mp-feedback-success-subtle text-mp-feedback-success";

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-lg text-sm font-bold", iconTone)}>
          {icon ?? title.slice(0, 1)}
        </span>
        {delta ? (
          <span className={cn("rounded-md px-2 py-1 text-xs font-bold", deltaTone)}>
            {delta}
          </span>
        ) : null}
      </div>
      <p className={cn("mt-7 mb-1 font-medium text-mp-content-muted", variant === "dark" && "text-[#9aa8ba]")}>{title}</p>
      <strong className={cn("mp-tracking-zero block whitespace-nowrap text-[24px] font-bold leading-[30px] text-mp-content-strong", variant === "dark" && "text-white")}>{value}</strong>
    </>
  );

  if (!onPress) {
    return (
      <article className={cn("min-h-36 rounded-xl border p-5 shadow-sm", variant === "dark" ? "mp-metric-dark" : "border-mp-border-subtle bg-white")}>
        {content}
      </article>
    );
  }

  return (
    <button
      className={cn("min-h-36 w-full rounded-xl border p-5 text-left shadow-sm transition hover:-translate-y-px", variant === "dark" ? "mp-metric-dark" : "border-mp-border-subtle bg-white")}
      onClick={onPress}
      type="button"
    >
      {content}
    </button>
  );
}

export function Panel({
  children,
  className,
  id,
  onPress,
  ariaLabel
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  onPress?: () => void;
  ariaLabel?: string;
}) {
  const panelClassName = cn("rounded-xl border border-mp-border-subtle bg-white p-6 shadow-sm", onPress && "text-left transition hover:-translate-y-px", className);

  if (!onPress) return <section className={panelClassName} id={id}>{children}</section>;

  return (
    <button aria-label={ariaLabel} className={panelClassName} id={id} onClick={onPress} type="button">
      {children}
    </button>
  );
}

export function CardHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="mp-tracking-zero m-0 text-xl font-bold leading-[28px] text-mp-content-strong">{title}</h2>
        {subtitle ? <p className="mt-1 text-mp-content-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ children, variant = "positive" }: { children: ReactNode; variant?: Tone }) {
  const tone =
    variant === "warning" || variant === "default"
      ? "bg-mp-feedback-warning-subtle text-mp-feedback-warning"
      : variant === "failed" || variant === "danger"
        ? "bg-mp-feedback-danger-subtle text-mp-feedback-danger"
        : variant === "info"
          ? "bg-mp-brand-primary-subtle text-mp-brand-primary"
          : "bg-mp-feedback-success-subtle text-mp-feedback-success";

  return (
    <span
      className={cn(
        "inline-flex min-h-[26px] items-center gap-2 whitespace-nowrap rounded-full px-3 text-xs font-bold",
        tone
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-mp-border-subtle bg-white shadow-sm">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-200 bg-slate-50 px-5 py-4 text-left text-xs font-bold uppercase text-mp-content-muted">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-slate-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-nowrap border-b border-slate-100 px-5 py-4 text-sm text-mp-content-default last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange?: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="font-bold text-mp-content-default">{label}</span>
      <input
        className="min-h-12 rounded-lg border border-mp-border-subtle bg-white px-4 text-mp-content-default outline-none focus:border-mp-brand-primary"
        defaultValue={value}
        onBlur={(event) => onChange?.(event.currentTarget.value)}
        type={type}
      />
    </label>
  );
}

export function InfoList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="mt-5 grid">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between gap-4 border-b border-slate-100 py-3">
          <dt className="text-mp-content-muted">{item.label}</dt>
          <dd className="m-0 text-right font-bold text-mp-content-strong">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ items }: { items: Array<{ title: string; description: string; time: string }> }) {
  return (
    <ol className="relative mt-5 list-none p-0 before:absolute before:bottom-5 before:left-[7px] before:top-2 before:w-0.5 before:bg-mp-border-subtle">
      {items.map((item) => (
        <li key={`${item.title}-${item.time}`} className="relative pb-6 pl-8">
          <span className="absolute left-0 top-1.5 size-4 rounded-full border-[3px] border-white bg-mp-brand-primary shadow-[0_0_0_1px_var(--mp-color-border-subtle)]" />
          <strong className="block text-sm text-mp-content-strong">{item.title}</strong>
          <p className="my-1 text-sm text-mp-content-muted">{item.description}</p>
          <small className="text-mp-content-subtle">{item.time}</small>
        </li>
      ))}
    </ol>
  );
}

function chartPath(points: ChartPoint[], key: "approved" | "rejected", max: number) {
  return points
    .map((point, index) => {
      const x = 40 + index * (690 / Math.max(points.length - 1, 1));
      const y = 220 - (point[key] / max) * 172;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function chartArea(points: ChartPoint[], max: number) {
  const path = chartPath(points, "approved", max);
  const lastX = 40 + (points.length - 1) * (690 / Math.max(points.length - 1, 1));
  return `${path} L ${lastX.toFixed(1)} 228 L 40 228 Z`;
}

export function LineChart({
  title,
  subtitle,
  data,
  onRandomize
}: {
  title: string;
  subtitle: string;
  data: ChartPoint[];
  onRandomize?: () => void;
}) {
  const max = Math.max(1, ...data.flatMap((point) => [point.approved, point.rejected]));

  return (
    <Panel>
      <CardHeading
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-mp-border-subtle bg-slate-50 px-3 text-xs">
              <i className="size-2 rounded-full bg-[#2f6bed]" /> Aprovadas
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-mp-border-subtle bg-slate-50 px-3 text-xs">
              <i className="size-2 rounded-full bg-slate-300" /> Recusadas
            </span>
            {onRandomize ? (
              <IconButton label="Atualizar cenário" onPress={onRandomize}>
                <MoreHorizontal className="size-4" />
              </IconButton>
            ) : null}
          </div>
        }
      />
      <svg className="block min-h-[270px] w-full" viewBox="0 0 760 260" role="img" aria-label={`${title}: ${subtitle}`}>
        <g stroke="#e8edf4">
          <line x1="40" x2="730" y1="42" y2="42" />
          <line x1="40" x2="730" y1="104" y2="104" />
          <line x1="40" x2="730" y1="166" y2="166" />
          <line x1="40" x2="730" y1="228" y2="228" />
        </g>
        <path fill="rgba(47,107,237,0.14)" d={chartArea(data, max)} />
        <path fill="none" stroke="#2f6bed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d={chartPath(data, "approved", max)} />
        <path fill="none" stroke="#cbd5e1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={chartPath(data, "rejected", max)} />
        <g fill="#62708a" fontSize="12" fontWeight="600">
          {data.map((point, index) => (
            <text key={point.label} x={40 + index * (690 / Math.max(data.length - 1, 1))} y="252">
              {point.label}
            </text>
          ))}
        </g>
      </svg>
    </Panel>
  );
}

export const Icons = {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Search,
  ShieldAlert
};
