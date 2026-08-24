import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { SmartNewsletterPreview } from "./SmartNewsletterPreview";
import { SmartNewsletterEditor } from "./SmartNewsletterEditor";
import { NewsletterAnalyticsPanel } from "./NewsletterAnalyticsPanel";
import { SmartNewsletter } from "../../types";
import {
  Mail,
  Send,
  Users,
  Building,
  CheckCircle2,
  BarChart,
  Eye,
  MousePointer,
  Sparkles,
  Plus,
  MessageSquare,
  FileText,
  Clock,
  Layout,
  Settings,
  Share2,
  Calendar,
  Check,
  Edit,
  Trash2,
} from "lucide-react";

export const CommunicationHub: React.FC = () => {
  const {
    newsletters,
    spes,
    investors,
    addNotification,
    addNewsletter,
    updateNewsletter,
    sendNewsletter,
    deleteNewsletter,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "NEWSLETTER" | "ANALYTICS" | "AUTOMATION" | "QUICK_DISPATCH"
  >("NEWSLETTER");

  const [selectedNewsletterForPreview, setSelectedNewsletterForPreview] =
    useState<SmartNewsletter | null>(newsletters[0] || null);

  const [isEditingNewsletter, setIsEditingNewsletter] = useState<boolean>(false);
  const [editingNewsletterTarget, setEditingNewsletterTarget] =
    useState<SmartNewsletter | null>(null);

  // Quick broadcast form state
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<
    "ALL" | "EMAIL" | "WHATSAPP" | "PORTAL"
  >("ALL");
  const [targetSegment, setTargetSegment] = useState<
    "ALL" | "PLATINUM" | "GOLD" | "FORTALEZA"
  >("ALL");
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Filter estimated audience count
  const estimatedAudience = investors.filter((inv) => {
    if (targetSegment === "PLATINUM") return inv.tier === "Private" || inv.tier === "Prime" || (inv.tier as string) === "Platinum";
    if (targetSegment === "GOLD") return inv.tier === "Select" || (inv.tier as string) === "Gold";
    if (targetSegment === "FORTALEZA") return inv.city.includes("Fortaleza");
    return true;
  }).length;

  const handleSendQuickCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignMessage) return;

    addNotification({
      title: campaignTitle,
      message: campaignMessage,
      date: new Date().toISOString().split("T")[0],
      read: false,
      type: "info",
    });

    setIsSentSuccess(true);
    setTimeout(() => {
      setIsSentSuccess(false);
      setCampaignTitle("");
      setCampaignMessage("");
    }, 3000);
  };

  const handleCreateNewNewsletter = () => {
    setEditingNewsletterTarget(null);
    setIsEditingNewsletter(true);
  };

  const handleEditNewsletter = (news: SmartNewsletter) => {
    setEditingNewsletterTarget(news);
    setIsEditingNewsletter(true);
  };

  const handleSaveNewsletter = (
    newsData: Omit<SmartNewsletter, "id"> | SmartNewsletter
  ) => {
    if ("id" in newsData && newsData.id && newsletters.some((n) => n.id === newsData.id)) {
      updateNewsletter(newsData.id, newsData);
      setSelectedNewsletterForPreview(newsData as SmartNewsletter);
    } else {
      const newId = addNewsletter(newsData as Omit<SmartNewsletter, "id">);
      const created = { ...(newsData as any), id: newId };
      setSelectedNewsletterForPreview(created);
    }
    setIsEditingNewsletter(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-6 h-6 text-amber-500" />
            Central de Newsletters Inteligentes & Comunicação ARV
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Geração automática de informativos com base nas SPEs, obras e novidades comerciais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewNewsletter}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Edição da Newsletter
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("NEWSLETTER");
            setIsEditingNewsletter(false);
          }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "NEWSLETTER"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Newsletters Inteligentes (Template 11 Cards)
        </button>

        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "ANALYTICS"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <BarChart className="w-4 h-4" />
          Painel de Resultados & Engajamento
        </button>

        <button
          onClick={() => setActiveTab("AUTOMATION")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "AUTOMATION"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          Automação & Frequência
        </button>

        <button
          onClick={() => setActiveTab("QUICK_DISPATCH")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "QUICK_DISPATCH"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Send className="w-4 h-4" />
          Disparo Rápido de Comunicados
        </button>
      </div>

      {/* TAB 1: NEWSLETTER HUB */}
      {activeTab === "NEWSLETTER" && (
        <div className="space-y-6">
          
          {isEditingNewsletter ? (
            <SmartNewsletterEditor
              initialNewsletter={editingNewsletterTarget}
              onSave={handleSaveNewsletter}
              onCancel={() => setIsEditingNewsletter(false)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of Newsletters */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Informativos Disponíveis ({newsletters.length})
                    </h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded">
                      Gerador Automático
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {newsletters.map((news) => {
                      const isSelected = selectedNewsletterForPreview?.id === news.id;
                      return (
                        <div
                          key={news.id}
                          onClick={() => setSelectedNewsletterForPreview(news)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 dark:bg-amber-500/20 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                              {news.speName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {news.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {news.editionName}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/40">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              {news.editionDate}
                            </span>
                            <span>Frequência: <strong>{news.frequency}</strong></span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                              Canais: {news.channels.join(", ")}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditNewsletter(news);
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                title="Editar Newsletter"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendNewsletter(news.id);
                                }}
                                className="p-1 rounded hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                title="Disparar para Investidores"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Newsletter Template Render */}
              <div className="lg:col-span-8">
                {selectedNewsletterForPreview ? (
                  <SmartNewsletterPreview
                    newsletter={selectedNewsletterForPreview}
                    isInteractive={true}
                    onEdit={() => handleEditNewsletter(selectedNewsletterForPreview)}
                    onSend={() => sendNewsletter(selectedNewsletterForPreview.id)}
                  />
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    Selecione uma newsletter à esquerda para visualizar seu template padrão completo.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: ANALYTICS & ENGAGEMENT */}
      {activeTab === "ANALYTICS" && <NewsletterAnalyticsPanel />}

      {/* TAB 3: AUTOMATION & FREQUENCY */}
      {activeTab === "AUTOMATION" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Configuração da Central de Automação de Newsletters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina as regras automáticas de compilação de relatórios e agendamento de disparos para cada SPE
            </p>
          </div>

          <div className="space-y-4">
            {spes.map((spe) => (
              <div
                key={spe.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {spe.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Progresso Físico: {spe.progressPercentage}% • VGV: R$ {spe.totalVgv.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Frequência Padrão</span>
                    <select className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold">
                      <option value="Mensal">Mensal (Todo dia 25)</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Semanal">Semanal</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Aprovação do RI</span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      Revisão Manual Obrigatória
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUICK DISPATCH CAMPAIGN FORM */}
      {activeTab === "QUICK_DISPATCH" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Criar Novo Comunicado / Disparo Rápido
              </h2>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full">
                Público Estimado: {estimatedAudience} Investidores
              </span>
            </div>

            {isSentSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Comunicado disparado com sucesso para os investidores!
              </div>
            )}

            <form onSubmit={handleSendQuickCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Título do Comunicado / Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Ex: Convocação para Assembleia de Acompanhamento das Obras SPE Horizon"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Segmentação do Público
                  </label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="ALL">Todos os Investidores ({investors.length})</option>
                    <option value="PLATINUM">Segmento Platinum (Score 88+)</option>
                    <option value="GOLD">Segmento Gold (Score 75-87)</option>
                    <option value="FORTALEZA">Investidores em Fortaleza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Canais de Entrega
                  </label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="ALL">Todos (E-mail + WhatsApp + Notification)</option>
                    <option value="EMAIL">Somente E-mail Marketing</option>
                    <option value="WHATSAPP">Somente WhatsApp API</option>
                    <option value="PORTAL">Somente In-App (Portal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Conteúdo da Mensagem *
                </label>
                <textarea
                  rows={6}
                  required
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Prezados investidores..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" /> Disparar Comunicado Rápido
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <BarChart className="w-4 h-4 text-amber-500" /> Histórico de Disparos Rápidos
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Relatório de Prestação de Contas 2º Trimestre
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>2026-07-20</span>
                    <span className="text-amber-600 font-semibold">32 Destinatários</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Eye className="w-3 h-3" /> 92% Abertura
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-bold">
                      <MousePointer className="w-3 h-3" /> 78% Cliques
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
