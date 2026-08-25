import React, { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  MapPin,
  Filter,
  Search,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  DollarSign,
  PieChart,
  Calculator,
  ChevronRight,
  Calendar,
  Sparkles,
  BarChart3,
  Building,
  Eye,
  SlidersHorizontal,
  FileDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Development, SPE } from "../../types";
import { runProfitabilitySimulation } from "../../utils/profitabilityCalculations";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";

interface DevelopmentPricingGridProps {
  onSelectForSimulation?: (speId: string) => void;
}

export const DevelopmentPricingGrid: React.FC<DevelopmentPricingGridProps> = ({
  onSelectForSimulation,
}) => {
  const { developments, spes, contracts, unitPriceComparisons, marketBenchmarkHistory } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");

  // Mapear cidades disponíveis
  const cities = useMemo(() => {
    const set = new Set<string>();
    spes.forEach((s) => s.city && set.add(s.city));
    return Array.from(set);
  }, [spes]);

  // Consolidar dados de Empreendimentos com suas respectivas SPEs e Métricas Financeiras
  const enrichedDevelopments = useMemo(() => {
    return developments.map((dev) => {
      const spe = spes.find((s) => s.id === dev.speId);
      const devContracts = contracts.filter(
        (c) => c.speId === dev.speId || c.developmentId === dev.id
      );

      // Unidades comparadas
      const relatedUnits = unitPriceComparisons.filter(
        (u) => u.speId === dev.speId || u.speName?.toLowerCase().includes(dev.name.toLowerCase())
      );

      const avgPricePerM2 =
        relatedUnits.length > 0
          ? Math.round(
              relatedUnits.reduce((acc, u) => acc + u.pricePerM2, 0) / relatedUnits.length
            )
          : spe?.city === "Florianópolis"
          ? 15800
          : spe?.city === "Fortaleza"
          ? 12400
          : 14200;

      const avgBenchmarkM2 =
        relatedUnits.length > 0
          ? Math.round(
              relatedUnits.reduce(
                (acc, u) => acc + (u.benchmarkAveragePricePerM2Region || u.pricePerM2 * 0.9),
                0
              ) / relatedUnits.length
            )
          : Math.round(avgPricePerM2 * 0.88);

      const totalInvestedInDev = devContracts.reduce((acc, c) => acc + c.investedAmount, 0);

      const avgExpectedRoi =
        devContracts.length > 0
          ? devContracts.reduce((acc, c) => acc + (c.expectedRoiPercentage || 18), 0) /
            devContracts.length
          : 18.5;

      const unitsSold = dev.totalUnits - dev.unitsAvailable;
      const salesProgressPercentage =
        dev.totalUnits > 0 ? Math.round((unitsSold / dev.totalUnits) * 100) : 0;

      return {
        ...dev,
        spe,
        totalInvestedInDev,
        avgExpectedRoi,
        avgPricePerM2,
        avgBenchmarkM2,
        premiumPercentage:
          avgBenchmarkM2 > 0 ? ((avgPricePerM2 - avgBenchmarkM2) / avgBenchmarkM2) * 100 : 0,
        unitsSold,
        salesProgressPercentage,
      };
    });
  }, [developments, spes, contracts, unitPriceComparisons]);

  // Filtragem
  const filteredDevelopments = useMemo(() => {
    return enrichedDevelopments.filter((item) => {
      if (selectedCity !== "ALL" && item.spe?.city !== selectedCity) return false;
      if (selectedStatus !== "ALL" && item.spe?.status !== selectedStatus) return false;
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(term);
        const matchSpe = item.spe?.name.toLowerCase().includes(term);
        const matchCity = item.spe?.city.toLowerCase().includes(term);
        const matchType = item.type.toLowerCase().includes(term);
        return matchName || matchSpe || matchCity || matchType;
      }
      return true;
    });
  }, [enrichedDevelopments, selectedCity, selectedStatus, searchTerm]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Grid de Empreendimentos & Indicadores de Precificação
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consolidação dos dados de VGV, estoque, precificação por m² e rentabilidade esperada por empreendimento.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar empreendimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todas as Cidades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Em Captação">Em Captação</option>
            <option value="Em Obras">Em Obras</option>
            <option value="Concluído">Concluído</option>
            <option value="Planejamento">Planejamento</option>
          </select>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Tabela Grid
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Total Empreendimentos</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {filteredDevelopments.length} Ativos
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Portfólio ARV Investor
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">VGV Total Consolidado</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(
              filteredDevelopments.reduce((acc, d) => acc + (d.spe?.totalVgv || 0), 0)
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Soma dos projetos listados
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Preço Médio / m²</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(
              filteredDevelopments.length > 0
                ? filteredDevelopments.reduce((acc, d) => acc + d.avgPricePerM2, 0) /
                  filteredDevelopments.length
                : 0
            )}
            /m²
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Posicionamento de valorização
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">ROI Médio Esperado</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            +
            {(
              filteredDevelopments.reduce((acc, d) => acc + d.avgExpectedRoi, 0) /
              (filteredDevelopments.length || 1)
            ).toFixed(1)}
            % a.a.
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            vs CDI Médio 11.5% a.a.
          </span>
        </div>
      </div>

      {/* View Mode: Grid Table */}
      {viewMode === "grid" ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="text-left py-3.5 px-4">Empreendimento / SPE</th>
                  <th className="text-left py-3.5 px-4">Tipo & Cidade</th>
                  <th className="text-right py-3.5 px-4">VGV Total</th>
                  <th className="text-center py-3.5 px-4">Vendas / Estoque</th>
                  <th className="text-right py-3.5 px-4">Preço Méd. (R$/m²)</th>
                  <th className="text-right py-3.5 px-4">Benchmark Região</th>
                  <th className="text-right py-3.5 px-4">ROI Anual Esperado</th>
                  <th className="text-center py-3.5 px-4">Status Obra</th>
                  <th className="text-right py-3.5 px-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDevelopments.map((dev) => (
                  <tr
                    key={dev.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{dev.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-6">
                        {dev.spe?.name || "SPE Associada"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {dev.type}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {dev.spe?.city || "SC / CE"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(dev.spe?.totalVgv || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {dev.unitsSold}/{dev.totalUnits} un.
                        </span>
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${dev.salesProgressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {dev.salesProgressPercentage}% vendido
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(dev.avgPricePerM2)}/m²
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                      <div>{formatCurrency(dev.avgBenchmarkM2)}/m²</div>
                      <span
                        className={`text-[10px] font-bold ${
                          dev.premiumPercentage >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600"
                        }`}
                      >
                        {dev.premiumPercentage >= 0 ? "+" : ""}
                        {dev.premiumPercentage.toFixed(1)}% vs região
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        +{dev.avgExpectedRoi.toFixed(1)}% a.a.
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          dev.spe?.status === "Em Obras"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : dev.spe?.status === "Concluído"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {dev.spe?.status || "Em Obras"} ({dev.spe?.progressPercentage || 45}%)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectForSimulation && onSelectForSimulation(dev.speId)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="Simular rentabilidade deste empreendimento"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          Simular
                        </button>

                        <button
                          onClick={() => {
                            const res = runProfitabilitySimulation(
                              {
                                title: `Estudo de Rentabilidade • ${dev.name}`,
                                speId: dev.speId,
                                purchasePrice: dev.spe?.totalVgv ? Math.round(dev.spe.totalVgv / 40) : 500000,
                                entryDate: "2026-08-01",
                                horizonMonths: 36,
                                appreciationScenario: "Moderado",
                              },
                              marketBenchmarkHistory
                            );
                            ProfitabilityPdfExportService.generateSimulationPDF(
                              res.simulation,
                              res.comparison,
                              {
                                notes: `Relatório de rentabilidade gerado para o empreendimento ${dev.name} (${dev.spe?.name}).`,
                              }
                            );
                          }}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                          title="Baixar Estudo em PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevelopments.map((dev) => (
            <div
              key={dev.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      {dev.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {dev.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {dev.spe?.city || "SC / CE"} • {dev.address}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      dev.spe?.status === "Em Obras"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {dev.spe?.status || "Em Obras"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">VGV Total</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(dev.spe?.totalVgv || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Preço Médio / m²</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(dev.avgPricePerM2)}/m²
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Estoque / Unidades</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {dev.unitsAvailable} de {dev.totalUnits} disp.
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">ROI Esperado</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{dev.avgExpectedRoi.toFixed(1)}% a.a.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSelectForSimulation && onSelectForSimulation(dev.speId)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  Simular
                </button>

                <button
                  onClick={() => {
                    const res = runProfitabilitySimulation(
                      {
                        title: `Estudo de Rentabilidade • ${dev.name}`,
                        speId: dev.speId,
                        purchasePrice: dev.spe?.totalVgv ? Math.round(dev.spe.totalVgv / 40) : 500000,
                        entryDate: "2026-08-01",
                        horizonMonths: 36,
                        appreciationScenario: "Moderado",
                      },
                      marketBenchmarkHistory
                    );
                    ProfitabilityPdfExportService.generateSimulationPDF(
                      res.simulation,
                      res.comparison,
                      {
                        notes: `Relatório de rentabilidade gerado para o empreendimento ${dev.name} (${dev.spe?.name}).`,
                      }
                    );
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Baixar Relatório PDF"
                >
                  <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
