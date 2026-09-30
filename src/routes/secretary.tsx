import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { DssTabShell, DssReviewShell } from "@/components/dss/Shell";
import { SelectionMap } from "@/components/dss/SelectionMap";
import { Card } from "@/components/dss/ui";
import {
  DISTRICTS,
  DQ_CHECKS,
  MODULES,
  MODULE_INDICATORS,
  districtOutcomeData,
  districtProgramData,
  districtDQData,
  districtRYG,
  districtNFHS6Data,
  districtZeroSAMPct,
  ptDistrictTrend,
  ptStateTrend,
  stateOutcomes,
  type ModuleKey,
  type PTMonth,
} from "@/lib/dss-data";
import {
  PROGRAM_TIERS,
  PROGRAM_SURVEY,
  PROGRAM_DQ_META,
  PLAN_OPTIONS,
  PREVIOUS_SESSION_ACTIONS,
  STATUS_ICON,
  STATUS_COLOR,
  TIER_META,
  dqBreakdown,
  directedToOptions,
  indicatorTrend,
  trendDirection,
  MONTH_LABELS,
  DQ_METHODOLOGY,
  dqBand,
  indicatorStateAvg,
  indicatorValue,
  programDq,
  surveyValues,
  type TrackerItem,
} from "@/lib/secretary-v6";

