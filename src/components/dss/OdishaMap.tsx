import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import {
  COLOR_HEX,
  colorForCoverage,
  colorForOutcome,
  districtOutcomeData,
  districtProgramData,
  type LayerKind,
} from "@/lib/dss-data";

const ODISHA_TOPO_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/topojson/states/odisha.json";

const DISTRICT_NAME_MAP: Record<string, string> = {
  "Angul": "Anugola",
  "Balasore": "Baleshwar",
  "Bargarh": "Baragada",
  "Cuttack": "Kataka",
  "Deogarh": "Debagada",
  "Jagatsinghpur": "Jagatsinghapur",
  "Jajapur": "Jajpur",
  "Jajpur": "Jajpur",
  "Kandhamal": "Kandhamala",
  "Kendrapara": "Kendrapada",
  "Keonjhar": "Kendujhar",
  "Nayagarh": "Nayagada",
  "Sundergarh": "Sundaragada",
  "Sundargarh": "Sundaragada",
  "Nabarangapur": "Nabarangpur",
  "Nabarangpur": "Nabarangpur",
  "Baudh": "Boudh",
  "Sonapur": "Subarnapur"
};

function resolveDistrictName(props: Record<string, unknown>): string {
  const rawName = (
    (props.district as string) ||
    (props.NAME_2 as string) ||
    (props.dtname as string) ||
    (props.District as string) ||
    (props.name as string) ||
    "Unknown"
  );
  return DISTRICT_NAME_MAP[rawName] || rawName;
}

function valueFor(district: string, kind: LayerKind, key: string): number | null {
  if (kind === "outcome") {
    const o = districtOutcomeData[district];
    if (!o) return null;
    return (o as any)[key] ?? null;
  }
  const p = districtProgramData[district];
  if (!p) return null;
  return p[key] ?? null;
}

export type OdishaMapProps = {
  layer: LayerKind;
  layerKey: string;
  layerLabel?: string;
  onDistrictClick?: (district: string) => void;
  showLegend?: boolean;
  selectedDistrict?: string | null;
  /** Override data lookup — if provided, used instead of districtProgramData/districtOutcomeData */
  getDistrictValue?: (district: string) => number | null;
  /** Override colour function — if provided, used instead of colorForCoverage/colorForOutcome */
  getDistrictColor?: (value: number | null) => "green" | "amber" | "red";
  /** Direct hex fill color per district — overrides getDistrictColor entirely */
  getDistrictFill?: (district: string) => string;
  /** Override legend entries */
  legendItems?: { color: string; label: string }[];
};

export function OdishaMap({
  layer,
  layerKey,
  layerLabel,
  onDistrictClick,
  showLegend = true,
  selectedDistrict = null,
  getDistrictValue,
  getDistrictColor,
  getDistrictFill,
  legendItems,
}: OdishaMapProps) {
  const [hover, setHover] = useState<{ name: string; value: number | null; x: number; y: number } | null>(null);
  const isOutcome = layer === "outcome";

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 4200, center: [84.5, 20.5] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={ODISHA_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const distName = resolveDistrictName(geo.properties as Record<string, unknown>);
                const value = getDistrictValue ? getDistrictValue(distName) : valueFor(distName, layer, layerKey);
                const c = getDistrictColor ? getDistrictColor(value) : (isOutcome ? colorForOutcome(value) : colorForCoverage(value));
                const perfFill = getDistrictFill ? getDistrictFill(distName) : COLOR_HEX[c];
                const dimmed = !!selectedDistrict && selectedDistrict !== distName;
                const fill = dimmed ? "#E0E0E0" : perfFill;
                const opacity = dimmed ? 0.4 : 1;
                const stroke = selectedDistrict === distName ? "#0D5E8A" : "#FFFFFF";
                const strokeWidth = selectedDistrict === distName ? 1.6 : 0.6;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onMouseEnter={(e) =>
                      setHover({
                        name: distName,
                        value,
                        x: (e as any).clientX,
                        y: (e as any).clientY,
                      })
                    }
                    onMouseMove={(e) =>
                      setHover((h) =>
                        h ? { ...h, x: (e as any).clientX, y: (e as any).clientY } : h,
                      )
                    }
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onDistrictClick?.(distName)}
                    style={{
                      default: { outline: "none", cursor: onDistrictClick ? "pointer" : "default" },
                      hover: { outline: "none", opacity: dimmed ? 0.55 : 0.85, filter: "brightness(1.08)" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hover && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <div className="font-bold">{hover.name}</div>
          <div>
            {layerLabel ?? layerKey}: {hover.value === null ? "—" : `${hover.value}%`}
          </div>
        </div>
      )}

      {showLegend && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 rounded shadow px-3 py-2 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-gray-700">Legend</span>
          <div className="flex items-center gap-3">
            {legendItems ? (
              legendItems.map((item) => <LegendSwatch key={item.label} color={item.color} label={item.label} />)
            ) : isOutcome ? (
              <>
                <LegendSwatch color={COLOR_HEX.red} label="Critical (>25%)" />
                <LegendSwatch color={COLOR_HEX.amber} label="Moderate (18–25%)" />
                <LegendSwatch color={COLOR_HEX.green} label="On Track (<18%)" />
              </>
            ) : (
              <>
                <LegendSwatch color={COLOR_HEX.green} label=">85%" />
                <LegendSwatch color={COLOR_HEX.amber} label="70–85%" />
                <LegendSwatch color={COLOR_HEX.red} label="<70%" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="text-gray-700">{label}</span>
    </div>
  );
}
