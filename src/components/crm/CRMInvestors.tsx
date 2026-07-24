import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Download,
  UserPlus,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { InvestorTier } from "../../types";
import { InvestorDetailModal } from "./InvestorDetailModal";
import { ScoreGauge } from "../common/ScoreGauge";

interface CRMInvestorsProps {
  onOpenNewInvestor: () => void;
}

export const CRMInvestors: React.FC<CRMInvestorsProps> = ({ onOpenNewInvestor }) => {
  const { investors, contracts } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedConsultant, setSelectedConsultant] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);

  // Filter logic
  const filteredInvestors = investors.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      inv.name.toLowerCase().includes(q) ||
      inv.cpfCnpj.includes(q) ||
      inv.email.toLowerCase().includes(q) ||
      inv.city.toLowerCase().includes(q) ||
      inv.profession.toLowerCase().includes(q);

    const matchesTier = selectedTier === "ALL" || inv.tier === selectedTier;
    const matchesConsultant =
      selectedConsultant === "ALL" || inv.consultant === selectedConsultant;

    return matchesQuery && matchesTier && matchesConsultant;
  });

  // Global KPIs
  const totalInvestedAll = contracts.reduce((acc, c) => acc + c.investedAmount, 0);
  const avgTicket = investors.length ? Math.round(totalInvestedAll / investors.length) : 0;
  const platinumCount = investors.filter((i) => i.tier === "Platinum").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700 dark:text-blue-400" /> CRM Investidores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão completa de relacionamento, contratos, histórico de interações e Score Inteligente (Base de 30 investidores).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewInvestor}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Novo Investidor
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total de Investidores</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{investors.length}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">100% Ativos no Hub</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patrimônio Gerido Total</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
            R$ {(totalInvestedAll / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Soma dos aportes das SPEs</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ticket Médio por Investidor</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            R$ {(avgTicket / 1000).toFixed(0)} mil
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Média do grupo cadastrado</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Clientes Platinum (Score &gt; 88)</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{platinumCount}</div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Elegíveis a Novos Lançamentos</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, e-mail, profissão ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tier Filter Dropdown */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">Todos os Tiers de Score</option>
            <option value="Platinum">Platinum (88-100)</option>
            <option value="Gold">Gold (75-87)</option>
            <option value="Silver">Silver (60-74)</option>
            <option value="Bronze">Bronze (45-59)</option>
            <option value="Risco">Em Risco (&lt;45)</option>
          </select>

          {/* Consultant Filter */}
          <select
            value={selectedConsultant}
            onChange={(e) => setSelectedConsultant(e.target.value)}
            className="hidden lg:block px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">Todos os Consultores</option>
            <option value="Camila Vasconcelos">Camila Vasconcelos</option>
            <option value="Gabriel Fontes">Gabriel Fontes</option>
            <option value="Mariana Barreto">Mariana Barreto</option>
          </select>
        </div>

        {/* View Toggle (Table / Grid) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
            title="Visão Tabela Completa"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
            title="Visão Cards em Grade"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === "table" ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Investidor</th>
                  <th className="p-4">Profissão & Cidade</th>
                  <th className="p-4">Consultor RI</th>
                  <th className="p-4">Score & Tier</th>
                  <th className="p-4">Total Aportado</th>
                  <th className="p-4">Satisfação NPS</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInvestors.map((inv) => {
                  const invContracts = contracts.filter((c) => c.investorId === inv.id);
                  const invInvested = invContracts.reduce((acc, c) => acc + c.investedAmount, 0);

                  const tierBadges: Record<InvestorTier, string> = {
                    Platinum: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                    Gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    Silver: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
                    Bronze: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                    Risco: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                  };

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvestorId(inv.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={inv.avatarUrl}
                            alt={inv.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {inv.name}
                            </div>
                            <div className="text-[10px] text-slate-400">CPF: {inv.cpfCnpj}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-900 dark:text-slate-200 font-medium">{inv.profession}</div>
                        <div className="text-[10px] text-slate-400">{inv.city}</div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {inv.consultant}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {inv.score}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              tierBadges[inv.tier]
                            }`}
                          >
                            {inv.tier}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                        R$ {invInvested ? invInvested.toLocaleString("pt-BR") : "1.000.000"}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {inv.npsCategory} ({inv.satisfactionScore}/10)
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestors.map((inv) => {
            const invContracts = contracts.filter((c) => c.investorId === inv.id);
            const invInvested = invContracts.reduce((acc, c) => acc + c.investedAmount, 0);

            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvestorId(inv.id)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-amber-500/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={inv.avatarUrl}
                      alt={inv.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-500 transition-colors">
                        {inv.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{inv.profession} • {inv.city}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Total Investido</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      R$ {invInvested ? invInvested.toLocaleString("pt-BR") : "1.000.000"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Score Inteligente</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{inv.score} / 100 ({inv.tier})</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>Consultor: <strong className="text-slate-700 dark:text-slate-300">{inv.consultant}</strong></span>
                  <span className="text-amber-600 font-semibold group-hover:underline">Ver perfil →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInvestorId && (
        <InvestorDetailModal
          investorId={selectedInvestorId}
          onClose={() => setSelectedInvestorId(null)}
        />
      )}
    </div>
  );
};
