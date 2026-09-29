import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useDss } from "@/lib/dss-context";
import {
  MODULE_INDICATORS,
  OUTCOMES,
  PT_OUTCOMES,
  NFHS6_OUTCOMES,
  COLOR_HEX,
  colorForCoverage,
  colorForOutcome,
  districtOutcomeData,
  districtProgramData,
  DISTRICTS,
  rankDistricts,
  stateOutcomes,
  PT_INDICATORS,
  PHONE_SURVEY_ROWS,
  MEASUREMENT_EFFICIENCY_TOOLTIP,
  ptStateTrend,
  ptDistrictTrend,
  PT_MONTHS,
  districtNFHS6Data,
  districtDQData,
  districtDQScoreDist,
  districtRYG,
  STATE_RYG,
  type OutcomeKey,
  type PTOutcomeKey,
  type PTMonth,
} from "@/lib/dss-data";
import { Card, ViewToggle, AssignPlanButton } from "@/components/dss/ui";
import { OdishaMap } from "@/components/dss/OdishaMap";
import { DssShell, DownloadButton } from "@/components/dss/Shell";
import { ArrowDown, ArrowUp, AlertTriangle, CheckCircle2, X, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Outcomes Overview — WCD Insights | Govt of Odisha" },
      {
        name: "description",
        content:
          "Decision Support System for the Secretary, WCD, Government of Odisha. Outcomes-first view of wasting, stunting and underweight across 30 districts.",
      },
    ],
  }),
  component: () => (
    <DssShell>
      <Overview />
    </DssShell>
  ),
});

type MapMode = "pt" | "nfhs6" | "compare";