export const Route = createFileRoute("/secretary")({
  head: () => ({
    meta: [
      { title: "Weekly District Review — Secretary View | WCD Odisha" },
      {
        name: "description",
        content:
          "Session-based weekly district review tool for the Secretary, WCD Odisha: select districts, review outcomes, service delivery and data quality, assign improvement plans.",
      },
      { property: "og:title", content: "Weekly District Review — Secretary View" },
      {
        property: "og:description",
        content:
          "Run structured weekly reviews of Odisha districts: outcomes, service delivery gaps, data quality and assigned improvement plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecretaryPage,
});

const TEAL = "#4f46e5";
const PLANS = [
  "POSHAN Intensive Support",
  "Saksham Anganwadi Strengthening",
  "Data Quality Remediation",
  "Multi-programme Bundle",
];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function sdScore(d: string) {
  const p = districtProgramData[d];
  if (!p) return 0;
  const vals = Object.values(p);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
/** % Red AWCs in district — primary DQ metric (higher = worse quality). */
function dqScore(d: string) {
  const ryg = districtRYG[d];
  if (!ryg || ryg.total === 0) return 0;
  return Math.round(ryg.R / ryg.total * 100);
}
function dqFlagged(d: string) {
  return dqScore(d); // same: % red AWCs IS the flagged metric
}
/** Real PT wasting % from POSHAN Tracker July 2026 */
function ptWasting(d: string) {
  return ptDistrictTrend[d]?.["Jul"]?.wasting ?? districtOutcomeData[d]?.wasting ?? 0;
}
/** 6-month PT trend for a given outcome field */
const PT_TREND_MONTHS: PTMonth[] = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
function ptOutcomeTrend(d: string, field: "wasting" | "stunting" | "sam" | "uw"): number[] {
  return PT_TREND_MONTHS.map((m) => ptDistrictTrend[d]?.[m]?.[field] ?? 0);
}
function ptOutcomeStateAvg(field: "wasting" | "stunting" | "sam" | "uw") {
  const v = ptStateTrend["Jul"];
  if (field === "wasting") return v.wasting;
  if (field === "stunting") return v.stunting;
  if (field === "sam") return v.sam;
  return v.uw;
}
function population(d: string) {
  // deterministic pseudo population (lakh) for context display
  const seed = d.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (8 + (seed % 30) + ((seed % 7) / 10)).toFixed(1);
}

type Row = { key: string; name: string; value: number; stateAvg: number };

function moduleRows(module: ModuleKey, district: string): Row[] {
  const base = MODULE_INDICATORS[module].map((i) => i.key);
  const keys =
    module === "poshan"
      ? [...base, "poshan_vhsnd", "poshan_homevisit"]
      : base;
  const nameFor = (k: string) => {
    const found = MODULE_INDICATORS[module].find((i) => i.key === k);
    if (found) return found.name;
    if (k === "poshan_vhsnd") return "VHSND Conducted";
    return "Home Visits by AWW";
  };
  const valueFor = (d: string, k: string) => {
    const p = districtProgramData[d];
    if (!p) return 0;
    if (k === "poshan_vhsnd") return clamp(p.poshan_weighed + 9);
    if (k === "poshan_homevisit") return clamp(p.poshan_weighed - 1);
    return p[k] ?? 0;
  };
  return keys.map((k) => ({
    key: k,
    name: nameFor(k),
    value: valueFor(district, k),
    stateAvg: Math.round(
      DISTRICTS.reduce((a, d) => a + valueFor(d, k), 0) / DISTRICTS.length,
    ),
  }));
}

/** Compute review priority score for a district (0–100, higher = more urgent).
 * Combines: wasting level, Feb→Jul trend, % Red AWCs, zero-SAM AWC %, measurement efficiency.
 * Returns score + top 2 reasons for the score. */
function priorityScore(d: string): { score: number; reasons: string[] } {
  const w = ptWasting(d);
  const wFeb = ptDistrictTrend[d]?.["Feb"]?.wasting ?? w;
  const trend = +(w - wFeb).toFixed(1);
  const dq = dqScore(d);
  const meff = districtProgramData[d]?.poshan_weighed ?? 80;
  const zeroSAM = districtZeroSAMPct[d] ?? 20;

  let score = 0;
  const reasons: string[] = [];

  // Wasting level (0–30)
  if (w > 5)      { score += 30; reasons.push(`High wasting ${w.toFixed(1)}%`); }
  else if (w > 3) { score += 15; reasons.push(`Moderate wasting ${w.toFixed(1)}%`); }

  // Wasting trend Feb→Jul (0–25)
  if (trend > 0.5)      { score += 25; reasons.push(`Worsening ↑${trend.toFixed(1)}pp`); }
  else if (trend > 0.2) { score += 10; }

  // DQ concern (0–20)
  if (dq < 65)      { score += 20; reasons.push(`Poor DQ ${dq}%`); }
  else if (dq < 75) { score += 10; }

  // Zero-SAM AWC % suspicious (0–15)
  if (zeroSAM > 40)  { score += 15; reasons.push(`${zeroSAM}% AWCs zero-reported`); }
  else if (zeroSAM > 25) { score += 8; }

  // Low measurement efficiency (0–10)
  if (meff < 75) { score += 10; reasons.push(`Low ME ${meff}%`); }

  return { score, reasons: reasons.slice(0, 2) };
}

const SUGGESTED = [...DISTRICTS]
  .sort((a, b) => priorityScore(b).score - priorityScore(a).score)
  .slice(0, 8);

/** Dot color for PT wasting: >5% red, ≥3% amber, <3% green (PT scale) */
function dotFor(w: number) {
  return w > 5 ? "#C62828" : w >= 3 ? "#F59E0B" : "#2E7D32";
}

/* ------------------------------- page ------------------------------- */

type Reviewed = Record<
  string,
  { plan: string | null; directedTo?: string; note: string; skipped: boolean }
>;

function SecretaryPage() {
  const [step, setStep] = useState<"select" | "review" | "summary">("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [reviewed, setReviewed] = useState<Reviewed>({});

  if (step === "review") {
    return (
      <DssReviewShell onBack={() => setStep("select")}>
        <ReviewScreen
          districts={selected}
          index={current}
          setIndex={setCurrent}
          reviewed={reviewed}
          setReviewed={setReviewed}
          onEnd={() => setStep("summary")}
        />
      </DssReviewShell>
    );
  }

  return (
    <DssTabShell>
      {step === "select" && (
        <SelectScreen
          selected={selected}
          setSelected={setSelected}
          onStart={() => {
            setCurrent(0);
            setReviewed({});
            setStep("review");
          }}
        />
      )}
      {step === "summary" && (
        <SummaryScreen
          districts={selected}
          reviewed={reviewed}
          onAgain={() => {
            setSelected([]);
            setReviewed({});
            setCurrent(0);
            setStep("select");
          }}
        />
      )}
    </DssTabShell>
  );
}

/* ----------------------------- screen 1 ----------------------------- */

/* ------------------------- action tracker panel ------------------------- */

function ActionTracker({ selected }: { selected: string[] }) {
  const [open, setOpen] = useState(false);
  const [all, setItems] = useState<TrackerItem[]>(PREVIOUS_SESSION_ACTIONS);
  const canExpand = selected.length >= 2;
  const items = selected.length
    ? all.filter((i) => selected.includes(i.district))
    : [];
  const done = items.filter((i) => i.status === "Done").length;
  const pending = items.length - done;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 transition-all">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[13px] font-extrabold text-gray-900 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Last review&apos;s actions
        </span>
        {/* <span className="text-gray-300">|</span>
        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Week of 4 Aug 2026</span> */}
        {canExpand && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-[12px] font-medium text-gray-600 flex gap-2">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">{done} Done ✓</span>
              <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{pending} Pending ●</span>
            </span>
          </>
        )}
        <button
          disabled={!canExpand}
          onClick={() => canExpand && setOpen(!open)}
          className={`ml-auto px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            canExpand
              ? "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 cursor-pointer shadow-sm"
              : "bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed opacity-50"
          }`}
        >
          {open ? "Collapse ▲" : "Expand ▼"}
        </button>
      </div>

      {open && canExpand && items.length === 0 && (
        <div className="text-[13px] font-medium text-gray-500 mt-4 bg-gray-50 p-4 rounded-lg text-center border border-gray-100 border-dashed">
          No previous actions recorded for the selected districts.
        </div>
      )}
      {open && items.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-600 font-bold uppercase tracking-wide text-[10px]">
                <th className="text-left py-2.5 px-4 font-bold">District</th>
                <th className="text-left py-2.5 px-4 font-bold">Plan assigned</th>
                <th className="text-left py-2.5 px-4 font-bold">Directed to</th>
                <th className="text-left py-2.5 px-4 font-bold">Status</th>
                <th className="text-left py-2.5 px-4 font-bold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((it) => (
                <tr key={it.district} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-4 font-extrabold text-gray-900">{it.district}</td>
                  <td className="py-2.5 px-4 font-medium text-gray-700">{it.plan}</td>
                  <td className="py-2.5 px-4 font-medium text-gray-600">{it.directedTo}</td>
                  <td className="py-2.5 px-4">
                    <select
                      value={it.status}
                      onChange={(e) =>
                        setItems((arr) =>
                          arr.map((x) =>
                            x.district === it.district
                              ? { ...x, status: e.target.value as TrackerItem["status"] }
                              : x,
                          ),
                        )
                      }
                      className="px-2.5 py-1 rounded-md border border-gray-200 text-[11px] font-bold bg-white shadow-sm focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]/30 outline-none transition-all cursor-pointer"
                      style={{ color: STATUS_COLOR[it.status] }}
                    >
                      {(["Done", "In Progress", "Pending"] as const).map((s) => (
                        <option key={s} value={s} className="text-gray-800" style={{ color: "#1f2937" }}>
                          {STATUS_ICON[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 italic max-w-xs truncate" title={it.note ?? ""}>{it.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SelectScreen({
  selected,
  setSelected,
  onStart,
}: {
  selected: string[];
  setSelected: (v: string[]) => void;
  onStart: () => void;
}) {
  const [sort, setSort] = useState<{ outcome: boolean; sd: boolean; dq: boolean; priority: boolean }>({
    outcome: true,
    sd: false,
    dq: false,
    priority: false,
  });

  const districts = useMemo(() => {
    const list = [...DISTRICTS];
    if (sort.priority) list.sort((a, b) => priorityScore(b).score - priorityScore(a).score);
    else if (sort.sd) list.sort((a, b) => sdScore(a) - sdScore(b));
    else if (sort.outcome) list.sort((a, b) => a.localeCompare(b));
    return list;
  }, [sort]);

  const toggle = (d: string) => {
    if (selected.includes(d)) setSelected(selected.filter((x) => x !== d));
    else if (selected.length < 8) setSelected([...selected, d]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-indigo-100/60 rounded-xl px-6 py-5 flex items-center gap-4 flex-wrap relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Weekly District Review</h2>
            {/* <span className="px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-600 shadow-sm leading-none uppercase tracking-wide">Week of 4 Aug 2026</span> */}
          </div>
          {/* <p className="text-[13px] text-gray-500 mt-2 font-medium max-w-xl">
            Select 7–8 districts to review this session. The system highlights districts that may need priority attention based on wasting trends and data quality.
          </p> */}
          <p className="text-[13px] text-gray-500 mt-2 font-medium max-w-xl">
            Select districts to review this session. The system highlights districts that may need priority attention based on wasting trends and data quality.
          </p>
        </div>
        {/* <button
          disabled={true}
          onClick={onStart}
          className="ml-auto px-6 py-2.5 rounded-lg text-[13px] font-bold text-white shadow-md transition-all z-10
            disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-[#4f46e5]"
        >
          Start Review →
        </button> */}
      </div>

      <ActionTracker selected={selected} />

      {/* Sort Section moved from the right sidebar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Sort view by:</div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              // { k: "priority" as const, label: "Priority Score" },
              { k: "outcome" as const, label: "Worst Outcomes" },
              // { k: "sd" as const, label: "Worst SD" },
              { k: "dq" as const, label: "DQ Flagged" },
            ].map((p) => (
              <button
                key={p.k}
                onClick={() =>
                  setSort((s) => ({
                    outcome: false, sd: false, dq: false, priority: false,
                    [p.k]: !s[p.k],
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  sort[p.k] ? "bg-[#4f46e5] text-white shadow-sm" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#4f46e5]/50 hover:bg-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/* <div className="text-[10px] text-gray-400 font-medium max-w-xs">
          * Priority score: wasting level + trend + DQ + zero-reporting AWC % + ME
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 items-start">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {districts.map((d) => {
            const w = ptWasting(d);
            const sd = sdScore(d);
            const flagged = dqFlagged(d);
            const isSel = selected.includes(d);
            const blocked = !isSel && selected.length >= 8;
            const dqHighlight = sort.dq && flagged > 25;
            const { score: pScore, reasons: pReasons } = priorityScore(d);
            const pColor = pScore > 50 ? "#C62828" : pScore > 30 ? "#D97706" : "#2E7D32";
            const pBg = pScore > 50 ? "bg-red-50" : pScore > 30 ? "bg-yellow-50" : "bg-green-50";
            
            const wTheme = w < 3 ? "bg-emerald-50" : w <= 5 ? "bg-amber-50" : "bg-red-50";
            const wBorder = w < 3 ? "border-emerald-200" : w <= 5 ? "border-amber-200" : "border-red-200";

            return (
              <button
                key={d}
                onClick={() => toggle(d)}
                title={blocked ? "Max 8 districts" : `Priority ${pScore}/100: ${pReasons.join("; ")}`}
                className={`text-left rounded-xl p-3 border transition-all duration-200 relative overflow-hidden group ${
                  isSel
                    ? "bg-[#4f46e5] text-white border-transparent shadow-md ring-2 ring-offset-1 ring-[#4f46e5]"
                    : blocked
                      ? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed"
                      : `${wTheme} ${wBorder} hover:border-[#4f46e5]/50 hover:shadow-md hover:-translate-y-0.5`
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[14px] font-bold leading-tight">{d}</span>
                  {isSel ? (
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-white">✓</span>
                    </div>
                  ) : null}
                </div>
                
                {/* {pReasons.length > 0 && !isSel && (
                  <div className="text-[10px] font-medium leading-tight truncate mb-2 opacity-80" style={{ color: pColor }}>
                    {pReasons[0]}
                  </div>
                )}
                {isSel && pReasons.length > 0 && (
                  <div className="text-[10px] font-medium leading-tight truncate mb-2 text-white/80">
                    {pReasons[0]}
                  </div>
                )} */}
                
                <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100/20">
                  <div className={`text-[11px] font-medium ${isSel ? "text-white/90" : "text-gray-600"}`}>
                    <span className="opacity-70">Wasting:</span> <span className="font-bold">{w.toFixed(1)}%</span>
                  </div>
                  <div className={`text-[11px] font-medium ${isSel ? "text-white/90" : "text-gray-600"}`}>
                    <span className="opacity-70">DQ:</span> <span className="font-bold">{flagged.toFixed(0)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4 lg:sticky lg:top-4">
          {/* <Selection Guide hidden by user request> */}
          {false && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/50">
              <div className="text-[13px] font-extrabold text-gray-900 mb-3 tracking-tight">Selection Guide</div>
              <div className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Suggested for this week</div>
              <div className="grid grid-cols-2 gap-y-1.5 text-[12px] text-gray-700 mb-4 font-medium">
                {SUGGESTED.map((d) => (
                  <span key={d} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]/40" />
                    {d}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelected(SUGGESTED)}
                className="w-full mb-5 px-4 py-2 rounded-lg text-[12px] font-bold text-white shadow-sm transition-all hover:shadow-md bg-[#4f46e5]"
              >
                Select All 8 Suggested
              </button>

              <div className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Sort view by</div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { k: "priority" as const, label: "Priority Score" },
                  { k: "outcome" as const, label: "Worst Outcomes" },
                  { k: "sd" as const, label: "Worst SD" },
                  { k: "dq" as const, label: "DQ Flagged" },
                ].map((p) => (
                  <button
                    key={p.k}
                    onClick={() =>
                      setSort((s) => ({
                        outcome: false, sd: false, dq: false, priority: false,
                        [p.k]: !s[p.k],
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      sort[p.k] ? "bg-[#4f46e5] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="text-[9.5px] text-gray-400 mt-2.5 font-medium leading-relaxed bg-white p-2 rounded-md border border-gray-100">
                * Priority score: wasting level + trend + DQ + zero-reporting AWC % + ME
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-[13px] font-extrabold text-gray-900 mb-2 tracking-tight">
              Selected ({selected.length}/8)
            </div>
            {selected.length === 0 ? (
              <div className="text-[11px] font-medium text-gray-400 italic">No districts selected yet.</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-sm bg-[#4f46e5]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
            {/* Map removed by user request */}
            {/* <div className="mt-4 border border-gray-200/60 rounded-lg overflow-hidden bg-white shadow-sm">
              <SelectionMap highlighted={selected} height={200} />
            </div> */}
          </div>

          {/* Side-by-side comparison removed by user request */}
          {false && selected.length === 2 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100/50">
              <div className="text-[13px] font-extrabold text-gray-900 mb-3 tracking-tight">
                Side-by-side Comparison
              </div>
              {(() => {
                const [dA, dB] = selected;
                const rows: { label: string; a: string; b: string; higherWorse?: boolean }[] = [
                  {
                    label: "Priority Score",
                    a: `${priorityScore(dA).score}/100`,
                    b: `${priorityScore(dB).score}/100`,
                    higherWorse: true,
                  },
                  {
                    label: "Wasting (Jul '26)",
                    a: `${ptWasting(dA).toFixed(1)}%`,
                    b: `${ptWasting(dB).toFixed(1)}%`,
                    higherWorse: true,
                  },
                  {
                    label: "Service Delivery",
                    a: `${sdScore(dA)}%`,
                    b: `${sdScore(dB)}%`,
                    higherWorse: false,
                  },
                  {
                    label: "Red AWCs %",
                    a: `${dqScore(dA)}%`,
                    b: `${dqScore(dB)}%`,
                    higherWorse: true,
                  },
                  {
                    label: "Red AWCs (abs)",
                    a: `${dqFlagged(dA).toFixed(1)}%`,
                    b: `${dqFlagged(dB).toFixed(1)}%`,
                    higherWorse: true,
                  },
                  {
                    label: "Zero-SAM AWCs",
                    a: `${(districtZeroSAMPct[dA] ?? 0).toFixed(1)}%`,
                    b: `${(districtZeroSAMPct[dB] ?? 0).toFixed(1)}%`,
                    higherWorse: true,
                  },
                  {
                    label: "PT Jul Wasting",
                    a: `${(ptDistrictTrend[dA]?.["Jul"]?.wasting ?? 0).toFixed(1)}%`,
                    b: `${(ptDistrictTrend[dB]?.["Jul"]?.wasting ?? 0).toFixed(1)}%`,
                    higherWorse: true,
                  },
                ];
                return (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-1 font-semibold text-gray-500">Metric</th>
                        <th className="text-center py-1 font-bold text-teal-700">{dA}</th>
                        <th className="text-center py-1 font-bold text-teal-700">{dB}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const aNum = parseFloat(row.a);
                        const bNum = parseFloat(row.b);
                        const aWins = row.higherWorse ? aNum < bNum : aNum > bNum;
                        const bWins = row.higherWorse ? bNum < aNum : bNum > aNum;
                        return (
                          <tr key={row.label} className="border-b border-gray-100">
                            <td className="py-1 text-gray-600">{row.label}</td>
                            <td className="py-1 text-center font-semibold"
                              style={{ color: aWins ? "#2E7D32" : bWins ? "#C62828" : "#374151" }}>
                              {row.a}{aWins ? " ✓" : ""}
                            </td>
                            <td className="py-1 text-center font-semibold"
                              style={{ color: bWins ? "#2E7D32" : aWins ? "#C62828" : "#374151" }}>
                              {row.b}{bWins ? " ✓" : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}

          <button
            disabled={true}
            onClick={onStart}
            className="w-full py-3 rounded-lg text-sm font-bold text-white shadow disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: TEAL }}
          >
            Start Review →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- screen 2 ----------------------------- */

/** SAM care cascade funnel — per district.
 * Estimated & PT Identified = real data. Referred/Admitted/Cured = illustrative. */
function SamPipelineFunnel({ district }: { district: string }) {
  const julData = ptDistrictTrend[district]?.["Jul"];
  const nfhs6 = districtNFHS6Data[district];
  if (!julData || !nfhs6) return null;

  const n = julData.n;
  const ptSam = julData.sam;
  const nfhsSam = nfhs6.sam;

  // Deterministic seed for dummy pipeline rates
  const seed = district.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const referralRate  = 0.15 + (seed % 15) / 100;   // 15–30%
  const admissionRate = 0.55 + (seed % 20) / 100;   // 55–75%
  const cureRate      = 0.68 + (seed % 14) / 100;   // 68–82%

  const estimated  = Math.round(n * nfhsSam / 100);
  const identified = Math.round(n * ptSam / 100);
  const referred   = Math.round(identified * referralRate);
  const admitted   = Math.round(referred * admissionRate);
  const cured      = Math.round(admitted * cureRate);

  const stages: { label: string; val: number; isReal: boolean; sub: string }[] = [
    { label: "Estimated SAM (NFHS-6)",  val: estimated,  isReal: true,  sub: `${nfhsSam}% survey rate × enrolled children` },
    { label: "PT Identified",           val: identified, isReal: true,  sub: `${ptSam}% PT Jul 2026 — WHZ + MUAC + oedema` },
    { label: "Referred to NRC",         val: referred,   isReal: false, sub: `~${Math.round(referralRate * 100)}% of identified — illustrative` },
    { label: "NRC Admitted",            val: admitted,   isReal: false, sub: `~${Math.round(admissionRate * 100)}% of referred — illustrative` },
    { label: "Treatment Completed",     val: cured,      isReal: false, sub: `~${Math.round(cureRate * 100)}% of admitted — illustrative` },
  ];

  const maxVal = Math.max(estimated, 1);
  const gap = +(nfhsSam - ptSam).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase text-gray-700">SAM Care Cascade</span>
        <span className="text-[10px] text-gray-400">
          ✅ Real &nbsp;·&nbsp; <span className="text-gray-800">🔵 Illustrative</span>
        </span>
      </div>
      <div className="text-[10px] text-gray-500 mb-2">
        NFHS-6 estimate → PT tracking → referral & treatment pipeline
      </div>
      <div className="space-y-2">
        {stages.map((s) => {
          const barPct = Math.round((s.val / maxVal) * 100);
          const barColor = s.isReal ? "#4f46e5" : "#4f46e5";
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-semibold text-gray-700">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900">{s.val.toLocaleString()}</span>
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded"
                    style={{
                      background: s.isReal ? "#DCFCE7" : "#DBEAFE",
                      color: s.isReal ? "#166534" : "#1E40AF",
                    }}
                  >
                    {s.isReal ? "✅ Real" : "🔵 Illus."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${barPct}%`, background: barColor }}
                  />
                </div>
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>
      {gap > 1 && (
        <div className="mt-2 rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] text-amber-800">
          <span className="font-bold">SAM gap: {gap}pp</span> — NFHS-6 ({nfhsSam}%) vs PT ({ptSam}%).
          NFHS-6 uses WHZ only; PT adds MUAC &lt;11.5cm &amp; oedema.
        </div>
      )}
    </div>
  );
}

/** 5-pattern district insight based on real DQ + outcome signals. Module arg injects module-specific context. */
function getPattern(district: string, module: ModuleKey): {
  bg: string; border: string; color: string;
  title: string; headline: string;
  points: string[];
  suggestedPlan: string; suggestedTo: string;
} {
  const dq = dqScore(district);
  const w = ptWasting(district);
  const mEff = districtProgramData[district]?.poshan_weighed ?? 80;
  const zeroSAM = districtZeroSAMPct[district] ?? 20;
  const sd = sdScore(district);
  const nfhs6Sam = districtNFHS6Data[district]?.sam ?? 5.7;
  const wFeb = ptDistrictTrend[district]?.["Feb"]?.wasting ?? w;
  const wTrend = +(w - wFeb).toFixed(1);
  const stateWasting = +ptOutcomeStateAvg("wasting").toFixed(1);
  const ptSam = +(ptDistrictTrend[district]?.["Jul"]?.sam ?? 0).toFixed(2);

  // Module-specific context — replaces the 3rd bullet and overrides plan/to for non-POSHAN tabs
  const modCtx: { point: string; plan: string; to: string } | null = (() => {
    if (module === "saksham") {
      const iphs = districtProgramData[district]?.saksham_iphs ?? 51;
      const open = districtProgramData[district]?.saksham_open ?? 71;
      return {
        point: `Saksham: ${iphs}% AWCs meet IPHS standards; ${open}% open on unannounced visit — AWC functionality gap`,
        plan: "Saksham AWC Strengthening Plan",
        to: `DSWO ${district}`,
      };
    }
    if (module === "subhadra") {
      const enroll = districtProgramData[district]?.subhadra_enrolled ?? 77;
      const inst1 = districtProgramData[district]?.subhadra_inst1 ?? 68;
      return {
        point: `Subhadra: ${enroll}% eligible women enrolled; ${inst1}% received 1st installment — ${100 - enroll}% coverage gap`,
        plan: "Subhadra Enrollment & Disbursement Drive",
        to: `DSWO ${district}`,
      };
    }
    if (module === "mamta") {
      const reg = districtProgramData[district]?.mamta_registered ?? 74;
      const del = districtProgramData[district]?.mamta_delivery ?? 71;
      return {
        point: `Mamta: ${reg}% PW registered; ${del}% with institutional delivery linked — ANC convergence with Health needed`,
        plan: "Mamta Convergence & Coverage Plan",
        to: `CDPO ${district} + DPMU Health`,
      };
    }
    return null;
  })();

  // Pattern 1 — DQ First: data can't be trusted
  if (dq < 65 || zeroSAM > 40) {
    const triggers = [];
    if (dq < 65) triggers.push(`DQ composite score is ${dq}% — below the 65% reliability threshold`);
    if (zeroSAM > 40) triggers.push(`${zeroSAM}% of AWCs report zero SAM/MAM/UW — likely reporting suppression`);
    return {
      bg: "#FEF3F2", border: "#FECACA", color: "#B91C1C",
      title: "⚠ Data Quality Alert — Fix Data Before Acting",
      headline: `Outcome numbers for ${district} are unreliable. Remediate data quality before assigning outcome-based targets.`,
      points: [
        ...triggers,
        `Wasting shows ${w.toFixed(1)}% — but this figure may be inflated or deflated by the data issues above`,
        modCtx?.point ?? `Recommend: field verification visit + CDPO coaching on Poshan Tracker entry`,
      ],
      suggestedPlan: modCtx ? `DQ Remediation + ${modCtx.plan}` : "Data Quality Remediation",
      suggestedTo: modCtx?.to ?? `CDPO ${district}`,
    };
  }

  // Pattern 2 — Real Crisis: credible data, high wasting
  if (w > 4.5 && dq >= 65 && mEff >= 75) {
    return {
      bg: "#FFF1F1", border: "#FECACA", color: "#991B1B",
      title: "🔴 Confirmed High Burden — Immediate Action Required",
      headline: `${district} has credible data (DQ ${dq}%) and alarming outcomes. This is a real crisis, not a data artefact.`,
      points: [
        `PT wasting ${w.toFixed(1)}% vs state avg ${stateWasting}% — ${(w - stateWasting).toFixed(1)}pp above average`,
        `6-month trend: ${wTrend > 0.3 ? `↑ worsening +${wTrend}pp Feb→Jul` : wTrend < -0.3 ? `↓ improving ${wTrend}pp Feb→Jul` : "→ stable"}`,
        modCtx?.point ?? `NFHS-6 SAM: ${nfhs6Sam}% vs PT SAM: ${ptSam}% — verify NRC referral pipeline is active`,
      ],
      suggestedPlan: modCtx?.plan ?? "POSHAN Intensive Support",
      suggestedTo: modCtx?.to ?? `DSWO ${district}`,
    };
  }

  // Pattern 3 — Hidden/Genuine Burden: low zero-SAM %, KBK-type pattern
  if (zeroSAM < 15 && dq >= 60) {
    return {
      bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8",
      title: "🔵 Genuine Burden — KBK Pattern",
      headline: `Only ${zeroSAM}% of AWCs report zero malnutrition — a low figure characteristic of the KBK belt where genuine burden is being captured.`,
      points: [
        `Low zero-reporting rate signals AWWs are actually identifying SAM/MAM/UW children`,
        modCtx?.point ?? `NFHS-6 SAM ${nfhs6Sam}% vs PT SAM ${ptSam}% — verify CMAM enrollment and NRC referrals`,
        `DQ ${dq}% — data is acceptable; focus on connecting identified children to services`,
      ],
      suggestedPlan: modCtx?.plan ?? "POSHAN Intensive Support",
      suggestedTo: modCtx?.to ?? `DSWO ${district}`,
    };
  }

  // Pattern 4 — Process Gap: decent DQ, weak service delivery
  if (dq >= 65 && sd < 65) {
    return {
      bg: "#FFFBEB", border: "#FDE68A", color: "#92400E",
      title: "🟡 Process Gap — Service Delivery Below Average",
      headline: `${district}'s data is credible (DQ ${dq}%) but service delivery is weak (SD ${sd}%). Delivery gaps are the primary constraint.`,
      points: [
        `SD score ${sd}% vs state average — input and process indicators lagging`,
        modCtx?.point ?? `Wasting ${w.toFixed(1)}% — outcomes reflect delivery failures, not a data issue`,
        modCtx
          ? `Wasting ${w.toFixed(1)}% — outcomes reflect delivery failures, not a data issue`
          : `Focus: VHSND frequency, home visit coverage for SAM/MAM, SNP adherence`,
      ],
      suggestedPlan: modCtx?.plan ?? "POSHAN Intensive Support",
      suggestedTo: modCtx?.to ?? `CDPO ${district}`,
    };
  }

  // Pattern 5 — Strong Performer
  return {
    bg: "#F0FFF4", border: "#BBF7D0", color: "#166534",
    title: "✅ Strong Performer — Share as Model",
    headline: `${district} shows solid data quality (DQ ${dq}%), acceptable outcomes, and reasonable service delivery.`,
    points: [
      `Wasting ${w.toFixed(1)}% is ${(stateWasting - w).toFixed(1)}pp below state average — relative strength`,
      modCtx?.point ?? `DQ ${dq}%, Measurement Efficiency ${mEff}% — data is credible`,
      `Consider documenting AWC-level practices for peer learning across weaker districts`,
    ],
    suggestedPlan: modCtx?.plan ?? "Document & share as model district",
    suggestedTo: modCtx?.to ?? `DSWO ${district}`,
  };
}

function InfoDot({ text, left }: { text: string; left?: boolean }) {
  return (
    <span className="relative inline-block group align-middle">
      <span className="w-4 h-4 inline-flex items-center justify-center rounded-full border border-gray-400 text-[9px] font-bold text-gray-600 cursor-help">
        i
      </span>
      <span
        className={`pointer-events-none absolute bottom-full mb-2 hidden group-hover:block z-50 w-64 rounded-lg bg-gray-900 text-white text-[11px] leading-relaxed p-3 shadow-xl ${
          left ? "right-0" : "left-1/2 -translate-x-1/2"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

function Sparkline({
  series,
  avg,
  color,
  unit,
  dir,
}: {
  series: number[];
  avg: number;
  color: string;
  unit?: "pct" | "count";
  dir: { label: string; color: string };
}) {
  const W = 200;
  const H = 60;
  const pad = 6;
  const all = [...series, avg];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (series.length - 1);
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);
  const pts = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <div className="mt-1 mb-2 ml-2 inline-block">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Last 6 months</span>
        <span className="text-[10px] font-bold" style={{ color: dir.color }}>
          {dir.label}
        </span>
      </div>
      <svg width={W} height={H} className="block">
        <line
          x1={pad}
          x2={W - pad}
          y1={y(avg)}
          y2={y(avg)}
          stroke="#9CA3AF"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
        <circle cx={x(series.length - 1)} cy={y(series[series.length - 1])} r={3} fill={color} />
      </svg>
      <div className="flex justify-between" style={{ width: W }}>
        {MONTH_LABELS.map((m, i) => (
          <span key={i} className="text-[9px] text-gray-400">
            {m}
          </span>
        ))}
      </div>
      <div className="text-[9px] text-gray-400">
        Latest: {series[series.length - 1]}
        {unit === "count" ? "" : "%"} &nbsp;·&nbsp; state avg (dashed): {avg}
        {unit === "count" ? "" : "%"}
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const color = value < 60 ? "#C62828" : value <= 80 ? "#F59E0B" : "#2E7D32";
  return (
    <div className="flex-1 h-2.5 bg-gray-100 rounded overflow-hidden min-w-[60px]">
      <div className="h-full rounded" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function statusDot(value: number) {
  return value < 60 ? "🔴" : value <= 80 ? "🟡" : "🟢";
}

function ReviewScreen({
  districts,
  index,
  setIndex,
  reviewed,
  setReviewed,
  onEnd,
}: {
  districts: string[];
  index: number;
  setIndex: (i: number) => void;
  reviewed: Reviewed;
  setReviewed: (r: Reviewed) => void;
  onEnd: () => void;
}) {
  const navigate = useNavigate();
  const district = districts[index];
  const entry = reviewed[district];
  const [plan, setPlan] = useState<string>(entry?.plan ?? "");
  const [directedTo, setDirectedTo] = useState<string>(entry?.directedTo ?? `CDPO ${district}`);
  const [note, setNote] = useState<string>(entry?.note ?? "");
  const [module, setModule] = useState<ModuleKey>("poshan");
  const [survey, setSurvey] = useState(false);
  const [trends, setTrends] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);
  const [dqModule, setDqModule] = useState<ModuleKey>("poshan");
  const [openTiers, setOpenTiers] = useState<Record<string, boolean>>({});

  // reset local form when district changes
  const [lastDistrict, setLastDistrict] = useState(district);
  if (lastDistrict !== district) {
    setLastDistrict(district);
    setPlan(reviewed[district]?.plan ?? "");
    setDirectedTo(reviewed[district]?.directedTo ?? `CDPO ${district}`);
    setNote(reviewed[district]?.note ?? "");
  }

  const o = districtOutcomeData[district];
  const meVal = districtProgramData[district]?.poshan_weighed ?? 96;
  const rank =
    [...DISTRICTS].sort(
      (a, b) => districtOutcomeData[a].wasting - districtOutcomeData[b].wasting,
    ).indexOf(district) + 1;

  const blocks = PROGRAM_TIERS[module];
  const surveyRows = PROGRAM_SURVEY[module];
  const moduleDq = module === "poshan" ? dqScore(district) : programDq(module, district);
  const moduleDqBand = dqBand(moduleDq);

  const isTierOpen = (t: string) => openTiers[`${module}:${t}`] !== false;
  const toggleTier = (t: string) =>
    setOpenTiers((s) => ({ ...s, [`${module}:${t}`]: !(s[`${module}:${t}`] !== false) }));

  const save = (skipped: boolean) => {
    setReviewed({
      ...reviewed,
      [district]: {
        plan: skipped ? null : plan || null,
        directedTo: skipped ? "" : directedTo,
        note,
        skipped,
      },
    });
    if (index < districts.length - 1) setIndex(index + 1);
    else onEnd();
  };

  return (
    <div className="space-y-4">
      {/* progress */}
      <div className="bg-white rounded-lg shadow-sm px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold text-gray-800">
            Weekly District Review — {index + 1} of {districts.length}
          </div>
          <button
            onClick={onEnd}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-gray-300 text-gray-700"
          >
            End Review
          </button>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {districts.map((d, i) => {
            const r = reviewed[d];
            const isCurrent = i === index;
            return (
              <div key={d} className="flex items-center gap-1 shrink-0">
                <button onClick={() => setIndex(i)} className="flex flex-col items-center px-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border-2 ${
                      isCurrent ? "text-white" : r ? "text-gray-700 bg-white" : "text-gray-400 bg-white"
                    }`}
                    style={{
                      background: isCurrent ? TEAL : undefined,
                      borderColor: isCurrent ? TEAL : r ? "#4E9A6A" : "#D1D5DB",
                    }}
                  >
                    {r ? (r.skipped ? "○" : "✓") : ""}
                  </span>
                  <span
                    className={`text-[11px] mt-1 ${isCurrent ? "font-bold text-gray-800" : "text-gray-600"}`}
                  >
                    {d}
                  </span>
                </button>
                {i < districts.length - 1 && <span className="text-gray-300">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-4 items-start">
        {/* LEFT */}
        <div className="space-y-3">
          <Card>
            <div className="text-lg font-bold text-gray-800">{district} District</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Ranked {rank}th of 30{" "}
              <InfoDot text="Districts ranked by composite POSHAN 2.0 service delivery score — average of all Input and Process indicators for July 2026." />
              {" "}&nbsp;|&nbsp; Population: ~{population(district)}L
            </div>
            <div className="mt-2">
              <SelectionMap highlighted={[district]} height={120} />
            </div>
          </Card>

          {/* Session Delta — changes since last review */}
          {(() => {
            const seed = district.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
            const wDelta = +(((seed % 10) - 5) * 0.15).toFixed(1);
            const dqDelta = (seed % 13) - 5;
            const meDelta = (seed % 9) - 4;
            const wGood = wDelta < 0;
            const dqGood = dqDelta > 0;
            const meGood = meDelta > 0;
            return (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-gray-800">Since last review (4 Aug 2026)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-semibold">
                    🔵 Illustrative
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] flex-wrap">
                  <span>
                    Wasting{" "}
                    <span style={{ color: wGood ? "#2E7D32" : "#C62828", fontWeight: 700 }}>
                      {wDelta > 0 ? "↑ +" : "↓ "}{Math.abs(wDelta)}pp
                    </span>
                  </span>
                  <span>
                    🔴 Red AWCs{" "}
                    <span style={{ color: dqGood ? "#2E7D32" : "#C62828", fontWeight: 700 }}>
                      {dqDelta > 0 ? "↑ +" : "↓ "}{Math.abs(dqDelta)}pp
                    </span>
                  </span>
                  <span>
                    Meas. Eff.{" "}
                    <span style={{ color: meGood ? "#2E7D32" : "#C62828", fontWeight: 700 }}>
                      {meDelta > 0 ? "↑ +" : "↓ "}{Math.abs(meDelta)}pp
                    </span>
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Data Quality — top of left panel so it contextualises everything below */}
          <Card>
            <div className="text-xs font-bold uppercase text-gray-700 mb-2">
              Data Quality by Programme
            </div>
            <div className="space-y-1.5">
              {MODULES.map((m) => {
                const isPoshan = m.key === "poshan";
                const score = isPoshan ? dqScore(district) : programDq(m.key, district);
                // For POSHAN: score = % Red AWCs (higher = worse). For others: DQ score (higher = better).
                const band = isPoshan
                  ? (score <= 10 ? { bg: "#E8F5E9", color: "#2E7D32", dot: "🟢" }
                     : score <= 25 ? { bg: "#FEF9C3", color: "#D97706", dot: "🟡" }
                     : { bg: "#FFEBEE", color: "#C62828", dot: "🔴" })
                  : dqBand(score);
                const meta = PROGRAM_DQ_META[m.key];
                const ok = isPoshan ? score <= 10 : score >= 80;
                return (
                  <div
                    key={m.key}
                    className="flex items-center gap-2 text-[11px] rounded px-2 py-1.5"
                    style={{ background: band.bg }}
                  >
                    <span className="flex-1 font-semibold text-gray-700">{meta.label}</span>
                    <span className="font-bold" style={{ color: band.color }}>
                      {score}%{isPoshan ? " Red" : ""}
                    </span>
                    <span>{band.dot}</span>
                    <span className="w-20 text-right text-gray-600">
                      {ok ? "✓ OK" : `⚠ ${meta.issue}`}
                    </span>
                  </div>
                );
              })}
            </div>
            {(() => {
              const dqd = districtDQData[district];
              if (!dqd) return null;
              return (
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-600 bg-gray-50 rounded px-2 py-1.5">
                  <span>AWCs: <b className="text-gray-800">{dqd.awcs.toLocaleString()}</b></span>
                  <span>Copy-paste: <b style={{ color: dqd.copy_pct > 50 ? "#C62828" : "#2E7D32" }}>{dqd.copy_pct.toFixed(1)}%</b></span>
                  <span>Mech. increment: <b style={{ color: dqd.mech_inc_pct > 50 ? "#C62828" : "#2E7D32" }}>{dqd.mech_inc_pct.toFixed(1)}%</b></span>
                  <span>Borderline zone: <b style={{ color: dqd.borderline_pct > 70 ? "#C62828" : "#6B7280" }}>{dqd.borderline_pct.toFixed(1)}%</b></span>
                </div>
              );
            })()}
            <button
              onClick={() => {
                setDqModule(module);
                setDqOpen(true);
              }}
              className="mt-2 text-xs font-semibold text-gray-800 underline"
            >
              View Full DQ Details →
            </button>
          </Card>

          {/* SAM Care Cascade — real estimates + illustrative pipeline */}
          <SamPipelineFunnel district={district} />

          {/* Outcome / module-indicator cards — updates with active module tab */}
          {module === "poshan" ? (
            // POSHAN tab: real PT outcome cards
            ([
              { key: "p_o_wast",  name: "Wasting (U5)",    field: "wasting"  as const, target: 3.0 },
              { key: "p_o_stunt", name: "Stunting (U6)",   field: "stunting" as const, target: null },
              { key: "p_o_sam",   name: "SAM prevalence",  field: "sam"      as const, target: null },
              { key: "p_o_uw",    name: "Underweight (U5)",field: "uw"       as const, target: null },
            ] as const).map((ind) => {
              const val = +(ptDistrictTrend[district]?.["Jul"]?.[ind.field] ?? 0).toFixed(1);
              const avg = +ptOutcomeStateAvg(ind.field).toFixed(1);
              const delta = +(val - avg).toFixed(1);
              const worse = delta > 0;
              const trend6 = ptOutcomeTrend(district, ind.field);
              const trendDir = trend6.length >= 2 ? trend6[trend6.length - 1] - trend6[0] : 0;
              const dq = dqScore(district);
              return (
                <div key={ind.key} className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-600 leading-tight">{ind.name}</span>
                    <span className="text-2xl font-extrabold" style={{ color: worse ? "#C62828" : "#2E7D32" }}>{val}%</span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 flex justify-between">
                    <span>State avg: {avg}%</span>
                    <span style={{ color: worse ? "#C62828" : "#2E7D32" }}>
                      {delta > 0 ? "↑ +" : "↓ "}{Math.abs(delta)}pp {worse ? "above" : "below"} avg
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    6-month trend:{" "}
                    <span style={{ color: trendDir > 0.3 ? "#C62828" : trendDir < -0.3 ? "#2E7D32" : "#6B7280" }}>
                      {trendDir > 0.3 ? "↑ worsening" : trendDir < -0.3 ? "↓ improving" : "→ stable"}{" "}
                      ({trendDir > 0 ? "+" : ""}{trendDir.toFixed(1)}pp Feb→Jul)
                    </span>
                  </div>
                  {ind.target !== null && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      FY26-27 target: {ind.target}% ·{" "}
                      <span style={{ color: val <= ind.target ? "#2E7D32" : "#C62828" }}>
                        {val <= ind.target ? "✓ on target" : `${(val - ind.target).toFixed(1)}pp above target`}
                      </span>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-0.5">POSHAN Tracker · Jul 2026</div>
                  {ind.field === "wasting" && dq < 65 && (
                    <div className="text-[10px] bg-red-50 border border-red-100 text-[#B91C1C] rounded px-1.5 py-0.5 mt-1 font-semibold">
                      ⚠ DQ {dq}% — treat this figure with caution
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Non-POSHAN tab: show module-specific indicator cards (up to 4)
            MODULE_INDICATORS[module].slice(0, 4)
              .map((ind) => {
                const val = districtProgramData[district]?.[ind.key] ?? 0;
                const stateVals = DISTRICTS.map((d) => districtProgramData[d]?.[ind.key] ?? 0);
                const avg = Math.round(stateVals.reduce((a, b) => a + b, 0) / stateVals.length);
                const delta = +(val - avg).toFixed(0);
                const good = delta > 0;
                return (
                  <div key={ind.key} className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-gray-600 leading-tight">{ind.name}</span>
                      <span className="text-2xl font-extrabold shrink-0" style={{ color: good ? "#2E7D32" : "#C62828" }}>{val}%</span>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1 flex justify-between">
                      <span>State avg: {avg}%</span>
                      <span style={{ color: good ? "#2E7D32" : "#C62828" }}>
                        {delta > 0 ? "↑ +" : "↓ "}{Math.abs(delta)}pp {good ? "above" : "below"} avg
                      </span>
                    </div>
                    {ind.tier && (
                      <div className="text-[10px] text-gray-400 mt-0.5 capitalize">{ind.tier} indicator</div>
                    )}
                    <div className="text-[10px] text-blue-500 mt-0.5">🔵 Illustrative</div>
                  </div>
                );
              })
          )}

          <div className="bg-gray-100 rounded-lg p-3 text-[11px] italic text-gray-600">
            Last reviewed: 12 Jul 2026
            <br />
            Note: “AWW vacancy issue flagged — follow up with DSWO”
            <br />
            Action taken: Plan assigned to CDPO {district}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex gap-1 flex-wrap">
                {MODULES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModule(m.key)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold ${
                      module === m.key ? "text-white" : "bg-gray-100 text-gray-600"
                    }`}
                    style={module === m.key ? { background: TEAL } : undefined}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setDqModule(module);
                  setDqOpen(true);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{
                  background: moduleDqBand.bg,
                  borderColor: moduleDqBand.border,
                  color: moduleDqBand.color,
                }}
              >
                {MODULES.find((m) => m.key === module)?.label.split(" ")[0]} DQ: {moduleDq}%{" "}
                {moduleDqBand.dot} ({PROGRAM_DQ_META[module].portal})
              </button>
              <InfoDot text={DQ_METHODOLOGY} left />
            </div>

            <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
              <span className="text-gray-500 font-semibold">Data source:</span>
              <button
                onClick={() => setSurvey(false)}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  !survey ? "text-white" : "bg-gray-100 text-gray-600"
                }`}
                style={!survey ? { background: TEAL } : undefined}
              >
                ● Admin Data (PT)
              </button>
              <button
                onClick={() => setSurvey(true)}
                className={`px-3 py-1.5 rounded text-xs font-semibold ${
                  survey ? "text-white" : "bg-gray-100 text-gray-600"
                }`}
                style={survey ? { background: TEAL } : undefined}
              >
                ○ Phone Survey (HFM)
              </button>
              <button
                onClick={() => setTrends((t) => !t)}
                className={`ml-auto px-3 py-1.5 rounded text-xs font-semibold border ${
                  trends ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-300"
                }`}
                style={trends ? { background: "#4f46e5" } : undefined}
              >
                📈 Trends
              </button>
            </div>

            {trends && (
              <div className="text-[10px] text-gray-500 bg-gray-50 rounded px-3 py-1.5 flex gap-4">
                <span>Trend direction over 6 months (Feb–Jul 2026):</span>
                <span className="text-[#2E7D32] font-semibold">↑ Improving = ≥1.5pp better</span>
                <span className="text-[#C62828] font-semibold">↓ Worsening = ≥1.5pp worse</span>
                <span className="text-gray-500 font-semibold">→ Stable = &lt;1.5pp change</span>
              </div>
            )}

            <div className="space-y-3">
              {blocks.map((block) => {
                const open = isTierOpen(block.tier);
                const label =
                  TIER_META.find((t) => t.key === block.tier)?.label.toUpperCase() ?? block.tier;
                return (
                  <div key={block.tier} className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => toggleTier(block.tier)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-800"
                    >
                      <span>{open ? "▼" : "▶"}</span> {label}
                    </button>
                    {open && (
                      <>
                        <div className="mt-2 space-y-1.5">
                          {block.indicators.map((ind) => {
                            const val = indicatorValue(ind, district);
                            const avg = indicatorStateAvg(ind);
                            const delta = +(val - avg).toFixed(1);
                            const good = ind.inverse ? delta < 0 : delta > 0;
                            const isCount = ind.unit === "count";
                            const dotVal = ind.inverse ? (val > avg ? 40 : 90) : val;
                            return (
                              <div
                                key={ind.key}
                                className="flex items-center gap-2 text-xs flex-wrap"
                              >
                                <span className="w-52 shrink-0 text-gray-700 flex items-center gap-1">
                                  {ind.name}
                                  {ind.note && (
                                    <span className="text-gray-400"> ({ind.note})</span>
                                  )}
                                  {ind.definition && <InfoDot text={ind.definition} />}
                                </span>
                                {block.tier !== "outcome" && !isCount && <Bar value={val} />}
                                <span className="w-12 text-right font-bold text-gray-800">
                                  {val}
                                  {isCount ? "" : "%"}
                                </span>
                                <span>
                                  {isCount
                                    ? val >= (ind.target ?? 0)
                                      ? "🟢"
                                      : "🔴"
                                    : statusDot(dotVal)}
                                </span>
                                {isCount ? (
                                  <span className="text-gray-500">
                                    target: {ind.target}
                                  </span>
                                ) : (
                                  <span
                                    className="w-36 text-right font-semibold"
                                    style={{ color: good ? "#2E7D32" : "#C62828" }}
                                  >
                                    {delta > 0 ? "↑ +" : "▼ "}
                                    {Math.abs(delta)}pp vs state ({avg}
                                    {"%"})
                                  </span>
                                )}
                                {trends && (
                                  <div className="w-full">
                                    <Sparkline
                                      series={indicatorTrend(ind, district)}
                                      avg={avg}
                                      unit={ind.unit}
                                      color={
                                        isCount
                                          ? val >= (ind.target ?? 0)
                                            ? "#2E7D32"
                                            : "#C62828"
                                          : dotVal < 60
                                            ? "#C62828"
                                            : dotVal <= 80
                                              ? "#F59E0B"
                                              : "#2E7D32"
                                      }
                                      dir={trendDirection(
                                        indicatorTrend(ind, district),
                                        ind.inverse,
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {survey && block.tier === "input" && surveyRows.length > 0 && (
                          <div className="mt-3 rounded-lg bg-gray-50 p-3">
                            <div className="text-[11px] font-bold text-gray-700 mb-2">
                              Phone Survey (beneficiary uptake)
                            </div>
                            <div className="space-y-2">
                              {surveyRows.map((row) => {
                                const v = surveyValues(row, district);
                                return (
                                  <div key={row.key} className="text-[11px]">
                                    <div className="font-semibold text-gray-700">{row.name}</div>
                                    {v.pt !== null && (
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="w-28 text-gray-500">Admin (PT):</span>
                                        <Bar value={v.pt} />
                                        <span className="w-10 text-right font-bold">{v.pt}%</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="w-28 text-gray-500">Survey (uptake):</span>
                                      <Bar value={v.survey} />
                                      <span className="w-10 text-right font-bold">
                                        {v.survey}%
                                      </span>
                                      {v.gap !== null && (
                                        <span className="font-bold text-[#C62828]">
                                          Gap: {v.gap}pp 🔴
                                        </span>
                                      )}
                                    </div>
                                    {row.quote && (
                                      <div className="text-[10px] italic text-gray-500 mt-0.5">
                                        “{row.quote}”
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2">
                              Source: WCD Phone Survey, Q2 2025. Gap = delivery-to-receipt leakage.
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] italic text-gray-400 mt-2">
                          Source: {block.source}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {(() => {
            const pat = getPattern(district, module);
            return (
              <div
                className="rounded-lg border p-4"
                style={{ background: pat.bg, borderColor: pat.border }}
              >
                <div
                  className="text-sm font-bold mb-1.5 flex items-center gap-1.5"
                  style={{ color: pat.color }}
                >
                  <Lightbulb size={15} style={{ color: pat.color }} />
                  {pat.title}
                </div>
                <p className="text-xs text-gray-800 leading-relaxed mb-2">{pat.headline}</p>
                <ul className="space-y-1.5 mb-3">
                  {pat.points.map((p, i) => (
                    <li key={i} className="text-xs text-gray-700 leading-relaxed flex gap-1.5">
                      <span style={{ color: pat.color }}>•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-2.5 flex items-center justify-between gap-2 flex-wrap"
                  style={{ borderColor: pat.border }}>
                  <p className="text-xs text-gray-800 font-semibold">
                    Suggested: {pat.suggestedPlan} → {pat.suggestedTo}
                  </p>
                  <button
                    onClick={() => { setPlan(pat.suggestedPlan); setDirectedTo(pat.suggestedTo); }}
                    className="px-3 py-1.5 rounded text-[11px] font-semibold text-white shrink-0"
                    style={{ background: pat.color }}
                  >
                    Use this suggestion
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Deep Dive navigation shortcut */}
          <button
            onClick={() => navigate({ to: "/deep-dive", search: { district } })}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <span>Investigate indicators in Deep Dive</span>
            <span className="text-sm">→</span>
          </button>

          <Card>
            <div className="text-sm font-bold text-gray-800 mb-3">
              Secretary&apos;s Decision — {district}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-600 w-20">Plan:</span>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 text-xs bg-white"
              >
                <option value="">Assign Improvement Plan…</option>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 pl-20">
              {PLAN_OPTIONS.map((p) => (
                <span key={p.name} className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                  {p.name} <InfoDot text={p.detail} />
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-600 w-20">Direct to:</span>
              <select
                value={directedTo}
                onChange={(e) => setDirectedTo(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 text-xs bg-white"
              >
                {directedToOptions(district).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Verbal instruction / minutes note
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Recorded into session minutes…"
              className="w-full px-3 py-2 rounded border border-gray-300 text-xs mb-3"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => save(true)}
                className="px-4 py-2 rounded text-xs font-semibold border border-gray-300 text-gray-700"
              >
                Skip district
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const pat = getPattern(district, module);
                    const dq = module === "poshan" ? dqScore(district) : programDq(module, district);
                    const text = [
                      `DISTRICT REVIEW — ${district} | ${MODULES.find(m => m.key === module)?.label ?? module.toUpperCase()} | ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
                      ``,
                      `ASSESSMENT: ${pat.title}`,
                      `${pat.headline}`,
                      ``,
                      `KEY POINTS:`,
                      ...pat.points.map((p) => `• ${p}`),
                      ``,
                      `RED AWCs: ${dq}%`,
                      ``,
                      `DECISION:`,
                      `Plan: ${plan || "(not set)"}`,
                      `Directed to: ${directedTo}`,
                      `Note: ${note || "(none)"}`,
                    ].join("\n");
                    navigator.clipboard.writeText(text).then(
                      () => toast.success("Copied to clipboard"),
                      () => toast.error("Clipboard copy failed")
                    );
                  }}
                  className="px-3 py-2 rounded text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  📋 Copy as text
                </button>
                <button
                  onClick={() => {
                    if (!plan) {
                      toast.error("Select an improvement plan or skip this district");
                      return;
                    }
                    toast.success(`${plan} recorded for ${district} → ${directedTo}`);
                    save(false);
                  }}
                  className="px-4 py-2 rounded text-xs font-bold text-white"
                  style={{ background: TEAL }}
                >
                  {index < districts.length - 1
                    ? "Save to Minutes & Continue →"
                    : "Save to Minutes & Finish →"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {dqOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDqOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">
                Data Quality — {district} (11 checks)
              </h3>
              <button onClick={() => setDqOpen(false)} className="text-gray-500 text-sm">
                ✕
              </button>
            </div>
            <div className="flex gap-1 flex-wrap mb-3">
              {MODULES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setDqModule(m.key)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold ${
                    dqModule === m.key ? "text-white" : "bg-gray-100 text-gray-600"
                  }`}
                  style={dqModule === m.key ? { background: TEAL } : undefined}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-600 mb-3">
              Portal: {PROGRAM_DQ_META[dqModule].portal} &nbsp;|&nbsp; DQ (Red AWCs for POSHAN):{" "}
              <span
                className="font-bold"
                style={{ color: dqBand(programDq(dqModule, district)).color }}
              >
                {programDq(dqModule, district)}%
              </span>{" "}
              {dqBand(programDq(dqModule, district)).dot}
            </div>
            {(() => {
              const bd = dqBreakdown(dqModule, district);
              return (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="text-left py-1.5">Check</th>
                      <th className="text-left py-1.5">Severity</th>
                      <th className="text-right py-1.5">AWCs flagged</th>
                      <th className="text-right py-1.5">Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bd.rows.map((c) => {
                      const sev = c.weight === 3 ? "high" : c.weight === 2 ? "medium" : "low";
                      return (
                        <tr key={c.name} className="border-b border-gray-100">
                          <td className="py-1.5 font-semibold text-gray-800">{c.name}</td>
                          <td className="py-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                                sev === "high" ? "bg-[#C62828]" : sev === "medium" ? "bg-[#F59E0B]" : "bg-gray-400"
                              }`}
                            >
                              {sev}
                            </span>
                          </td>
                          <td className="py-1.5 text-right font-semibold">{c.flagged}%</td>
                          <td className="py-1.5 text-right text-gray-600">{c.penalty > 0 ? `-${c.penalty.toFixed(1)}pp` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={3} className="py-2 font-bold text-gray-700">DQ Total</td>
                      <td className="py-2 text-right font-bold" style={{ color: dqBand(bd.score).color }}>{bd.score}%</td>
                    </tr>
                  </tfoot>
                </table>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}


/* ----------------------------- screen 3 ----------------------------- */

function SummaryScreen({
  districts,
  reviewed,
  onAgain,
}: {
  districts: string[];
  reviewed: Reviewed;
  onAgain: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const assigned = districts.filter((d) => reviewed[d] && !reviewed[d].skipped && reviewed[d].plan);
  const skipped = districts.filter((d) => reviewed[d]?.skipped || !reviewed[d]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm px-5 py-3">
        <h2 className="text-lg font-bold text-gray-800">Review Complete — Week of 4 Aug 2026</h2>
        <div className="text-sm text-gray-600 mt-1">
          {districts.length} districts reviewed &nbsp;|&nbsp; {assigned.length} plans assigned
          &nbsp;|&nbsp; {skipped.length} skipped
        </div>
      </div>

      <Card>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200">
              <th className="text-left py-2">District</th>
              <th className="text-right py-2">Wasting</th>
              <th className="text-right py-2">SD Score</th>
              <th className="text-right py-2">DQ</th>
              <th className="text-left py-2 pl-4">Plan Assigned</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d) => {
              const r = reviewed[d];
              const w = ptWasting(d);
              const sd = sdScore(d);
              const dq = dqScore(d);
              return (
                <tr key={d} className="border-b border-gray-100">
                  <td className="py-2 font-semibold text-gray-800">{d}</td>
                  <td className="py-2 text-right">
                    {w.toFixed(1)}%{" "}
                    <span style={{ color: dotFor(w) }}>●</span>
                  </td>
                  <td className="py-2 text-right">
                    {sd}% <span style={{ color: sd < 60 ? "#C62828" : sd <= 80 ? "#F59E0B" : "#2E7D32" }}>●</span>
                  </td>
                  <td className="py-2 text-right">
                    {dq}% {dq < 60 ? "⚠" : ""}
                  </td>
                  <td className="py-2 pl-4">
                    {r && !r.skipped && r.plan ? (
                      <span className="font-semibold text-[#4f46e5]">{r.plan}</span>
                    ) : (
                      <span className="text-gray-500">Skipped</span>
                    )}
                  </td>
                  <td className="py-2 text-gray-600">{r?.note ? `“${r.note}”` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="text-sm font-bold text-gray-800 mb-3">Session Minutes — Week of 4 Aug 2026</div>
        <div className="space-y-2">
          {districts.filter((d) => reviewed[d] && !reviewed[d].skipped).map((d) => {
            const r = reviewed[d];
            return (
              <div key={d} className="border-l-4 border-[#4f46e5] pl-3 py-1">
                <div className="text-xs font-bold text-gray-800">{d}</div>
                <div className="text-xs text-gray-600">
                  Plan: <span className="font-semibold text-[#4f46e5]">{r.plan}</span>
                  {r.directedTo && <> &nbsp;→&nbsp; <span className="font-semibold">{r.directedTo}</span></>}
                </div>
                {r.note && (
                  <div className="text-xs italic text-gray-500 mt-0.5">"{r.note}"</div>
                )}
              </div>
            );
          })}
          {districts.filter((d) => reviewed[d]?.skipped || !reviewed[d]).length > 0 && (
            <div className="text-xs text-gray-400 italic pt-1 border-t border-gray-100">
              Skipped: {districts.filter((d) => reviewed[d]?.skipped || !reviewed[d]).join(", ")}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-gray-800 mb-2">Reviewed districts</div>
        <SelectionMap
          highlighted={districts}
          outlined={assigned}
          fillFor={(d) => dotFor(ptWasting(d))}
          height={280}
        />
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={onAgain}
          className="px-4 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-700 bg-white"
        >
          ← Review Again
        </button>
        <button
          onClick={() => toast.success("Full minutes exported as PDF")}
          className="px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ background: "#4f46e5" }}
        >
          Export Full Minutes as PDF ↓
        </button>
        <button
          onClick={() => setConfirm(true)}
          className="px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ background: TEAL }}
        >
          Send to District Officers ✉
        </button>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
            <h3 className="font-bold text-gray-800 mb-2">Send summary</h3>
            <p className="text-sm text-gray-700">
              Summary will be shared with CDPOs of all {districts.length} reviewed districts.
              Confirm?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirm(false)}
                className="px-4 py-2 rounded text-xs font-semibold border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirm(false);
                  toast.success("Summary sent to district officers");
                }}
                className="px-4 py-2 rounded text-xs font-bold text-white"
                style={{ background: TEAL }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
