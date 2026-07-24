import React, { useState } from "react";
import {
  PieChart,
  BarChart,
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
} from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <PieChart className="w-4 h-4" /> Painel do Gestor Comercial & Mídia
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

      {/* Campaigns and Channel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Desempenho por Campanha de Mídia
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
