import React, { useState } from "react";
import {
  X,
  FileDown,
  LineChart,
  BarChart3,
  PieChart,
  TableProperties,
  CheckSquare,
  Square,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ProfitabilitySimulation,
  BenchmarkComparisonResult,
} from "../../types";
import {
  ProfitabilityPdfExportService,
  ProfitabilityPdfExportOptions,
} from "../../services/profitability/profitabilityPdfExportService";

interface ProfitabilityPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: ProfitabilitySimulation;
  comparison: BenchmarkComparisonResult;
  initialClientName?: string;
}

export const ProfitabilityPdfExportModal: React.FC<ProfitabilityPdfExportModalProps> = ({
  isOpen,
  onClose,
  simulation,
  comparison,
  initialClientName = "",
}) => {
  const [clientName, setClientName] = useState(initialClientName || simulation.investorName || "");
  const [consultantName, setConsultantName] = useState("Equipe ARV Empreendimentos");
  const [notes, setNotes] = useState(
    `Estudo de viabilidade e rentabilidade projetada para o empreendimento ARV. O investimento supera os indexadores CDI e IPCA no horizonte de ${simulation.horizonMonths} meses no cenário ${simulation.appreciationScenario}.`
  );

  // Chart & Table Selection states
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeEvolutionChart, setIncludeEvolutionChart] = useState(true);
  const [includeComparisonBarChart, setIncludeComparisonBarChart] = useState(true);
  const [includeCostBreakdownChart, setIncludeCostBreakdownChart] = useState(true);
  const [includeCostsTable, setIncludeCostsTable] = useState(true);
  const [includeEvolutionTable, setIncludeEvolutionTable] = useState(true);

  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = (allCharts: boolean) => {
    setIsExporting(true);
    try {
      const options: ProfitabilityPdfExportOptions = {
        clientName: clientName.trim() || undefined,
        consultantName: consultantName.trim() || undefined,
        notes: notes.trim() || undefined,
        includeCharts: allCharts ? true : includeCharts,
        includeEvolutionChart: allCharts ? true : includeEvolutionChart,
        includeComparisonBarChart: allCharts ? true : includeComparisonBarChart,
        includeCostBreakdownChart: allCharts ? true : includeCostBreakdownChart,
        includeCostsTable,
        includeEvolutionTable,
      };

      ProfitabilityPdfExportService.generateSimulationPDF(simulation, comparison, options);
      onClose();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Exportar Relatório Executivo com Gráficos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure os gráficos e tabelas incluídos no documento PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary Box */}
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-blue-900 dark:text-blue-200">
                {simulation.title || "Simulação de Rentabilidade ARV"}
              </div>
              <div>
                Prazo: <span className="font-medium text-slate-900 dark:text-white">{simulation.horizonMonths} meses</span> • 
                Retorno Imóvel: <span className="font-bold text-blue-600 dark:text-blue-400">+{comparison.realEstateReturnPercentage.toFixed(1)}%</span> • 
                Spread vs CDI: <span className="font-bold text-emerald-600">+{comparison.realEstateVsCdiPercentagePoints.toFixed(1)} p.p.</span>
              </div>
            </div>
          </div>

          {/* Gráficos a Incluir */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-blue-600" />
                Gráficos no Relatório
              </label>

              <button
                type="button"
                onClick={() => {
                  const newVal = !includeCharts;
                  setIncludeCharts(newVal);
                  setIncludeEvolutionChart(newVal);
                  setIncludeComparisonBarChart(newVal);
                  setIncludeCostBreakdownChart(newVal);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {includeCharts ? "Desmarcar Todos os Gráficos" : "Marcar Todos os Gráficos"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evolution Chart Checkbox */}
              <div
                onClick={() => setIncludeEvolutionChart(!includeEvolutionChart)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  includeEvolutionChart
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 opacity-70"
                }`}
              >
                {includeEvolutionChart ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <LineChart className="w-3.5 h-3.5 text-blue-600" />
                    Gráfico de Evolução Temporal
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Curvas de patrimônio mês a mês (Imóvel ARV vs CDI vs IPCA)
                  </div>
                </div>
              </div>

              {/* Bar Comparison Chart */}
              <div
                onClick={() => setIncludeComparisonBarChart(!includeComparisonBarChart)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  includeComparisonBarChart
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 opacity-70"
                }`}
              >
                {includeComparisonBarChart ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                    Gráfico de Retorno e Spreads
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Barras comparativas de retorno acumulado e ganho real
                  </div>
                </div>
              </div>

              {/* Cost Decomposition Chart */}
              <div
                onClick={() => setIncludeCostBreakdownChart(!includeCostBreakdownChart)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  includeCostBreakdownChart
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 opacity-70"
                }`}
              >
                {includeCostBreakdownChart ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-rose-500" />
                    Gráfico de Decomposição de Custos
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Demonstração gráfica do lucro líquido vs custos e impostos
                  </div>
                </div>
              </div>

              {/* Evolution Table Snapshot */}
              <div
                onClick={() => setIncludeEvolutionTable(!includeEvolutionTable)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  includeEvolutionTable
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 opacity-70"
                }`}
              >
                {includeEvolutionTable ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <TableProperties className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    Tabela Temporal Periódica
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Amostragem dos valores numéricos a cada semestre
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Personalizados */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Personalização do Documento
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Nome do Cliente / Investidor
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Dr. Roberto Almeida"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Consultor / Responsável
                </label>
                <input
                  type="text"
                  value={consultantName}
                  onChange={(e) => setConsultantName(e.target.value)}
                  placeholder="Ex: Fábio Silvestri"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                Notas e Observações Comerciais
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Insira notas explicativas personalizadas..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>PDF gerado em alta resolução com qualidade gráfica vetorial.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleExport(true)}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? "Gerando PDF..." : "Baixar PDF com Gráficos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
