import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Building2,
  TrendingUp,
  MapPin,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  CheckCircle2,
  DollarSign,
  PieChart,
  FileDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { UnitPriceComparison, BuildingStandard } from "../../types";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";

export const PriceComparisonPanel: React.FC = () => {
  const { unitPriceComparisons, spes } = useApp();

  const [selectedSpe, setSelectedSpe] = useState<string>("ALL");
  const [selectedStandard, setSelectedStandard] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"pricePerM2" | "positioning" | "price">("pricePerM2");

  // Filtragem
  const filteredComparisons = useMemo(() => {
    return unitPriceComparisons
      .filter((item) => {
        if (selectedSpe !== "ALL" && item.speId !== selectedSpe) return false;
        if (selectedStandard !== "ALL" && item.buildingStandard !== selectedStandard)
          return false;
        if (searchTerm.trim() !== "") {
          const term = searchTerm.toLowerCase();
          const matchUnit = item.unitNumber?.toLowerCase().includes(term);
          const matchSpe = item.speName?.toLowerCase().includes(term);
          const matchRegion = item.region.toLowerCase();
          const matchType = item.type?.toLowerCase().includes(term);
          return matchUnit || matchSpe || matchRegion.includes(term) || matchType;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "pricePerM2") return b.pricePerM2 - a.pricePerM2;
        if (sortBy === "positioning") return b.positioningPercentage - a.positioningPercentage;
        return b.price - a.price;
      });
  }, [unitPriceComparisons, selectedSpe, selectedStandard, searchTerm, sortBy]);

  // Estatísticas Rápidas
  const avgArvPriceM2 = useMemo(() => {
    if (!filteredComparisons.length) return 0;
    return (
      filteredComparisons.reduce((acc, i) => acc + i.pricePerM2, 0) /
      filteredComparisons.length
    );
  }, [filteredComparisons]);

  const avgRegionalBenchmarkM2 = useMemo(() => {
    if (!filteredComparisons.length) return 0;
    return (
      filteredComparisons.reduce(
        (acc, i) => acc + (i.benchmarkAveragePricePerM2Region || i.pricePerM2),
        0
      ) / filteredComparisons.length
    );
  }, [filteredComparisons]);

  const avgPremiumPercentage = useMemo(() => {
    if (avgRegionalBenchmarkM2 === 0) return 0;
    return ((avgArvPriceM2 - avgRegionalBenchmarkM2) / avgRegionalBenchmarkM2) * 100;
  }, [avgArvPriceM2, avgRegionalBenchmarkM2]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  // Preparar dados do gráfico
  const chartData = useMemo(() => {
    return filteredComparisons.slice(0, 8).map((item) => ({
      name: `${item.unitNumber || "Unidade"} (${item.speName?.split("-")[0]?.trim() || "ARV"})`,
      pricePerM2: item.pricePerM2,
      benchmark: item.benchmarkAveragePricePerM2Region || Math.round(item.pricePerM2 * 0.92),
      region: item.region,
      positioning: item.positioningPercentage,
    }));
  }, [filteredComparisons]);

  return (
    <div className="space-y-6">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-blue-600" />
              Preço Médio ARV (R$/m²)
            </span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold px-2 py-0.5 rounded-full">
              {filteredComparisons.length} Unidades
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(avgArvPriceM2)}/m²
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Valor ponderado dos lançamentos e estoques ativos.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-amber-600" />
              Média Regional de Mercado
            </span>
            <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 font-bold px-2 py-0.5 rounded-full">
              Benchmark SC / CE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(avgRegionalBenchmarkM2)}/m²
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pesquisa de mercado imobiliário regional de referência.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Posicionamento Médio ARV
            </span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
              Valor Agregado
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            {avgPremiumPercentage >= 0 ? "+" : ""}
            {avgPremiumPercentage.toFixed(1)}%
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Prêmio de qualidade de projeto, lazer e localização nobre.
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div
        id="chart-price-m2-comparison"
        className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Comparativo de R$/m²: Unidades ARV vs Benchmark Regional
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Valores por metro quadrado privativo comparados com a média dos bairros de implantação.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              Preço ARV (R$/m²)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-slate-400" />
              Média Regional Mercado
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                angle={-15}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const arvVal = Number(payload[0]?.value) || 0;
                  const benchVal = Number(payload[1]?.value) || 0;
                  const diffPct = benchVal ? ((arvVal - benchVal) / benchVal) * 100 : 0;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-200">
                        {label}
                      </div>
                      <div className="flex justify-between gap-4 text-blue-400 font-semibold">
                        <span>Unidade ARV:</span>
                        <span>{formatCurrency(arvVal)}/m²</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-400">
                        <span>Média Regional:</span>
                        <span>{formatCurrency(benchVal)}/m²</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 font-bold">
                        <span>Posicionamento:</span>
                        <span className={diffPct >= 0 ? "text-emerald-400" : "text-amber-400"}>
                          {diffPct >= 0 ? "+" : ""}
                          {diffPct.toFixed(1)}% vs mercado
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="pricePerM2" name="Preço ARV" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="benchmark" name="Benchmark Regional" fill="#94a3b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar unidade, SPE, bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SPE Filter */}
          <select
            value={selectedSpe}
            onChange={(e) => setSelectedSpe(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todas as SPEs</option>
            {spes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Standard Filter */}
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Padrões</option>
            <option value="Alto Padrão">Alto Padrão</option>
            <option value="Médio">Médio Padrão</option>
            <option value="Econômico">Econômico</option>
          </select>
        </div>

        {/* Sort By & PDF Export Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 self-end md:self-auto w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ordenar por:</span>
            <button
              onClick={() => setSortBy("pricePerM2")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === "pricePerM2"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              R$/m²
            </button>
            <button
              onClick={() => setSortBy("positioning")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === "positioning"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              Posicionamento
            </button>
            <button
              onClick={() => setSortBy("price")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === "price"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              Preço Total
            </button>
          </div>

          <button
            onClick={() => {
              ProfitabilityPdfExportService.generatePriceComparisonPDF(
                filteredComparisons,
                spes,
                {
                  includeCharts: true,
                  includePriceBenchmarkChart: true,
                  notes: `Relatório comparativo de preços por m² (${filteredComparisons.length} unidades analisadas com benchmark regional).`,
                }
              );
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Exportar Relatório e Gráfico Comparativo em PDF"
          >
            <FileDown className="w-3.5 h-3.5" /> PDF com Gráficos
          </button>
        </div>
      </div>

      {/* Comparisons Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="text-left py-3 px-4">Unidade / Tipologia</th>
                <th className="text-left py-3 px-4">Empreendimento (SPE)</th>
                <th className="text-left py-3 px-4">Região / Bairro</th>
                <th className="text-center py-3 px-4">Padrão</th>
                <th className="text-right py-3 px-4">Área Priv.</th>
                <th className="text-right py-3 px-4">Preço Total</th>
                <th className="text-right py-3 px-4">R$/m² ARV</th>
                <th className="text-right py-3 px-4">Média Regional</th>
                <th className="text-right py-3 px-4">Posicionamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredComparisons.map((item) => {
                const isAbove = item.positioningPercentage >= 0;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.unitNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.type}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                      {item.speName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.region}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          item.buildingStandard === "Alto Padrão"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : item.buildingStandard === "Médio"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {item.buildingStandard}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {item.areaM2.toFixed(1)} m²
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.pricePerM2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {formatCurrency(item.benchmarkAveragePricePerM2Region || 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          isAbove
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isAbove ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {isAbove ? "+" : ""}
                        {item.positioningPercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredComparisons.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhuma unidade encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
