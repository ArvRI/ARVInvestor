import React, { useState } from "react";
import {
  Kanban,
  ListFilter,
  Plus,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  User,
  Building,
  Tag,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { LeadFunnelStage, MarketingLead } from "../../types";

const STAGES: { id: LeadFunnelStage; label: string; color: string }[] = [
  { id: "Novo Lead", label: "Novo Lead", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
  { id: "Primeiro Contato", label: "Primeiro Contato", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  { id: "Atendimento", label: "Atendimento", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200" },
  { id: "Visita Agendada", label: "Visita Agendada", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200" },
  { id: "Proposta", label: "Proposta", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  { id: "Reserva", label: "Reserva", color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200" },
  { id: "Contrato", label: "Contrato em Elab.", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" },
  { id: "Pagamento", label: "Aguardando Pagamento", color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200" },
  { id: "Venda Concluída", label: "Venda Concluída 🎉", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-bold" },
  { id: "Onboarding", label: "Onboarding Digital", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-bold" },
  { id: "Portal Liberado", label: "Portal Liberado 🚀", color: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200 font-bold" },
];

interface FunnelKanbanProps {
  onOpenBrokerCards: (lead: MarketingLead) => void;
  onOpenNewLeadModal: () => void;
}

export const FunnelKanban: React.FC<FunnelKanbanProps> = ({
  onOpenBrokerCards,
  onOpenNewLeadModal,
}) => {
  const { leads, moveLeadStage, spes } = useApp();
  const [selectedLeadModal, setSelectedLeadModal] = useState<MarketingLead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBroker, setFilterBroker] = useState("ALL");
  const [filterSpe, setFilterSpe] = useState("ALL");
  const [filterOrigin, setFilterOrigin] = useState("ALL");

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.originCampaign.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBroker = filterBroker === "ALL" || l.assignedBroker === filterBroker;
    const matchesSpe = filterSpe === "ALL" || l.speOfInterest === filterSpe;
    const matchesOrigin =
      filterOrigin === "ALL" ||
      (filterOrigin === "RD_STATION" && (l.rdStationId || l.originCampaign?.toLowerCase().includes("rd station") || l.utmSource?.includes("rd"))) ||
      (filterOrigin === "OTHER" && !(l.rdStationId || l.originCampaign?.toLowerCase().includes("rd station") || l.utmSource?.includes("rd")));

    return matchesSearch && matchesBroker && matchesSpe && matchesOrigin;
  });

  const getNextStage = (current: LeadFunnelStage): LeadFunnelStage | null => {
    const idx = STAGES.findIndex((s) => s.id === current);
    if (idx < STAGES.length - 1) return STAGES[idx + 1].id;
    return null;
  };

  const getPrevStage = (current: LeadFunnelStage): LeadFunnelStage | null => {
    const idx = STAGES.findIndex((s) => s.id === current);
    if (idx > 0) return STAGES[idx - 1].id;
    return null;
  };

  const totalPipelineValue = filteredLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Filter and KPI Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou campanha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterBroker}
            onChange={(e) => setFilterBroker(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Corretores</option>
            <option value="Camila Vasconcelos">Camila Vasconcelos</option>
            <option value="Lucas Andrade">Lucas Andrade</option>
            <option value="Renata Bezerra">Renata Bezerra</option>
          </select>

          <select
            value={filterSpe}
            onChange={(e) => setFilterSpe(e.target.value)}
            className="hidden lg:block px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todas as SPEs</option>
            {spes.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Origem: Todas</option>
            <option value="RD_STATION">Origem: RD Station API</option>
            <option value="OTHER">Origem: Outras Fontes</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pipeline Total: <strong className="text-blue-700 dark:text-blue-400">R$ {(totalPipelineValue / 1000000).toFixed(2)}M</strong>
          </div>

          <button
            onClick={onOpenNewLeadModal}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* Horizontal Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[2200px]">
          {STAGES.map((st) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === st.id);
            const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

            return (
              <div
                key={st.id}
                className="w-72 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col max-h-[720px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({stageLeads.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    R$ {(stageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Column Leads List */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      Nenhum lead nesta etapa
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const next = getNextStage(lead.stage);
                      const prev = getPrevStage(lead.stage);

                      return (
                        <div
                          key={lead.id}
                          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition-all space-y-2 group"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4
                              onClick={() => setSelectedLeadModal(lead)}
                              className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer"
                            >
                              {lead.name}
                            </h4>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 shrink-0">
                              R$ {((lead.dealValue || 0) / 1000).toFixed(0)}k
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{lead.speOfInterest}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Corretor: {lead.assignedBroker}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="truncate">{lead.originCampaign}</span>
                            </div>

                            {/* RD Station Source Badge */}
                            {(lead.rdStationId || lead.originCampaign?.toLowerCase().includes("rd station") || lead.utmSource?.includes("rd")) && (
                              <div className="pt-1 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                  <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" /> RD Station API
                                </span>
                                {lead.rdSyncStatus && (
                                  <span className="text-[9px] text-slate-400 truncate">
                                    {lead.rdSyncStatus}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                            <button
                              onClick={() => onOpenBrokerCards(lead)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded flex items-center gap-1 transition-colors"
                              title="Abrir Cards do Corretor / Central de Documentos"
                            >
                              <FileText className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                              Cards / Doc
                            </button>

                            <div className="flex items-center gap-1">
                              {prev && (
                                <button
                                  onClick={() => moveLeadStage(lead.id, prev)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded"
                                  title={`Voltar para ${prev}`}
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {next && (
                                <button
                                  onClick={() => moveLeadStage(lead.id, next)}
                                  className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded flex items-center gap-0.5 shadow-xs"
                                  title={`Avançar para ${next}`}
                                >
                                  Avance <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Lead Módulo Marketing & CRM
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedLeadModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">WhatsApp / Telefone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {selectedLeadModal.whatsapp}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">E-mail</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> {selectedLeadModal.email}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Campanha Origem</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeadModal.originCampaign}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Empreendimento de Interesse</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeadModal.speOfInterest}</span>
              </div>

              <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Rastreamento UTM Digital</span>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  <div><strong>UTM Source:</strong> {selectedLeadModal.utmSource}</div>
                  <div><strong>UTM Medium:</strong> {selectedLeadModal.utmMedium}</div>
                  <div><strong>UTM Campaign:</strong> {selectedLeadModal.utmCampaign}</div>
                </div>
              </div>

              {/* RD Station API Tracking */}
              <div className="col-span-2 bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Atribuição RD Station API
                  </span>
                  {selectedLeadModal.rdSyncStatus && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {selectedLeadModal.rdSyncStatus}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div><strong>ID RD Station:</strong> {selectedLeadModal.rdStationId || "rd-ct-auto"}</div>
                  <div><strong>Gatilho Conversão:</strong> {selectedLeadModal.rdConversionIdentifier || "LP_Ebook_SPE"}</div>
                </div>
                {selectedLeadModal.rdLeadUrl && (
                  <div className="pt-1 text-[11px]">
                    <a
                      href={selectedLeadModal.rdLeadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Ver lead no CRM RD Station <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Corretor Responsável</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeadModal.assignedBroker}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Valor do Negócio</span>
                <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                  R$ {(selectedLeadModal.dealValue || 0).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const leadToOpen = selectedLeadModal;
                  setSelectedLeadModal(null);
                  onOpenBrokerCards(leadToOpen);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs"
              >
                <FileText className="w-4 h-4" /> Ir para Cards de Cadastro e Assinatura
              </button>

              <button
                onClick={() => setSelectedLeadModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
