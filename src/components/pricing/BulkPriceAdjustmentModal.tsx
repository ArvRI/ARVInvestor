import React, { useState } from "react";
import { X, TrendingUp, DollarSign, Percent, AlertCircle, Check, ArrowRight } from "lucide-react";
import { PriceTable, PricingUnit } from "../../types/pricing";
import { CUBService } from "../../services/pricing/CUBService";

interface BulkPriceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: PriceTable;
  units: PricingUnit[];
  onApplyAdjustment: (
    updatedUnits: PricingUnit[],
    updatedTable: PriceTable,
    adjustmentType: "cub" | "percent",
    adjustmentValue: number
  ) => void;
}

export const BulkPriceAdjustmentModal: React.FC<BulkPriceAdjustmentModalProps> = ({
  isOpen,
  onClose,
  table,
  units,
  onApplyAdjustment,
}) => {
  if (!isOpen) return null;

  const [adjustmentMode, setAdjustmentMode] = useState<"cub" | "percent">("percent");
  const [percentValue, setPercentValue] = useState<number>(3.5);
  const [newCubRate, setNewCubRate] = useState<number>(table.cubReferenceValue * 1.035);
  const [applyOnlyToAvailable, setApplyOnlyToAvailable] = useState<boolean>(true);

  // Calcula impacto em tempo real
  const targetUnits = units.filter((u) => u.tableId === table.id);
  const affectedUnits = applyOnlyToAvailable
    ? targetUnits.filter((u) => u.status === "Disponível" || u.status === "Reservada")
    : targetUnits;

  const currentAvailableVgv = affectedUnits.reduce((acc, u) => acc + u.basePrice, 0);

  let newAvailableVgv = 0;
  if (adjustmentMode === "percent") {
    newAvailableVgv = currentAvailableVgv * (1 + percentValue / 100);
  } else {
    // Calculado pelo novo CUB
    newAvailableVgv = affectedUnits.reduce((acc, u) => acc + u.cubPrice * newCubRate, 0);
  }

  const vgvDifference = newAvailableVgv - currentAvailableVgv;
  const percentDelta =
    adjustmentMode === "percent"
      ? percentValue
      : ((newCubRate - table.cubReferenceValue) / table.cubReferenceValue) * 100;

  const handleApply = () => {
    const adjustedUnits = units.map((u) => {
      if (u.tableId !== table.id) return u;
      if (applyOnlyToAvailable && u.status === "Vendida") return u;

      let newBasePrice = u.basePrice;
      let newCubPrice = u.cubPrice;

      if (adjustmentMode === "percent") {
        newBasePrice = Math.round(u.basePrice * (1 + percentValue / 100));
        newCubPrice = CUBService.brlToCub(newBasePrice, table.cubReferenceValue);
      } else {
        newBasePrice = Math.round(u.cubPrice * newCubRate);
        newCubPrice = u.cubPrice; // Quantidade de CUBs mantida
      }

      const newPricePerM2 = Number((newBasePrice / u.privateAreaM2).toFixed(2));
      const newCubPerM2 = Number((newCubPrice / u.privateAreaM2).toFixed(2));

      return {
        ...u,
        basePrice: newBasePrice,
        cubPrice: newCubPrice,
        pricePerM2: newPricePerM2,
        cubPerM2: newCubPerM2,
      };
    });

    const updatedTable: PriceTable = {
      ...table,
      cubReferenceValue: adjustmentMode === "cub" ? newCubRate : table.cubReferenceValue,
      totalVgv: table.totalVgv + vgvDifference,
      availableVgv: table.availableVgv + vgvDifference,
      averagePricePerM2: Number((table.averagePricePerM2 * (1 + percentDelta / 100)).toFixed(2)),
      updatedAt: new Date().toISOString(),
      updatedBy: `Reajuste em Lote (${percentDelta >= 0 ? "+" : ""}${percentDelta.toFixed(2)}%)`,
    };

    onApplyAdjustment(
      adjustedUnits,
      updatedTable,
      adjustmentMode,
      adjustmentMode === "percent" ? percentValue : newCubRate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Reajuste em Lote de Preços da Tabela
              </h2>
              <p className="text-xs text-slate-500">{table.name} ({table.version})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setAdjustmentMode("percent")}
              className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                adjustmentMode === "percent"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Percent className="w-4 h-4" /> Reajuste Percentual (%)
            </button>
            <button
              onClick={() => setAdjustmentMode("cub")}
              className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                adjustmentMode === "cub"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Atualizar Taxa CUB (R$)
            </button>
          </div>

          {/* Adjustment Inputs */}
          {adjustmentMode === "percent" ? (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Percentual de Reajuste Comercial (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={percentValue}
                  onChange={(e) => setPercentValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-400">%</span>
              </div>
              <div className="flex gap-2 pt-1">
                {[1.5, 2.5, 3.5, 5.0, 7.0].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercentValue(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-[11px] font-bold"
                  >
                    +{p}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Novo Valor do CUB/SC de Referência (R$)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={newCubRate}
                  onChange={(e) => setNewCubRate(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                CUB Atual: R$ {table.cubReferenceValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / m²
              </p>
            </div>
          )}

          {/* Scope Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Aplicar apenas às unidades Disponíveis e Reservadas
              </span>
              <span className="text-[11px] text-slate-500">
                Preserva o valor histórico contratado das unidades já vendidas.
              </span>
            </div>
            <input
              type="checkbox"
              checked={applyOnlyToAvailable}
              onChange={(e) => setApplyOnlyToAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          {/* Impact Simulation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
            <h4 className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-300 tracking-wider">
              Simulação de Impacto no VGV em Estoque
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">VGV Atual Afetado:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  R$ {currentAvailableVgv.toLocaleString("pt-BR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Novo VGV Estimado:</span>
                <span className="font-black font-mono text-blue-600 dark:text-blue-400">
                  R$ {newAvailableVgv.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Acréscimo de Receita Potencial:
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +{vgvDifference >= 0 ? "R$ " + vgvDifference.toLocaleString("pt-BR") : "R$ 0"} (
                  {percentDelta >= 0 ? "+" : ""}
                  {percentDelta.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" /> Aplicar Reajuste em {affectedUnits.length} Unidades
          </button>
        </div>
      </div>
    </div>
  );
};
