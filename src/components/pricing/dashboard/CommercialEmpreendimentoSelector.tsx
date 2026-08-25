import React from "react";
import { Building2, Check, Filter, Layers, CheckSquare, Square, ChevronRight } from "lucide-react";
import { PriceTable, PricingUnit } from "../../../types/pricing";

interface CommercialEmpreendimentoSelectorProps {
  tables: PriceTable[];
  units: PricingUnit[];
  selectedTableIds: string[];
  isMultiSelect: boolean;
  onToggleMultiSelect: () => void;
  onSelectSingleTable: (tableId: string) => void;
  onToggleTableSelection: (tableId: string) => void;
  onSelectAllTables: () => void;
  formatCurrency: (val: number) => string;
  formatShortCurrency: (val: number) => string;
}

export const CommercialEmpreendimentoSelector: React.FC<CommercialEmpreendimentoSelectorProps> = ({
  tables,
  units,
  selectedTableIds,
  isMultiSelect,
  onToggleMultiSelect,
  onSelectSingleTable,
  onToggleTableSelection,
  onSelectAllTables,
  formatShortCurrency,
}) => {
  const isAllSelected = selectedTableIds.includes("ALL") || selectedTableIds.length === tables.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Filter className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Seleção de Empreendimentos para os Gráficos & Análises
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clique no empreendimento desejado para isolar seus dados ou ative a múltipla seleção para comparar projetos específicos:
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-select toggle button */}
          <button
            type="button"
            onClick={onToggleMultiSelect}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isMultiSelect
                ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {isMultiSelect ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-white" />
                <span>Múltipla Seleção Ativa</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ativar Comparativo (Múltiplos)</span>
              </>
            )}
          </button>

          {isMultiSelect && (
            <button
              type="button"
              onClick={onSelectAllTables}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {isAllSelected ? "Desmarcar Todos" : "Selecionar Todos"}
            </button>
          )}
        </div>
      </div>

      {/* Grid of Empreendimento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card: Todos (Consolidado) */}
        {!isMultiSelect && (
          <button
            type="button"
            onClick={() => onSelectSingleTable("ALL")}
            className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
              selectedTableIds.includes("ALL")
                ? "bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/40"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Portfólio Geral
              </span>
              {selectedTableIds.includes("ALL") && (
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="font-black text-xs mt-1 truncate">🏢 Todos Consolidado</div>
            <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/60">
              <span className="font-semibold">{tables.length} Empreendimentos</span>
              <span className="font-mono font-bold text-amber-400">Geral</span>
            </div>
          </button>
        )}

        {/* Individual Cards for each Table / SPE */}
        {tables.map((t) => {
          const tableUnits = units.filter((u) => u.tableId === t.id);
          const totalUnits = tableUnits.length || t.totalUnitsCount;
          const soldUnits = tableUnits.filter((u) => u.status === "Vendida").length || t.soldUnitsCount;
          const vsoPercent = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
          const totalVgv = tableUnits.length > 0
            ? tableUnits.reduce((sum, u) => sum + u.basePrice, 0)
            : t.totalVgv;

          const isSelected = isMultiSelect
            ? selectedTableIds.includes(t.id) || selectedTableIds.includes("ALL")
            : selectedTableIds.includes(t.id);

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (isMultiSelect) {
                  onToggleTableSelection(t.id);
                } else {
                  onSelectSingleTable(t.id);
                }
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/40"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider truncate max-w-[130px] ${
                  isSelected ? "text-indigo-300" : "text-slate-400"
                }`}>
                  {t.speName ? t.speName.replace("SPE LTDA", "").trim() : "ARV SPE"}
                </span>

                {isMultiSelect ? (
                  isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )
                ) : (
                  isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )
                )}
              </div>

              <div className="font-black text-xs mt-1 truncate" title={t.name}>
                {t.name.replace("Tabela de Vendas", "").replace("Tabela Comercial", "").replace("Tabela de Lançamento", "").trim()}
              </div>

              <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/60 font-mono">
                <span className="text-[10px] text-slate-400">
                  {soldUnits}/{totalUnits} un ({vsoPercent.toFixed(0)}%)
                </span>
                <span className={`font-bold ${isSelected ? "text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                  {formatShortCurrency(totalVgv)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
