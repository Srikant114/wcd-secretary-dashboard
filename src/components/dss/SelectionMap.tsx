import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const ODISHA_TOPO_URL =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/topojson/states/odisha.json";

function resolveDistrictName(props: Record<string, unknown>): string {
  return (
    (props.district as string) ||
    (props.NAME_2 as string) ||
    (props.dtname as string) ||
    (props.District as string) ||
    (props.name as string) ||
    "Unknown"
  );
}

export type SelectionMapProps = {
  /** districts to highlight with the fill colour */
  highlighted: string[];
  /** optional per-district fill override (e.g. colour by wasting) */
  fillFor?: (district: string) => string | null;
  /** districts that get an accent border (e.g. plan assigned) */
  outlined?: string[];
  fill?: string;
  height?: number;
};

export function SelectionMap({
  highlighted,
  fillFor,
  outlined = [],
  fill = "#0F6E6B",
  height = 200,
}: SelectionMapProps) {
  const set = new Set(highlighted);
  const outlineSet = new Set(outlined);
  return (
    <div className="w-full" style={{ height }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 3000, center: [84.5, 20.4] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={ODISHA_TOPO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = resolveDistrictName(geo.properties as Record<string, unknown>);
              const on = set.has(name);
              const custom = on && fillFor ? fillFor(name) : null;
              const outline = outlineSet.has(name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={on ? custom ?? fill : "#E5E7EB"}
                  stroke={outline ? "#0F6E6B" : "#FFFFFF"}
                  strokeWidth={outline ? 1.8 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
