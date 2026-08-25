import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  User,
  Plus,
  MessageSquare,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ScoreGauge } from "../common/ScoreGauge";
import { NewInteractionModal } from "../common/NewInteractionModal";
import { InvestorProfitabilityCard } from "../profitability/InvestorProfitabilityCard";

interface InvestorDetailModalProps {
  investorId: string | null;
  onClose: () => void;
}

export const InvestorDetailModal: React.FC<InvestorDetailModalProps> = ({
  investorId,
  onClose,
}) => {
  const { investors, contracts, spes, timelineInteractions, assemblies } = useApp();
  const [activeTab, setActiveTab] = useState<"perfil" | "contratos" | "score" | "timeline">("perfil");
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);

  if (!investorId) return null;

  const investor = investors.find((i) => i.id === investorId);
  if (!investor) return null;

  const invContracts = contracts.filter((c) => c.investorId === investor.id);
  const invTotalInvested = invContracts.reduce((acc, c) => acc + c.investedAmount, 0);
  const invInteractions = timelineInteractions.filter((t) => t.investorId === investor.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={investor.avatarUrl}
              alt={investor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/80 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{investor.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-slate-950">
                  {investor.tier}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-amber-500" /> {investor.profession}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {investor.city}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-amber-500" /> Consultor: {investor.consultant}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddInteractionOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Registrar Contato
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs overflow-x-auto">
          {[
            { id: "perfil", label: "Perfil & Cadastro", icon: User },
            { id: "contratos", label: `Carteira (${invContracts.length})`, icon: FileText },
            { id: "score", label: `Score Inteligente (${investor.score}/100)`, icon: Award },
            { id: "timeline", label: `Timeline de Interações (${invInteractions.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === "perfil" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                  Dados de Identificação & Contato
                </div>
                <div className="flex justify-between"><span className="text-slate-500">CPF / CNPJ:</span><span className="font-semibold text-slate-900 dark:text-slate-100">{investor.cpfCnpj}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">WhatsApp:</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{investor.whatsapp}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">E-mail:</span><span className="font-semibold text-slate-900 dark:text-slate-100">{investor.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Endereço:</span><span className="font-semibold text-slate-900 dark:text-slate-100">{investor.address}, {investor.city}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Data Cadastro:</span><span className="font-semibold text-slate-900 dark:text-slate-100">{investor.createdAt}</span></div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-200 dark:border-slate-700 pb-2">
                  Resumo Patrimonial ARV
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Total Investido:</span><span className="font-bold text-amber-600 text-sm">R$ {invTotalInvested.toLocaleString("pt-BR")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Unidades Adquiridas:</span><span className="font-semibold text-slate-900 dark:text-slate-100">{invContracts.length} Unidades</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ticket Médio por Unidade:</span><span className="font-semibold text-slate-900 dark:text-slate-100">R$ {invContracts.length ? Math.round(invTotalInvested / invContracts.length).toLocaleString("pt-BR") : 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Classificação NPS:</span><span className="font-semibold text-emerald-600">{investor.npsCategory} ({investor.satisfactionScore}/10)</span></div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500 italic">
                  &quot;{investor.notes}&quot;
                </div>
              </div>
            </div>
          )}

          {activeTab === "contratos" && (
            <div className="space-y-4">
              {invContracts.map((c) => {
                const spe = spes.find((s) => s.id === c.speId);
                return (
                  <div key={c.id} className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.contractNumber} • {spe?.name}</div>
                        <div className="text-slate-500 mt-0.5">Adquirido em {c.purchaseDate} • Cota {c.speSharePercentage}% SPE</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">R$ {c.investedAmount.toLocaleString("pt-BR")}</div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-md">{c.status}</span>
                      </div>
                    </div>

                    <InvestorProfitabilityCard contract={c} compact />
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "score" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Calculadora Inteligente de Score</h3>
                <ScoreGauge score={investor.score} tier={investor.tier} breakdown={investor.scoreBreakdown} size="md" />
              </div>
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Algoritmo de Qualificação do Investidor</div>
                <p className="text-slate-500 leading-relaxed">
                  O Score do Investidor é atualizado automaticamente combinando volume investido, número de reaportes, assiduidade em assembleias, engajamento no portal e indicações de novos clientes.
                </p>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl font-medium">
                  Status Atual: <span className="font-bold">{investor.tier}</span>. Cliente elegível para benefícios exclusivos do programa de fidelização ARV.
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Histórico de Ocorrências e Contatos</h3>
                <button
                  onClick={() => setIsAddInteractionOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova Ocorrência
                </button>
              </div>

              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6 text-xs">
                {invInteractions.map((int) => (
                  <div key={int.id} className="relative">
                    <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="font-bold text-slate-900 dark:text-slate-100">{int.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{int.type} por {int.author} em {int.date}</div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {int.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewInteractionModal
        isOpen={isAddInteractionOpen}
        onClose={() => setIsAddInteractionOpen(false)}
        investorId={investor.id}
        investorName={investor.name}
      />
    </div>
  );
};
