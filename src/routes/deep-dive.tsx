import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine, Tooltip,
  LineChart, Line, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { DssShell, DownloadButton } from "@/components/dss/Shell";
import { Card, ViewToggle, AssignPlanButton } from "@/components/dss/ui";
import { OdishaMap } from "@/components/dss/OdishaMap";
import { useDss } from "@/lib/dss-context";
import {
  MODULE_INDICATORS,
  SERVICE_DELIVERY_TILES,
  DQ_CHECKS,
  COLOR_HEX,
  colorForCoverage,
  colorForOutcome,
  rankDistricts,
  DISTRICTS,
  districtProgramData,
  DISTRICT_PROJECTS,
  PT_INDICATORS,
  PHONE_SURVEY_ROWS,
  MEASUREMENT_EFFICIENCY_TOOLTIP,
  districtDQData,
  districtDQScoreDist,
  districtDQChecks,
  ptProjectData,
  ptDistrictTrend,
  ptStateTrend,
  PT_MONTHS,
  districtRYG,
  projectRYG,
  awcRYG,
  STATE_RYG,
  type PTMonth,
  type DQCheck,
  type DistrictRYG,
  type ProjectRYG,
  type AWCRYGRow,
  type RYGStatus,
} from "@/lib/dss-data";
import { toast } from "sonner";
import { Info, ChevronDown, ChevronRight, X } from "lucide-react";

export const Route = createFileRoute("/deep-dive")({
  validateSearch: (search: Record<string, unknown>) => ({
    district: typeof search.district === "string" ? search.district : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Deep Dive — WCD Insights | Govt of Odisha" },
      { name: "description", content: "Indicator-wise performance, service delivery, and data quality deep-dives for WCD programs across Odisha districts." },
    ],
  }),
  component: () => (
    <DssShell>
      <DeepDive />
    </DssShell>
  ),
});

function InfoDot({ text }: { text: string }) {
  return (
    <span className="relative inline-block group align-middle ml-1">
      <span className="w-4 h-4 inline-flex items-center justify-center rounded-full border border-gray-400 text-[9px] font-bold text-gray-600 cursor-help">i</span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 rounded-lg bg-gray-900 text-white text-[11px] leading-relaxed p-3 shadow-xl">
        {text}
      </span>
    </span>
  );
}

type SubTab = "Indicator-wise Performance" | "Service Delivery Score" | "Data Quality Score" | "Programme Convergence";

