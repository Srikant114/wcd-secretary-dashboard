import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>{children}</div>
  );
}

export function PerfBadge({ value, thresholds = [85, 70] as [number, number] }: { value: number; thresholds?: [number, number] }) {
  const [g, a] = thresholds;
  const bg = value > g ? "bg-[#2E7D32]" : value >= a ? "bg-[#F59E0B]" : "bg-[#C62828]";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded`}>{value}%</span>
  );
}

export function AssignPlanButton({ count, indicator }: { count: number; indicator: string }) {
  return (
    <button
      onClick={() =>
        toast.success("Plan assigned", {
          description: `Plan assigned to ${count} districts for ${indicator}. Block supervisors will be notified.`,
        })
      }
      className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm"
    >
      Assign plan
    </button>
  );
}

export function ViewToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-gray-100 rounded p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-xs font-semibold rounded ${
            value === o ? "bg-white text-[#f97316] shadow-sm" : "text-gray-600"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function useToggle<T extends string>(initial: T) {
  return useState<T>(initial);
}
