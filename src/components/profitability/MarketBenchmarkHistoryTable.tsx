import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Percent,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { MarketBenchmarkEntry, MarketIndicator } from "../../types";

export const MarketBenchmarkHistoryTable: React.FC = () => {
  const {
    marketBenchmarkHistory,
    addMarketBenchmarkEntry,
    updateMarketBenchmarkEntry,
    deleteMarketBenchmarkEntry,
  } = useApp();

  const [selectedIndicator, setSelectedIndicator] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<MarketBenchmarkEntry | null>(null);

  // Form State
  const [formMonth, setFormMonth] = useState<string>("2026-09");
  const [formIndicator, setFormIndicator] = useState<MarketIndicator>("CDI");
  const [formMonthlyRate, setFormMonthlyRate] = useState<number>(0.92);
  const [formAccumulated12m, setFormAccumulated12m] = useState<number>(11.5);
  const [formSource, setFormSource] = useState<string>("BACEN / Cetip");

  // Ordenar e filtrar histórico
  const filteredHistory = useMemo(() => {
    return [...marketBenchmarkHistory]
      .filter((e) => {
        if (selectedIndicator !== "ALL" && e.indicator !== selectedIndicator) return false;
        return true;
      })
      .sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth));
  }, [marketBenchmarkHistory, selectedIndicator]);

  // Preparar dados do gráfico dos últimos meses
  const chartData = useMemo(() => {
    const monthsMap = new Map<
      string,
      { month: string; cdiMonthly?: number; ipcaMonthly?: number; cdi12m?: number; ipca12m?: number }
    >();

    marketBenchmarkHistory.forEach((item) => {
      const existing = monthsMap.get(item.referenceMonth) || { month: item.referenceMonth };
      if (item.indicator === "CDI") {
        existing.cdiMonthly = item.monthlyRatePercentage;
        existing.cdi12m = item.accumulated12MonthsPercentage;
      } else if (item.indicator === "IPCA") {
        existing.ipcaMonthly = item.monthlyRatePercentage;
        existing.ipca12m = item.accumulated12MonthsPercentage;
      }
      monthsMap.set(item.referenceMonth, existing);
    });

    return Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [marketBenchmarkHistory]);

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormMonth("2026-09");
    setFormIndicator("CDI");
    setFormMonthlyRate(0.92);
    setFormAccumulated12m(11.5);
    setFormSource("BACEN / Cetip");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: MarketBenchmarkEntry) => {
    setEditingEntry(entry);
    setFormMonth(entry.referenceMonth);
    setFormIndicator(entry.indicator);
    setFormMonthlyRate(entry.monthlyRatePercentage);
    setFormAccumulated12m(entry.accumulated12MonthsPercentage);
    setFormSource(entry.source);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      updateMarketBenchmarkEntry(editingEntry.id, {
        referenceMonth: formMonth,
        indicator: formIndicator,
        monthlyRatePercentage: formMonthlyRate,
        accumulated12MonthsPercentage: formAccumulated12m,
        source: formSource,
      });
    } else {
      addMarketBenchmarkEntry({
        referenceMonth: formMonth,
        indicator: formIndicator,
        monthlyRatePercentage: formMonthlyRate,
        accumulated12MonthsPercentage: formAccumulated12m,
        source: formSource,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro de benchmark?")) {
      deleteMarketBenchmarkEntry(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Histórico Oficial de Indicadores Financeiros (CDI & IPCA)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Séries temporais auditáveis e editáveis para benchmark de rentabilidade dos empreendimentos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicator Filter */}
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Indicadores</option>
            <option value="CDI">Apenas CDI</option>
            <option value="IPCA">Apenas IPCA</option>
          </select>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento Mensal
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Evolução da Taxa Mensal: CDI vs IPCA (% ao mês)
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              CDI Mensal (%)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              IPCA Mensal (%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        {label}
                      </div>
                      <div className="text-amber-400 font-semibold flex justify-between gap-4">
                        <span>CDI Mensal:</span>
                        <span>{Number(payload[0]?.value || 0).toFixed(2)}%</span>
                      </div>
                      <div className="text-rose-400 font-semibold flex justify-between gap-4">
                        <span>IPCA Mensal:</span>
                        <span>{Number(payload[1]?.value || 0).toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="cdiMonthly"
                name="CDI Mensal"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="ipcaMonthly"
                name="IPCA Mensal"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Registros Históricos Cadastrados ({filteredHistory.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Clique em editar para ajustar valores ou atualizar fontes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="text-left py-3 px-4">Mês de Referência</th>
                <th className="text-left py-3 px-4">Indicador</th>
                <th className="text-right py-3 px-4">Taxa no Mês (%)</th>
                <th className="text-right py-3 px-4">Acumulado 12m (%)</th>
                <th className="text-left py-3 px-4">Fonte Oficial</th>
                <th className="text-right py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {item.referenceMonth}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        item.indicator === "CDI"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.indicator}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {item.monthlyRatePercentage.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                    {item.accumulated12MonthsPercentage.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-slate-500">{item.source}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        title="Editar Indicador"
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Excluir Registro"
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {editingEntry ? (
                  <>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    Editar Taxa de Indicador ({editingEntry.indicator} • {editingEntry.referenceMonth})
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-blue-600" />
                    Lançar Taxa de Benchmark Mensal
                  </>
                )}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mês de Referência (AAAA-MM):
                </label>
                <input
                  type="text"
                  placeholder="2026-09"
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Indicador:
                </label>
                <select
                  value={formIndicator}
                  onChange={(e) => {
                    const ind = e.target.value as MarketIndicator;
                    setFormIndicator(ind);
                    if (ind === "CDI") setFormSource("BACEN / Cetip");
                    else if (ind === "IPCA") setFormSource("IBGE");
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="CDI">CDI (Renda Fixa / Depósito Interbancário)</option>
                  <option value="IPCA">IPCA (Índice de Preços ao Consumidor Amplo)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Taxa Mensal (%):
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    value={formMonthlyRate}
                    onChange={(e) => setFormMonthlyRate(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Acumulado 12m (%):
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    value={formAccumulated12m}
                    onChange={(e) => setFormAccumulated12m(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Fonte Oficial:
                </label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {editingEntry ? "Salvar Alterações" : "Salvar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
