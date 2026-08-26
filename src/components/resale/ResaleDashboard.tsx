import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  ResaleListing,
  ResalePricing,
  ResalePaymentCondition,
  ResaleLead,
  ReturnRecord,
  SPE,
  Investor,
} from "../../types";

interface ResaleDashboardProps {
  listings: ResaleListing[];
  pricingList: ResalePricing[];
  conditionsList: ResalePaymentCondition[];
  leads: ResaleLead[];
  returns: ReturnRecord[];
  spes: SPE[];
  investors: Investor[];
  onOpenReportModal: () => void;
  onOpenReturnModal: () => void;
  onOpenNewListingModal: () => void;
}

export const ResaleDashboard: React.FC<ResaleDashboardProps> = ({
  listings,
  pricingList,
  conditionsList,
  leads,
  returns,
  spes,
  investors,
  onOpenReportModal,
  onOpenReturnModal,
  onOpenNewListingModal,
}) => {
  const [selectedSpeId, setSelectedSpeId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"all" | "month" | "quarter">("all");

  // Filter listings based on controls
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (selectedStatus !== "all" && l.status !== selectedStatus) return false;
      if (selectedSpeId !== "all") {
        const ret = returns.find((r) => r.id === l.returnRecordId);
        if (ret && ret.speId !== selectedSpeId) return false;
      }
      return true;
    });
  }, [listings, selectedSpeId, selectedStatus, returns]);

  const filteredPricing = useMemo(() => {
    return pricingList.filter((p) =>
      filteredListings.some((l) => l.id === p.resaleListingId)
    );
  }, [pricingList, filteredListings]);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (selectedSpeId !== "all" && r.speId !== selectedSpeId) return false;
      return true;
    });
  }, [returns, selectedSpeId]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedSpeId !== "all") {
        const listing = listings.find((l) => l.id === lead.resaleListingId);
        const ret = returns.find((r) => r.id === listing?.returnRecordId);
        if (ret && ret.speId !== selectedSpeId) return false;
      }
      return true;
    });
  }, [leads, selectedSpeId, listings, returns]);

  // Aggregated KPIs
  const totalListings = filteredListings.length;
  const publishedCount = filteredListings.filter((l) => l.status === "Publicado").length;
  const soldCount = filteredListings.filter((l) => l.status === "Vendido").length;
  const inPrepCount = filteredListings.filter((l) => l.status === "Em Preparação").length;
  const reservedCount = filteredListings.filter((l) => l.status === "Reservado").length;

  const totalVgvResale = filteredPricing.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
  const totalVgvTable = filteredPricing.reduce((acc, p) => acc + (p.originalTablePrice || 0), 0);
  const totalVgvSold = filteredListings
    .filter((l) => l.status === "Vendido")
    .reduce((acc, l) => {
      const p = filteredPricing.find((pr) => pr.resaleListingId === l.id);
      return acc + (p?.resalePrice || 0);
    }, 0);

  const totalOriginalContractAmount = filteredReturns.reduce(
    (acc, r) => acc + (r.originalContractAmount || 0),
    0
  );
  const totalRetentionSPE = filteredReturns.reduce(
    (acc, r) =>
      acc + ((r.originalContractAmount || 0) * (r.retentionPercentage || 0)) / 100,
    0
  );
  const totalRefundToInvestors = filteredReturns.reduce(
    (acc, r) => acc + (r.amountRefundedToInvestor || 0),
    0
  );

  const avgDiscount =
    filteredPricing.length > 0
      ? filteredPricing.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) /
        filteredPricing.length
      : 0;

  const conversionRate =
    totalListings > 0 ? ((soldCount / totalListings) * 100).toFixed(1) : "0.0";

  // Chart 1: Status Distribution
  const statusDistributionData = [
    { name: "Publicado", value: publishedCount, color: "#3b82f6" },
    { name: "Em Preparação", value: inPrepCount, color: "#f59e0b" },
    { name: "Reservado", value: reservedCount, color: "#8b5cf6" },
    { name: "Vendido", value: soldCount, color: "#10b981" },
    {
      name: "Pausado",
      value: filteredListings.filter((l) => l.status === "Pausado").length,
      color: "#64748b",
    },
  ].filter((d) => d.value > 0);

  // Chart 2: Pricing Comparison
  const pricingComparisonData = filteredPricing.map((p) => {
    const listing = filteredListings.find((l) => l.id === p.resaleListingId);
    return {
      unit: p.unitId,
      title: listing?.listingTitle || p.unitId,
      tabela: Math.round(p.originalTablePrice / 1000),
      revenda: Math.round(p.resalePrice / 1000),
      piso: Math.round(p.minimumAcceptablePrice / 1000),
      desconto: p.discountPercentageVsTable,
    };
  });

  // Chart 3: Distratos Financial Breakdown
  const returnsFinancialData = filteredReturns.map((r) => {
    const retentionVal = ((r.originalContractAmount || 0) * (r.retentionPercentage || 0)) / 100;
    return {
      unit: r.unitId,
      contrato: Math.round(r.originalContractAmount / 1000),
      retencao: Math.round(retentionVal / 1000),
      restituicao: Math.round(r.amountRefundedToInvestor / 1000),
      retencaoPct: r.retentionPercentage,
    };
  });

  // Chart 4: Lead Funnel
  const funnelStages = [
    {
      stage: "Novos Leads",
      count: filteredLeads.filter((l) => l.status === "Novo").length,
      color: "#3b82f6",
    },
    {
      stage: "Em Atendimento",
      count: filteredLeads.filter((l) => l.status === "Em Atendimento").length,
      color: "#f59e0b",
    },
    {
      stage: "Proposta Enviada",
      count: filteredLeads.filter((l) => l.status === "Proposta Enviada").length,
      color: "#8b5cf6",
    },
    {
      stage: "Convertido (Vendido)",
      count: filteredLeads.filter((l) => l.status === "Convertido").length,
      color: "#10b981",
    },
    {
      stage: "Perdido",
      count: filteredLeads.filter((l) => l.status === "Perdido").length,
      color: "#64748b",
    },
  ];

  // Chart 5: Leads by Source
  const leadSourceMap: { [k: string]: number } = {};
  filteredLeads.forEach((l) => {
    leadSourceMap[l.source] = (leadSourceMap[l.source] || 0) + 1;
  });
  const leadSourceData = Object.entries(leadSourceMap).map(([name, value]) => ({
    name,
    value,
  }));
  const SOURCE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"];

  // Units close to floor margin risk
  const marginRiskUnits = filteredPricing.filter((p) => {
    const margin = p.resalePrice - p.minimumAcceptablePrice;
    return margin <= p.originalTablePrice * 0.05;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* SPE Filter */}
          <select
            value={selectedSpeId}
            onChange={(e) => setSelectedSpeId(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">Todas as SPEs / Empreendimentos</option>
            {spes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">Todos os Status</option>
            <option value="Publicado">Publicados (Ativos)</option>
            <option value="Em Preparação">Em Preparação</option>
            <option value="Reservado">Reservados</option>
            <option value="Vendido">Vendidos / Recolocados</option>
            <option value="Pausado">Pausados</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gerar Relatórios & Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: VGV em Revenda */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>VGV em Revenda</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            R$ {(totalVgvResale / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500">
            {totalListings} unidades monitoradas
          </div>
        </div>

        {/* KPI 2: VGV Recolocado */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>VGV Recolocado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            R$ {(totalVgvSold / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {soldCount} unidades concluídas
          </div>
        </div>

        {/* KPI 3: Retenção SPE Retida */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Retenção Legal SPE</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            R$ {(totalRetentionSPE / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-500">
            Lei nº 13.786/2018
          </div>
        </div>

        {/* KPI 4: Desconto Médio */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Desconto Médio</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {avgDiscount.toFixed(1)}% OFF
          </div>
          <div className="text-[11px] text-slate-500">
            vs. Tabela Geral
          </div>
        </div>

        {/* KPI 5: Conversão de Vendas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Taxa de Conversão</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {soldCount} de {totalListings} unidades
          </div>
        </div>

        {/* KPI 6: Leads no Pipeline */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Leads Captados</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {filteredLeads.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Interessados ativos
          </div>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tabela vs Revenda vs Piso Mínimo */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Comparativo de Precificação: Tabela vs. Revenda vs. Piso Mínimo
              </h3>
              <p className="text-xs text-slate-500">Valores expressos em R$ mil por unidade</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pricingComparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `R$ ${Number(val).toLocaleString("pt-BR")}k`,
                    name === "tabela"
                      ? "Tabela Oficial"
                      : name === "revenda"
                      ? "Preço Revenda"
                      : "Piso de Segurança",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "tabela"
                      ? "Tabela Oficial"
                      : value === "revenda"
                      ? "Preço de Revenda"
                      : "Piso Mínimo"
                  }
                />
                <Bar dataKey="tabela" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="revenda" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="piso" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distratos Financial Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Composição Financeira dos Distratos (Lei nº 13.786/2018)
              </h3>
              <p className="text-xs text-slate-500">
                Valor original do contrato, retenção da incorporadora e restituição ao investidor
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnsFinancialData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `R$ ${Number(val).toLocaleString("pt-BR")}k`,
                    name === "contrato"
                      ? "Valor Contrato Original"
                      : name === "retencao"
                      ? "Retenção da SPE"
                      : "Restituição ao Investidor",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "contrato"
                      ? "Contrato Original"
                      : value === "retencao"
                      ? "Retenção SPE (Lei 13.786)"
                      : "Restituição Devolvida"
                  }
                />
                <Bar dataKey="contrato" fill="#64748b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="retencao" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="restituicao" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Status Donut + Funnel + Lead Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Status das Unidades na Esteira
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Vendas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Funil Comercial de Leads de Revenda
          </h3>
          <div className="space-y-2.5 pt-1">
            {funnelStages.map((st, idx) => {
              const maxVal = Math.max(...funnelStages.map((s) => s.count), 1);
              const widthPct = Math.max((st.count / maxVal) * 100, 12);

              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{st.stage}</span>
                    <span className="font-bold">{st.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: st.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Origem dos Leads */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Canais de Captação de Compradores
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell
                      key={`source-${index}`}
                      fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Governance & Margin Safety Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Governança Comercial, Piso Mínimo & Conformidade Legal
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
            Regras de Proteção Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Trava Rígida de Piso Mínimo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Nenhuma unidade pode ser publicada ou vendida abaixo do piso aprovado pela diretoria sem assinatura de aprovação prévia.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Retenção Lei nº 13.786/2018</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Retenção de até 25% a 50% (em caso de patrimônio de afetação) garantindo amortização de corretagem e despesas operacionais da SPE.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Prioridade a Investidores da Base</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Oportunidades de revenda são sincronizadas automaticamente com o portal do investidor para captação imediata com ticket preferencial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
