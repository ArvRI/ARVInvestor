import React, { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Tag,
  Plus,
} from "lucide-react";
import { ResaleLead, ResaleListing, ResalePricing, Investor } from "../../types";

interface ResaleLeadsPanelProps {
  leads: ResaleLead[];
  listings: ResaleListing[];
  pricingList: ResalePricing[];
  investors: Investor[];
  onUpdateLeadStatus: (leadId: string, status: ResaleLead["status"]) => void;
  onConcludeSale: (
    listingId: string,
    saleData: {
      investorId?: string;
      buyerName: string;
      buyerEmail?: string;
      buyerPhone?: string;
      contractAmount: number;
      purchaseDate?: string;
      speSharePercentage?: number;
    }
  ) => void;
}

export const ResaleLeadsPanel: React.FC<ResaleLeadsPanelProps> = ({
  leads,
  listings,
  pricingList,
  investors,
  onUpdateLeadStatus,
  onConcludeSale,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadForSale, setSelectedLeadForSale] = useState<ResaleLead | null>(null);
  const [saleContractAmount, setSaleContractAmount] = useState<number>(315000);
  const [saleInvestorId, setSaleInvestorId] = useState<string>("");
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const filteredLeads = leads.filter((lead) => {
    return (
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.resaleListingId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const stages: ResaleLead["status"][] = [
    "Novo",
    "Em Atendimento",
    "Proposta Enviada",
    "Convertido",
    "Perdido",
  ];

  const handleOpenSaleModal = (lead: ResaleLead) => {
    const listing = listings.find((l) => l.id === lead.resaleListingId);
    const pricing = pricingList.find((p) => p.resaleListingId === lead.resaleListingId);
    setSelectedLeadForSale(lead);
    setSaleContractAmount(pricing?.resalePrice || 320000);
  };

  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForSale) return;

    onConcludeSale(selectedLeadForSale.resaleListingId, {
      investorId: saleInvestorId || undefined,
      buyerName: selectedLeadForSale.name,
      buyerEmail: selectedLeadForSale.email,
      buyerPhone: selectedLeadForSale.phone,
      contractAmount: saleContractAmount,
      purchaseDate: saleDate,
      speSharePercentage: 1.8,
    });

    onUpdateLeadStatus(selectedLeadForSale.id, "Convertido");
    setSelectedLeadForSale(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por lead, e-mail, telefone ou id de anúncio..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total: <strong className="text-slate-900 dark:text-white">{filteredLeads.length}</strong> leads captados na vitrine
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.status === stage);
          const stageColor = {
            "Novo": "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
            "Em Atendimento": "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
            "Proposta Enviada": "border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300",
            "Convertido": "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
            "Perdido": "border-slate-400 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400",
          }[stage];

          return (
            <div
              key={stage}
              className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-w-[240px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {stage}
                </span>
                <span className="text-[11px] font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  {stageLeads.length}
                </span>
              </div>

              {/* Stage Leads Cards */}
              <div className="space-y-2.5 flex-1">
                {stageLeads.map((lead) => {
                  const listing = listings.find((l) => l.id === lead.resaleListingId);
                  const pricing = pricingList.find((p) => p.resaleListingId === lead.resaleListingId);

                  return (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                            {lead.name}
                          </strong>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {lead.source}
                        </span>
                      </div>

                      {/* Listing Badge */}
                      <div className="text-[11px] bg-slate-50 dark:bg-slate-900/80 p-1.5 rounded border border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-500 dark:text-slate-400 block truncate">
                          Unidade: {listing?.unitId || lead.resaleListingId}
                        </span>
                        {pricing?.resalePrice && (
                          <strong className="text-blue-600 dark:text-blue-400 font-bold">
                            R$ {pricing.resalePrice.toLocaleString("pt-BR")}
                          </strong>
                        )}
                      </div>

                      {/* Contacts */}
                      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      </div>

                      {lead.message && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded border border-slate-100 dark:border-slate-800 line-clamp-2">
                          "{lead.message}"
                        </p>
                      )}

                      {/* Stage Transitions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1">
                        {stage !== "Novo" && (
                          <button
                            onClick={() => onUpdateLeadStatus(lead.id, "Novo")}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                          >
                            Novo
                          </button>
                        )}
                        {stage !== "Em Atendimento" && (
                          <button
                            onClick={() => onUpdateLeadStatus(lead.id, "Em Atendimento")}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                          >
                            Atendimento
                          </button>
                        )}
                        {stage !== "Proposta Enviada" && (
                          <button
                            onClick={() => onUpdateLeadStatus(lead.id, "Proposta Enviada")}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                          >
                            Proposta
                          </button>
                        )}
                        {stage !== "Convertido" && (
                          <button
                            onClick={() => handleOpenSaleModal(lead)}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-2xs ml-auto"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Vender</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Conclusão de Venda e Criação de Contrato */}
      {selectedLeadForSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg text-slate-900 dark:text-white">
                  Concluir Revenda & Emitir Contrato
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadForSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSale} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs space-y-1">
                <strong className="text-emerald-900 dark:text-emerald-200 block">
                  Comprador: {selectedLeadForSale.name}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 block">
                  Contato: {selectedLeadForSale.phone} • {selectedLeadForSale.email}
                </span>
                <span className="text-slate-600 dark:text-slate-400 block">
                  Anúncio: {selectedLeadForSale.resaleListingId}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vincular a Investidor Existente na Base (Opcional):
                </label>
                <select
                  value={saleInvestorId}
                  onChange={(e) => setSaleInvestorId(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="">Criar novo investidor na base com estes dados</option>
                  {investors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.tier} • {inv.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Valor Final do Contrato (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={saleContractAmount}
                    onChange={(e) => setSaleContractAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Data da Assinatura *
                  </label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-[11px] text-blue-800 dark:text-blue-300">
                ℹ️ Esta ação marcará a listagem como <strong>"Vendida"</strong>, retirará o imóvel da vitrine pública e gerará um novo contrato ativo com rastreabilidade completa para a gestão de SPE.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForSale(null)}
                  className="px-3 py-1.5 rounded-lg border text-xs text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirmar Venda & Emitir Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
