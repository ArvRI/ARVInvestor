import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import {
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  DollarSign,
  Tag,
  TrendingUp,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { ChartViewTab, ChartMetric } from "./CommercialChartControls";
import { CommercialBrokerStockMirror } from "./CommercialBrokerStockMirror";
import { PriceTable, PricingUnit } from "../../../types/pricing";
import { CommercialReportData } from "../../../services/pricing/commercialPdfExportService";

interface CommercialChartsSectionProps {
  activeTab: ChartViewTab;
  metric: ChartMetric;
  statusChartData: { name: string; value: number; count: number; percent: number; color: string }[];
  tipologyChartData: any[];
  speComparisonData: any[];
  floorChartData: any[];
  kpis: any;
  formatCurrency: (val: number) => string;
  formatShortCurrency: (val: number) => string;
  tables?: PriceTable[];
  activeTable?: PriceTable | null;
  isConsolidated?: boolean;
  units?: PricingUnit[];
  simulatedCub?: number;
  cubSimVariation?: number;
  reportData?: CommercialReportData;
  onSimulateUnit?: (unit: PricingUnit) => void;
}

export const CommercialChartsSection: React.FC<CommercialChartsSectionProps> = ({
  activeTab,
  metric,
  statusChartData,
  tipologyChartData,
  speComparisonData,
  floorChartData,
  kpis,
  formatCurrency,
  formatShortCurrency,
  tables = [],
  activeTable = null,
  isConsolidated = true,
  units = [],
  simulatedCub = 0,
  cubSimVariation = 0,
  reportData,
  onSimulateUnit,
}) => {
  const getMetricLabel = () => {
    if (metric === "vgv") return "VGV (R$)";
    if (metric === "unidades") return "Unidades";
    return "Área Privativa (m²)";
  };

  const getMetricKey = (prefix: "sold" | "available" | "total") => {
    if (metric === "vgv") return `${prefix}Vgv`;
    if (metric === "unidades") return `${prefix}Units`;
    return `${prefix}Area`;
  };

  const formatMetricValue = (val: number) => {
    if (metric === "vgv") return formatCurrency(val);
    if (metric === "unidades") return `${val} un`;
    return `${val.toFixed(1)} m²`;
  };

  // If Espelho para Corretores is selected:
  if (activeTab === "espelho_corretores" && reportData) {
    return (
      <CommercialBrokerStockMirror
        tables={tables}
        activeTable={activeTable}
        isConsolidated={isConsolidated}
        units={units}
        simulatedCub={simulatedCub}
        cubSimVariation={cubSimVariation}
        reportData={reportData}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
        onSimulateUnit={onSimulateUnit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. VIEW: GERAL (Donut + Tipologias) */}
      {activeTab === "geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart - Status do Estoque */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" />
                  Composição do VGV por Status
                </h3>
                <span className="text-[11px] text-slate-400">{kpis.totalUnits} un.</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribuição financeira entre vendidas, disponíveis e reservas
              </p>
            </div>

            <div className="h-64 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "VGV"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {statusChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">{item.percent.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-400">{item.count} un</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - VGV & Absorção por Tipologia */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Vendido vs Estoque por Tipologia ({getMetricLabel()})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {tipologyChartData.length} tipologias
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo de absorção realizada e estoque remanescente
              </p>
            </div>

            <div className="h-64 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tipologyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tickFormatter={(v) => {
                      if (metric === "vgv") return `R$ ${(v / 1000000).toFixed(1)}M`;
                      if (metric === "unidades") return `${v} un`;
                      return `${v} m²`;
                    }}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatMetricValue(Number(val)),
                      name === getMetricKey("sold") ? "Vendido / Realizado" : "Disponível (Estoque)",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    formatter={(value) => (value === getMetricKey("sold") ? "Vendido" : "Disponível (Estoque)")}
                  />
                  <Bar dataKey={getMetricKey("sold")} fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey={getMetricKey("available")} fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>
                Maior volume: <strong>{tipologyChartData[0]?.type || "N/A"}</strong> ({formatShortCurrency(tipologyChartData[0]?.totalVgv || 0)})
              </span>
              <span>
                Maior VSO:{" "}
                <strong>
                  {tipologyChartData.length > 0
                    ? tipologyChartData.reduce((max, t) => (t.vsoPercent > max.vsoPercent ? t : max), tipologyChartData[0]).type
                    : "N/A"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW: COMPARATIVO ENTRE EMPREENDIMENTOS (SPEs) */}
      {(activeTab === "comparativo_spe" || activeTab === "geral") && speComparisonData.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Desempenho Comercial Comparativo por Empreendimento (SPE)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparação de VGV Vendido, VGV em Estoque e Velocidade de Vendas (VSO %) em cada projeto
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl">
              {speComparisonData.length} Empreendimentos Selecionados
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={speComparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="tableName" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: "#f59e0b" }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name === "vsoPercent") return [`${Number(val).toFixed(1)}%`, "VSO (Velocidade)"];
                    return [formatCurrency(Number(val)), name === "soldVgv" ? "VGV Vendido" : "VGV Disponível"];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(value) => {
                    if (value === "soldVgv") return "VGV Vendido (R$)";
                    if (value === "availableVgv") return "VGV Disponível (R$)";
                    return "Taxa VSO (%)";
                  }}
                />
                <Bar yAxisId="left" dataKey="soldVgv" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="availableVgv" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="vsoPercent" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. VIEW: PAVIMENTOS */}
      {(activeTab === "pavimentos" || (activeTab === "geral" && floorChartData.length > 0)) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Absorção Vertical por Pavimento / Andar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribuição de unidades vendidas vs estoque disponível em cada nível da torre
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{floorChartData.length} pavimentos</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="floorName" type="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} unidades`,
                    name === "soldUnits" ? "Vendidas" : "Disponíveis",
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => (value === "soldUnits" ? "Vendidas" : "Disponíveis")}
                />
                <Bar dataKey="soldUnits" fill="#6366f1" stackId="stack" radius={[0, 0, 0, 0]} />
                <Bar dataKey="availableUnits" fill="#10b981" stackId="stack" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. VIEW: PREÇO MÉDIO / M² E CUB */}
      {activeTab === "preco_m2" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Preço Médio por m² Privativo & Ticket por Tipologia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valorização do m² privativo e índice em CUB/SC para cada tipologia
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tipologyChartData} margin={{ top: 15, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v.toFixed(1)} CUB`}
                  tick={{ fontSize: 10, fill: "#10b981" }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name === "avgCubM2") return [`${Number(val).toFixed(2)} CUBs / m²`, "Índice CUB"];
                    return [formatCurrency(Number(val)), name === "avgPriceM2" ? "Preço Médio / m²" : "Ticket Médio"];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(value) => {
                    if (value === "avgPriceM2") return "Preço Médio / m² (R$)";
                    return "CUBs / m²";
                  }}
                />
                <Bar yAxisId="left" dataKey="avgPriceM2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgCubM2" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. VIEW: FLUXO DE RECEBÍVEIS */}
      {activeTab === "fluxo_recebiveis" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Estrutura Padrão de Fluxo de Recebíveis da Obra
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Divisão projetada entre Sinal/Ato (12%), Mensais (15%), Balões (8%), Chaves (5%) e Financiamento (60%)
              </p>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
              Total {formatShortCurrency(kpis.totalVgv)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500">1. Sinal / Ato (12%)</div>
              <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                {formatShortCurrency(kpis.atoReceivables)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Agosto/2026</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500">2. 40x Mensais (15%)</div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                {formatShortCurrency(kpis.monthlyReceivables)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Set/26 a Dez/29</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500">3. 6x Reforços (8%)</div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                {formatShortCurrency(kpis.balloonReceivables)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Semestrais</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500">4. Chaves (5%)</div>
              <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                {formatShortCurrency(kpis.finalInstallmentReceivables)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Dezembro/2029</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-500">5. Financiamento (60%)</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {formatShortCurrency(kpis.financingReceivables)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Quitação bancária</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
