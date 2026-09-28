import { createContext, useContext, useState, type ReactNode } from "react";
import type { ModuleKey, OutcomeKey, PTOutcomeKey, LayerKind } from "./dss-data";
import { MODULE_INDICATORS } from "./dss-data";

type DssState = {
  module: ModuleKey;
  setModule: (m: ModuleKey) => void;
  district: string;
  setDistrict: (d: string) => void;
  dataMode: "admin" | "survey";
  setDataMode: (m: "admin" | "survey") => void;

  // What the map is currently colored by
  mapLayer: LayerKind;
  mapKey: string; // outcome key or indicator key
  setMapLayer: (kind: LayerKind, key: string) => void;

  selectedOutcome: PTOutcomeKey;
  setSelectedOutcome: (o: PTOutcomeKey) => void;

  selectedIndicatorKey: string;
  setSelectedIndicatorKey: (k: string) => void;
};

const Ctx = createContext<DssState | null>(null);

export function DssProvider({ children }: { children: ReactNode }) {
  const [module, setModuleState] = useState<ModuleKey>("poshan");
  const [district, setDistrict] = useState("All Districts");
  const [dataMode, setDataMode] = useState<"admin" | "survey">("admin");
  const [selectedOutcome, setSelectedOutcomeState] = useState<PTOutcomeKey>("wasting");
  const [selectedIndicatorKey, setSelectedIndicatorKeyState] = useState<string>("poshan_weighed");
  const [mapLayer, setMapLayerState] = useState<LayerKind>("outcome");
  const [mapKey, setMapKey] = useState<string>("wasting");

  const setMapLayer = (kind: LayerKind, key: string) => {
    setMapLayerState(kind);
    setMapKey(key);
  };

  const setSelectedOutcome = (o: PTOutcomeKey) => {
    setSelectedOutcomeState(o);
    setMapLayer("outcome", o);
  };

  const setSelectedIndicatorKey = (k: string) => {
    setSelectedIndicatorKeyState(k);
    setMapLayer("coverage", k);
  };

  const setModule = (m: ModuleKey) => {
    setModuleState(m);
    const highlighted = MODULE_INDICATORS[m].find((i) => i.highlight) ?? MODULE_INDICATORS[m][0];
    setSelectedIndicatorKeyState(highlighted.key);
    // Keep current map layer; do not auto-switch
  };

  return (
    <Ctx.Provider
      value={{
        module, setModule,
        district, setDistrict,
        dataMode, setDataMode,
        mapLayer, mapKey, setMapLayer,
        selectedOutcome, setSelectedOutcome,
        selectedIndicatorKey, setSelectedIndicatorKey,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDss() {
  const v = useContext(Ctx);
  if (!v) throw new Error("DssProvider missing");
  return v;
}