function DeepDive() {
  // const [tab, setTab] = useState<SubTab>("Indicator-wise Performance");
  // const tabs: SubTab[] = ["Indicator-wise Performance", "Service Delivery Score", "Data Quality Score", "Programme Convergence"];
  const [tab, setTab] = useState<SubTab>("Data Quality Score");
  const tabs: SubTab[] = ["Data Quality Score", "Indicator-wise Performance", "Service Delivery Score", "Programme Convergence"];
  const { district: preselect } = Route.useSearch();
  const { setDistrict } = useDss();
  useEffect(() => {
    if (preselect && DISTRICTS.includes(preselect)) setDistrict(preselect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselect]);
  return (
    <div>
      <div className="bg-white rounded-t-lg shadow-sm flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition shrink-0 ${tab === t
                ? "text-[#4f46e5] border-b-2 border-[#4f46e5] bg-[#4f46e5]/10"
                : "text-gray-600 hover:text-gray-800"
              }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {/* {tab === "Indicator-wise Performance" && <IndicatorPerformance />}
        {tab === "Service Delivery Score" && <ServiceDelivery />}
        {tab === "Data Quality Score" && <DataQuality />}
        {tab === "Programme Convergence" && <ProgrammeConvergence />} */}

        {tab === "Data Quality Score" && <DataQuality />}
        {tab !== "Data Quality Score" && (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500 font-medium">
            <span className="text-xl mb-2">Coming Soon</span>
            <span className="text-sm">This section is currently under development.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  return (
    <div className="my-3 pt-6">
      <div className="relative h-3 bg-gray-200 rounded">
        <div className="h-3 rounded bg-[#4E9A6A]" style={{ width: `${value}%` }} />
        <div className="absolute top-[-4px] h-5 w-0.5 bg-[#f97316]" style={{ left: `${target}%` }} />
        <div className="absolute -top-5 text-[10px] font-semibold text-gray-800" style={{ left: `calc(${target}% - 24px)` }}>
          Target {target}%
        </div>
      </div>
    </div>
  );
}

// Helper: deterministic project-level breakdown for a district
const MONTH_LABELS_DD = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
function getProjectValues(district: string, key: string): { name: string; value: number }[] {
  const base = districtProgramData[district]?.[key] ?? 0;
  const seed = (district + key).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const projects = DISTRICT_PROJECTS[district] ?? [`${district} Project`];
  return projects.map((name, i) => {
    const noise = ((seed * (i + 3) * 7 + i * 17) % 23) - 11; // –11 to +11
    const val = Math.max(1, Math.min(99, base + noise));
    return { name, value: val };
  });
}

function getIndicatorTrend(key: string, district: string): number[] {
  const vals = district !== "All Districts"
    ? [districtProgramData[district]?.[key] ?? 0]
    : DISTRICTS.map((d) => districtProgramData[d]?.[key] ?? 0);
  const latest = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const seed = (key + district).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 7;
  const shape = [-6, -4, -3, -1.5, 1, 0];
  return shape.map((s) => Math.max(1, Math.min(99, Math.round(latest + s * (1 + seed / 20)))));
}

// NFHS-6 Odisha state benchmarks (2023-24) for outcome comparison
const NFHS6_ODISHA = { wasting: 21.4, stunting: 27.0, underweight: 31.5 };

function IndicatorPerformance() {
  const { module, selectedIndicatorKey, setSelectedIndicatorKey, district } = useDss();
  const indicators = MODULE_INDICATORS[module];
  const ind = indicators.find((i) => i.key === selectedIndicatorKey) ?? indicators[0];
  const [rightView, setRightView] = useState<"Graph View" | "Map View">("Graph View");
  const [projectView, setProjectView] = useState<"Graph View" | "Table View">("Graph View");
  const [showTrend, setShowTrend] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<PTMonth>("Jul");

  const districtSelected = district !== "All Districts";

  const ranked = useMemo(() => rankDistricts("coverage", ind.key, true), [ind.key]);
  const stateAvg = useMemo(() => {
    const vals = DISTRICTS.map((d) => districtProgramData[d]?.[ind.key] ?? 0);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [ind.key]);
  const nationalAvg = 74.8;
  const target = 85;

  // Real project-level PT outcomes for selected district × month
  const ptProjects = useMemo(() => {
    if (!districtSelected) return [];
    const districtProjects = ptProjectData[district];
    if (!districtProjects) return [];
    return Object.entries(districtProjects)
      .map(([name, months]) => {
        const m = months[selectedMonth];
        return m ? { name, wasting: m.wasting, stunting: m.stunting, uw: m.uw, sam: m.sam, n: m.n } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.wasting - a.wasting);
  }, [district, selectedMonth, districtSelected]);

  // Real 6-month wasting/stunting trend
  const trendSeries = useMemo(() => {
    return PT_MONTHS.map((m) => {
      const distPt = districtSelected ? ptDistrictTrend[district]?.[m] : null;
      const statePt = ptStateTrend[m];
      return {
        month: m,
        districtWasting: distPt?.wasting ?? null,
        districtStunting: distPt?.stunting ?? null,
        stateWasting: statePt?.wasting ?? null,
        stateStunting: statePt?.stunting ?? null,
      };
    });
  }, [district, districtSelected]);

  const compareData = [
    { name: "Odisha State Avg", value: stateAvg, fill: COLOR_HEX[colorForCoverage(stateAvg) as "green" | "amber" | "red"] },
    { name: "National Avg (ICDS)", value: nationalAvg, fill: "#7FB3D5" },
  ];
  if (districtSelected) {
    const dVal = districtProgramData[district]?.[ind.key] ?? 0;
    compareData.unshift({
      name: district,
      value: dVal,
      fill: COLOR_HEX[colorForCoverage(dVal) as "green" | "amber" | "red"],
    });
  }

  // PT outcomes for selected district/month for NFHS benchmark panel
  const ptM = districtSelected ? ptDistrictTrend[district]?.[selectedMonth] : ptStateTrend[selectedMonth];
  const nfhsBenchmarks = [
    { k: "Wasting", pt: ptM?.wasting ?? null, nfhs6: NFHS6_ODISHA.wasting },
    { k: "Stunting", pt: ptM?.stunting ?? null, nfhs6: NFHS6_ODISHA.stunting },
    { k: "Underweight", pt: ptM?.uw ?? null, nfhs6: NFHS6_ODISHA.underweight },
  ];

  const belowTarget = ranked.filter((r) => r.value < target).length;
  const belowAvg = ranked.filter((r) => r.value < stateAvg).length;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Select indicator:</span>
          <select value={ind.key} onChange={(e) => setSelectedIndicatorKey(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm bg-white min-w-[320px]">
            {indicators.map((i) => (
              <option key={i.key} value={i.key}>{i.name}</option>
            ))}
          </select>
          {ind.tooltip && <InfoDot text={ind.tooltip} />}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Month:</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value as PTMonth)}
              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white">
              {PT_MONTHS.map((m) => <option key={m} value={m}>{m} 2026</option>)}
            </select>
            <button onClick={() => setShowTrend((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${showTrend ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "bg-white text-gray-600 border-gray-300 hover:border-[#4f46e5]"
                }`}>
              {showTrend ? "Hide trend" : "6-month outcome trend"}
            </button>
          </div>
        </div>
      </Card>

      {showTrend && (
        <Card>
          <div className="text-sm font-bold text-gray-800 mb-3">
            Nutrition outcome trend — Feb–Jul 2026 {districtSelected ? `· ${district}` : "· Odisha state"}
          </div>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={trendSeries} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={["auto", "auto"]} />
                <Tooltip formatter={(v: number) => `${v?.toFixed(1)}%`} />
                {districtSelected ? (
                  <>
                    <Line dataKey="districtWasting" name="Wasting" stroke="#C62828" strokeWidth={2}
                      dot={{ r: 3 }} connectNulls />
                    <Line dataKey="districtStunting" name="Stunting" stroke="#f97316" strokeWidth={2}
                      dot={{ r: 3 }} connectNulls />
                    <Line dataKey="stateWasting" name="State wasting" stroke="#C62828" strokeDasharray="4 3"
                      strokeWidth={1} dot={false} connectNulls />
                  </>
                ) : (
                  <>
                    <Line dataKey="stateWasting" name="Wasting (Odisha)" stroke="#C62828" strokeWidth={2}
                      dot={{ r: 3 }} connectNulls />
                    <Line dataKey="stateStunting" name="Stunting (Odisha)" stroke="#f97316" strokeWidth={2}
                      dot={{ r: 3 }} connectNulls />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-gray-500 italic mt-1">Source: POSHAN Tracker · Feb–Jul 2026</div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <div className="text-sm font-bold text-gray-800 mb-3">
            {districtSelected ? `${district} vs State & National` : "State vs National"}
          </div>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={compareData} layout="vertical" margin={{ left: 110, right: 30 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {compareData.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ProgressBar value={districtSelected ? (districtProgramData[district]?.[ind.key] ?? stateAvg) : stateAvg} target={target} />
          <div className="mt-6">
            <span className="bg-[#f97316] text-white px-3 py-1 rounded-full text-xs font-semibold">Target – {target}%</span>
          </div>
          <div className="mt-3 text-sm space-y-1">
            <div>State Rank: <b>14th</b> (out of 36 states) <InfoDot text="Odisha's rank among all states/UTs on this indicator as reported in ICDS-CAS / Poshan Tracker national dashboard, July 2026." /></div>
            <div>State performing <span className="text-[#C62828] font-bold">below</span> target</div>
            <div>State performing <span className="text-[#2E7D32] font-bold">above</span> national average</div>
          </div>

          {/* NFHS-6 Odisha vs PT outcome benchmarks */}
          <div className="mt-4 border-t pt-3">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase">
              PT vs NFHS-6 Odisha · {selectedMonth} 2026
              {districtSelected && <span className="ml-1 font-normal normal-case text-gray-400">({district})</span>}
            </div>
            <div className="space-y-1.5">
              {nfhsBenchmarks.map(({ k, pt, nfhs6 }) => {
                const c = pt !== null ? colorForOutcome(pt) as "green" | "amber" | "red" : "amber";
                return (
                  <div key={k} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-600 w-24">{k}</span>
                    <span className="font-bold" style={{ color: pt !== null ? COLOR_HEX[c] : "#6B7280" }}>
                      PT: {pt !== null ? pt.toFixed(1) + "%" : "—"}
                    </span>
                    <span className="text-gray-500">NFHS-6 Odisha: {nfhs6}%</span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-gray-400 italic mt-1">NFHS-6 (2023-24) Odisha state estimates</div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
              {districtSelected ? `${district} — Project-wise performance` : ind.name}
              {ind.tooltip && <InfoDot text={ind.tooltip} />}
            </div>
            <div className="flex items-center gap-2">
              {districtSelected ? (
                <ViewToggle
                  options={["Graph View", "Table View"]}
                  value={projectView}
                  onChange={(v) => setProjectView(v as typeof projectView)}
                />
              ) : (
                <ViewToggle
                  options={["Graph View", "Map View"]}
                  value={rightView}
                  onChange={(v) => setRightView(v as typeof rightView)}
                />
              )}
              <DownloadButton />
            </div>
          </div>
          {districtSelected ? (
            /* Project-level breakdown — Graph View updates with selected indicator; Table View shows real PT outcomes */
            <div>
              <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                {projectView === "Table View"
                  ? <><span>PT nutrition outcomes by project · <b>{selectedMonth} 2026</b></span><span className="text-gray-400 ml-1">({ptProjects.length} projects)</span></>
                  : <><span><b>{ind.name}</b> — project breakdown · {district}</span><span className="text-[10px] text-blue-500 ml-2">🔵 Illus.</span></>}
              </div>
              {projectView === "Table View" ? (
                ptProjects.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center">No project data available for {district}</div>
                ) : (
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2">Project</th>
                          <th className="text-center px-3 py-2">Wasting</th>
                          <th className="text-center px-3 py-2">Stunting</th>
                          <th className="text-center px-3 py-2">Underweight</th>
                          <th className="text-center px-3 py-2">SAM</th>
                          <th className="text-right px-3 py-2">N</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ptProjects.map((p, i) => {
                          const cw = colorForOutcome(p.wasting) as "green" | "amber" | "red";
                          const cs = colorForOutcome(p.stunting) as "green" | "amber" | "red";
                          const cu = colorForOutcome(p.uw) as "green" | "amber" | "red";
                          return (
                            <tr key={p.name} className={i % 2 ? "bg-gray-50" : ""}>
                              <td className="px-3 py-1.5 font-medium text-gray-800">{p.name}</td>
                              <td className="px-3 py-1.5 text-center">
                                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: COLOR_HEX[cw] }}>{p.wasting.toFixed(1)}%</span>
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: COLOR_HEX[cs] }}>{p.stunting.toFixed(1)}%</span>
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: COLOR_HEX[cu] }}>{p.uw.toFixed(1)}%</span>
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">{p.sam.toFixed(1)}%</td>
                              <td className="px-3 py-1.5 text-right text-gray-500">{p.n.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (() => {
                const projData = getProjectValues(district, ind.key);
                return (
                  <div style={{ height: Math.max(200, projData.length * 28) }}>
                    <ResponsiveContainer>
                      <BarChart data={projData} layout="vertical" margin={{ left: 110, right: 30 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                        <ReferenceLine x={districtProgramData[district]?.[ind.key] ?? stateAvg}
                          stroke="#f97316" strokeDasharray="4 3"
                          label={{ value: "District avg", position: "top", fontSize: 10, fill: "#f97316" }} />
                        <Bar dataKey="value" name={ind.name} radius={[0, 3, 3, 0]}>
                          {projData.map((p, i) => (
                            <Cell key={i} fill={COLOR_HEX[colorForCoverage(p.value) as "green" | "amber" | "red"]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
              <div className="text-[10px] text-gray-500 italic mt-2">
                {projectView === "Table View"
                  ? `Source: POSHAN Tracker · ${selectedMonth} 2026`
                  : "🔵 Illustrative project breakdown — switch to Table View for real PT outcome data per project"}
              </div>
            </div>
          ) : rightView === "Graph View" ? (
            <div className="h-[480px]">
              <ResponsiveContainer>
                <BarChart data={ranked} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <ReferenceLine
                    x={stateAvg}
                    stroke="#f97316"
                    strokeDasharray="4 3"
                    label={{ value: `State Avg ${stateAvg}%`, position: "top", fontSize: 10, fill: "#f97316" }}
                  />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {ranked.map((d, i) => (
                      <Cell key={i} fill={COLOR_HEX[colorForCoverage(d.value) as "green" | "amber" | "red"]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[480px]">
              <OdishaMap layer="coverage" layerKey={ind.key} layerLabel={ind.name} />
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="space-y-2">
          {districtSelected ? (
            <>
              {ptProjects.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <b>{ptProjects.filter((p) => p.wasting > (ptDistrictTrend[district]?.[selectedMonth]?.wasting ?? 0)).length} projects</b> above district wasting avg
                    </span>
                    <AssignPlanButton count={ptProjects.filter((p) => p.wasting > (ptDistrictTrend[district]?.[selectedMonth]?.wasting ?? 0)).length} indicator="wasting" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <b>{ptProjects.filter((p) => p.wasting > 5).length} projects</b> with wasting &gt;5% (high risk)
                    </span>
                    <AssignPlanButton count={ptProjects.filter((p) => p.wasting > 5).length} indicator="wasting" />
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{belowTarget} districts</b> performing below target ({target}%)</span>
                <AssignPlanButton count={belowTarget} indicator={ind.name} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{belowAvg} districts</b> performing below state average</span>
                <AssignPlanButton count={belowAvg} indicator={ind.name} />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function ServiceDelivery() {
  const { module, dataMode, district } = useDss();
  const districtSelected = district !== "All Districts";
  const tiles = SERVICE_DELIVERY_TILES[module];
  const [selectedTile, setSelectedTile] = useState(tiles[2]?.name ?? tiles[0].name);
  const [view, setView] = useState<"Graph View" | "Map View">("Map View");
  const [projectView, setProjectView] = useState<"Graph View" | "Table View">("Graph View");

  const tileKeyMap: Record<string, string> = {
    "Measurement Efficiency": "poshan_weighed",
    "SNP distributed": "poshan_snp",
    "SAM referred": "poshan_sam",
    "SAM identified": "poshan_sam",
    "THR given (PW)": "poshan_thr",
    "THR given (LM)": "poshan_thr",
    "AWCs with toilet": "saksham_toilet",
    "AWCs with electricity": "saksham_electricity",
    "ECE enrolled": "saksham_ecce",
    "AWW filled": "saksham_aww",
    "Enrolled": "subhadra_enrolled",
    "1st installment": module === "mamta" ? "mamta_inst1" : "subhadra_inst1",
    "2nd installment": module === "mamta" ? "mamta_inst2" : "subhadra_inst2",
    "DBT success": "subhadra_dbt",
    "Registered": "mamta_registered",
    "Institutional delivery": "mamta_delivery",
  };
  const layerKey = tileKeyMap[selectedTile] ?? "poshan_weighed";
  const ranked = rankDistricts("coverage", layerKey, true);
  const top = ranked.slice(-3).reverse();
  const bottom = ranked.slice(0, 3);
  const stateAvg = ranked.length
    ? Math.round(ranked.reduce((a, r) => a + r.value, 0) / ranked.length)
    : 70;
  const belowAvg = ranked.filter((r) => r.value < stateAvg).length;
  const aboveAvg = ranked.length - belowAvg;
  const belowTarget = ranked.filter((r) => r.value < 85).length;

  const projectData = useMemo(
    () => districtSelected ? getProjectValues(district, layerKey) : [],
    [district, layerKey, districtSelected],
  );
  const dVal = districtProgramData[district]?.[layerKey] ?? 0;

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between bg-[#FFF3E0]">
        <div className="text-sm font-bold text-gray-800">
          {districtSelected ? `${district} — Service Delivery Score` : "District Score (Service Delivery)"}
        </div>
        <span className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-full font-bold">
          {districtSelected ? `${dVal}%` : `${stateAvg}%`}
        </span>
      </Card>

      {dataMode === "survey" && <PTvsSurveyCard />}

      {selectedTile === "SAM identified" && (
        <Card className="bg-amber-50 border-amber-100">
          <div className="text-xs font-bold text-amber-800 mb-1">About: SAM identified</div>
          <p className="text-xs text-gray-700 leading-relaxed">
            "SAM identified" = fraction of children formally recorded as Severely Acutely Malnourished (WHZ &lt;−3 or MUAC &lt;115mm) in PT.
            In July 2026, Odisha's PT wasting rate was <b>3.4%</b> across ~25.2 lakh measured children — implying ~{Math.round(2519189 * 0.0053 / 1000)}k SAM cases.
            State SAM prevalence (PT): <b>0.53%</b>. Only <b>41%</b> of estimated SAM children are being actively identified and placed in the referral pipeline; the remaining ~59% go undetected, delaying NRC referral.
          </p>
        </Card>
      )}

      <Card>
        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Service lifecycle indicators</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tiles.map((t) => {
            const sel = selectedTile === t.name;
            const displayVal = districtSelected
              ? (districtProgramData[district]?.[tileKeyMap[t.name] ?? "poshan_weighed"] ?? t.value)
              : t.value;
            const c = colorForCoverage(displayVal) as "green" | "amber" | "red";
            const bg = sel
              ? "bg-[#f97316] text-white"
              : c === "green" ? "bg-[#E8F5E9] text-[#2E7D32]"
                : c === "amber" ? "bg-[#FFF8E1] text-[#B07700]"
                  : "bg-[#FFEBEE] text-[#C62828]";
            return (
              <button
                key={t.name}
                onClick={() => setSelectedTile(t.name)}
                className={`shrink-0 w-32 p-3 rounded-md text-left ${bg} shadow-sm`}
              >
                <div className="text-[11px] font-medium leading-tight flex items-center gap-1">
                  {t.name}
                  {t.name === "Measurement Efficiency" && (
                    <span title={MEASUREMENT_EFFICIENCY_TOOLTIP} className="inline-flex">
                      <Info size={11} />
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold mt-1">{displayVal}%</div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-800">
              {districtSelected ? `${district} — Project-wise: ${selectedTile}` : selectedTile}
            </div>
            {districtSelected ? (
              <ViewToggle
                options={["Graph View", "Table View"]}
                value={projectView}
                onChange={(v) => setProjectView(v as typeof projectView)}
              />
            ) : (
              <ViewToggle
                options={["Graph View", "Map View"]}
                value={view}
                onChange={(v) => setView(v as typeof view)}
              />
            )}
          </div>

          {districtSelected ? (
            projectView === "Table View" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-3 py-2">Project</th>
                      <th className="text-right px-3 py-2 w-24">Value</th>
                      <th className="text-right px-3 py-2 w-28">vs District avg</th>
                      <th className="text-right px-3 py-2 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectData.map((p, i) => {
                      const delta = +(p.value - dVal).toFixed(1);
                      const c = colorForCoverage(p.value) as "green" | "amber" | "red";
                      return (
                        <tr key={p.name} className={i % 2 ? "bg-gray-50" : ""}>
                          <td className="px-3 py-2 font-medium text-gray-800">{p.name}</td>
                          <td className="px-3 py-2 text-right font-bold" style={{ color: COLOR_HEX[c] }}>{p.value}%</td>
                          <td className="px-3 py-2 text-right text-xs font-semibold" style={{ color: delta >= 0 ? "#2E7D32" : "#C62828" }}>
                            {delta >= 0 ? `+${delta}` : delta}pp
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: COLOR_HEX[c] + "22", color: COLOR_HEX[c] }}>
                              {c === "green" ? "Good" : c === "amber" ? "Watch" : "Alert"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-[10px] text-gray-400 mt-2 italic">Synthetic project-level data · Source: Poshan Tracker Jul 2026</div>
              </div>
            ) : (
              <div style={{ height: Math.max(200, projectData.length * 32) }}>
                <ResponsiveContainer>
                  <BarChart data={projectData} layout="vertical" margin={{ left: 110, right: 30 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip formatter={(v) => [`${v}%`, selectedTile]} />
                    <ReferenceLine x={dVal} stroke="#f97316" strokeDasharray="4 3"
                      label={{ value: "District avg", position: "top", fontSize: 10, fill: "#f97316" }} />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                      {projectData.map((p, i) => (
                        <Cell key={i} fill={COLOR_HEX[colorForCoverage(p.value) as "green" | "amber" | "red"]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-[10px] text-gray-400 mt-1 italic">Synthetic project-level data · Source: Poshan Tracker Jul 2026</div>
              </div>
            )
          ) : view === "Map View" ? (
            <div className="h-[420px]"><OdishaMap layer="coverage" layerKey={layerKey} layerLabel={selectedTile} /></div>
          ) : (
            <div className="h-[420px]">
              <ResponsiveContainer>
                <BarChart data={ranked} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {ranked.map((d, i) => (
                      <Cell key={i} fill={COLOR_HEX[colorForCoverage(d.value) as "green" | "amber" | "red"]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          {districtSelected ? (
            <>
              <Card className="bg-[#E8F5E9]">
                <div className="text-xs font-bold text-[#2E7D32] mb-2">Top Projects</div>
                {[...projectData].sort((a, b) => b.value - a.value).slice(0, 3).map((r) => (
                  <div key={r.name} className="flex justify-between text-sm py-1"><span>{r.name}</span><b>{r.value}%</b></div>
                ))}
              </Card>
              <Card className="bg-[#FFEBEE]">
                <div className="text-xs font-bold text-[#C62828] mb-2">Bottom Projects</div>
                {[...projectData].sort((a, b) => a.value - b.value).slice(0, 3).map((r) => (
                  <div key={r.name} className="flex justify-between text-sm py-1"><span>{r.name}</span><b>{r.value}%</b></div>
                ))}
              </Card>
              <Card>
                <ProgressBar value={dVal} target={85} />
                <div className="mt-6">
                  <span className="bg-[#f97316] text-white px-3 py-1 rounded-full text-xs font-semibold">Target – 85%</span>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-[#E8F5E9]">
                <div className="text-xs font-bold text-[#2E7D32] mb-2">Top Districts</div>
                {top.map((r) => (
                  <div key={r.name} className="flex justify-between text-sm py-1"><span>{r.name}</span><b>{r.value}%</b></div>
                ))}
              </Card>
              <Card className="bg-[#FFEBEE]">
                <div className="text-xs font-bold text-[#C62828] mb-2">Bottom Districts</div>
                {bottom.map((r) => (
                  <div key={r.name} className="flex justify-between text-sm py-1"><span>{r.name}</span><b>{r.value}%</b></div>
                ))}
              </Card>
              <Card>
                <ProgressBar value={stateAvg} target={85} />
                <div className="mt-6">
                  <span className="bg-[#f97316] text-white px-3 py-1 rounded-full text-xs font-semibold">Target – 85%</span>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      <Card>
        <div className="space-y-2">
          {districtSelected ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{projectData.filter((p) => p.value < dVal).length} projects</b> below district average</span>
                <AssignPlanButton count={projectData.filter((p) => p.value < dVal).length} indicator={selectedTile} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{projectData.filter((p) => p.value < 85).length} projects</b> below target (85%)</span>
                <AssignPlanButton count={projectData.filter((p) => p.value < 85).length} indicator={selectedTile} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{belowAvg} districts</b> below state average ({stateAvg}%)</span>
                <AssignPlanButton count={belowAvg} indicator={selectedTile} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{aboveAvg} districts</b> at or above state average ({stateAvg}%)</span>
                <AssignPlanButton count={aboveAvg} indicator={selectedTile} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm"><b>{belowTarget} districts</b> below target (85%)</span>
                <AssignPlanButton count={belowTarget} indicator={selectedTile} />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function PTvsSurveyCard() {
  const ptByKey = Object.fromEntries(PT_INDICATORS.map((p) => [p.key, p.value]));
  return (
    <Card>
      <div className="text-sm font-bold text-gray-800 mb-3">Admin Data (PT) vs Phone Survey (Beneficiary Feedback)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">Admin Data (PT)</div>
          <div className="space-y-2">
            {PT_INDICATORS.map((p) => {
              const c = colorForCoverage(p.value) as "green" | "amber" | "red";
              return (
                <div key={p.key} className="bg-gray-50 rounded p-2 flex items-center justify-between gap-2">
                  <span className="text-xs flex items-center gap-1">
                    {p.name}
                    {p.key === "meas" && (
                      <span title={MEASUREMENT_EFFICIENCY_TOOLTIP} className="text-gray-400 inline-flex"><Info size={11} /></span>
                    )}
                  </span>
                  <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: COLOR_HEX[c] }}>{p.value}%</span>
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
                <div key={r.name} className="bg-gray-50 rounded p-2 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs">{r.name}</div>
                    {gap !== undefined && (
                      <span className="mt-1 inline-block bg-red-100 text-[#C62828] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        Uptake Gap: {gap > 0 ? "+" : ""}{gap}pp vs PT
                      </span>
                    )}
                  </div>
                  <span className="text-gray-800 text-xs font-bold px-2 py-0.5 rounded bg-blue-50">{r.value}%</span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-gray-500 italic mt-2">
            Phone survey captures beneficiary-reported uptake. Gaps vs PT indicate delivery-to-receipt leakage.
            Source: WCD Phone Survey, July 2026.
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============== DATA QUALITY (14-check framework) ==============

// Window is fixed at 6 months (Feb–Jul 2026) — single data snapshot

function districtCheckFlaggedPct(district: string, checkNum: number): number {
  const check = DQ_CHECKS.find((c) => c.num === checkNum);
  if (!check) return 0;
  const d = districtDQChecks[district];
  return d ? d[check.key] : check.stateRate;
}

function projectCheckFlaggedPct(
  district: string, checkNum: number, districtPct: number,
): { name: string; value: number }[] {
  const seed = (district + String(checkNum)).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const projects = DISTRICT_PROJECTS[district] ?? [`${district} Project`];
  return projects.map((name, i) => {
    const noise = ((seed * (i + 5) * 11 + i * 17) % 19) - 9;
    const val = Math.max(0, Math.min(99, +(districtPct + noise).toFixed(1)));
    return { name, value: val };
  });
}

function computeDistrictDqScore(district: string, _dqScore: number): number {
  const d = districtDQData[district];
  if (d) return Math.round((1 - d.avg_score / 14) * 100);
  // Synthetic fallback for unknown districts
  const snp = districtProgramData[district]?.snp_coverage ?? 64;
  const seed = district.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 10;
  const noise = (64 - snp) * 0.18 + seed - 5;
  return Math.max(40, Math.min(99, Math.round(_dqScore - noise)));
}

function getProjectDqScores(district: string, baseScore: number): { name: string; value: number }[] {
  const seed = district.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const projects = DISTRICT_PROJECTS[district] ?? [`${district} Project`];
  return projects.map((name, i) => {
    const noise = ((seed * (i + 5) * 11 + i * 13) % 25) - 12;
    const val = Math.max(40, Math.min(99, baseScore + noise));
    return { name, value: val };
  });
}

// Thresholds: 0% = good, 0–30% = watch (amber), >30% = alert (red)
function colorForFlagged(pct: number): "green" | "amber" | "red" {
  return pct === 0 ? "green" : pct <= 30 ? "amber" : "red";
}

function DQBinGraph({ district }: { district: string }) {
  const bins = districtDQScoreDist[district];
  if (!bins) return null;
  const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11+"];
  const data = labels.map((label, i) => ({ label, count: bins[i] ?? 0 }));
  const totalAWCs = bins.reduce((s, v) => s + v, 0);
  const peak = Math.max(...data.map((d) => d.count));

  // AWCs eligible for notice (>7 flags = bins[8]+bins[9]+bins[10]+bins[11])
  const noticeCount = (bins[8] ?? 0) + (bins[9] ?? 0) + (bins[10] ?? 0) + (bins[11] ?? 0);
  // AWCs eligible for reward (0 flags = bins[0])
  const rewardCount = bins[0] ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs font-bold text-gray-800 mb-0.5">AWC Score Distribution — {district}</div>
      <div className="text-[10px] text-gray-500 mb-2">
        DQ checks triggered per AWC (0 = no issues, 11+ = most checks triggered) · {totalAWCs.toLocaleString()} AWCs total
      </div>
      <div className="flex gap-4">
        <div style={{ height: 160, flex: 1 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: 4, right: 8, bottom: 0, top: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={38}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                domain={[0, Math.ceil(peak * 1.1)]} />
              <Tooltip formatter={(v, _n, p) => [v.toLocaleString(), `AWCs with ${p.payload.label} flags`]} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i}
                    fill={i <= 3 ? COLOR_HEX.green : i <= 6 ? COLOR_HEX.amber : COLOR_HEX.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Action buttons */}
        <div className="flex flex-col gap-2 justify-center min-w-[160px]">
          <button
            onClick={() => toast.success(`Notice sent to ${noticeCount} AWCs in ${district} with >7 DQ flags`, { description: "AWW & CDPO notified via POSHAN portal" })}
            className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border border-red-300 bg-[#FFF5F5] hover:bg-red-50 transition text-left"
          >
            <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-wide">⚠ Send Notice</span>
            <span className="text-[11px] font-semibold text-gray-800">{noticeCount.toLocaleString()} AWCs</span>
            <span className="text-[9px] text-gray-500">with &gt;7 DQ checks</span>
          </button>
          <button
            onClick={() => toast.success(`Reward certificate sent to ${rewardCount} AWCs in ${district} with 0 flags`, { description: "Appreciation letter issued via POSHAN portal" })}
            className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border border-green-300 bg-[#F0FFF4] hover:bg-green-50 transition text-left"
          >
            <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wide">★ Reward AWCs</span>
            <span className="text-[11px] font-semibold text-gray-800">{rewardCount.toLocaleString()} AWCs</span>
            <span className="text-[9px] text-gray-500">with 0 flags (clean data)</span>
          </button>
        </div>
      </div>
      <div className="flex gap-3 mt-1.5 text-[9px] text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: COLOR_HEX.green }} />0–3 checks (low risk)</span>
        <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: COLOR_HEX.amber }} />4–6 checks (moderate)</span>
        <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ background: COLOR_HEX.red }} />7+ checks (high risk)</span>
      </div>
      <div className="text-[9px] text-gray-400 italic mt-1">Source: validata · Poshan Tracker Jul 2026</div>
    </div>
  );
}

// District name mapping: dss-data convention → Excel/RYG JSON convention
const DIST_TO_RYG: Record<string, string> = {
  "Jajpur": "Jajpur",
  "Kendujhar": "Kendujhar",
  "Sundaragada": "Sundaragada",
};

function getRYGForDistrict(d: string): DistrictRYG {
  return (districtRYG as Record<string, DistrictRYG>)[d]
    ?? (districtRYG as Record<string, DistrictRYG>)[DIST_TO_RYG[d] ?? ""]
    ?? { R: 0, Y: 0, G: 0, total: 0 };
}
function getProjectsForDistrict(d: string): ProjectRYG[] {
  return (projectRYG as Record<string, ProjectRYG[]>)[d]
    ?? (projectRYG as Record<string, ProjectRYG[]>)[DIST_TO_RYG[d] ?? ""]
    ?? [];
}
function getAWCsForDistrict(d: string): AWCRYGRow[] {
  return (awcRYG as Record<string, AWCRYGRow[]>)[d]
    ?? (awcRYG as Record<string, AWCRYGRow[]>)[DIST_TO_RYG[d] ?? ""]
    ?? [];
}

const STATUS_CONFIG = {
  R: { label: "Red AWCs", color: "#C62828", bg: "#FFEBEE", fillLight: [255, 205, 210] as [number, number, number], fillDark: [183, 28, 28] as [number, number, number] },
  Y: { label: "Yellow AWCs", color: "#D97706", bg: "#FEF9C3", fillLight: [254, 249, 195] as [number, number, number], fillDark: [217, 119, 6] as [number, number, number] },
  G: { label: "Green AWCs", color: "#2E7D32", bg: "#E8F5E9", fillLight: [200, 230, 201] as [number, number, number], fillDark: [27, 94, 32] as [number, number, number] },
} as const;

function DataQuality() {
  const { district, setDistrict } = useDss();
  const districtSelected = district !== "All Districts";
  const [selectedStatus, setSelectedStatus] = useState<RYGStatus>("R");
  const [view, setView] = useState<"Map" | "Graph View">("Map");
  const [activeCheck, setActiveCheck] = useState<DQCheck | null>(null);

  const sc = STATUS_CONFIG[selectedStatus];

  // Gradient fill for choropleth: normalize by max % in that status across districts
  const maxDistrictPct = useMemo(() => {
    let max = 0;
    for (const d of DISTRICTS) {
      const ryg = getRYGForDistrict(d);
      if (ryg.total > 0) max = Math.max(max, ryg[selectedStatus] / ryg.total);
    }
    return max > 0 ? max : 1;
  }, [selectedStatus]);

  function getDistrictFillHex(d: string): string {
    const ryg = getRYGForDistrict(d);
    if (!ryg || ryg.total === 0) return "#E0E0E0";
    const norm = Math.min(1, (ryg[selectedStatus] / ryg.total) / maxDistrictPct);
    const [lr, lg, lb] = sc.fillLight;
    const [dr, dg, db] = sc.fillDark;
    const r = Math.round(lr + (dr - lr) * norm);
    const g = Math.round(lg + (dg - lg) * norm);
    const b = Math.round(lb + (db - lb) * norm);
    return `rgb(${r},${g},${b})`;
  }

  // Tooltip label for map
  const mapLayerLabel = `% ${sc.label}`;

  // Top 3 districts for selected status (by %)
  const top3Districts = useMemo(() =>
    DISTRICTS.map((d) => {
      const ryg = getRYGForDistrict(d);
      return { name: d, count: ryg[selectedStatus], pct: ryg.total > 0 ? ryg[selectedStatus] / ryg.total * 100 : 0 };
    }).sort((a, b) => b.pct - a.pct).slice(0, 3),
    [selectedStatus]);

  // All-district stacked bar (sorted by % of selectedStatus desc)
  const districtStackedData = useMemo(() =>
    DISTRICTS.map((d) => {
      const ryg = getRYGForDistrict(d);
      const t = ryg.total || 1;
      return { name: d, R: Math.round(ryg.R / t * 100), Y: Math.round(ryg.Y / t * 100), G: Math.round(ryg.G / t * 100) };
    }).sort((a, b) => b[selectedStatus] - a[selectedStatus]),
    [selectedStatus]);

  // Project stacked bar when district selected
  const projectStackedData = useMemo(() => {
    if (!districtSelected) return [];
    return getProjectsForDistrict(district).map((p) => {
      const t = p.total || 1;
      return { name: p.project, R: Math.round(p.R / t * 100), Y: Math.round(p.Y / t * 100), G: Math.round(p.G / t * 100), rAbs: p.R, yAbs: p.Y, gAbs: p.G };
    }).sort((a, b) => b[selectedStatus] - a[selectedStatus]);
  }, [district, districtSelected, selectedStatus]);

  const top3Projects = useMemo(() =>
    projectStackedData.map(p => ({ name: p.name, pct: p[selectedStatus] })).slice(0, 3),
    [projectStackedData, selectedStatus]);

  const currentRYG = districtSelected ? getRYGForDistrict(district) : STATE_RYG;

  function handleDownloadLineList() {
    if (!districtSelected) {
      const a = document.createElement("a");
      a.href = "/complete_data.csv";
      a.download = "260923_OD Final WCD War Room (74223).csv";
      a.click();
      toast.success("Downloading complete state CSV...");
      return;
    }
    const awcs = getAWCsForDistrict(district);
    if (!awcs.length) { toast.error("No AWC data for this district."); return; }
    const lines = ["AWC Name,AWC Code,Project,Sector,Status"];
    awcs.forEach(([name, code, proj, sector, status]) => {
      lines.push(`"${name}","${code}","${proj}","${sector}","${status}"`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${district.replace(/ /g, "_")}_AWC_RYG_LineList.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${awcs.length.toLocaleString()} AWCs for ${district}`);
  }

  return (
    <div className="space-y-4">
      {/* DQ Banner */}
      <Card className="bg-blue-50 border border-blue-100 shadow-sm">
        <p className="text-[13px] font-medium text-gray-800 leading-relaxed">
          <span className="font-bold text-[#4f46e5]">📊 Data Quality (DQ)</span> — Each AWC is classified{" "}
          <span className="text-[#C62828] font-bold">Red</span>,{" "}
          <span className="text-[#D97706] font-bold">Yellow</span>, or{" "}
          <span className="text-[#2E7D32] font-bold">Green</span>{" "}
          based on measurement patterns detected by the VALIDATA engine — copy-paste repetition, blanket increments, z-score bunching &amp; abnormal transitions.{" "}
          <span className="text-[#C62828]">Red = high concern</span> · <span className="text-[#D97706]">Yellow = moderate</span> · <span className="text-[#2E7D32]">Green = clean data</span>.
          {/* &nbsp;<span className="text-gray-500 italic">Source: Poshan Tracker · Jul 2026 · {STATE_RYG.total.toLocaleString()} AWCs across Odisha.</span> */}
          &nbsp;<span className="text-gray-500 italic">Source: Poshan Tracker · Feb to July 2026 · 74,223 AWCs across Odisha.</span>
        </p>
      </Card>

      {/* 3 RYG Boxes */}
      <div className="grid grid-cols-3 gap-3">
        {(["R", "Y", "G"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const ryg = districtSelected ? getRYGForDistrict(district) : STATE_RYG;
          const count = ryg[s];
          const pct = ryg.total > 0 ? (count / ryg.total * 100).toFixed(1) : "0.0";
          const isSelected = selectedStatus === s;
          return (
            <button key={s} onClick={() => setSelectedStatus(s)}
              className={`rounded-xl p-4 text-left transition-all border-2 ${isSelected ? "shadow-lg scale-[1.02]" : "opacity-80 hover:opacity-100"
                }`}
              style={{
                background: cfg.bg,
                color: cfg.color,
                borderColor: isSelected ? cfg.color : "transparent",
              }}>
              <div className="text-xs font-bold uppercase tracking-wide opacity-60">{cfg.label}</div>
              <div className="text-3xl font-extrabold mt-1.5 tabular-nums tracking-tight">{count.toLocaleString()}</div>
              <div className="text-sm font-semibold mt-1">{pct}%{" "}
                <span className="font-normal text-gray-600 text-xs">of {districtSelected ? district : "Odisha"}</span>
              </div>
              {isSelected && <div className="text-[10px] mt-1.5 opacity-50 font-medium">▼ Showing map &amp; rankings</div>}
            </button>
          );
        })}
      </div>

      {/* Main grid: 2/3 chart + 1/3 right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Map / stacked bar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold" style={{ color: sc.color }}>
                {districtSelected
                  ? `${district} — Project-wise AWC Distribution`
                  : `Odisha — % ${sc.label} by District`}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {districtSelected
                  ? "Stacked % distribution of Red / Yellow / Green AWCs per project"
                  : "Click a district on the map to drill in · Darker shade = higher % of selected status"}
              </div>
            </div>
            {!districtSelected && (
              <ViewToggle options={["Map", "Graph View"]} value={view}
                onChange={(v) => setView(v as typeof view)} />
            )}
          </div>

          {districtSelected ? (
            <div style={{ height: Math.max(260, projectStackedData.length * 36) }}>
              <ResponsiveContainer>
                <BarChart data={projectStackedData} layout="vertical" margin={{ left: 120, right: 30 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} interval={0} />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === "R" ? "🔴 Red" : name === "Y" ? "🟡 Yellow" : "🟢 Green"]}
                    labelFormatter={(l) => `Project: ${l}`}
                  />
                  <Bar dataKey="R" stackId="a" name="R" fill="#C62828" />
                  {/* <Bar dataKey="Y" stackId="a" name="Y" fill="#F57F17" /> */}
                  <Bar dataKey="Y" stackId="a" name="Y" fill="#EAB308" />
                  <Bar dataKey="G" stackId="a" name="G" fill="#2E7D32" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : view === "Map" ? (
            <div style={{ height: 430 }}>
              <OdishaMap
                layer="coverage"
                layerKey="ryg"
                layerLabel={mapLayerLabel}
                getDistrictValue={(d) => {
                  const ryg = getRYGForDistrict(d);
                  return ryg && ryg.total > 0 ? Math.round(ryg[selectedStatus] / ryg.total * 100) : null;
                }}
                getDistrictColor={() => "green" /* not used — overridden by getDistrictFill */}
                getDistrictFill={getDistrictFillHex}
                legendItems={[
                  { color: `rgb(${sc.fillLight.join(",")})`, label: "Low %" },
                  { color: `rgb(${sc.fillDark.map((v, i) => Math.round(sc.fillLight[i] + (v - sc.fillLight[i]) * 0.5)).join(",")})`, label: "Medium %" },
                  { color: `rgb(${sc.fillDark.join(",")})`, label: "High %" },
                ]}
                onDistrictClick={(d) => setDistrict(d)}
              />
            </div>
          ) : (
            <div style={{ height: 510 }}>
              <ResponsiveContainer>
                <BarChart data={districtStackedData} layout="vertical" margin={{ left: 90, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} interval={0} />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === "R" ? "🔴 Red" : name === "Y" ? "🟡 Yellow" : "🟢 Green"]}
                    labelFormatter={(l) => `District: ${l}`}
                  />
                  <Bar dataKey="R" stackId="a" name="R" fill="#C62828" />
                  {/* <Bar dataKey="Y" stackId="a" name="Y" fill="#F57F17" /> */}
                  <Bar dataKey="Y" stackId="a" name="Y" fill="#EAB308" />
                  <Bar dataKey="G" stackId="a" name="G" fill="#2E7D32" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Top 3 */}
          <div className="rounded-xl border p-4" style={{ background: sc.bg }}>
            <div className="text-xs font-bold mb-3" style={{ color: sc.color }}>
              Top 3 — {districtSelected ? "Projects" : "Districts"} by {sc.label}
            </div>
            {(districtSelected ? top3Projects : top3Districts).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold opacity-40 w-4">#{i + 1}</span>
                  <span className="text-sm font-medium text-gray-800 truncate capitalize">{item.name}</span>
                </div>
                <b className="text-base shrink-0 ml-2 tabular-nums" style={{ color: sc.color }}>{item.pct.toFixed(1)}%</b>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <Card>
            <div className="text-xs font-bold text-gray-600 mb-3">Actions</div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const target = districtSelected ? district : "all of Odisha";
                  toast.error(`📋 Notice sent to ${currentRYG.R.toLocaleString()} Red AWCs in ${target}`);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-[#FFEBEE] text-[#C62828] border border-red-200 text-sm font-semibold hover:bg-red-100 transition text-left"
              >
                📋 Send Notice
                <span className="block text-xs font-normal opacity-70">{currentRYG.R.toLocaleString()} Red AWCs{districtSelected ? ` in ${district}` : ""}</span>
              </button>
              <button
                onClick={() => {
                  const target = districtSelected ? district : "all of Odisha";
                  toast.success(`🏆 Reward notice sent to ${currentRYG.G.toLocaleString()} Green AWCs in ${target}`);
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-[#E8F5E9] text-[#2E7D32] border border-green-200 text-sm font-semibold hover:bg-green-100 transition text-left"
              >
                🏆 Reward AWCs
                <span className="block text-xs font-normal opacity-70">{currentRYG.G.toLocaleString()} Green AWCs{districtSelected ? ` in ${district}` : ""}</span>
              </button>
              <button
                onClick={handleDownloadLineList}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-semibold transition text-left bg-[#E8F4FD] text-gray-800 border-blue-200 hover:bg-blue-100"
              >
                ⬇ Download {districtSelected ? "Line List" : "State CSV"}
                <span className="block text-xs font-normal opacity-70">
                  {districtSelected ? `${getAWCsForDistrict(district).length.toLocaleString()} AWCs — ${district}` : "Complete dataset for all districts"}
                </span>
              </button>
            </div>
          </Card>

          {/* District AWC breakdown summary */}
          {/* <Hidden by user request> */}
          {false && districtSelected && (
            <Card>
              <div className="text-xs font-bold text-gray-600 mb-2">{district} — AWC Status</div>
              {(["R", "Y", "G"] as const).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const ryg = getRYGForDistrict(district);
                const count = ryg?.[s] ?? 0;
                const pct = ryg?.total > 0 ? (count / ryg.total * 100).toFixed(1) : "0";
                return (
                  <div key={s} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: cfg.color }} />
                      <span className="text-sm text-gray-700">{cfg.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm tabular-nums" style={{ color: cfg.color }}>{count.toLocaleString()}</span>
                      <span className="text-[11px] text-gray-400 ml-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      {activeCheck && <DQCheckModal check={activeCheck} onClose={() => setActiveCheck(null)} />}
    </div>
  );
}

function DQCheckModal({ check, onClose }: { check: DQCheck; onClose: () => void }) {
  const ranked = useMemo(() => {
    return DISTRICTS.map((d) => {
      const pct = districtCheckFlaggedPct(d, check.num);
      const awcs = districtDQData[d]?.awcs ?? 0;
      return { name: d, pct, affectedCount: Math.round(awcs * pct / 100) };
    }).sort((a, b) => b.affectedCount - a.affectedCount).slice(0, 10);
  }, [check.num]);

  const statusColor = colorForFlagged(check.stateRate);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <aside className="bg-white w-[520px] h-full p-5 shadow-2xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-[11px] text-gray-500">Check #{check.num} · {check.group}</div>
            <h3 className="text-lg font-bold text-gray-800">{check.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
        </div>
        <div className="text-sm text-gray-700 mb-3">{check.detail}</div>
        <div className="bg-[#FFF3E0] rounded p-2 text-xs mb-3 flex items-center gap-3">
          <div>
            <span className="font-bold text-sm">{check.stateRate}%</span>
            <span className="text-gray-600 ml-1">state average</span>
          </div>
          <span className="px-2 py-0.5 rounded font-bold text-[11px]"
            style={{
              background: statusColor === "red" ? "#FFEBEE" : statusColor === "amber" ? "#FFF8E1" : "#E8F5E9",
              color: statusColor === "red" ? "#C62828" : statusColor === "amber" ? "#B07700" : "#2E7D32"
            }}>
            {statusColor === "red" ? "Alert" : statusColor === "amber" ? "Watch" : "Good"}
          </span>
        </div>
        <div className="text-xs font-bold text-gray-600 mb-2">District breakdown — top 10 by AWCs affected</div>
        <table className="w-full text-xs mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-2 py-1">District</th>
              <th className="text-right px-2 py-1">AWCs affected</th>
              <th className="text-right px-2 py-1">District rate</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => {
              const c = colorForFlagged(r.pct);
              return (
                <tr key={r.name} className={i % 2 ? "bg-gray-50" : ""}>
                  <td className="px-2 py-1 font-medium">{r.name}</td>
                  <td className="px-2 py-1 text-right font-semibold text-gray-800">
                    {r.affectedCount.toLocaleString()}
                  </td>
                  <td className="px-2 py-1 text-right"
                    style={{ color: c === "red" ? "#C62828" : c === "amber" ? "#B07700" : "#2E7D32" }}>
                    {r.pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={() => toast.success(`Line list downloaded for ${check.name}`)}
          className="bg-[#f97316] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#0a4b6f]"
        >
          Download Line List
        </button>
      </aside>
    </div>
  );
}

// ============== PROGRAMME CONVERGENCE ==============

type ConvergenceXKey = "saksham_open" | "mamta_registered" | "subhadra_enrolled" | "poshan_weighed";
const CONVERGENCE_X_OPTIONS: { key: ConvergenceXKey; label: string; prog: string }[] = [
  { key: "saksham_open", label: "AWCs open on visit (Saksham)", prog: "Saksham" },
  { key: "mamta_registered", label: "PW registration rate (Mamta)", prog: "Mamta" },
  { key: "subhadra_enrolled", label: "Women enrolled (Subhadra)", prog: "Subhadra" },
  { key: "poshan_weighed", label: "Measurement Efficiency (POSHAN)", prog: "POSHAN" },
];

function dqScoreOf(d: string) {
  const dq = districtDQData[d];
  if (!dq) return 0;
  return Math.round((1 - dq.avg_score / 14) * 100);
}

function ProgrammeConvergence() {
  const [xKey, setXKey] = useState<ConvergenceXKey>("saksham_open");
  const xOpt = CONVERGENCE_X_OPTIONS.find((o) => o.key === xKey)!;

  const scatterData = useMemo(() => DISTRICTS.map((d) => {
    const xVal = districtProgramData[d]?.[xKey] ?? 0;
    const yVal = +(ptDistrictTrend[d]?.["Jul"]?.wasting ?? 0).toFixed(1);
    const dq = dqScoreOf(d);
    const awcs = districtDQData[d]?.awcs ?? 500;
    return { name: d, x: xVal, y: yVal, dq, awcs, color: dq >= 75 ? COLOR_HEX.green : dq >= 65 ? COLOR_HEX.amber : COLOR_HEX.red };
  }), [xKey]);

  // Pearson correlation
  const n = scatterData.length;
  const xMean = scatterData.reduce((s, p) => s + p.x, 0) / n;
  const yMean = scatterData.reduce((s, p) => s + p.y, 0) / n;
  const num = scatterData.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0);
  const den = Math.sqrt(
    scatterData.reduce((s, p) => s + (p.x - xMean) ** 2, 0) *
    scatterData.reduce((s, p) => s + (p.y - yMean) ** 2, 0)
  );
  const r = den === 0 ? 0 : +(num / den).toFixed(2);
  const corrLabel = r < -0.4 ? "moderate negative" : r < -0.2 ? "weak negative" : r < 0.2 ? "no clear" : r < 0.4 ? "weak positive" : "moderate positive";

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <div className="text-sm font-bold text-gray-800">Programme Convergence</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Does a stronger X-axis programme correlate with lower wasting? · Jul 2026 · 30 districts
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-semibold">X axis:</span>
            {CONVERGENCE_X_OPTIONS.map((o) => (
              <button key={o.key} onClick={() => setXKey(o.key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border ${xKey === o.key ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-300"
                  }`}
                style={xKey === o.key ? { background: "#f97316" } : undefined}>
                {o.prog}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2 px-1">
          <span className="text-xs text-gray-600">
            Correlation (r = <b style={{ color: r < -0.2 ? "#2E7D32" : r > 0.2 ? "#C62828" : "#6B7280" }}>{r}</b>):{" "}
            <span className="italic">{corrLabel} relationship</span> between {xOpt.label.toLowerCase()} and PT wasting.
          </span>
        </div>

        <div className="h-[480px]">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <XAxis type="number" dataKey="x" name={xOpt.label} unit="%" domain={["auto", "auto"]}
                tick={{ fontSize: 11 }}
                label={{ value: xOpt.label, position: "insideBottom", offset: -15, fontSize: 11, fill: "#6B7280" }} />
              <YAxis type="number" dataKey="y" name="PT Wasting %" unit="%" domain={["auto", "auto"]}
                tick={{ fontSize: 11 }}
                label={{ value: "PT Wasting % (Jul 2026)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#6B7280" }} />
              <ZAxis type="number" dataKey="awcs" range={[40, 200]} name="AWCs" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 text-xs">
                      <div className="font-bold text-gray-800 mb-1">{d.name}</div>
                      <div>{xOpt.label}: <b>{d.x}%</b></div>
                      <div>PT Wasting: <b style={{ color: d.y > 5 ? "#C62828" : "#2E7D32" }}>{d.y}%</b></div>
                      <div>DQ Score: <b style={{ color: d.color }}>{d.dq}%</b></div>
                      <div className="text-gray-500">{d.awcs.toLocaleString()} AWCs</div>
                    </div>
                  );
                }}
              />
              {[COLOR_HEX.green, COLOR_HEX.amber, COLOR_HEX.red].map((col) => (
                <Scatter
                  key={col}
                  data={scatterData.filter((p) => p.color === col)}
                  fill={col}
                  fillOpacity={0.85}
                  name={col === COLOR_HEX.green ? "Good DQ (≥75%)" : col === COLOR_HEX.amber ? "Watch DQ (65–74%)" : "Alert DQ (<65%)"}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-4 justify-center text-[11px] mt-1">
          {[
            { color: COLOR_HEX.green, label: "DQ ≥75% (Good)" },
            { color: COLOR_HEX.amber, label: "DQ 65–74% (Watch)" },
            { color: COLOR_HEX.red, label: "DQ <65% (Alert)" },
          ].map(({ color, label }) => (
            <span key={color} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
          <span className="text-gray-400">· circle size = number of AWCs</span>
        </div>
        <div className="text-[10px] text-gray-400 italic text-center mt-1">
          {xOpt.prog !== "POSHAN" ? "🔵 X-axis values are illustrative — " : ""}PT wasting from POSHAN Tracker Jul 2026 · DQ from validata analysis
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-gray-800 mb-3">District Table — {xOpt.label} vs Wasting</div>
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2">District</th>
                <th className="text-right px-3 py-2">{xOpt.prog}</th>
                <th className="text-right px-3 py-2">Wasting</th>
                <th className="text-right px-3 py-2">DQ</th>
              </tr>
            </thead>
            <tbody>
              {[...scatterData].sort((a, b) => b.y - a.y).map((d, i) => (
                <tr key={d.name} className={i % 2 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-1.5 font-medium text-gray-800">{d.name}</td>
                  <td className="px-3 py-1.5 text-right text-gray-700">{d.x}%</td>
                  <td className="px-3 py-1.5 text-right font-bold" style={{ color: d.y > 5 ? "#C62828" : "#2E7D32" }}>{d.y}%</td>
                  <td className="px-3 py-1.5 text-right font-semibold" style={{ color: d.color }}>{d.dq}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
