import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Percent,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  FileDown,
  Sliders,
} from "lucide-react";
import { BenchmarkComparisonResult, ProfitabilitySimulation } from "../../types";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";
import { ProfitabilityPdfExportModal } from "./ProfitabilityPdfExportModal";

interface ProfitabilityComparisonChartProps {
  simulation: ProfitabilitySimulation;
  comparison: BenchmarkComparisonResult;
  showDetails?: boolean;
}

export const ProfitabilityComparisonChart: React.FC<ProfitabilityComparisonChartProps> = ({
  simulation,
  comparison,
  showDetails = true,
}) => {
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const isWinnerRealEstate = comparison.winnerIndicator === "Imóvel";
  const isWinnerCDI = comparison.winnerIndicator === "CDI";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatPercent = (val: number, showSign = false) => {
    const formatted = val.toFixed(2).replace(".", ",") + "%";
    if (showSign && val > 0) return `+${formatted}`;
    return formatted;
  };

  // Formatar dados do gráfico com base no valor de compra real da simulação
  const chartData = comparison.monthlyEvolution.map((pt) => {
    const factor = simulation.purchasePrice / 1000;
    return {
      monthLabel: pt.monthLabel,
      imovel: Math.round(pt.realEstateValue * factor),
      cdi: Math.round(pt.cdiValue * factor),
      ipca: Math.round(pt.ipcaValue * factor),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Imóvel */}
        <div
          id="card-return-imovel"
          className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Retorno Líquido Imóvel
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
              {simulation.appreciationScenario}
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatPercent(comparison.realEstateReturnPercentage, true)}
          </div>
          <div className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 flex items-center justify-between">
            <span>Anualizado:</span>
            <span className="font-bold">
              {formatPercent(comparison.realEstateAnnualizedPercentage)} a.a.
            </span>
          </div>
          <div className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5 flex items-center justify-between">
            <span>Lucro Líquido Est.:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(simulation.netProfitAmount)}
            </span>
          </div>
        </div>

        {/* Card CDI */}
        <div
          id="card-return-cdi"
          className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              CDI Período Equivalente
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              {simulation.horizonMonths} meses
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {formatPercent(comparison.cdiReturnPercentageSamePeriod, true)}
          </div>
          <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 flex items-center justify-between">
            <span>Anualizado:</span>
            <span className="font-bold">
              {formatPercent(comparison.cdiAnnualizedPercentage || 0)} a.a.
            </span>
          </div>
          <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5 flex items-center justify-between">
            <span>Spread Imóvel vs CDI:</span>
            <span
              className={`font-bold flex items-center ${
                comparison.realEstateVsCdiPercentagePoints >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {comparison.realEstateVsCdiPercentagePoints >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />
              )}
              {comparison.realEstateVsCdiPercentagePoints >= 0 ? "+" : ""}
              {comparison.realEstateVsCdiPercentagePoints.toFixed(2)} p.p.
            </span>
          </div>
        </div>

        {/* Card IPCA */}
        <div
          id="card-return-ipca"
          className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-rose-600" />
              Inflação IPCA Acumulada
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400">IBGE</span>
          </div>
          <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
            {formatPercent(comparison.ipcaReturnPercentageSamePeriod, true)}
          </div>
          <div className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1 flex items-center justify-between">
            <span>Anualizado:</span>
            <span className="font-bold">
              {formatPercent(comparison.ipcaAnnualizedPercentage || 0)} a.a.
            </span>
          </div>
          <div className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5 flex items-center justify-between">
            <span>Spread Imóvel vs IPCA:</span>
            <span
              className={`font-bold flex items-center ${
                comparison.realEstateVsIpcaPercentagePoints >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {comparison.realEstateVsIpcaPercentagePoints >= 0 ? "+" : ""}
              {comparison.realEstateVsIpcaPercentagePoints.toFixed(2)} p.p.
            </span>
          </div>
        </div>

        {/* Card Retorno Real & Vencedor */}
        <div
          id="card-winner-indicator"
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
            isWinnerRealEstate
              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
              : isWinnerCDI
              ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span
                className={`flex items-center gap-1.5 ${
                  isWinnerRealEstate
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Ganho Real Líquido
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  isWinnerRealEstate
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                <Award className="w-3 h-3" />
                Supera {comparison.winnerIndicator}
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${
                isWinnerRealEstate
                  ? "text-emerald-900 dark:text-emerald-100"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatPercent(comparison.realGainAboveInflationPercentage, true)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Poder de compra real descontando integralmente o IPCA de {simulation.horizonMonths}m.
            </p>
          </div>
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span>Período:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {simulation.entryDate} até {simulation.exitDate}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div
        id="chart-container-evolution"
        className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Evolução Patrimonial Acumulada no Mesmo Horizonte
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparativo temporal do aporte de{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {formatCurrency(simulation.purchasePrice)}
              </strong>{" "}
              ao longo de {simulation.horizonMonths} meses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/40">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Imóvel ARV
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/40">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                CDI
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800/40">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                IPCA
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  ProfitabilityPdfExportService.generateSimulationPDF(
                    simulation,
                    comparison,
                    {
                      includeCharts: true,
                      notes: "Estudo comparativo de rentabilidade gerado via plataforma ARV.",
                    }
                  );
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Exportar Relatório em PDF com Gráficos"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> PDF com Gráficos
              </button>

              <button
                onClick={() => setShowPdfModal(true)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Personalizar Opções de Exportação em PDF"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recharts LineChart Container */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[200px]">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        {label}
                      </div>
                      <div className="flex justify-between items-center text-blue-400 font-semibold">
                        <span>Imóvel ARV:</span>
                        <span>{formatCurrency(Number(payload[0]?.value) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-400 font-semibold">
                        <span>CDI Acumulado:</span>
                        <span>{formatCurrency(Number(payload[1]?.value) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-rose-400 font-semibold">
                        <span>IPCA (Inflação):</span>
                        <span>{formatCurrency(Number(payload[2]?.value) || 0)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ display: "none" }} />
              <Line
                type="monotone"
                dataKey="imovel"
                name="Imóvel ARV"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cdi"
                name="CDI"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5, fill: "#f59e0b" }}
              />
              <Line
                type="monotone"
                dataKey="ipca"
                name="IPCA"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
                activeDot={{ r: 4, fill: "#f43f5e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer obrigatório */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong>Aviso Legal & Metodologia:</strong> A simulação de valorização do imóvel é uma{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">projeção estimada</span> baseada no
            cenário selecionado e histórico das SPEs ARV. O CDI e IPCA foram capitalizados de forma composta para o
            mesmo horizonte exato de {simulation.horizonMonths} meses a partir de séries oficiais do BACEN e IBGE.
            Retornos passados não são garantia de rentabilidade futura.
          </p>
        </div>
      </div>

      {/* Details Table & Costs Breakdown */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabela de Comparativo Estruturado */}
          <div
            id="panel-table-indicators"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Comparativo Consolidado de Indicadores
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="text-left py-2 font-medium">Indicador</th>
                    <th className="text-right py-2 font-medium">Retorno Período</th>
                    <th className="text-right py-2 font-medium">Retorno a.a.</th>
                    <th className="text-right py-2 font-medium">Spread vs Imóvel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-blue-50/40 dark:bg-blue-950/20 font-bold text-blue-900 dark:text-blue-100">
                    <td className="py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Imóvel ARV ({simulation.appreciationScenario})
                    </td>
                    <td className="text-right py-3 text-blue-600 dark:text-blue-400">
                      {formatPercent(comparison.realEstateReturnPercentage, true)}
                    </td>
                    <td className="text-right py-3">
                      {formatPercent(comparison.realEstateAnnualizedPercentage)} a.a.
                    </td>
                    <td className="text-right py-3 text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      CDI Período Equivalente
                    </td>
                    <td className="text-right py-3 font-semibold text-amber-600">
                      {formatPercent(comparison.cdiReturnPercentageSamePeriod, true)}
                    </td>
                    <td className="text-right py-3 text-slate-600 dark:text-slate-400">
                      {formatPercent(comparison.cdiAnnualizedPercentage || 0)} a.a.
                    </td>
                    <td
                      className={`text-right py-3 font-bold ${
                        comparison.realEstateVsCdiPercentagePoints >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {comparison.realEstateVsCdiPercentagePoints >= 0 ? "+" : ""}
                      {comparison.realEstateVsCdiPercentagePoints.toFixed(2)} p.p.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      IPCA (Inflação no Período)
                    </td>
                    <td className="text-right py-3 font-semibold text-rose-600">
                      {formatPercent(comparison.ipcaReturnPercentageSamePeriod, true)}
                    </td>
                    <td className="text-right py-3 text-slate-600 dark:text-slate-400">
                      {formatPercent(comparison.ipcaAnnualizedPercentage || 0)} a.a.
                    </td>
                    <td
                      className={`text-right py-3 font-bold ${
                        comparison.realEstateVsIpcaPercentagePoints >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {comparison.realEstateVsIpcaPercentagePoints >= 0 ? "+" : ""}
                      {comparison.realEstateVsIpcaPercentagePoints.toFixed(2)} p.p.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Discriminação de Custos Considerados */}
          <div
            id="panel-costs-breakdown"
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Custos e Tributos Deduzidos na Simulação
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Preço de Aquisição:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(simulation.purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Valor Bruto Projetado de Venda:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(simulation.projectedSalePrice)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  Comissão de Corretagem ({simulation.costsConsidered.corretagemPercentage}% na venda):
                </span>
                <span className="text-rose-600 font-semibold">
                  - {formatCurrency((simulation.costsConsidered.corretagemPercentage / 100) * simulation.projectedSalePrice)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  ITBI ({simulation.costsConsidered.itbiPercentage}%) + Cartório/Registro:
                </span>
                <span className="text-rose-600 font-semibold">
                  - {formatCurrency((simulation.costsConsidered.itbiPercentage / 100) * simulation.purchasePrice + simulation.costsConsidered.registroAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  IR Ganho de Capital ({simulation.costsConsidered.impostoRendaPercentage}% est.):
                </span>
                <span className="text-rose-600 font-semibold">
                  - {formatCurrency(Math.max(0, simulation.projectedSalePrice - simulation.purchasePrice - simulation.netProfitAmount - ((simulation.costsConsidered.corretagemPercentage / 100) * simulation.projectedSalePrice + (simulation.costsConsidered.itbiPercentage / 100) * simulation.purchasePrice + simulation.costsConsidered.registroAmount)))}
                </span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-emerald-800 dark:text-emerald-200">Resultado Líquido Final:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(simulation.netProfitAmount)} ({formatPercent(comparison.realEstateReturnPercentage, true)})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPdfModal && (
        <ProfitabilityPdfExportModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          simulation={simulation}
          comparison={comparison}
        />
      )}
    </div>
  );
};
