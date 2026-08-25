import React, { useState } from "react";
import {
  TrendingUp,
  Building2,
  Calculator,
  Compass,
  Database,
  Bookmark,
  Award,
  ShieldCheck,
  Zap,
  Percent,
  Trash2,
  Eye,
  Plus,
  Layers,
  LayoutDashboard,
  FileDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ARVLogo } from "../common/ARVLogo";
import { ProfitabilityExecutiveDashboard } from "./ProfitabilityExecutiveDashboard";
import { ProfitabilitySimulatorForm } from "./ProfitabilitySimulatorForm";
import { DevelopmentPricingGrid } from "./DevelopmentPricingGrid";
import { PriceComparisonPanel } from "./PriceComparisonPanel";
import { RegionalPriceHeatmap } from "./RegionalPriceHeatmap";
import { MarketBenchmarkHistoryTable } from "./MarketBenchmarkHistoryTable";
import { ProfitabilityComparisonChart } from "./ProfitabilityComparisonChart";
import { runProfitabilitySimulation } from "../../utils/profitabilityCalculations";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";
import { ProfitabilitySimulation } from "../../types";

export const ProfitabilityDashboard: React.FC = () => {
  const {
    profitabilitySimulations,
    deleteProfitabilitySimulation,
    marketBenchmarkHistory,
    spes,
    unitPriceComparisons,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "developments" | "simulator" | "pricing" | "regional" | "history" | "saved"
  >("dashboard");

  const [prefilledSpeId, setPrefilledSpeId] = useState<string | undefined>(undefined);

  const [viewingSavedSim, setViewingSavedSim] = useState<ProfitabilitySimulation | null>(
    null
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number, showSign = false) => {
    const formatted = val.toFixed(2).replace(".", ",") + "%";
    if (showSign && val > 0) return `+${formatted}`;
    return formatted;
  };

  const handleSelectSpeForSimulation = (speId: string) => {
    setPrefilledSpeId(speId);
    setActiveTab("simulator");
  };

  const handleExportDashboardPDF = () => {
    ProfitabilityPdfExportService.generateExecutiveDashboardPDF(
      spes,
      unitPriceComparisons,
      marketBenchmarkHistory,
      profitabilitySimulations
    );
  };

  const handleExportPricingPDF = () => {
    ProfitabilityPdfExportService.generatePriceComparisonPDF(
      unitPriceComparisons,
      spes
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        {/* ARV Watermark Logo */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ARVLogo lightMode size="xl" className="scale-150" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                Módulo Financeiro & Inteligência de Mercado
              </span>
              <ARVLogo lightMode size="sm" showTagline className="hidden sm:inline-flex opacity-80" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Rentabilidade Imobiliária & Comparativo de Preços
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Análise comparativa de valorização dos ativos imobiliários ARV contra os indicadores oficiais do mercado financeiro (CDI e IPCA).
            </p>
          </div>

          {/* Action Export Buttons & Key Metric Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
                <div className="text-[9px] uppercase font-semibold text-slate-400">Imóveis ARV</div>
                <div className="text-sm sm:text-base font-bold text-blue-400">+17.0% a.a.</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
                <div className="text-[9px] uppercase font-semibold text-slate-400">CDI Ref.</div>
                <div className="text-sm sm:text-base font-bold text-amber-400">+11.6% a.a.</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
                <div className="text-[9px] uppercase font-semibold text-slate-400">IPCA 12m</div>
                <div className="text-sm sm:text-base font-bold text-rose-400">+4.3% a.a.</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
                <div className="text-[9px] uppercase font-semibold text-slate-400">Ganho Real</div>
                <div className="text-sm sm:text-base font-bold text-emerald-400">+12.2% a.a.</div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2">
              <button
                onClick={handleExportDashboardPDF}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
                title="Exportar Relatório Geral em PDF"
              >
                <FileDown className="w-3.5 h-3.5" /> PDF Geral
              </button>
              <button
                onClick={handleExportPricingPDF}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer whitespace-nowrap"
                title="Exportar Comparativo de Preços em PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" /> PDF Preços
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Executivo
        </button>

        <button
          onClick={() => {
            setActiveTab("developments");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "developments"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Grid de Empreendimentos
        </button>

        <button
          onClick={() => {
            setActiveTab("simulator");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "simulator"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulador Interativo
        </button>

        <button
          onClick={() => {
            setActiveTab("pricing");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "pricing"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          Comparativo de Preços (R$/m²)
        </button>

        <button
          onClick={() => {
            setActiveTab("regional");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "regional"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Compass className="w-4 h-4" />
          Inteligência Regional (SC / CE)
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Database className="w-4 h-4" />
          Histórico Indicadores (CDI & IPCA)
        </button>

        <button
          onClick={() => {
            setActiveTab("saved");
            setViewingSavedSim(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "saved"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Simulações Salvas ({profitabilitySimulations.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "dashboard" && (
        <ProfitabilityExecutiveDashboard
          onNavigateToSimulator={(speId) => {
            if (speId) setPrefilledSpeId(speId);
            setActiveTab("simulator");
          }}
          onNavigateToPricing={() => setActiveTab("pricing")}
          onNavigateToRegional={() => setActiveTab("regional")}
          onNavigateToHistory={() => setActiveTab("history")}
        />
      )}

      {activeTab === "developments" && (
        <DevelopmentPricingGrid onSelectForSimulation={handleSelectSpeForSimulation} />
      )}

      {activeTab === "simulator" && (
        <ProfitabilitySimulatorForm initialSpeId={prefilledSpeId} />
      )}

      {activeTab === "pricing" && <PriceComparisonPanel />}

      {activeTab === "regional" && <RegionalPriceHeatmap />}

      {activeTab === "history" && <MarketBenchmarkHistoryTable />}

      {activeTab === "saved" && (
        <div className="space-y-6">
          {viewingSavedSim ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewingSavedSim(null)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ← Voltar para Lista
                  </button>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Visualizando: {viewingSavedSim.title}
                  </div>
                </div>

                {(() => {
                  const res = runProfitabilitySimulation(
                    {
                      id: viewingSavedSim.id,
                      contractId: viewingSavedSim.contractId,
                      purchasePrice: viewingSavedSim.purchasePrice,
                      entryDate: viewingSavedSim.entryDate,
                      horizonMonths: viewingSavedSim.horizonMonths,
                      appreciationScenario: viewingSavedSim.appreciationScenario,
                      customAnnualAppreciationRate: viewingSavedSim.customAnnualAppreciationRate,
                      customCdiAnnualRate: viewingSavedSim.customCdiAnnualRate,
                      customIpcaAnnualRate: viewingSavedSim.customIpcaAnnualRate,
                      costs: viewingSavedSim.costsConsidered,
                    },
                    marketBenchmarkHistory
                  );

                  return (
                    <button
                      onClick={() => {
                        ProfitabilityPdfExportService.generateSimulationPDF(
                          res.simulation,
                          res.comparison,
                          {
                            clientName: viewingSavedSim.investorName,
                          }
                        );
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" /> Exportar PDF desta Simulação
                    </button>
                  );
                })()}
              </div>

              {(() => {
                const res = runProfitabilitySimulation(
                  {
                    id: viewingSavedSim.id,
                    contractId: viewingSavedSim.contractId,
                    purchasePrice: viewingSavedSim.purchasePrice,
                    entryDate: viewingSavedSim.entryDate,
                    horizonMonths: viewingSavedSim.horizonMonths,
                    appreciationScenario: viewingSavedSim.appreciationScenario,
                    customAnnualAppreciationRate: viewingSavedSim.customAnnualAppreciationRate,
                    customCdiAnnualRate: viewingSavedSim.customCdiAnnualRate,
                    customIpcaAnnualRate: viewingSavedSim.customIpcaAnnualRate,
                    costs: viewingSavedSim.costsConsidered,
                  },
                  marketBenchmarkHistory
                );
                return (
                  <ProfitabilityComparisonChart
                    simulation={res.simulation}
                    comparison={res.comparison}
                  />
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-blue-600" />
                    Simulações e Cenários Registrados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Histórico de simulações personalizadas salvas na plataforma com exportação direta em PDF.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("simulator")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Nova Simulação
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profitabilitySimulations.map((sim) => {
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
                      className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {sim.appreciationScenario} ({sim.horizonMonths}m)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {sim.createdAt}
                          </span>
                        </div>

                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                          {sim.title || `Simulação ${sim.appreciationScenario}`}
                        </div>

                        {sim.investorName && (
                          <div className="text-xs text-slate-500">
                            Investidor: <strong className="text-slate-700 dark:text-slate-300">{sim.investorName}</strong>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400">Aporte:</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(sim.purchasePrice)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Retorno Líquido:</div>
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                              {formatPercent(res.comparison.realEstateReturnPercentage, true)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">CDI Período:</div>
                            <div className="font-semibold text-amber-600">
                              {formatPercent(res.comparison.cdiReturnPercentageSamePeriod, true)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Ganho Real vs IPCA:</div>
                            <div className="font-semibold text-emerald-600">
                              {formatPercent(res.comparison.realGainAboveInflationPercentage, true)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingSavedSim(sim)}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-blue-100 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detalhes
                          </button>
                          <button
                            onClick={() => {
                              ProfitabilityPdfExportService.generateSimulationPDF(
                                res.simulation,
                                res.comparison,
                                {
                                  clientName: sim.investorName,
                                }
                              );
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                            title="Gerar PDF desta simulação"
                          >
                            <FileDown className="w-3.5 h-3.5" /> PDF
                          </button>
                        </div>
                        <button
                          onClick={() => deleteProfitabilitySimulation(sim.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Excluir simulação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {profitabilitySimulations.length === 0 && (
                  <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                    <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Nenhuma simulação salva ainda
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Use o Simulador Interativo para calcular e gravar cenários de rentabilidade dos investidores.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

