import React, { useState } from "react";
import {
  Building2,
  Tag,
  TrendingDown,
  Users,
  ShieldCheck,
  Plus,
  Filter,
  Eye,
  Clock,
  Sparkles,
  FileText,
  DollarSign,
  AlertTriangle,
  Layers,
  CheckCircle2,
  TrendingUp,
  Percent,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ResaleListing, ResalePricing } from "../../types";
import { ResaleListingCard } from "./ResaleListingCard";
import { ResaleShowcaseGrid } from "./ResaleShowcaseGrid";
import { RegisterReturnModal } from "./RegisterReturnModal";
import { ResalePricingEditorModal } from "./ResalePricingEditorModal";
import { ResaleListingEditorModal } from "./ResaleListingEditorModal";
import { ResaleLeadCaptureModal } from "./ResaleLeadCaptureModal";
import { ResaleLeadsPanel } from "./ResaleLeadsPanel";
import { ResaleDashboard } from "./ResaleDashboard";
import { ResaleReportModal } from "./ResaleReportModal";

export const ResaleManagement: React.FC = () => {
  const {
    resaleListings,
    resalePricing,
    resalePaymentConditions,
    resaleLeads,
    returnRecords,
    contracts,
    investors,
    spes,
    addReturnRecord,
    registerUnitReturn,
    addResaleListing,
    createResaleListing,
    updateResaleListing,
    publishResaleListing,
    pauseResaleListing,
    reserveResaleListing,
    markResaleAsSold,
    setResalePricing,
    updateResalePricing,
    addResalePaymentCondition,
    deleteResalePaymentCondition,
    addResaleLead,
    updateResaleLead,
    incrementListingView,
    generateListingDescriptionWithAI,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "showcase" | "pipeline" | "returns" | "leads"
  >("dashboard");

  // Modals state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);

  // Totais & Métricas
  const totalListings = resaleListings.length;
  const publishedCount = resaleListings.filter((l) => l.status === "Publicado").length;
  const soldCount = resaleListings.filter((l) => l.status === "Vendido").length;

  const totalVgvResale = resalePricing.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
  const totalVgvSold = resaleListings
    .filter((l) => l.status === "Vendido")
    .reduce((acc, l) => {
      const p = resalePricing.find((pr) => pr.resaleListingId === l.id);
      return acc + (p?.resalePrice || 0);
    }, 0);

  const avgDiscount =
    resalePricing.length > 0
      ? resalePricing.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) /
        resalePricing.length
      : 0;

  const totalLeads = resaleLeads.length;

  const handleOpenLeadModal = (listing: ResaleListing) => {
    setSelectedListing(listing);
    setIsLeadModalOpen(true);
  };

  const handleOpenPricingModal = (listing: ResaleListing) => {
    setSelectedListing(listing);
    setIsPricingModalOpen(true);
  };

  const handleOpenListingEditor = (listing: ResaleListing) => {
    setSelectedListing(listing);
    setIsListingModalOpen(true);
  };

  const handleCreateManualListing = () => {
    const id = createResaleListing("unit-nova", {
      listingTitle: "Nova Oportunidade de Revenda",
      listingDescription: "Unidade recém-adicionada para revenda com condições especiais.",
      status: "Em Preparação",
    });
    const created = resaleListings.find((l) => l.id === id);
    if (created) {
      handleOpenListingEditor(created);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Módulo Comercial, Financeiro & Jurídico
            </span>
            <span className="text-xs font-medium text-slate-500">Lei nº 13.786/2018</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Revenda de Unidades & Gestão de Distratos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Painel executivo, formalização de devoluções, precificação estratégica, emissão de relatórios oficiais e vitrine de oportunidades.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors border border-slate-700 dark:border-slate-600"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Gerar Relatórios</span>
          </button>
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Formalizar Distrato</span>
          </button>
          <button
            onClick={handleCreateManualListing}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Anúncio</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "dashboard"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard & Indicadores</span>
        </button>

        <button
          onClick={() => setActiveTab("showcase")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "showcase"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vitrine de Oportunidades</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "pipeline"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestão de Anúncios & Esteira</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {totalListings}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "returns"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Distratos & Devoluções</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            {returnRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === "leads"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads & Propostas</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
            {totalLeads}
          </span>
        </button>
      </div>

      {/* Tab 0: Comprehensive Dashboard */}
      {activeTab === "dashboard" && (
        <ResaleDashboard
          listings={resaleListings}
          pricingList={resalePricing}
          conditionsList={resalePaymentConditions}
          leads={resaleLeads}
          returns={returnRecords}
          spes={spes}
          investors={investors}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenReturnModal={() => setIsReturnModalOpen(true)}
          onOpenNewListingModal={handleCreateManualListing}
        />
      )}

      {/* Tab 1: Showcase Grid */}
      {activeTab === "showcase" && (
        <ResaleShowcaseGrid
          listings={resaleListings}
          pricingList={resalePricing}
          conditionsList={resalePaymentConditions}
          spes={spes}
          onOpenLeadModal={handleOpenLeadModal}
          onIncrementView={incrementListingView}
          isPublicView={true}
        />
      )}

      {/* Tab 2: Management Pipeline */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resaleListings.map((listing) => {
              const pricing = resalePricing.find((p) => p.resaleListingId === listing.id);
              const conditions = resalePaymentConditions.filter((c) => c.resaleListingId === listing.id);
              const spe = spes.find((s) => s.id === "spe-t58");

              return (
                <ResaleListingCard
                  key={listing.id}
                  listing={listing}
                  pricing={pricing}
                  conditions={conditions}
                  speName={spe?.name}
                  onEditListing={handleOpenListingEditor}
                  onEditPricing={handleOpenPricingModal}
                  onPublish={publishResaleListing}
                  onPause={pauseResaleListing}
                  onReserve={reserveResaleListing}
                  onMarkSold={(l) => {
                    setSelectedListing(l);
                    setActiveTab("leads");
                  }}
                  isPublicView={false}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Returns & Distratos Records */}
      {activeTab === "returns" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Registro Formal de Distratos & Devoluções de Unidades
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Total de registros: {returnRecords.length}
              </span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exportar Relatório</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Unidade / SPE</th>
                  <th className="p-3.5">Investidor</th>
                  <th className="p-3.5">Modalidade</th>
                  <th className="p-3.5">Data Devolução</th>
                  <th className="p-3.5">Valor Contrato</th>
                  <th className="p-3.5">Retenção (%)</th>
                  <th className="p-3.5">Restituição (R$)</th>
                  <th className="p-3.5">Status Jurídico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {returnRecords.map((r) => {
                  const inv = investors.find((i) => i.id === r.originalInvestorId);
                  const spe = spes.find((s) => s.id === r.speId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {r.unitId}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {spe?.name || r.speId}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{inv?.name || "Investidor Original"}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {r.returnType}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(r.returnDate).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3.5 font-medium">
                        R$ {r.originalContractAmount.toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400">
                        {r.retentionPercentage}%
                      </td>
                      <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">
                        R$ {r.amountRefundedToInvestor.toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {r.legalStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Leads & Proposals */}
      {activeTab === "leads" && (
        <ResaleLeadsPanel
          leads={resaleLeads}
          listings={resaleListings}
          pricingList={resalePricing}
          investors={investors}
          onUpdateLeadStatus={updateResaleLead as any}
          onConcludeSale={markResaleAsSold}
        />
      )}

      {/* Modais Integrados */}
      <ResaleReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listings={resaleListings}
        pricingList={resalePricing}
        conditionsList={resalePaymentConditions}
        leads={resaleLeads}
        returns={returnRecords}
        spes={spes}
        investors={investors}
      />

      <RegisterReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        contracts={contracts}
        investors={investors}
        spes={spes}
        onRegisterReturn={registerUnitReturn}
      />

      <ResalePricingEditorModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        pricing={resalePricing.find((p) => p.resaleListingId === selectedListing?.id)}
        conditions={resalePaymentConditions.filter((c) => c.resaleListingId === selectedListing?.id)}
        onSavePricing={setResalePricing}
        onAddCondition={addResalePaymentCondition}
        onDeleteCondition={deleteResalePaymentCondition}
      />

      <ResaleListingEditorModal
        isOpen={isListingModalOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        pricing={resalePricing.find((p) => p.resaleListingId === selectedListing?.id)}
        spe={spes[0]}
        onSaveListing={updateResaleListing}
        onGenerateWithAI={generateListingDescriptionWithAI}
      />

      <ResaleLeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        pricing={resalePricing.find((p) => p.resaleListingId === selectedListing?.id)}
        conditions={resalePaymentConditions.filter((c) => c.resaleListingId === selectedListing?.id)}
        speName={spes[0]?.name}
        onSubmitLead={(data) => {
          if (selectedListing) {
            addResaleLead({
              resaleListingId: selectedListing.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              message: data.message || "",
              source: data.source,
              status: "Novo",
            });
          }
        }}
      />
    </div>
  );
};

