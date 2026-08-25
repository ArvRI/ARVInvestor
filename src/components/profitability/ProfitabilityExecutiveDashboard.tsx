import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Building2,
  Calculator,
  Layers,
  Award,
  ShieldCheck,
  Zap,
  Percent,
  FileDown,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Compass,
  Database,
  BarChart3,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ARVLogo } from "../common/ARVLogo";
import { runProfitabilitySimulation } from "../../utils/profitabilityCalculations";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";
import { ProfitabilityComparisonChart } from "./ProfitabilityComparisonChart";
import { AppreciationScenario } from "../../types";

interface ProfitabilityExecutiveDashboardProps {
  onNavigateToSimulator: (speId?: string) => void;
  onNavigateToPricing: () => void;
  onNavigateToRegional: () => void;
  onNavigateToHistory: () => void;
}

export const ProfitabilityExecutiveDashboard: React.FC<ProfitabilityExecutiveDashboardProps> = ({
  onNavigateToSimulator,
  onNavigateToPricing,
  onNavigateToRegional,
  onNavigateToHistory,
}) => {
  const {
    spes,
    contracts,
    marketBenchmarkHistory,
    profitabilitySimulations,
    unitPriceComparisons,
  } = useApp();

  // Quick live simulator inside the executive dashboard
  const [quickSpeId, setQuickSpeId] = useState<string>("spe-grid");
  const [quickAmount, setQuickAmount] = useState<number>(445000);
  const [quickHorizon, setQuickHorizon] = useState<number>(36);
  const [quickScenario, setQuickScenario] = useState<AppreciationScenario>("Moderado");
  const [isExportingDashboard, setIsExportingDashboard] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatPercent = (val: number, showSign = false) => {
    const formatted = (val || 0).toFixed(2).replace(".", ",") + "%";
    if (showSign && val > 0) return `+${formatted}`;
    return formatted;
  };

  // Portfolio aggregates
  const totalVgv = spes.reduce((acc, s) => acc + (s.totalVgv || 0), 0);
  const avgRoiPortfolio = 18.2;
  const currentCdi = 11.5;
  const currentIpca = 4.3;
  const alphaVsCdi = avgRoiPortfolio - currentCdi;
  const realGainVsIpca = avgRoiPortfolio - currentIpca;

  // Run live calculation for the quick simulator widget
  const quickSimResult = useMemo(() => {
    const selectedSpe = spes.find((s) => s.id === quickSpeId);
    return runProfitabilitySimulation(
      {
        title: `Simulação Executiva • ${selectedSpe?.name || "SPE ARV"} (${quickScenario})`,
        speId: quickSpeId,
        purchasePrice: quickAmount,
        entryDate: "2026-08-01",
        horizonMonths: quickHorizon,
        appreciationScenario: quickScenario,
      },
      marketBenchmarkHistory
    );
  }, [quickSpeId, quickAmount, quickHorizon, quickScenario, spes, marketBenchmarkHistory]);

  const handleExportDashboardPDF = () => {
    setIsExportingDashboard(true);
    try {
      ProfitabilityPdfExportService.generateExecutiveDashboardPDF(
        spes,
        unitPriceComparisons,
        marketBenchmarkHistory,
        profitabilitySimulations,
        {
          includeCharts: true,
          includeSpeChart: true,
          notes: "Relatório executivo consolidado gerado automaticamente através da Central de Inteligência ARV.",
        }
      );
      setExportSuccessMsg("PDF do Dashboard Executivo com Gráficos exportado com sucesso!");
      setTimeout(() => setExportSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsExportingDashboard(false);
    }
  };

  const handleExportQuickSimPDF = () => {
    ProfitabilityPdfExportService.generateSimulationPDF(
      quickSimResult.simulation,
      quickSimResult.comparison,
      {
        includeCharts: true,
        includeEvolutionChart: true,
        includeComparisonBarChart: true,
        includeCostBreakdownChart: true,
        notes: `Simulação gerada no Dashboard Executivo para o empreendimento ${spes.find((s) => s.id === quickSpeId)?.name}.`,
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Notification Toast */}
      {exportSuccessMsg && (
        <div className="p-3 bg-emerald-500 text-white rounded-2xl flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {exportSuccessMsg}
          </div>
          <span className="text-[10px] opacity-80">Download iniciado</span>
        </div>
      )}

      {/* Main Executive Hero Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* ARV Watermark Logo */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ARVLogo lightMode size="xl" className="scale-150" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                Dashboard Executivo
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mercado em Alta (SC / Florianópolis)
              </span>
              <ARVLogo lightMode size="sm" showTagline className="hidden sm:inline-flex opacity-80" />
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Rentabilidade & Inteligência Competitiva
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consolidação de retorno financeiro dos ativos ARV, comparativo direto com taxas oficiais do CDI e IPCA (BACEN/IBGE) e posicionamento de preço por m².
            </p>
          </div>

          {/* Quick PDF Export Trigger */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleExportDashboardPDF}
              disabled={isExportingDashboard}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4" />
              {isExportingDashboard ? "Gerando PDF..." : "Exportar PDF do Dashboard"}
            </button>

            <button
              onClick={() => onNavigateToSimulator()}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-400" />
              Abrir Simulador Completo
            </button>
          </div>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase font-semibold text-slate-400">VGV Total Consolidado</div>
            <div className="text-lg sm:text-xl font-bold text-white mt-0.5">{formatCurrency(totalVgv)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{spes.length} Empreendimentos ativos</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase font-semibold text-blue-300">Retorno Médio ARV</div>
            <div className="text-lg sm:text-xl font-bold text-blue-400 mt-0.5">+{avgRoiPortfolio.toFixed(1)}% a.a.</div>
            <div className="text-[10px] text-blue-200/80 mt-0.5">Projeção moderada/otimista</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase font-semibold text-amber-300">Spread sobre CDI</div>
            <div className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">+{alphaVsCdi.toFixed(1)} p.p. a.a.</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">CDI Ref: {currentCdi}% a.a.</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase font-semibold text-emerald-300">Ganho Real vs IPCA</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">+{realGainVsIpca.toFixed(1)}% a.a.</div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5">Poder de compra preservado</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-semibold text-slate-300">Preço Médio m² ARV</div>
            <div className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">R$ 15.240/m²</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">+12.4% vs Benchmark Região</div>
          </div>
        </div>
      </div>

      {/* SPE Performance Matrix (ARV GRID, T58 Spot, Meridiem, Horizon) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Performance & Rentabilidade por Empreendimento (SPEs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visão comparativa de VGV, taxa anualizada de valorização, preço por m² e status de obra.
            </p>
          </div>

          <button
            onClick={onNavigateToPricing}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            Ver Comparativo de Preço por m² <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spes.map((spe) => {
            const isGrid = spe.id === "spe-grid";
            const isT58 = spe.id === "spe-t58";
            const isMeridiem = spe.id === "spe-meridiem";

            const roi = isGrid ? 19.2 : isT58 ? 18.5 : isMeridiem ? 17.8 : 16.5;
            const avgM2 = isGrid ? 15480 : isT58 ? 13850 : isMeridiem ? 14200 : 16500;
            const benchmarkM2 = isGrid || isT58 ? 13800 : isMeridiem ? 12800 : 14800;
            const spreadM2 = ((avgM2 - benchmarkM2) / benchmarkM2) * 100;
            const obraPercent = isGrid ? 35 : isT58 ? 98 : isMeridiem ? 58 : 72;

            return (
              <div
                key={spe.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isGrid
                    ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isGrid
                          ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {spe.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Obra: <strong className="text-slate-900 dark:text-slate-100">{obraPercent}%</strong>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {spe.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {spe.city || "Florianópolis, SC"}
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">VGV Total:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(spe.totalVgv)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">ROI Anual Projetado:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        +{roi.toFixed(1)}% a.a.
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Preço Médio / m²:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(avgM2)}/m²
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Spread vs Benchmark:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{spreadM2.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => onNavigateToSimulator(spe.id)}
                    className="flex-1 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" /> Simular
                  </button>

                  <button
                    onClick={() => {
                      const sampleComparison = runProfitabilitySimulation(
                        {
                          title: `Estudo de Rentabilidade • ${spe.name}`,
                          speId: spe.id,
                          purchasePrice: spe.totalVgv > 0 ? Math.round(spe.totalVgv / 40) : 500000,
                          entryDate: "2026-08-01",
                          horizonMonths: 36,
                          appreciationScenario: "Moderado",
                        },
                        marketBenchmarkHistory
                      );
                      ProfitabilityPdfExportService.generateSimulationPDF(
                        sampleComparison.simulation,
                        sampleComparison.comparison,
                        { notes: `Estudo de rentabilidade executivo para ${spe.name}.` }
                      );
                    }}
                    title="Exportar PDF desta SPE"
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quick Simulation & Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Simulator Control Widget */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Simulação Rápida no Dashboard
              </h3>
              <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Ao Vivo
              </span>
            </div>

            {/* SPE Selector */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Empreendimento:
              </label>
              <select
                value={quickSpeId}
                onChange={(e) => {
                  setQuickSpeId(e.target.value);
                  if (e.target.value === "spe-grid") setQuickAmount(445000);
                  else if (e.target.value === "spe-t58") setQuickAmount(420000);
                  else if (e.target.value === "spe-meridiem") setQuickAmount(680000);
                  else setQuickAmount(1200000);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-900 dark:text-slate-100"
              >
                {spes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Aporte / Valor de Aquisição (R$):
              </label>
              <input
                type="number"
                step={10000}
                value={quickAmount}
                onChange={(e) => setQuickAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Horizon & Scenario */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Prazo:</label>
                <select
                  value={quickHorizon}
                  onChange={(e) => setQuickHorizon(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value={12}>12 Meses (1 ano)</option>
                  <option value={24}>24 Meses (2 anos)</option>
                  <option value={36}>36 Meses (3 anos)</option>
                  <option value={48}>48 Meses (4 anos)</option>
                  <option value={60}>60 Meses (5 anos)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cenário:</label>
                <select
                  value={quickScenario}
                  onChange={(e) => setQuickScenario(e.target.value as AppreciationScenario)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="Conservador">Conservador</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Otimista">Otimista</option>
                </select>
              </div>
            </div>

            {/* Quick Result Summary */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Retorno Líquido Imóvel:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatPercent(quickSimResult.comparison.realEstateReturnPercentage, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CDI Período Equivalente:</span>
                <span className="font-semibold text-amber-600">
                  {formatPercent(quickSimResult.comparison.cdiReturnPercentageSamePeriod, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lucro Líquido Estimado:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(quickSimResult.simulation.netProfitAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportQuickSimPDF}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Gerar PDF desta Rentabilidade
            </button>

            <button
              onClick={() => onNavigateToSimulator(quickSpeId)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              Abrir no Simulador Detalhado <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Comparison Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ProfitabilityComparisonChart
            simulation={quickSimResult.simulation}
            comparison={quickSimResult.comparison}
            showDetails={false}
          />
        </div>
      </div>

      {/* Saved Simulations & Market Benchmark Quick Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Simulations Quick List with PDF Button */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Simulações Registradas & Exportação de PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere o relatório em PDF com um clique para cada investidor.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {profitabilitySimulations.length} salvas
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {profitabilitySimulations.slice(0, 5).map((sim) => {
              const res = runProfitabilitySimulation(
                {
                  id: sim.id,
                  contractId: sim.contractId,
                  purchasePrice: sim.purchasePrice,
                  entryDate: sim.entryDate,
                  horizonMonths: sim.horizonMonths,
                  appreciationScenario: sim.appreciationScenario,
                  customAnnualAppreciationRate: sim.customAnnualAppreciationRate,
                  customCdiAnnualRate: sim.customCdiAnnualRate,
                  customIpcaAnnualRate: sim.customIpcaAnnualRate,
                  costs: sim.costsConsidered,
                },
                marketBenchmarkHistory
              );

              return (
                <div
                  key={sim.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {sim.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Aporte: <strong>{formatCurrency(sim.purchasePrice)}</strong></span>
                      <span>•</span>
                      <span>Retorno: <strong className="text-blue-600 dark:text-blue-400">{formatPercent(res.comparison.realEstateReturnPercentage, true)}</strong></span>
                      <span>•</span>
                      <span>{sim.horizonMonths}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      ProfitabilityPdfExportService.generateSimulationPDF(
                        res.simulation,
                        res.comparison,
                        {
                          clientName: sim.investorName,
                          notes: `Relatório exportado diretamente a partir do histórico de simulações.`,
                        }
                      );
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Macro Indicators & Market Spread Monitor */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                Monitor de Indicadores Oficiais (BACEN & IBGE)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Taxas mensais e acumuladas em 12 meses utilizadas nos comparativos.
              </p>
            </div>

            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Tabela Completa <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="text-left py-2 font-medium">Mês</th>
                  <th className="text-left py-2 font-medium">Indicador</th>
                  <th className="text-right py-2 font-medium">Taxa Mês</th>
                  <th className="text-right py-2 font-medium">Acum. 12m</th>
                  <th className="text-right py-2 font-medium">Fonte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marketBenchmarkHistory.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{b.referenceMonth}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          b.indicator === "CDI"
                            ? "bg-amber-50 dark:bg-amber-950 text-amber-600"
                            : "bg-rose-50 dark:bg-rose-950 text-rose-600"
                        }`}
                      >
                        {b.indicator}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium">{b.monthlyRatePercentage.toFixed(2)}%</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      {b.accumulated12MonthsPercentage.toFixed(2)}% a.a.
                    </td>
                    <td className="py-2.5 text-right text-slate-400">{b.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
