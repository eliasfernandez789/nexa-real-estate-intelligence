"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Temperatura } from "@/lib/pedidos";

export type Vista = "red" | "mios" | "urgentes";
export type EstadoFiltro = "activos" | "todos" | "cerrados" | "archivados";
export type OrdenFiltro = "reciente" | "temperatura" | "presupuesto";

interface FiltersState {
  vista: Vista;
  setVista: (v: Vista) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  temperaturas: Set<Temperatura>;
  toggleTemperatura: (t: Temperatura) => void;
  tipos: Set<string>;
  toggleTipo: (t: string) => void;
  zonas: Set<string>;
  toggleZona: (z: string) => void;
  estadoFiltro: EstadoFiltro;
  setEstadoFiltro: (e: EstadoFiltro) => void;
  soloOficina: boolean;
  setSoloOficina: (v: boolean) => void;
  orden: OrdenFiltro;
  setOrden: (o: OrdenFiltro) => void;
  limpiar: () => void;
}

const FiltersContext = createContext<FiltersState | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [vista, setVista] = useState<Vista>("red");
  const [busqueda, setBusqueda] = useState("");
  const [temperaturas, setTemperaturas] = useState<Set<Temperatura>>(new Set());
  const [tipos, setTipos] = useState<Set<string>>(new Set());
  const [zonas, setZonas] = useState<Set<string>>(new Set());
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("activos");
  const [soloOficina, setSoloOficina] = useState(false);
  const [orden, setOrden] = useState<OrdenFiltro>("reciente");

  const toggleTemperatura = (t: Temperatura) =>
    setTemperaturas((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const toggleTipo = (t: string) =>
    setTipos((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const toggleZona = (z: string) =>
    setZonas((prev) => {
      const next = new Set(prev);
      if (next.has(z)) next.delete(z);
      else next.add(z);
      return next;
    });

  const limpiar = () => {
    setBusqueda("");
    setTemperaturas(new Set());
    setTipos(new Set());
    setZonas(new Set());
    setEstadoFiltro("activos");
  };

  const value = useMemo<FiltersState>(
    () => ({
      vista,
      setVista,
      busqueda,
      setBusqueda,
      temperaturas,
      toggleTemperatura,
      tipos,
      toggleTipo,
      zonas,
      toggleZona,
      estadoFiltro,
      setEstadoFiltro,
      soloOficina,
      setSoloOficina,
      orden,
      setOrden,
      limpiar,
    }),
    [vista, busqueda, temperaturas, tipos, zonas, estadoFiltro, soloOficina, orden],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersState {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters debe usarse dentro de <FiltersProvider>");
  return ctx;
}
