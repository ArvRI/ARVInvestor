import React from "react";
import {
  BarChart3,
  Layers,
  PieChart,
  Tag,
  DollarSign,
  Filter,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Building2,
  Users,
} from "lucide-react";
import { UnitStatus } from "../../../types/pricing";

export type ChartViewTab = "geral" | "espelho_corretores" | "tipologia" | "comparativo_spe" | "pavimentos" | "preco_m2" | "fluxo_recebiveis";
export type ChartMetric = "vgv" | "unidades" | "area";

interface CommercialChartControlsProps {
  activeTab: ChartViewTab;
  onChangeTab: (tab: ChartViewTab) => void;
  metric: ChartMetric;
  onChangeMetric: (metric: ChartMetric) => void;
  selectedStatuses: UnitStatus[];
  onToggleStatus: (status: UnitStatus) => void;
  availableTipologies: string[];
  selectedTipologies: string[];
  onToggleTipology: (type: string) => void;
  onSelectAllTipologies: () => void;
}

export const CommercialChartControls: React.FC<CommercialChartControlsProps> = ({
  activeTab,
  onChangeTab,
  metric,
  onChangeMetric,
  selectedStatuses,
  onToggleStatus,
  availableTipologies,
  selectedTipologies,
  onToggleTipology,
  onSelectAllTipologies,
}) => {
  const tabs: { id: ChartViewTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "geral", label: "Visão Geral Integrada", icon: <PieChart className="w-3.5 h-3.5" /> },
    { id: "espelho_corretores", label: "Espelho de Estoque (Corretores)", icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />, badge: "Vendas" },
    { id: "tipologia", label: "VGV por Tipologia", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "comparativo_spe", label: "Comparativo entre Projetos", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "pavimentos", label: "Absorção por Pavimento", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "preco_m2", label: "Preço Médio / m² & CUB", icon: <Tag className="w-3.5 h-3.5" /> },
    { id: "fluxo_recebiveis", label: "Fluxo de Recebíveis", icon: <DollarSign className="w-3.5 h-3.5" /> },
  ];

  const allStatuses: UnitStatus[] = ["Disponível", "Vendida", "Reservada", "Bloqueada"];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Top row: Tab Switcher & Metric Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs for Chart View */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? tab.id === "espelho_corretores"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Metric Selector (VGV vs Unidades vs Area) */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-indigo-500" /> Métrica:
          </span>
          <button
            type="button"
            onClick={() => onChangeMetric("vgv")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              metric === "vgv"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            VGV (R$)
          </button>
          <button
            type="button"
            onClick={() => onChangeMetric("unidades")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              metric === "unidades"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Qtd Unidades
          </button>
          <button
            type="button"
            onClick={() => onChangeMetric("area")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              metric === "area"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Área (m²)
          </button>
        </div>
      </div>

      {/* Filter Row: Status Filters & Tipology Filters */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-500" /> Filtrar Status nos Gráficos:
          </span>
          {allStatuses.map((st) => {
            const isChecked = selectedStatuses.includes(st);
            const statusColors: Record<UnitStatus, { active: string; border: string }> = {
              Disponível: { active: "bg-emerald-600 text-white border-emerald-500", border: "border-emerald-200 dark:border-emerald-800" },
              Vendida: { active: "bg-indigo-600 text-white border-indigo-500", border: "border-indigo-200 dark:border-indigo-800" },
              Reservada: { active: "bg-amber-600 text-white border-amber-500", border: "border-amber-200 dark:border-amber-800" },
              Bloqueada: { active: "bg-slate-600 text-white border-slate-500", border: "border-slate-200 dark:border-slate-800" },
              Permuta: { active: "bg-purple-600 text-white border-purple-500", border: "border-purple-200 dark:border-purple-800" },
            };

            const cfg = statusColors[st] || { active: "bg-slate-600 text-white border-slate-500", border: "border-slate-200" };

            return (
              <button
                key={st}
                type="button"
                onClick={() => onToggleStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isChecked
                    ? `${cfg.active} shadow-xs`
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 opacity-60"
                }`}
              >
                {isChecked ? <Check className="w-3 h-3" /> : null}
                <span>{st}</span>
              </button>
            );
          })}
        </div>

        {/* Tipology Pills */}
        {availableTipologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Tipologias:
            </span>
            <button
              type="button"
              onClick={onSelectAllTipologies}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedTipologies.length === 0 || selectedTipologies.length === availableTipologies.length
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Todas
            </button>
            {availableTipologies.map((t) => {
              const isSelected = selectedTipologies.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggleTipology(t)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
