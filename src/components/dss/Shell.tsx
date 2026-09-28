import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, Home, FileText, ExternalLink, Download } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DssProvider, useDss } from "@/lib/dss-context";
import { MODULES, DISTRICTS, type ModuleKey } from "@/lib/dss-data";
import { toast } from "sonner";
import odishaLogo from "@/assets/images/odiLogo.png";

function Header() {
  return (
    <header
      className="w-full text-black shadow-md px-3 sm:px-6 py-2.5 z-40 shrink-0 transition-colors border-b border-border relative"
      style={{ backgroundImage: "var(--header-bg)" }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Branding (SSO Style) */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none min-w-0">
          <img src={odishaLogo} alt="Government of Odisha Emblem" className="h-12 w-12 object-contain rounded-full shrink-0" />

          <div className="flex flex-col justify-center min-w-0">
            <div className="inline-block border-b border-black pb-0.5 max-w-full">
              <h1 className="text-[12px] sm:text-[14px] lg:text-[15.5px] font-extrabold text-black tracking-wide leading-tight truncate sm:whitespace-nowrap drop-shadow-xs">
                {/* GOVERNMENT OF ODISHA —  */}
                Women &amp; Child Department
              </h1>
            </div>
            <p className="text-[11px] sm:text-[12.5px] lg:text-[13.5px] font-bold text-primary leading-tight pt-0.5 tracking-tight truncate sm:whitespace-nowrap">
              {/* Insights for Secretary, WCD Dashboard */}
              GOVERNMENT OF ODISHA
            </p>
          </div>
        </div>

        {/* Right Controls (SSO Style) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            {[Settings, Home, FileText, ExternalLink].map((Icon, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-lg bg-white/30 hover:bg-white/50 active:bg-white/60 border border-black/20 flex items-center justify-center text-black transition-colors shadow-sm cursor-pointer"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          <div className="relative ml-1">
            <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/15 active:bg-white/22 transition-colors cursor-pointer">
              <div className="text-end hidden xl:block">
                <p className="text-xs font-bold text-black leading-tight">Secretary</p>
                <p className="text-[10px] text-black/80 leading-tight">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white border border-black/20 flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SubHeader() {
  return null;
}

function TopTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/", label: "Overview" },
    { to: "/deep-dive", label: "Deep Dive" },
    { to: "/secretary", label: "Secretary View" },
  ];
  return (
    <div className="flex gap-5 items-center px-2 py-0.5 w-fit">
      {tabs.map((t) => {
        const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`text-[13px] transition flex items-center gap-1.5 pb-1 border-b-2 ${active
              ? "text-black font-extrabold border-[#f97316]"
              : "text-gray-500 font-semibold border-transparent hover:text-black hover:border-gray-300"
              }`}
          >
            {active && <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />}
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function Sidebar() {
  const { module, setModule } = useDss();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-16 bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-2 flex flex-col items-center gap-4 shrink-0 h-[calc(100vh-80px)] mt-4 ml-4 z-10 transition-all duration-300">
        <button onClick={() => setCollapsed(false)} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => setModule(m.key as ModuleKey)}
            title={m.label}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${module === m.key ? "bg-[#f97316] text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            {m.label.charAt(0)}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-56 bg-white rounded-xl shadow-sm border border-gray-100 py-3 px-2 flex flex-col gap-0.5 shrink-0 h-[calc(100vh-80px)] mt-4 ml-4 overflow-y-auto z-10 transition-all duration-300">
      <div className="flex items-center justify-between px-3 mb-1 mt-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Navigation</div>
        <button onClick={() => setCollapsed(true)} className="text-gray-400 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      {MODULES.map((m) => {
        const active = module === m.key;
        return (
          <button
            key={m.key}
            onClick={() => setModule(m.key as ModuleKey)}
            className={`text-left px-3 py-2 rounded-lg transition-all ${active
              ? "bg-[#f97316] shadow-sm"
              : "bg-transparent hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-gray-300"}`} />
              <div className={`text-[12px] ${active ? "text-white font-bold" : "text-gray-700 font-semibold"}`}>{m.label}</div>
            </div>
            <div className={`text-[10px] mt-0.5 ml-4 truncate ${active ? "text-white/90 font-medium" : "text-gray-400 font-medium"}`}>{m.subtitle}</div>
          </button>
        );
      })}
    </aside>
  );
}

export function FiltersBar() {
  const { district, setDistrict, dataMode, setDataMode } = useDss();
  return (
    <div className="bg-white px-5 py-3 flex items-center gap-4 border-b border-gray-100 flex-wrap z-10 relative">
      <span className="text-xs font-semibold text-gray-700">Select date:</span>
      <button className="px-3 py-1 rounded-full bg-[#f97316] text-white text-[11px] font-semibold hover:bg-[#f97316]/90 transition shadow-sm">
        July 2026
      </button>
      <select
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          if (e.target.value !== "All Districts") {
            toast.info(`Block-level view for ${e.target.value} coming soon`);
          }
        }}
        className="ml-2 px-3 py-1.5 rounded-md border border-gray-200 text-xs bg-white outline-none focus:ring-1 focus:ring-[#f97316] shadow-sm"
      >
        <option>All Districts</option>
        {DISTRICTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className={dataMode === "admin" ? "font-bold text-[#f97316]" : "text-gray-500"}>
          Admin Data (PT)
        </span>
        <button
          onClick={() => setDataMode(dataMode === "admin" ? "survey" : "admin")}
          className={`flex items-center w-10 h-5 rounded-full p-0.5 transition-colors border-2 focus:outline-none ${dataMode === "survey" ? "border-[#f97316] bg-[#f97316]/10" : "border-gray-200 bg-gray-50"
            }`}
        >
          <span
            className={`block w-3 h-3 rounded-full bg-[#f97316] transition-transform ${dataMode === "survey" ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
        <span className={dataMode === "survey" ? "font-bold text-[#f97316]" : "text-gray-500"}>
          Phone Survey
        </span>
      </div>
    </div>
  );
}

export function DownloadButton() {
  return (
    <button
      onClick={() => toast.success("Report downloaded as PDF")}
      className="p-2 rounded hover:bg-accent text-muted-foreground transition"
      title="Download"
    >
      <Download size={18} />
    </button>
  );
}

/** Full-width shell for Secretary Screen 2 — no sidebar, no top tabs, no filter bar. */
export function DssReviewShell({ children, onBack }: { children: ReactNode; onBack?: () => void }) {
  return (
    <DssProvider>
      <div className="min-h-screen flex flex-col bg-transparent relative h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 items-start h-[calc(100vh-64px)] overflow-hidden bg-[#eef1f6]">
          <div className="flex-1 flex flex-col h-[calc(100vh-80px)] mt-4 mx-4 max-w-7xl mx-auto w-full overflow-hidden">
            <div className="mb-2 px-1 flex gap-4 items-center">
              <button
                onClick={onBack}
                className="text-[12px] text-[#4f46e5] font-bold hover:underline bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
              >
                ← Back to District Selection
              </button>
            </div>
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <main className="flex-1 p-5 overflow-y-auto">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </DssProvider>
  );
}

/** Shell with header + tabs but no sidebar or filter bar — used for Secretary select/summary screens */
export function DssTabShell({ children }: { children: ReactNode }) {
  return (
    <DssProvider>
      <div className="min-h-screen flex flex-col bg-transparent relative h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 items-start h-[calc(100vh-64px)] overflow-hidden bg-[#eef1f6]">
          <div className="flex-1 flex flex-col h-[calc(100vh-80px)] mt-4 mx-4 overflow-hidden">
            <div className="mb-2 px-1">
              <TopTabs />
            </div>
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </DssProvider>
  );
}

export function DssShell({ children }: { children: ReactNode }) {
  return (
    <DssProvider>
      <div className="min-h-screen flex flex-col bg-transparent relative h-screen overflow-hidden">
        <Header />
        <SubHeader />
        <div className="flex flex-1 items-start h-[calc(100vh-64px)] overflow-hidden bg-[#eef1f6]">
          <Sidebar />
          <div className="flex-1 flex flex-col h-[calc(100vh-80px)] mt-4 mx-4 overflow-hidden">
            <div className="mb-2 px-1">
              <TopTabs />
            </div>
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <FiltersBar />
              <main className="flex-1 p-5 overflow-y-auto">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </DssProvider>
  );
}
