import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Download,
  Users,
  Search,
  Building2,
  BarChart3,
  TrendingUp,
  FileText,
  ExternalLink,
} from "lucide-react";

export const NewsletterAnalyticsPanel: React.FC = () => {
  const { newsletters } = useApp();
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>(
    newsletters[0]?.id || "news-01"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeNewsletter =
    newsletters.find((n) => n.id === selectedNewsletterId) || newsletters[0];

  const stats = activeNewsletter?.stats || {
    sentCount: 32,
    deliveryRate: 100,
    openRate: 91,
    clicksPerSection: {
      "Resumo Executivo": 28,
      "Evolução da Obra": 31,
      "Galeria de Fotos": 30,
      "Novidades Comerciais": 22,
      "Portal do Investidor": 29,
      "Contato Gerente": 14,
    },
    docDownloads: 24,
    photoViews: 142,
    portalVisitsGenerated: 38,
    mostAccessedSPE: activeNewsletter?.speName || "SPE ARV Horizon",
    engagementByInvestor: [
      { investorId: "inv-01", investorName: "Dr. Roberto de Andrade Siqueira", opensCount: 5, clicksCount: 8, lastAccessDate: "2026-07-24" },
      { investorId: "inv-02", investorName: "Dra. Mariana Costa Mello", opensCount: 4, clicksCount: 6, lastAccessDate: "2026-07-23" },
      { investorId: "inv-03", investorName: "Eng. Carlos Eduardo Fontes", opensCount: 6, clicksCount: 10, lastAccessDate: "2026-07-24" },
      { investorId: "inv-04", investorName: "Beatriz Lins Guimarães", opensCount: 3, clicksCount: 4, lastAccessDate: "2026-07-21" },
    ],
  };

  const filteredInvestors = (stats.engagementByInvestor || []).filter((inv) =>
    inv.investorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Selector and Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Painel de Engajamento e Métricas das Newsletters
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe a taxa de abertura, cliques por card e engajamento individual dos investidores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Edição Selecionada:
          </label>
          <select
            value={selectedNewsletterId}
            onChange={(e) => setSelectedNewsletterId(e.target.value)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
          >
            {newsletters.map((news) => (
              <option key={news.id} value={news.id}>
                {news.editionName} ({news.speName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Send className="w-3.5 h-3.5 text-blue-500" />
            Disparados
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {stats.sentCount}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Investidores cotistas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Taxa de Entrega
          </span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.deliveryRate}%
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Excelente amostragem</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            Taxa de Abertura
          </span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.openRate}%
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Alta receptividade</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <ExternalLink className="w-3.5 h-3.5 text-purple-500" />
            Visitas ao Portal
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {stats.portalVisitsGenerated}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Acessos gerados</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            Downloads Docs
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {stats.docDownloads}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">PDFs baixados</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Fotos Visualizadas
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {stats.photoViews}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Visualizações no galeria</span>
        </div>
      </div>

      {/* Clicks per Section Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-amber-500" />
          Cliques e Interação por Card / Seção do Template
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(stats.clicksPerSection || {}).map(([section, count]) => (
            <div
              key={section}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {section}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                {count} cliques
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Investor Engagement Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Engajamento Individual por Investidor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identifique quem abriu e interagiu com os conteúdos do informativo
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar investidor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 pl-5">Investidor Cotista</th>
                <th className="p-3.5">Aberturas da Newsletter</th>
                <th className="p-3.5">Cliques em Links</th>
                <th className="p-3.5">Último Acesso</th>
                <th className="p-3.5 pr-5 text-right">Nível de Engajamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvestors.map((inv) => (
                <tr
                  key={inv.investorId}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-slate-100">
                    {inv.investorName}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {inv.opensCount}x
                    </span>{" "}
                    abertas
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {inv.clicksCount}
                    </span>{" "}
                    interações
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {inv.lastAccessDate}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/50">
                      Alta Receptividade VIP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
