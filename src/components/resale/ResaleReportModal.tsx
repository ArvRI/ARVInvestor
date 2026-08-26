import React, { useState } from "react";
import {
  X,
  FileDown,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Eye,
  Settings,
  Filter,
  Check,
  BarChart3,
  PieChart,
  Layers,
} from "lucide-react";
import {
  ResaleListing,
  ResalePricing,
  ResalePaymentCondition,
  ResaleLead,
  ReturnRecord,
  SPE,
  Investor,
} from "../../types";
import {
  ResaleReportService,
  ResaleReportOptions,
} from "../../services/resale/resaleReportService";

interface ResaleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: ResaleListing[];
  pricingList: ResalePricing[];
  conditionsList: ResalePaymentCondition[];
  leads: ResaleLead[];
  returns: ReturnRecord[];
  spes: SPE[];
  investors: Investor[];
}

export const ResaleReportModal: React.FC<ResaleReportModalProps> = ({
  isOpen,
  onClose,
  listings,
  pricingList,
  conditionsList,
  leads,
  returns,
  spes,
  investors,
}) => {
  const [reportType, setReportType] = useState<ResaleReportOptions["reportType"]>("executive");
  const [selectedSpeId, setSelectedSpeId] = useState<string>("all");
  const [authorName, setAuthorName] = useState<string>("Diretoria Comercial & Jurídica ARV");
  const [executiveNotes, setExecutiveNotes] = useState<string>(() =>
    ResaleReportService.generateExecutiveAIBrief(listings, pricingList, returns, leads)
  );
  const [includeStatsSummary, setIncludeStatsSummary] = useState(true);
  const [includeDetailedTables, setIncludeDetailedTables] = useState(true);
  const [includePaymentConditions, setIncludePaymentConditions] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includePricingChart, setIncludePricingChart] = useState(true);
  const [includeReturnsChart, setIncludeReturnsChart] = useState(true);
  const [includeStatusFunnelChart, setIncludeStatusFunnelChart] = useState(true);
  const [activeViewTab, setActiveViewTab] = useState<"configure" | "preview">("configure");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Filter listings & metrics based on spe
  const filteredListings = listings.filter((l) => {
    if (selectedSpeId !== "all") {
      const ret = returns.find((r) => r.id === l.returnRecordId);
      if (ret && ret.speId !== selectedSpeId) return false;
    }
    return true;
  });

  const filteredPricing = pricingList.filter((p) =>
    filteredListings.some((l) => l.id === p.resaleListingId)
  );

  const filteredReturns = returns.filter((r) => {
    if (selectedSpeId !== "all" && r.speId !== selectedSpeId) return false;
    return true;
  });

  const filteredLeads = leads.filter((lead) => {
    if (selectedSpeId !== "all") {
      const listing = listings.find((l) => l.id === lead.resaleListingId);
      const ret = returns.find((r) => r.id === listing?.returnRecordId);
      if (ret && ret.speId !== selectedSpeId) return false;
    }
    return true;
  });

  // Calculate live preview metrics
  const totalVgvResale = filteredPricing.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
  const totalVgvSold = filteredListings
    .filter((l) => l.status === "Vendido")
    .reduce((acc, l) => {
      const p = filteredPricing.find((pr) => pr.resaleListingId === l.id);
      return acc + (p?.resalePrice || 0);
    }, 0);
  const totalRetention = filteredReturns.reduce(
    (acc, r) => acc + ((r.originalContractAmount * r.retentionPercentage) / 100),
    0
  );
  const avgDiscount =
    filteredPricing.length > 0
      ? filteredPricing.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) /
        filteredPricing.length
      : 0;

  const handleGenerateAIBrief = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const brief = ResaleReportService.generateExecutiveAIBrief(
        filteredListings,
        filteredPricing,
        filteredReturns,
        filteredLeads
      );
      setExecutiveNotes(brief);
      setIsGeneratingAI(false);
    }, 400);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      ResaleReportService.generatePDF(
        listings,
        pricingList,
        conditionsList,
        leads,
        returns,
        spes,
        investors,
        {
          reportType,
          speId: selectedSpeId !== "all" ? selectedSpeId : undefined,
          authorName,
          executiveNotes,
          includeStatsSummary,
          includeDetailedTables,
          includePaymentConditions,
          includeCharts,
          includePricingChart,
          includeReturnsChart,
          includeStatusFunnelChart,
        }
      );
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    ResaleReportService.exportToExcel(
      filteredListings,
      filteredPricing,
      conditionsList,
      filteredLeads,
      filteredReturns,
      spes,
      investors,
      selectedSpeId !== "all" ? selectedSpeId : undefined
    );
  };

  const handleExportCSV = () => {
    if (reportType === "returns_compliance") {
      const data = filteredReturns.map((r) => ({
        Unidade: r.unitId,
        SPE: r.speId,
        Tipo: r.returnType,
        ValorOriginal: r.originalContractAmount,
        RetencaoPct: r.retentionPercentage,
        Restituicao: r.amountRefundedToInvestor,
        Status: r.legalStatus,
        Data: r.returnDate,
      }));
      ResaleReportService.exportToCSV(data, "distratos-devolucoes");
    } else {
      const data = filteredListings.map((l) => {
        const p = filteredPricing.find((pr) => pr.resaleListingId === l.id);
        return {
          Unidade: l.unitId,
          Titulo: l.listingTitle,
          Status: l.status,
          PrecoTabela: p?.originalTablePrice || 0,
          PrecoRevenda: p?.resalePrice || 0,
          Desconto: p?.discountPercentageVsTable || 0,
          PisoMinimo: p?.minimumAcceptablePrice || 0,
        };
      });
      ResaleReportService.exportToCSV(data, "vitrine-precificacao-revenda");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Emissão & Exportação de Relatórios de Revenda e Distratos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere demonstrativos executivos, tabelas de precificação e auditoria de distratos em PDF e Excel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            onClick={() => setActiveViewTab("configure")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeViewTab === "configure"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Configurar Relatório & Parâmetros</span>
          </button>

          <button
            onClick={() => setActiveViewTab("preview")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeViewTab === "preview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Pré-Visualização do Documento</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeViewTab === "configure" ? (
            <div className="space-y-6">
              {/* Step 1: Select Report Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Tipo de Relatório
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Executive */}
                  <div
                    onClick={() => setReportType("executive")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      reportType === "executive"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span>Relatório Executivo Consolidado</span>
                      </div>
                      {reportType === "executive" && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Visão 360° com KPIs gerais, demonstrativo de distratos, precificação e funil de vendas para Diretoria.
                    </p>
                  </div>

                  {/* Option 2: Returns & Distratos */}
                  <div
                    onClick={() => setReportType("returns_compliance")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      reportType === "returns_compliance"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-rose-500" />
                        <span>Distratos & Lei nº 13.786/2018</span>
                      </div>
                      {reportType === "returns_compliance" && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Auditoria jurídica e financeira de retenções, devoluções, saldo a restituir e enquadramento legal.
                    </p>
                  </div>

                  {/* Option 3: Showcase & Pricing */}
                  <div
                    onClick={() => setReportType("showcase_pricing")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      reportType === "showcase_pricing"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        <span>Vitrine, Preços & Descontos</span>
                      </div>
                      {reportType === "showcase_pricing" && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Tabela de oportunidades de revenda, percentual de desconto vs tabela, piso mínimo e condições.
                    </p>
                  </div>

                  {/* Option 4: Leads & Funnel */}
                  <div
                    onClick={() => setReportType("leads_funnel")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      reportType === "leads_funnel"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>Funil de Leads & Eficiência</span>
                      </div>
                      {reportType === "leads_funnel" && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Pipeline comercial de interessados, canais de captação, propostas enviadas e conversão em vendas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Scope & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Escopo / Empreendimento (SPE)
                  </label>
                  <select
                    value={selectedSpeId}
                    onChange={(e) => setSelectedSpeId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                  >
                    <option value="all">Todas as SPEs (Consolidado Geral)</option>
                    {spes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Responsável / Emissor do Relatório
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: Fabio Silvestri - Comitê de Investimentos"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Step 3: Executive Summary with AI generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Parecer & Síntese Executiva no Cabeçalho</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateAIBrief}
                    disabled={isGeneratingAI}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingAI ? "Atualizando..." : "Recalcular Síntese com IA"}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={executiveNotes}
                  onChange={(e) => setExecutiveNotes(e.target.value)}
                  placeholder="Insira as notas executivas, conclusões e recomendações para este relatório..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Step 4: Included Sections */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Seções do Relatório
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeStatsSummary}
                      onChange={(e) => setIncludeStatsSummary(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Quadro de Indicadores (KPIs)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDetailedTables}
                      onChange={(e) => setIncludeDetailedTables(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tabela Analítica Completa</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePaymentConditions}
                      onChange={(e) => setIncludePaymentConditions(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Condições de Pagamento</span>
                  </label>
                </div>
              </div>

              {/* Step 5: Gráficos & Visualizações no PDF */}
              <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Gráficos & Visualizações Analíticas no PDF
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Inserir Gráficos no Documento</span>
                  </label>
                </div>

                {includeCharts && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePricingChart}
                        onChange={(e) => setIncludePricingChart(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">Comparativo de Preços</span>
                        <span className="text-[10px] text-slate-500 block">Tabela vs Revenda vs Piso</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeReturnsChart}
                        onChange={(e) => setIncludeReturnsChart(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">Distratos & Retenções</span>
                        <span className="text-[10px] text-slate-500 block">Lei 13.786/2018 vs Restituição</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeStatusFunnelChart}
                        onChange={(e) => setIncludeStatusFunnelChart(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">Esteira & Funil Comercial</span>
                        <span className="text-[10px] text-slate-500 block">Status das Unidades & Leads</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Document Preview */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 text-slate-900 dark:text-slate-100 font-sans">
              {/* Document Header */}
              <div className="border-b-2 border-blue-600 pb-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    ARV INVESTOR • GESTÃO DE ATIVOS IMOBILIÁRIOS
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">
                    {reportType === "executive"
                      ? "Relatório Executivo Consolidado de Revenda & Distratos"
                      : reportType === "returns_compliance"
                      ? "Relatório Jurídico-Financeiro de Distratos (Lei 13.786/2018)"
                      : reportType === "showcase_pricing"
                      ? "Relatório Comercial de Vitrine, Preços & Descontos de Revenda"
                      : "Relatório de Leads, Pipeline Comercial & Propostas"}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Escopo:{" "}
                    {selectedSpeId !== "all"
                      ? spes.find((s) => s.id === selectedSpeId)?.name || selectedSpeId
                      : "Consolidado Geral (Todas as SPEs)"}{" "}
                    | Emissor: {authorName}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <span>Data: {new Date().toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              {/* Executive Summary Box */}
              {executiveNotes && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Síntese Executiva:
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{executiveNotes}</p>
                </div>
              )}

              {/* Top KPIs Summary */}
              {includeStatsSummary && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      VGV EM REVENDA
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      R$ {(totalVgvResale / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {filteredListings.length} unidades
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      VGV RECOLOCADO
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      R$ {(totalVgvSold / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {filteredListings.filter((l) => l.status === "Vendido").length} vendidas
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      RETENÇÃO SPE
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      R$ {(totalRetention / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Lei nº 13.786/2018
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      DESCONTO MÉDIO
                    </span>
                    <span className="text-sm font-bold text-rose-600">
                      {avgDiscount.toFixed(1)}% OFF
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      s/ Tabela Oficial
                    </span>
                  </div>
                </div>
              )}

              {/* Chart Visual Previews */}
              {includeCharts && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Gráficos Integrados ao Documento PDF</span>
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                      Vetor High-DPI Pronto para Impressão
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {includePricingChart && (
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Comparativo de Preços (Tabela vs Revenda vs Piso)
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold">Gráfico 1</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {filteredPricing.slice(0, 3).map((p) => (
                            <div key={p.id} className="text-[10px] space-y-0.5">
                              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">{p.unitId}</span>
                                <span>Revenda: R$ {Math.round(p.resalePrice / 1000)}k (-{p.discountPercentageVsTable}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${Math.min((p.resalePrice / (p.originalTablePrice || 1)) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {includeReturnsChart && (
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Distratos & Retenções (Lei 13.786/2018)
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Gráfico 2</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {filteredReturns.slice(0, 3).map((r) => (
                            <div key={r.id} className="text-[10px] space-y-0.5">
                              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">{r.unitId}</span>
                                <span>Retenção Legal: {r.retentionPercentage}% (R$ {Math.round((r.originalContractAmount * r.retentionPercentage) / 100000)}k)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500 rounded-l-full"
                                  style={{ width: `${r.retentionPercentage}%` }}
                                />
                                <div
                                  className="h-full bg-rose-400 rounded-r-full"
                                  style={{ width: `${100 - r.retentionPercentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Table Preview */}
              {includeDetailedTables && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {reportType === "returns_compliance"
                      ? "Demonstrativo Analítico de Distratos"
                      : "Demonstrativo de Unidades & Precificação"}
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {reportType === "returns_compliance" ? (
                          <tr>
                            <th className="p-2 border">Unidade</th>
                            <th className="p-2 border">Modalidade</th>
                            <th className="p-2 border">Vlr. Contrato</th>
                            <th className="p-2 border">Retenção (%)</th>
                            <th className="p-2 border">Restituição</th>
                            <th className="p-2 border">Status</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="p-2 border">Unidade</th>
                            <th className="p-2 border">Título</th>
                            <th className="p-2 border">Tabela</th>
                            <th className="p-2 border">Revenda</th>
                            <th className="p-2 border">Desconto</th>
                            <th className="p-2 border">Piso Mínimo</th>
                            <th className="p-2 border">Status</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {reportType === "returns_compliance"
                          ? filteredReturns.map((r) => (
                              <tr key={r.id} className="text-[11px]">
                                <td className="p-2 border font-bold">{r.unitId}</td>
                                <td className="p-2 border">{r.returnType}</td>
                                <td className="p-2 border">
                                  R$ {r.originalContractAmount.toLocaleString("pt-BR")}
                                </td>
                                <td className="p-2 border font-bold text-blue-600">
                                  {r.retentionPercentage}%
                                </td>
                                <td className="p-2 border font-bold text-rose-600">
                                  R$ {r.amountRefundedToInvestor.toLocaleString("pt-BR")}
                                </td>
                                <td className="p-2 border">{r.legalStatus}</td>
                              </tr>
                            ))
                          : filteredListings.map((l) => {
                              const p = filteredPricing.find((pr) => pr.resaleListingId === l.id);
                              return (
                                <tr key={l.id} className="text-[11px]">
                                  <td className="p-2 border font-bold">{l.unitId}</td>
                                  <td className="p-2 border">{l.listingTitle}</td>
                                  <td className="p-2 border">
                                    R$ {(p?.originalTablePrice || 0).toLocaleString("pt-BR")}
                                  </td>
                                  <td className="p-2 border font-bold text-blue-600">
                                    R$ {(p?.resalePrice || 0).toLocaleString("pt-BR")}
                                  </td>
                                  <td className="p-2 border text-rose-600">
                                    {(p?.discountPercentageVsTable || 0).toFixed(1)}%
                                  </td>
                                  <td className="p-2 border text-slate-500">
                                    R$ {(p?.minimumAcceptablePrice || 0).toLocaleString("pt-BR")}
                                  </td>
                                  <td className="p-2 border">{l.status}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Export Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Documentos gerados em conformidade com as diretrizes ARV Inc.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? "Gerando..." : "Baixar PDF Oficial"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
