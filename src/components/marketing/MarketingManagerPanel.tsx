import React, { useState, useMemo } from "react";
import {
  PieChart as PieIcon,
  BarChart as BarIcon,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Share2,
  RefreshCw,
  Plus,
  Radio,
  FileCheck,
  Send,
  Zap,
  SlidersHorizontal,
  Download,
  Sparkles,
  Filter,
  Info,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useApp } from "../../context/AppContext";

export const MarketingManagerPanel: React.FC = () => {
  const { leads, onboardings, addLead } = useApp();

  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [webhookSource, setWebhookSource] = useState<"Meta Ads" | "RD Station" | "Google Forms">("Meta Ads");

  // Analytics Computation
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.stage === "Venda Concluída" || l.stage === "Portal Liberado" || l.stage === "Onboarding");
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : "0.0";
  const totalVgvWon = wonLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  // Pending docs count
  const pendingDocsCount = leads.filter((l) => !l.uploadedDocs || !l.uploadedDocs.rg || !l.uploadedDocs.cpf).length;

  // Contracts in drafting
  const contractsDraftingCount = leads.filter((l) => l.stage === "Contrato" || l.stage === "Proposta").length;

  // Clients without 1st portal access
  const onboardingsPendingAccess = onboardings.filter((o) => !o.checklist?.firstAccessDone).length;

  // Campaign Breakdown
  const campaignStats: Record<string, { leads: number; won: number; value: number }> = {};
  leads.forEach((l) => {
    const key = l.originCampaign || "Outros";
    if (!campaignStats[key]) campaignStats[key] = { leads: 0, won: 0, value: 0 };
    campaignStats[key].leads += 1;
    if (l.stage === "Venda Concluída" || l.stage === "Portal Liberado" || l.stage === "Onboarding") {
      campaignStats[key].won += 1;
      campaignStats[key].value += l.dealValue || 0;
    }
  });

  // Channel Breakdown
  const channelStats: Record<string, number> = {};
  leads.forEach((l) => {
    const source = l.utmSource || "direto";
    channelStats[source] = (channelStats[source] || 0) + 1;
  });

  const handleSimulateWebhook = () => {
    setSimulatingWebhook(true);
    setTimeout(() => {
      const names = [
        "Dr. Fernando Araripe",
        "Dra. Priscila Holanda",
        "Eng. Marcos Vinicius Távora",
        "Eduardo Siqueira Filho",
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];

      addLead({
        name: randomName,
        phone: "(85) 99770-" + Math.floor(1000 + Math.random() * 9000),
        whatsapp: "(85) 99770-" + Math.floor(1000 + Math.random() * 9000),
        email: randomName.toLowerCase().replace(/[^a-z]/g, "") + "@gmail.com",
        originCampaign: `${webhookSource} - Lead Instantâneo API 2026`,
        utmSource: webhookSource.toLowerCase().replace(" ", "_"),
        utmMedium: "cpc",
        utmCampaign: "campanha_automatica",
        assignedBroker: "Camila Vasconcelos",
        speOfInterest: "SPE ARV Horizon Residence",
        stage: "Novo Lead",
        dealValue: 1200000,
      });

      setSimulatingWebhook(false);
    }, 800);
  };

  // ----------------------------------------------------
  // CUSTOM LEAD CHART BUILDER STATE & LOGIC
  // ----------------------------------------------------
  const [customGroupBy, setCustomGroupBy] = useState<"stage" | "speOfInterest" | "assignedBroker" | "utmSource" | "originCampaign" | "profession" | "city">("stage");
  const [customMetric, setCustomMetric] = useState<"leadCount" | "totalValue" | "avgValue" | "conversionRate">("leadCount");
  const [customChartType, setCustomChartType] = useState<"bar" | "pie" | "line" | "area">("bar");
  const [customStageFilter, setCustomStageFilter] = useState<string>("ALL");
  const [customSpeFilter, setCustomSpeFilter] = useState<string>("ALL");
  const [customBrokerFilter, setCustomBrokerFilter] = useState<string>("ALL");
  const [customUtmFilter, setCustomUtmFilter] = useState<string>("ALL");

  const availableStages = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.stage).filter(Boolean))).sort();
  }, [leads]);

  const availableSpesList = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.speOfInterest).filter(Boolean))).sort();
  }, [leads]);

  const availableBrokersList = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.assignedBroker).filter(Boolean))).sort();
  }, [leads]);

  const availableUtmsList = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.utmSource).filter(Boolean))).sort();
  }, [leads]);

  const customLeadChartData = useMemo(() => {
    const filtered = leads.filter((lead) => {
      if (customStageFilter !== "ALL" && lead.stage !== customStageFilter) return false;
      if (customSpeFilter !== "ALL" && lead.speOfInterest !== customSpeFilter) return false;
      if (customBrokerFilter !== "ALL" && lead.assignedBroker !== customBrokerFilter) return false;
      if (customUtmFilter !== "ALL" && lead.utmSource !== customUtmFilter) return false;
      return true;
    });

    const groupMap: Record<string, { key: string; leadCount: number; totalValue: number; wonCount: number }> = {};

    filtered.forEach((lead) => {
      let groupKey = "Não informado";
      if (customGroupBy === "stage") groupKey = lead.stage || "Outros";
      else if (customGroupBy === "speOfInterest") groupKey = lead.speOfInterest || "Sem SPE";
      else if (customGroupBy === "assignedBroker") groupKey = lead.assignedBroker || "Sem Corretor";
      else if (customGroupBy === "utmSource") groupKey = lead.utmSource || "Direto / Orgânico";
      else if (customGroupBy === "originCampaign") groupKey = lead.originCampaign || "Geral";
      else if (customGroupBy === "profession") groupKey = lead.profession || "Não informada";
      else if (customGroupBy === "city") groupKey = lead.city ? `${lead.city} - ${lead.state || "CE"}` : "Não informada";

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = { key: groupKey, leadCount: 0, totalValue: 0, wonCount: 0 };
      }

      groupMap[groupKey].leadCount += 1;
      groupMap[groupKey].totalValue += lead.dealValue || 0;
      if (lead.stage === "Venda Concluída" || lead.stage === "Portal Liberado" || lead.stage === "Onboarding") {
        groupMap[groupKey].wonCount += 1;
      }
    });

    const result = Object.values(groupMap).map((item) => {
      const avgValue = item.leadCount > 0 ? item.totalValue / item.leadCount : 0;
      const convRate = item.leadCount > 0 ? Number(((item.wonCount / item.leadCount) * 100).toFixed(1)) : 0;

      let value = 0;
      let displayValueFormatted = "";

      if (customMetric === "leadCount") {
        value = item.leadCount;
        displayValueFormatted = `${item.leadCount} leads`;
      } else if (customMetric === "totalValue") {
        value = Number((item.totalValue / 1000).toFixed(1));
        displayValueFormatted = `R$ ${(item.totalValue / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
      } else if (customMetric === "avgValue") {
        value = Number((avgValue / 1000).toFixed(1));
        displayValueFormatted = `R$ ${(avgValue / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
      } else if (customMetric === "conversionRate") {
        value = convRate;
        displayValueFormatted = `${convRate}% (${item.wonCount} vendas)`;
      }

      return {
        name: item.key,
        value,
        leadCountRaw: item.leadCount,
        totalValueRaw: item.totalValue,
        avgValueRaw: avgValue,
        wonCountRaw: item.wonCount,
        conversionRateRaw: convRate,
        displayValueFormatted,
      };
    });

    return result.sort((a, b) => b.value - a.value);
  }, [leads, customGroupBy, customMetric, customStageFilter, customSpeFilter, customBrokerFilter, customUtmFilter]);

  const handleExportLeadChartCSV = () => {
    if (customLeadChartData.length === 0) return;
    const headers = ["Grupo / Categoria", "Valor Gráfico", "Qtd Leads", "VGV Total (R$)", "Ticket Médio (R$)", "Vendas Concluídas", "Taxa Conversão (%)"];
    const rows = customLeadChartData.map((d) => [
      `"${d.name}"`,
      d.value,
      d.leadCountRaw,
      d.totalValueRaw,
      Math.round(d.avgValueRaw),
      d.wonCountRaw,
      d.conversionRateRaw,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `arv_analise_leads_${customGroupBy}_${customMetric}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6"];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <PieIcon className="w-4 h-4" /> Painel do Gestor Comercial & Mídia
          </div>
          <h2 className="text-2xl font-bold mt-1 text-white">
            Performance de Marketing & Conversão
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de CAC, ROI de Mídia, Tempo do Funil e Integrações Omnichannel
          </p>
        </div>

        {/* Webhook Simulator Action */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
          <select
            value={webhookSource}
            onChange={(e) => setWebhookSource(e.target.value as any)}
            className="bg-slate-900 text-white text-xs p-2 rounded-lg border border-slate-700 font-semibold"
          >
            <option value="Meta Ads">Meta Ads (FB/IG)</option>
            <option value="RD Station">RD Station CRM</option>
            <option value="Google Forms">Google Forms LP</option>
          </select>

          <button
            onClick={handleSimulateWebhook}
            disabled={simulatingWebhook}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            {simulatingWebhook ? "Importando..." : "Simular Webhook API"}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Leads Captados</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalLeads} Leads</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">100% Rastreados via UTM</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Taxa de Conversão</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{conversionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{wonLeads.length} Vendas Concluídas</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Custo Médio por Venda (CAC)</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">R$ 1.850</div>
          <div className="text-[10px] text-slate-400 mt-1">Média sobre Mídia Paga</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tempo Médio Lead → Contrato</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">8,4 Dias</div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Eficiência Alta</div>
        </div>
      </div>

      {/* Secondary Operational Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Docs Pendentes / Corretor</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{pendingDocsCount} Clientes</div>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Contratos em Minuta</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">{contractsDraftingCount} Contratos</div>
          </div>
          <FileCheck className="w-8 h-8 text-blue-600 opacity-80" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Onboardings Ativos</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{onboardings.length} Clientes</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Pendente 1º Acesso Portal</div>
            <div className="text-xl font-bold text-purple-600 mt-0.5">{onboardingsPendingAccess} Clientes</div>
          </div>
          <Clock className="w-8 h-8 text-purple-500 opacity-80" />
        </div>
      </div>

      {/* CUSTOM INTERACTIVE LEAD CHART BUILDER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-blue-500" /> Análise Dinâmica de Leads
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Gerador de Gráficos & Relatórios de Leads
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Filtre e cruze variáveis do funil comercial, SPEs, corretor, origem UTM, campanha e ticket de negociação.
            </p>
          </div>

          <button
            onClick={handleExportLeadChartCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start lg:self-auto border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" /> Exportar Dados (.CSV)
          </button>
        </div>

        {/* QUICK PRESETS */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Atalhos Rápidos de Análise:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCustomGroupBy("stage");
                setCustomMetric("leadCount");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              🎯 Leads por Etapa do Funil
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("speOfInterest");
                setCustomMetric("totalValue");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              🏢 VGV em Negociação por SPE
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("assignedBroker");
                setCustomMetric("conversionRate");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              👤 Conversion Rate por Corretor
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("utmSource");
                setCustomMetric("leadCount");
                setCustomChartType("pie");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              📻 Distribuição por Canal (UTM)
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("profession");
                setCustomMetric("avgValue");
                setCustomChartType("area");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              💼 Ticket Médio por Profissão
            </button>
          </div>
        </div>

        {/* CONTROLS MATRIX (FILTERS & CHART PARAMS) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* 1. Group By (Eixo X) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Agrupar por (Eixo X):
              </label>
              <select
                value={customGroupBy}
                onChange={(e) => setCustomGroupBy(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="stage">Etapa do Funil</option>
                <option value="speOfInterest">SPE / Empreendimento</option>
                <option value="assignedBroker">Corretor Responsável</option>
                <option value="utmSource">Canal / Origem UTM</option>
                <option value="originCampaign">Campanha de Origem</option>
                <option value="profession">Profissão do Lead</option>
                <option value="city">Cidade / Estado</option>
              </select>
            </div>

            {/* 2. Metric (Eixo Y) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Métrica Analisada:
              </label>
              <select
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="leadCount">Quantidade de Leads</option>
                <option value="totalValue">VGV Total (R$ mil)</option>
                <option value="avgValue">Ticket Médio (R$ mil)</option>
                <option value="conversionRate">Taxa de Conversão (%)</option>
              </select>
            </div>

            {/* 3. Chart Format */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Visualização:
              </label>
              <select
                value={customChartType}
                onChange={(e) => setCustomChartType(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="bar">📊 Gráfico de Barras</option>
                <option value="pie">🍕 Gráfico de Pizza / Rosca</option>
                <option value="line">📈 Gráfico de Linha</option>
                <option value="area">🏔️ Gráfico de Área</option>
              </select>
            </div>

            {/* 4. Filter Stage */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar Etapa:
              </label>
              <select
                value={customStageFilter}
                onChange={(e) => setCustomStageFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas as Etapas</option>
                {availableStages.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Filter SPE */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar SPE:
              </label>
              <select
                value={customSpeFilter}
                onChange={(e) => setCustomSpeFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas as SPEs</option>
                {availableSpesList.map((spe) => (
                  <option key={spe} value={spe}>
                    {spe}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Filter Broker */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar Corretor:
              </label>
              <select
                value={customBrokerFilter}
                onChange={(e) => setCustomBrokerFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos os Corretores</option>
                {availableBrokersList.map((brk) => (
                  <option key={brk} value={brk}>
                    {brk}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Filter UTM Source */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar Canal UTM:
              </label>
              <select
                value={customUtmFilter}
                onChange={(e) => setCustomUtmFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos os Canais</option>
                {availableUtmsList.map((utm) => (
                  <option key={utm} value={utm}>
                    {utm}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CUSTOM SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total de Leads Filtrados</span>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              {customLeadChartData.reduce((acc, c) => acc + c.leadCountRaw, 0)} Leads
            </div>
            <span className="text-[10px] text-slate-500">
              VGV Total: R$ {(customLeadChartData.reduce((acc, c) => acc + c.totalValueRaw, 0) / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Grupos / Categorias</span>
            <div className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
              {customLeadChartData.length} segmentos
            </div>
            <span className="text-[10px] text-slate-500">Agrupados por {customGroupBy}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Líder do Ranking</span>
            <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base truncate">
              {customLeadChartData[0]?.name || "N/A"}
            </div>
            <span className="text-[10px] text-slate-500">{customLeadChartData[0]?.displayValueFormatted || "-"}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Vendas Concluídas</span>
            <div className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
              {customLeadChartData.reduce((acc, c) => acc + c.wonCountRaw, 0)} Contratos
            </div>
            <span className="text-[10px] text-slate-500">
              Taxa média:{" "}
              {customLeadChartData.length > 0
                ? (
                    customLeadChartData.reduce((acc, c) => acc + c.conversionRateRaw, 0) /
                    customLeadChartData.length
                  ).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>

        {/* DYNAMIC CHART RENDERER CONTAINER */}
        <div className="h-80 w-full pt-2">
          {customLeadChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Info className="w-8 h-8 text-slate-400 mb-2" />
              Nenhum lead encontrado com os filtros selecionados.
            </div>
          ) : customChartType === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={customLeadChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    customMetric === "leadCount"
                      ? "Quantidade"
                      : customMetric === "totalValue"
                      ? "VGV (R$)"
                      : customMetric === "avgValue"
                      ? "Ticket Médio (R$)"
                      : "Conversão (%)",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="value" name={customGroupBy.toUpperCase()} radius={[6, 6, 0, 0]}>
                  {customLeadChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : customChartType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={customLeadChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {customLeadChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Métrica",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : customChartType === "line" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customLeadChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Valor",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#3b82f6" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customLeadChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Valor",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaigns and Channel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Desempenho por Campanha de Mídia
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Campanha</th>
                  <th className="p-2.5">Leads</th>
                  <th className="p-2.5">Vendas</th>
                  <th className="p-2.5">Tx. Conv.</th>
                  <th className="p-2.5 rounded-r-lg">VGV Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(campaignStats).map(([camp, data]) => {
                  const rate = data.leads > 0 ? ((data.won / data.leads) * 100).toFixed(0) : "0";

                  return (
                    <tr key={camp} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{camp}</td>
                      <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">{data.leads}</td>
                      <td className="p-2.5 font-semibold text-emerald-600">{data.won}</td>
                      <td className="p-2.5 font-semibold text-blue-700 dark:text-blue-400">{rate}%</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                        R$ {(data.value / 1000).toLocaleString("pt-BR")}k
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Channels Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Origem por Canal (UTM Source)
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(channelStats).map(([ch, count]) => {
              const pct = Math.round((count / totalLeads) * 100) || 0;

              return (
                <div key={ch} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="capitalize text-slate-800 dark:text-slate-200">{ch}</span>
                    <span className="text-slate-500">{count} leads ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Status de Conexões API Marketing
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            { name: "Meta Ads (FB/IG)", status: "Conectado API v19", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { name: "RD Station CRM", status: "Webhook Ativo", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { name: "Google Forms LP", status: "Sincronizado", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { name: "WhatsApp Business API", status: "Online", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { name: "E-mail Marketing", status: "Servidor OK", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { name: "ClickSign / DocuSign", status: "Webhook OK", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
          ].map((int, idx) => (
            <div key={idx} className={`p-3 rounded-lg border text-center space-y-1 ${int.color}`}>
              <div className="font-bold">{int.name}</div>
              <div className="text-[10px] font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {int.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
