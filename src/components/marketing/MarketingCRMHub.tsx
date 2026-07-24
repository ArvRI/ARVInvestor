import React, { useState } from "react";
import {
  Target,
  FileText,
  Sparkles,
  PieChart,
  Plus,
  Share2,
  Building,
  User,
  Phone,
  Mail,
  DollarSign,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { FunnelKanban } from "./FunnelKanban";
import { BrokerOnboardingWizard } from "./BrokerOnboardingWizard";
import { CustomerDocSummaryCard } from "./CustomerDocSummaryCard";
import { CustomerOnboardingFlow } from "./CustomerOnboardingFlow";
import { MarketingManagerPanel } from "./MarketingManagerPanel";
import { MarketingLead } from "../../types";
import { useApp } from "../../context/AppContext";

export const MarketingCRMHub: React.FC = () => {
  const { addLead, spes, leads } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    "funnel" | "broker_cards" | "doc_summary" | "client_onboarding" | "manager_panel"
  >("funnel");

  const [selectedBrokerLead, setSelectedBrokerLead] = useState<MarketingLead | null>(null);
  const [selectedDocLeadId, setSelectedDocLeadId] = useState<string>(leads[0]?.id || "");
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // New Lead Form State
  const [newLeadData, setNewLeadData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    originCampaign: "Meta Ads - Lançamento Beira Mar",
    speOfInterest: spes[0]?.name || "SPE ARV Horizon Residence",
    assignedBroker: "Camila Vasconcelos",
    dealValue: 1200000,
    utmSource: "facebook",
    utmCampaign: "meta_campaign_2026",
    utmMedium: "cpc",
  });

  const handleOpenBrokerCards = (lead: MarketingLead) => {
    setSelectedBrokerLead(lead);
    setActiveSubTab("broker_cards");
  };

  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.name) return;

    addLead({
      name: newLeadData.name,
      phone: newLeadData.phone || "(85) 99999-0000",
      whatsapp: newLeadData.whatsapp || newLeadData.phone || "(85) 99999-0000",
      email: newLeadData.email || "investidor@arvinc.com.br",
      originCampaign: newLeadData.originCampaign,
      speOfInterest: newLeadData.speOfInterest,
      assignedBroker: newLeadData.assignedBroker,
      dealValue: Number(newLeadData.dealValue),
      utmSource: newLeadData.utmSource,
      utmCampaign: newLeadData.utmCampaign,
      utmMedium: newLeadData.utmMedium,
      stage: "Novo Lead",
      conversionDate: new Date().toISOString().split("T")[0],
    });

    setIsNewLeadModalOpen(false);
    setNewLeadData({
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      originCampaign: "Meta Ads - Lançamento Beira Mar",
      speOfInterest: spes[0]?.name || "SPE ARV Horizon Residence",
      assignedBroker: "Camila Vasconcelos",
      dealValue: 1200000,
      utmSource: "facebook",
      utmCampaign: "meta_campaign_2026",
      utmMedium: "cpc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Module 7 Navigation */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            MÓDULO 7 • ARV INVESTOR HUB
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Marketing, CRM & Onboarding Digital
          </h1>
        </div>

        {/* Sub-Tab Navigation Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab("funnel")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "funnel"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Target className="w-4 h-4" /> Funil Comercial
          </button>

          <button
            onClick={() => setActiveSubTab("broker_cards")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "broker_cards"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" /> Cards do Corretor
          </button>

          <button
            onClick={() => setActiveSubTab("doc_summary")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "doc_summary"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Resumo de Documentos
          </button>

          <button
            onClick={() => setActiveSubTab("client_onboarding")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "client_onboarding"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Onboarding Cliente
          </button>

          <button
            onClick={() => setActiveSubTab("manager_panel")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "manager_panel"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <PieChart className="w-4 h-4" /> Painel do Gestor
          </button>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {activeSubTab === "funnel" && (
        <FunnelKanban
          onOpenBrokerCards={handleOpenBrokerCards}
          onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
        />
      )}

      {activeSubTab === "broker_cards" && (
        <BrokerOnboardingWizard
          initialLead={selectedBrokerLead}
          onFinish={() => setActiveSubTab("client_onboarding")}
        />
      )}

      {activeSubTab === "doc_summary" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Selecione o Cliente / Lead para o Resumo de Documentos
              </h3>
              <p className="text-xs text-slate-500">
                Gera o Card Único Consolidado de Documentação para preencher a etapa inicial da minuta contratual.
              </p>
            </div>
            <select
              value={selectedDocLeadId}
              onChange={(e) => setSelectedDocLeadId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — ({l.speOfInterest || "Sem SPE"})
                </option>
              ))}
            </select>
          </div>

          <CustomerDocSummaryCard
            lead={leads.find((l) => l.id === selectedDocLeadId) || leads[0]}
            onNavigateToContract={() => {
              setSelectedBrokerLead(leads.find((l) => l.id === selectedDocLeadId) || leads[0]);
              setActiveSubTab("broker_cards");
            }}
          />
        </div>
      )}

      {activeSubTab === "client_onboarding" && <CustomerOnboardingFlow />}

      {activeSubTab === "manager_panel" && <MarketingManagerPanel />}

      {/* New Lead Creation Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewLead}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Cadastrar Novo Lead no Funil
              </h3>
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Fernando Araripe"
                  value={newLeadData.name}
                  onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Telefone / Celular</label>
                <input
                  type="text"
                  placeholder="(85) 99999-0000"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="investidor@email.com"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Empreendimento</label>
                <select
                  value={newLeadData.speOfInterest}
                  onChange={(e) => setNewLeadData({ ...newLeadData, speOfInterest: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  {spes.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Corretor Responsável</label>
                <select
                  value={newLeadData.assignedBroker}
                  onChange={(e) => setNewLeadData({ ...newLeadData, assignedBroker: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Camila Vasconcelos">Camila Vasconcelos</option>
                  <option value="Lucas Andrade">Lucas Andrade</option>
                  <option value="Renata Bezerra">Renata Bezerra</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Valor da Oportunidade (R$)</label>
                <input
                  type="number"
                  value={newLeadData.dealValue}
                  onChange={(e) => setNewLeadData({ ...newLeadData, dealValue: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Origem da Campanha</label>
                <input
                  type="text"
                  value={newLeadData.originCampaign}
                  onChange={(e) => setNewLeadData({ ...newLeadData, originCampaign: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
              >
                Salvar Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