function Overview() {
  const {
    module, dataMode,
    mapLayer, mapKey, setMapLayer,
    selectedOutcome, setSelectedOutcome,
    selectedIndicatorKey, setSelectedIndicatorKey,
  } = useDss();

  const indicators = MODULE_INDICATORS[module];
  const [rightView, setRightView] = useState<"Map View" | "Table View">("Map View");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<PTMonth>("Jul");
  const [mapMode, setMapMode] = useState<MapMode>("pt");
  const navigate = useNavigate();

  // State-level outcomes for the selected month
  const monthPT = ptStateTrend[selectedMonth];
  const prevMonth = PT_MONTHS[PT_MONTHS.indexOf(selectedMonth) - 1];
  const prevPT = prevMonth ? ptStateTrend[prevMonth] : null;

  const layerLabel =
    mapLayer === "outcome"
      ? OUTCOMES.find((o) => o.key === mapKey)?.label ?? mapKey
      : MODULE_INDICATORS[module].find((i) => i.key === mapKey)?.name ?? mapKey;

  return (
    <div className="space-y-4">
      {/* OUTCOME CARDS — PT (left, primary) + NFHS-6 (right, benchmark) */}
      <div className="grid grid-cols-2 gap-4">
        {/* PT Admin Data */}
        {/* <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-4"> */}
        <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            {/* <span className="text-xs font-bold text-primary uppercase tracking-wide">Poshan Tracker · {selectedMonth} 2026</span> */}
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Poshan Tracker · Feb to July 2026</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Month:</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value as PTMonth)}
                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white">
                {PT_MONTHS.map((m) => <option key={m} value={m}>{m} 2026</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { k: "wasting",     label: "Wasting (U5)",    val: monthPT.wasting  },
              { k: "stunting",    label: "Stunting (U6)",    val: monthPT.stunting },
              { k: "sam",         label: "SAM prevalence",   val: monthPT.sam      },
              { k: "underweight", label: "Underweight (U5)", val: monthPT.uw       },
            ] as const).map(({ k, label, val }) => {
              const prev = prevPT
                ? k === "wasting" ? prevPT.wasting
                  : k === "stunting" ? prevPT.stunting
                  : k === "sam" ? prevPT.sam
                  : prevPT.uw
                : null;
              const delta = prev !== null ? +(val - prev).toFixed(1) : null;
              const dirColor = delta === null ? "#6B7280" : delta > 0.05 ? "#C62828" : delta < -0.05 ? "#2E7D32" : "#6B7280";
              const isSelectable = true;
              const isSelected = selectedOutcome === k;
              return (
                <button
                  key={k}
                  onClick={() => isSelectable && setSelectedOutcome(k as PTOutcomeKey)}
                  className={`text-left rounded-md p-3 transition border-2 ${
                    isSelected
                      ? "bg-primary border-primary"
                      : isSelectable
                      ? "bg-primary/5 border-transparent hover:border-primary/40 cursor-pointer"
                      : "bg-primary/5 border-transparent cursor-default"
                  }`}
                >
                  <div className={`text-2xl font-extrabold ${isSelected ? "text-white" : "text-primary"}`}>{val.toFixed(1)}%</div>
                  <div className={`text-xs font-semibold mt-0.5 ${isSelected ? "text-white/90" : "text-gray-700"}`}>{label}</div>
                  {/* {delta !== null && (
                    <div className={`text-[10px] mt-1 font-semibold ${isSelected ? "text-white/80" : ""}`}
                      style={isSelected ? undefined : { color: dirColor }}>
                      {delta > 0.05 ? "↑" : delta < -0.05 ? "↓" : "→"} {delta > 0 ? "+" : ""}{delta}pp vs {prevMonth}
                    </div>
                  )} */}
                  <div className={`text-[10px] mt-1 font-semibold min-h-[15px] ${isSelected ? "text-white/80" : ""}`}
                    style={isSelected ? undefined : { color: dirColor }}>
                    {delta !== null ? (
                      <>{delta > 0.05 ? "↑" : delta < -0.05 ? "↓" : "→"} {delta > 0 ? "+" : ""}{delta}pp vs {prevMonth}</>
                    ) : (
                      <>&nbsp;</>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* <p className="text-[10px] italic text-gray-500 mt-2">
            Reflects measured children only. N = {monthPT.n.toLocaleString()} · Source: POSHAN Tracker
          </p> */}
          {/* <p className="text-[10px] italic text-gray-500 mt-2">
            Reflects measured children only. N = {monthPT.n.toLocaleString('en-IN')} · Source: POSHAN Tracker
          </p> */}
          <p className="text-[10px] italic text-gray-500 mt-auto pt-2">
            Reflects measured children only. N = {monthPT.n.toLocaleString('en-IN')} · Source: POSHAN Tracker
          </p>
        </div>

        {/* NFHS-6 Survey Benchmark */}
        {/* <div className="rounded-lg bg-[#FFF8E1] border border-amber-100 shadow-sm p-4"> */}
        <div className="rounded-lg bg-[#FFF8E1] border border-amber-100 shadow-sm p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">NFHS-6 · 2023–24</span>
            <span className="text-[10px] text-gray-500 italic">Survey benchmark</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["wasting","stunting","underweight","sam"] as const).map((k) => {
              const o = NFHS6_OUTCOMES[k];
              const labels: Record<string,string> = { wasting:"Wasting", stunting:"Stunting", underweight:"Underweight", sam:"SAM (WHZ<−3)" };
              const isSam = k === "sam";
              // SAM uses different color scale (lower numbers): <3 green, 3–7 amber, >7 red
              const sev = isSam
                ? (o.val < 3 ? "green" : o.val <= 7 ? "amber" : "red")
                : colorForOutcome(o.val) as "green" | "amber" | "red";
              const sevColor = COLOR_HEX[sev];
              const trendColor = o.trend === "worse" ? "#C62828" : "#2E7D32";
              return (
                <button
                  key={k}
                  onClick={() => setSelectedOutcome(k as PTOutcomeKey)}
                  className={`text-left rounded-md p-3 bg-white/70 border-2 transition ${
                    selectedOutcome === k ? "border-primary" : "border-transparent hover:border-amber-200"
                  }`}
                >
                  <div className="text-2xl font-extrabold" style={{ color: sevColor }}>{o.val}%</div>
                  <div className="text-xs font-semibold text-gray-700 mt-0.5">{labels[k]}</div>
                  <div className="text-[10px] mt-1 font-semibold" style={{ color: trendColor }}>
                    {o.trend === "worse" ? "↑ worse" : "↓ improved"} vs NFHS-5
                  </div>
                  {isSam
                    ? <div className="text-[10px] text-amber-700 italic">Survey only; PT uses MUAC+oedema</div>
                    : <div className="text-[10px] text-gray-500">baseline: {o.baseline}%</div>
                  }
                </button>
              );
            })}
          </div>
          {/* <p className="text-[10px] italic text-gray-500 mt-2">
            Population survey — true prevalence estimate. Next survey ~2028–29.
          </p> */}
          {/* <p className="text-[10px] italic text-gray-500 mt-auto pt-2">
            Population survey — true prevalence estimate. Next survey ~2028–29.
          </p> */}
          <p className="text-[10px] italic text-gray-500 mt-auto pt-2">
            Population survey — true prevalence estimate.
          </p>
        </div>
      </div>

      {false && (
        <>
      {/* hidden — keep grid cols=3 for old code that references OUTCOMES map */}
      <div className="hidden">
        {OUTCOMES.map((o) => {
          const active = selectedOutcome === o.key;
          const sev = colorForOutcome(o.current) as "green" | "amber" | "red";
          const sevColor = COLOR_HEX[sev];
          return (
            <button
              key={o.key}
              onClick={() => setSelectedOutcome(o.key)}
              className={`text-left rounded-lg p-4 bg-[#FFF8E1] shadow-sm transition border-2 ${
                active ? "border-[#f97316]" : "border-transparent hover:border-amber-200"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold" style={{ color: sevColor }}>
                  {o.current}%
                </span>
                <span className="flex items-center text-xs font-semibold text-[#2E7D32]">
                  {o.delta < 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                  {Math.abs(o.delta)} pp vs NFHS-5
                </span>
              </div>
              <div className="mt-1 text-sm font-bold text-gray-800">{o.label}</div>
              <div className="text-[11px] text-gray-600">
                NFHS-5 baseline: {o.baseline}%
              </div>
              <div className="mt-2 inline-block bg-[#f97316] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Source: {o.source}
              </div>
            </button>
          );
        })}
      </div>

      {/* DECISION ALERT STRIP */}
      <div className="bg-[#FFFDE7] rounded-md border border-amber-100 px-3 py-2 flex flex-wrap items-center gap-2">
        <AlertChip
          tone="red"
          icon={<AlertTriangle size={14} />}
          text="8 KBK-belt districts: PT wasting >5% — above state avg 3.8% · July 2026"
          onView={() => {
            setSelectedOutcome("wasting");
            setRightView("Map View");
            navigate({ to: "/secretary" });
          }}
        />
        <AlertChip
          tone="amber"
          icon={<AlertTriangle size={14} />}
          text="SAM referral <20% in 6 districts — NRC pipeline underutilised"
          onView={() => {
            setSelectedIndicatorKey("poshan_sam_ref");
            navigate({ to: "/deep-dive", search: { district: undefined } });
          }}
        />
        <AlertChip
          tone="green"
          icon={<CheckCircle2 size={14} />}
          text="Khordha, Cuttack, Jharsuguda: measurement efficiency >95% — strong data foundation"
          onView={() => {
            setSelectedIndicatorKey("poshan_weighed");
            navigate({ to: "/deep-dive", search: { district: undefined } });
          }}
        />
      </div>

      {/* MAIN 2-COL */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: DQ Summary Sidebar */}
        <DQSidebar selectedDistrict={selectedDistrict} />

        {/* Right: map / table */}
        <Card className="lg:col-span-3">
          {selectedDistrict && (
            <div className="mb-3 flex items-center justify-between bg-[#EDE7F6] border border-[#f97316]/30 rounded-md px-3 py-2">
              <div className="text-sm">
                Viewing: <b className="text-[#f97316]">{selectedDistrict}</b> — 6-month trend
              </div>
              <button onClick={() => setSelectedDistrict(null)}
                className="text-xs font-semibold text-[#f97316] hover:underline flex items-center gap-1">
                <X size={14} /> Show all districts
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ViewToggle options={["Table View", "Map View"]} value={rightView}
                onChange={(v) => setRightView(v as typeof rightView)} />
              {rightView === "Map View" && !selectedDistrict && (
                <div className="flex gap-1">
                  {(["pt","nfhs6","compare"] as MapMode[]).map((m) => {
                      return (
                      <button key={m}
                        onClick={() => setMapMode(m)}
                        className={`text-[10px] px-2 py-1 rounded font-semibold border transition ${
                          mapMode === m
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-300 hover:border-primary"
                        }`}>
                        {m === "pt" ? "PT Data" : m === "nfhs6" ? "NFHS-6" : "Compare"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <DownloadButton />
          </div>

          {rightView === "Map View" ? (
            selectedDistrict ? (
              /* District selected → 6-month trend */
              <DistrictTrendChart district={selectedDistrict!} outcome={selectedOutcome} selectedMonth={selectedMonth} />
            ) : mapMode === "nfhs6" ? (
              <div className="h-[420px] relative">
                <OdishaMap layer="outcome" layerKey={selectedOutcome}
                  layerLabel={`NFHS-6 ${selectedOutcome}`}
                  getDistrictValue={(d) => districtNFHS6Data[d]?.[selectedOutcome] ?? null}
                  getDistrictColor={(v) => {
                    if (v === null) return "amber";
                    if (selectedOutcome === "sam") return v < 3 ? "green" : v <= 7 ? "amber" : "red";
                    return colorForOutcome(v) as "green" | "amber" | "red";
                  }}
                  legendItems={selectedOutcome === "sam"
                    ? [
                        { color: COLOR_HEX.green, label: "<3% (Low)" },
                        { color: COLOR_HEX.amber, label: "3–7% (Moderate)" },
                        { color: COLOR_HEX.red, label: ">7% (High)" },
                      ]
                    : [
                        { color: COLOR_HEX.green, label: "<20% (Low)" },
                        { color: COLOR_HEX.amber, label: "20–35% (Moderate)" },
                        { color: COLOR_HEX.red, label: ">35% (High)" },
                      ]
                  }
                  onDistrictClick={setSelectedDistrict} />
                <div className="text-[10px] text-gray-500 italic mt-1">
                  Source: NFHS-6 (2023-24){selectedOutcome === "sam" ? " · SAM = WHZ < −3 only (no MUAC/oedema criteria)" : ""}
                </div>
              </div>
            ) : mapMode === "compare" ? (
              <div className="h-[420px] relative">
                <OdishaMap layer="outcome" layerKey={selectedOutcome}
                  layerLabel={`Discrepancy (NFHS-6 − PT) · ${selectedOutcome}`}
                  getDistrictValue={(d) => {
                    const nfhs = districtNFHS6Data[d]?.[selectedOutcome] ?? null;
                    const pt = ptVal(d, selectedMonth, selectedOutcome);
                    return nfhs !== null && pt !== null ? +(nfhs - pt).toFixed(1) : null;
                  }}
                  getDistrictColor={(v) => v === null ? "amber" : v > 15 ? "red" : v > 5 ? "amber" : "green"}
                  legendItems={[
                    { color: COLOR_HEX.green, label: "≤5pp gap (Close)" },
                    { color: COLOR_HEX.amber, label: "6–15pp gap (Moderate)" },
                    { color: COLOR_HEX.red, label: ">15pp gap (Large)" },
                  ]}
                  onDistrictClick={setSelectedDistrict} />
                <div className="text-[10px] text-gray-500 italic mt-1">
                  Discrepancy = NFHS-6 survey % minus PT admin %.{selectedOutcome === "sam" ? " SAM gap expected to be large: NFHS-6 uses WHZ only; PT adds MUAC & oedema." : " Large gaps may indicate under-counting."}
                </div>
              </div>
            ) : selectedOutcome === "sam" ? (
              /* SAM map — custom thresholds, PT data only */
              <div className="h-[420px] relative">
                <OdishaMap layer="outcome" layerKey="sam"
                  layerLabel={`SAM · ${selectedMonth} 2026`}
                  getDistrictValue={(d) => ptVal(d, selectedMonth, "sam")}
                  getDistrictColor={(v) => colorForSAM(v)}
                  legendItems={[
                    { color: COLOR_HEX.green, label: "0% (None)" },
                    { color: COLOR_HEX.amber, label: ">0–1% (Watch)" },
                    { color: COLOR_HEX.red, label: ">1% (Critical)" },
                  ]}
                  onDistrictClick={setSelectedDistrict} selectedDistrict={selectedDistrict} />
                <div className="text-[10px] text-gray-500 italic mt-1">Source: POSHAN Tracker · {selectedMonth} 2026 · State avg: {ptStateTrend[selectedMonth]?.sam.toFixed(2)}%</div>
              </div>
            ) : (
              <div className="h-[420px] relative">
                <OdishaMap layer="outcome" layerKey={selectedOutcome}
                  layerLabel={`${selectedOutcome} · ${selectedMonth} 2026`}
                  getDistrictValue={(d) => ptVal(d, selectedMonth, selectedOutcome)}
                  getDistrictColor={(v) => v === null ? "amber" : colorForOutcome(v) as "green" | "amber" | "red"}
                  legendItems={[
                    { color: COLOR_HEX.red, label: "Critical (>25%)" },
                    { color: COLOR_HEX.amber, label: "Moderate (18–25%)" },
                    { color: COLOR_HEX.green, label: "On Track (<18%)" },
                  ]}
                  onDistrictClick={setSelectedDistrict} selectedDistrict={selectedDistrict} />
                <div className="text-[10px] text-gray-500 italic mt-1">Source: POSHAN Tracker · {selectedMonth} 2026</div>
              </div>
            )
          ) : (
            <DistrictTable onSelect={setSelectedDistrict} activeOutcome={selectedOutcome} selectedMonth={selectedMonth} />
          )}

          {selectedDistrict ? (
            <DistrictInlinePanel district={selectedDistrict!} selectedMonth={selectedMonth} />
          ) : (
            <TopBottomLists outcome={selectedOutcome} selectedMonth={selectedMonth} />
          )}
        </Card>
      </div>
        </>
      )}
    </div>
  );
}

function moduleLabel(key: string) {
  return ({
    poshan: "POSHAN 2.0",
    saksham: "Saksham Anganwadi",
    subhadra: "Subhadra",
    mamta: "Mamta",
  } as Record<string, string>)[key];
}

function AlertChip({
  tone, icon, text, onView,
}: { tone: "red" | "amber" | "green"; icon: React.ReactNode; text: string; onView?: () => void }) {
  const cls = tone === "red"
    ? "bg-red-100 text-[#C62828] border-red-200"
    : tone === "amber"
    ? "bg-amber-100 text-[#B07700] border-amber-200"
    : "bg-green-100 text-[#2E7D32] border-green-200";
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${cls}`}>
      {icon}
      <span>{text}</span>
      {onView && (
        <button onClick={onView} className="ml-1 underline">
          View →
        </button>
      )}
    </div>
  );
}

function AdminVsSurvey() {
  const ptByKey = Object.fromEntries(PT_INDICATORS.map((p) => [p.key, p.value]));
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-xs font-bold text-gray-600 mb-2">Admin Data (PT)</div>
        <div className="space-y-2">
          {PT_INDICATORS.map((i) => {
            const c = colorForCoverage(i.value) as "green" | "amber" | "red";
            return (
              <div key={i.key} className="bg-white rounded p-3 flex justify-between items-center gap-2">
                <span className="text-xs flex items-center gap-1">
                  {i.name}
                  {i.key === "meas" && (
                    <span title={MEASUREMENT_EFFICIENCY_TOOLTIP} className="text-gray-400 inline-flex">
                      <Info size={12} />
                    </span>
                  )}
                </span>
                <span className="text-white text-xs font-bold px-2 py-1 rounded" style={{ background: COLOR_HEX[c] }}>
                  {i.value}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-gray-500 italic mt-2">Source: Poshan Tracker (MoWCD).</div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-600 mb-2">Phone Survey (Beneficiary Feedback)</div>
        <div className="space-y-2">
          {PHONE_SURVEY_ROWS.map((r) => {
            const pt = r.ptKey ? ptByKey[r.ptKey] : undefined;
            const gap = pt !== undefined ? r.value - pt : undefined;
            return (
              <div key={r.name} className="bg-white rounded p-3 flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="text-xs">{r.name}</div>
                  {gap !== undefined && (
                    <span className="mt-1 inline-block bg-red-100 text-[#C62828] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Uptake Gap: {gap > 0 ? "+" : ""}{gap}pp vs PT
                    </span>
                  )}
                </div>
                <span className="text-primary text-xs font-bold px-2 py-1 rounded bg-primary/10">
                  {r.value}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-gray-500 italic mt-2">
          Phone survey captures beneficiary-reported uptake. Gaps vs PT indicate delivery-to-receipt leakage.
          Source: WCD Phone Survey, Q2 2025.
        </div>
      </div>
    </div>
  );
}

function DQSidebar({ selectedDistrict }: { selectedDistrict: string | null }) {
  // Use RYG classification data (from VALIDATA / Excel)
  const stateRedPct = +(STATE_RYG.R / STATE_RYG.total * 100).toFixed(1);
  const stateGreenPct = +(STATE_RYG.G / STATE_RYG.total * 100).toFixed(1);

  const districtsByRed = useMemo(() =>
    DISTRICTS.map((d) => {
      const ryg = districtRYG[d] ?? { R: 0, Y: 0, G: 0, total: 1 };
      return { name: d, redPct: +(ryg.R / ryg.total * 100).toFixed(1), greenPct: +(ryg.G / ryg.total * 100).toFixed(1), total: ryg.total };
    }).sort((a, b) => b.redPct - a.redPct),
  []);

  const worst5 = districtsByRed.slice(0, 5);
  const best3 = [...districtsByRed].sort((a, b) => a.redPct - b.redPct).slice(0, 3);

  const stateNoticeCount = STATE_RYG.R;
  const stateRewardCount = STATE_RYG.G;

  return (
    <Card className="lg:col-span-2 bg-[#EFF3F8]">
      <div className="text-sm font-bold text-primary mb-3">Data Quality Overview</div>

      {/* State summary */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-white rounded p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Red AWCs</div>
          <div className="text-2xl font-extrabold text-[#C62828]">{stateRedPct}%</div>
          <div className="text-[9px] text-gray-400">{STATE_RYG.R.toLocaleString()} AWCs</div>
        </div>
        <div className="bg-white rounded p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Yellow AWCs</div>
          <div className="text-2xl font-extrabold text-[#D97706]">{+(STATE_RYG.Y / STATE_RYG.total * 100).toFixed(1)}%</div>
          <div className="text-[9px] text-gray-400">{STATE_RYG.Y.toLocaleString()} AWCs</div>
        </div>
        <div className="bg-white rounded p-2 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Green AWCs</div>
          <div className="text-2xl font-extrabold text-[#2E7D32]">{stateGreenPct}%</div>
          <div className="text-[9px] text-gray-400">{STATE_RYG.G.toLocaleString()} AWCs</div>
        </div>
      </div>

      {/* Notice / Reward action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => toast.success(`Notice sent to ${stateNoticeCount.toLocaleString()} AWCs across Odisha`, { description: "AWWs with >7 DQ flags notified via POSHAN portal" })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50 transition text-left"
        >
          <span className="text-base">⚠</span>
          <div>
            <div className="text-[10px] font-bold text-[#C62828]">Send Notice</div>
            <div className="text-[9px] text-gray-500">{stateNoticeCount.toLocaleString()} AWCs · &gt;7 checks</div>
          </div>
        </button>
        <button
          onClick={() => toast.success(`Certificates sent to ${stateRewardCount.toLocaleString()} AWCs across Odisha`, { description: "Clean AWCs with 0 flags rewarded via POSHAN portal" })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50 transition text-left"
        >
          <span className="text-base">★</span>
          <div>
            <div className="text-[10px] font-bold text-[#2E7D32]">Reward AWCs</div>
            <div className="text-[9px] text-gray-500">{stateRewardCount.toLocaleString()} AWCs · 0 flags</div>
          </div>
        </button>
      </div>

      {/* Selected district highlight */}
      {selectedDistrict && (() => {
        const ryg = districtRYG[selectedDistrict] ?? { R: 0, Y: 0, G: 0, total: 1 };
        const redP = +(ryg.R / ryg.total * 100).toFixed(1);
        const greenP = +(ryg.G / ryg.total * 100).toFixed(1);
        return (
          <div className="mb-3 bg-[#EDE7F6] border border-[#f97316]/30 rounded p-2">
            <div className="text-xs font-bold text-[#f97316] mb-1">{selectedDistrict}</div>
            <div className="flex gap-3 text-xs">
              <span>🔴 Red: <b className="text-[#C62828]">{redP}%</b></span>
              <span>🟡 Yellow: <b className="text-[#D97706]">{+(ryg.Y / ryg.total * 100).toFixed(1)}%</b></span>
              <span>🟢 Green: <b className="text-[#2E7D32]">{greenP}%</b></span>
            </div>
          </div>
        );
      })()}

      {/* Worst 5 districts by % Red */}
      <div className="mb-2">
        <div className="text-[10px] font-bold text-[#C62828] uppercase mb-1">Most Red AWCs</div>
        <div className="space-y-1">
          {worst5.map((d) => {
            const isSelected = d.name === selectedDistrict;
            return (
              <div key={d.name} className={`flex items-center justify-between rounded px-2 py-1 text-xs ${isSelected ? "bg-[#EDE7F6]" : "bg-white"}`}>
                <span className="font-medium truncate">{d.name}</span>
                <span className="font-bold ml-2 shrink-0 text-[#C62828]">{d.redPct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best 3 districts by % Green */}
      <div className="mb-3">
        <div className="text-[10px] font-bold text-[#2E7D32] uppercase mb-1">Most Green AWCs</div>
        <div className="space-y-1">
          {best3.map((d) => (
            <div key={d.name} className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs">
              <span className="font-medium">{d.name}</span>
              <span className="font-bold ml-2 text-[#2E7D32]">{d.greenPct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-gray-400 italic mb-2">AWC status: Red/Yellow/Green — classified by VALIDATA. Source: Poshan Tracker · Jul 2026</div>
      <Link to="/deep-dive" search={{ district: undefined }}
        className="inline-block border border-[#f97316] text-[#f97316] text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#f97316]/5">
        View Full DQ Analysis →
      </Link>
    </Card>
  );
}

function ptVal(district: string, month: PTMonth, outcome: PTOutcomeKey): number | null {
  const m = ptDistrictTrend[district]?.[month];
  if (!m) return null;
  if (outcome === "underweight") return m.uw;
  if (outcome === "stunting") return m.stunting;
  if (outcome === "sam") return m.sam;
  return m.wasting;
}

/** SAM-specific coloring: exactly 0 = green, >0–1 = amber, >1 = red */
function colorForSAM(v: number | null): "green" | "amber" | "red" {
  if (v === null) return "amber";
  if (v === 0) return "green";
  if (v <= 1) return "amber";
  return "red";
}

function DistrictTable({ onSelect, activeOutcome, selectedMonth }: {
  onSelect: (d: string) => void;
  activeOutcome: PTOutcomeKey;
  selectedMonth: PTMonth;
}) {
  const rows = useMemo(() => {
    return DISTRICTS.map((d) => {
      const p = districtProgramData[d];
      const poshanScore = Math.round(((p.poshan_snp + p.poshan_weighed + p.poshan_sam + p.poshan_thr) / 4));
      const m = ptDistrictTrend[d]?.[selectedMonth];
      return {
        d,
        wasting: m?.wasting ?? null,
        stunting: m?.stunting ?? null,
        uw: m?.uw ?? null,
        sam: m?.sam ?? null,
        poshanScore,
      };
    }).sort((a, b) => {
      const va = activeOutcome === "underweight" ? a.uw : activeOutcome === "stunting" ? a.stunting : activeOutcome === "sam" ? a.sam : a.wasting;
      const vb = activeOutcome === "underweight" ? b.uw : activeOutcome === "stunting" ? b.stunting : activeOutcome === "sam" ? b.sam : b.wasting;
      return (vb ?? 0) - (va ?? 0);
    });
  }, [activeOutcome, selectedMonth]);

  return (
    <div className="max-h-[480px] overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-primary text-primary-foreground sticky top-0">
          <tr>
            <th className="text-left px-3 py-2">District</th>
            <th className="text-center px-3 py-2">Wasting</th>
            <th className="text-center px-3 py-2">SAM</th>
            <th className="text-center px-3 py-2">Stunting</th>
            <th className="text-center px-3 py-2">Underweight</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.d} onClick={() => onSelect(r.d)}
              className={`cursor-pointer hover:bg-blue-50 ${i % 2 ? "bg-gray-50" : ""}`}>
              <td className="px-3 py-1.5 font-semibold">{r.d}</td>
              <OutcomeCell v={r.wasting} />
              <SAMCell v={r.sam} />
              <OutcomeCell v={r.stunting} />
              <OutcomeCell v={r.uw} />
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-[10px] text-gray-500 italic px-1 pt-1">Source: POSHAN Tracker · {selectedMonth} 2026</div>
    </div>
  );
}

function OutcomeCell({ v }: { v: number | null }) {
  if (v === null) return <td className="px-3 py-1.5 text-center text-gray-400">—</td>;
  const c = colorForOutcome(v) as "green" | "amber" | "red";
  return (
    <td className="px-3 py-1.5 text-center">
      <span className="text-white font-bold px-2 py-0.5 rounded" style={{ background: COLOR_HEX[c] }}>
        {v.toFixed(1)}%
      </span>
    </td>
  );
}

function SAMCell({ v }: { v: number | null }) {
  if (v === null) return <td className="px-3 py-1.5 text-center text-gray-400">—</td>;
  const c = colorForSAM(v);
  return (
    <td className="px-3 py-1.5 text-center">
      <span className="text-white font-bold px-2 py-0.5 rounded" style={{ background: COLOR_HEX[c] }}>
        {v.toFixed(2)}%
      </span>
    </td>
  );
}

function CoverageCell({ v }: { v: number }) {
  const c = colorForCoverage(v) as "green" | "amber" | "red";
  return (
    <td className="px-3 py-1.5 text-center">
      <span className="text-white font-bold px-2 py-0.5 rounded" style={{ background: COLOR_HEX[c] }}>
        {v}%
      </span>
    </td>
  );
}

function TopBottomLists({ outcome, selectedMonth }: { outcome: PTOutcomeKey; selectedMonth: PTMonth }) {
  const ranked = useMemo(() => {
    return DISTRICTS
      .map((d) => ({ name: d, value: ptVal(d, selectedMonth, outcome) ?? 0 }))
      .sort((a, b) => a.value - b.value); // ascending: best (lowest) first
  }, [outcome, selectedMonth]);

  const best = ranked.slice(0, 3);   // lowest = best for malnutrition
  const worst = ranked.slice(-3).reverse();
  const label = outcome === "sam" ? "SAM Prevalence"
    : OUTCOMES.find((o) => o.key === outcome)?.label ?? outcome;
  return (
    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100 text-xs">
      <div className="bg-[#E8F5E9] rounded-lg p-3 border border-green-100 shadow-sm">
        <div className="font-bold text-[#2E7D32] mb-1.5 flex items-center gap-1">▲ Best Districts — {label}</div>
        <div className="space-y-1 mt-2">
          {best.map((r) => (
            <div key={r.name} className="flex justify-between items-center text-gray-800">
              <span className="font-medium">{r.name}</span><b className="text-[#2E7D32]">{r.value.toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 italic mt-2.5">Source: POSHAN Tracker · {selectedMonth} 2026</div>
      </div>
      <div className="bg-[#FFEBEE] rounded-lg p-3 border border-red-100 shadow-sm">
        <div className="font-bold text-[#C62828] mb-1.5 flex items-center gap-1">▼ Needs Attention — {label}</div>
        <div className="space-y-1 mt-2">
          {worst.map((r) => (
            <div key={r.name} className="flex justify-between items-center text-gray-800">
              <span className="font-medium">{r.name}</span><b className="text-[#C62828]">{r.value.toFixed(1)}%</b>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 italic mt-2.5">Source: POSHAN Tracker · {selectedMonth} 2026</div>
      </div>
    </div>
  );
}

function DistrictInlinePanel({ district, selectedMonth }: { district: string; selectedMonth: PTMonth }) {
  const p = districtProgramData[district];
  const dqRow = districtDQData[district];
  const monthData = ptDistrictTrend[district]?.[selectedMonth];

  if (!p) {
    return (
      <div className="mt-3 bg-gray-50 rounded p-3 text-sm text-gray-600">
        No data available for {district}.
      </div>
    );
  }

  // RYG classification for this district
  const distRyg = districtRYG[district] ?? null;
  const distRedPct = distRyg && distRyg.total > 0 ? +(distRyg.R / distRyg.total * 100).toFixed(1) : null;

  // Rank this district by wasting in selected month
  const wastingRanked = DISTRICTS
    .map((d) => ({ name: d, value: ptVal(d, selectedMonth, "wasting") ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const wastingRank = wastingRanked.findIndex((r) => r.name === district) + 1;

  const gapPool = [
    { k: "SNP coverage", v: p.poshan_snp },
    { k: "Measurement efficiency", v: p.poshan_weighed },
    { k: "SAM referred", v: p.poshan_sam },
    { k: "THR coverage", v: p.poshan_thr },
    { k: "AWC toilet", v: p.saksham_toilet },
    { k: "ECCE enrolled", v: p.saksham_ecce },
  ].sort((a, b) => a.v - b.v).slice(0, 3);

  const stateM = ptStateTrend[selectedMonth];
  const ptOutcomes = [
    { label: "Wasting", v: monthData?.wasting ?? null, stateV: stateM?.wasting ?? null },
    { label: "SAM", v: monthData?.sam ?? null, stateV: stateM?.sam ?? null },
    { label: "Stunting", v: monthData?.stunting ?? null, stateV: stateM?.stunting ?? null },
    { label: "Underweight", v: monthData?.uw ?? null, stateV: stateM?.uw ?? null },
  ];

  return (
    <div className="mt-3 bg-white border border-primary/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-base font-bold text-primary">{district}</div>
          <div className="text-[11px] text-gray-500">
            Ranked {wastingRank} of {DISTRICTS.length} on wasting · {selectedMonth} 2026
          </div>
        </div>
        <div className="flex items-center gap-3">
          {distRedPct !== null && (
            <div className="text-center">
              <div className="text-[10px] text-gray-500 mb-0.5">Red AWCs</div>
              <div className="text-xl font-extrabold px-2 py-0.5 rounded text-[#C62828] bg-[#FFEBEE]">
                {distRedPct}%
              </div>
            </div>
          )}
          <AssignPlanButton count={1} indicator={`${district} improvement plan`} />
        </div>
      </div>
      {/* PT outcome tiles */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {ptOutcomes.map(({ label, v, stateV }) => {
          const c = v !== null ? (label === "SAM" ? colorForSAM(v) : colorForOutcome(v) as "green" | "amber" | "red") : "amber";
          const precision = label === "SAM" ? 2 : 1;
          return (
            <div key={label} className="bg-[#F0F7F9] rounded p-2 text-center">
              <div className="text-[10px] text-gray-600">{label}</div>
              <div className="text-2xl font-extrabold" style={{ color: COLOR_HEX[c] }}>
                {v !== null ? v.toFixed(precision) + "%" : "—"}
              </div>
              {stateV !== null && <div className="text-[10px] text-gray-500">State {stateV.toFixed(precision)}%</div>}
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-gray-500 italic mb-2">Source: POSHAN Tracker · {selectedMonth} 2026</div>
      <div>
        <div className="text-xs font-bold text-gray-600 mb-2">Top 3 Program Gaps</div>
        <div className="grid grid-cols-3 gap-2">
          {gapPool.map((g) => {
            const c = colorForCoverage(g.v) as "green" | "amber" | "red";
            return (
              <div key={g.k} className="bg-gray-50 rounded p-2 text-center">
                <div className="text-[10px] text-gray-600">{g.k}</div>
                <div className="text-sm font-bold" style={{ color: COLOR_HEX[c] }}>{g.v}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DistrictTrendChart({ district, outcome, selectedMonth }: {
  district: string;
  outcome: PTOutcomeKey;
  selectedMonth: PTMonth;
}) {
  const outLabel = outcome === "underweight" ? "Underweight" : outcome === "stunting" ? "Stunting" : outcome === "sam" ? "SAM" : "Wasting";
  const data = PT_MONTHS.map((m) => {
    const d = ptDistrictTrend[district]?.[m];
    const s = ptStateTrend[m];
    return {
      month: m,
      district: d ? ptVal(district, m, outcome) : null,
      state: s ? (outcome === "underweight" ? s.uw : outcome === "stunting" ? s.stunting : outcome === "sam" ? s.sam : s.wasting) : null,
    };
  });

  return (
    <div className="h-[420px] flex flex-col">
      <div className="text-xs font-semibold text-gray-700 mb-2">
        {district} — {outLabel} trend · Feb–Jul 2026
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" domain={["auto", "auto"]} />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <ReferenceLine
              y={data.find((d) => d.month === selectedMonth)?.state ?? undefined}
              stroke="#f97316" strokeDasharray="5 3"
              label={{ value: `State ${selectedMonth}`, position: "insideTopRight", fontSize: 10, fill: "#f97316" }}
            />
            <Line dataKey="district" name={district} stroke="#f97316" strokeWidth={2.5}
              dot={(props: any) => props.payload.month === selectedMonth
                ? <circle key={props.cx} cx={props.cx} cy={props.cy} r={5} fill="#f97316" stroke="white" strokeWidth={2} />
                : <circle key={props.cx} cx={props.cx} cy={props.cy} r={3} fill="#f97316" />}
              connectNulls />
            <Line dataKey="state" name="Odisha state" stroke="#f97316" strokeWidth={1.5}
              strokeDasharray="5 3" dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-gray-500 italic mt-1">Source: POSHAN Tracker · Feb–Jul 2026</div>
    </div>
  );
}
