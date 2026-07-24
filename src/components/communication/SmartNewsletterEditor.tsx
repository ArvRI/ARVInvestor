import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  SmartNewsletter,
  NewsletterFrequency,
  NewsletterChannel,
  NewsletterScheduleStatus,
} from "../../types";
import {
  Sparkles,
  Save,
  Send,
  Building2,
  Calendar,
  Layers,
  Share2,
  CheckCircle,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Eye,
  FileText,
} from "lucide-react";

interface SmartNewsletterEditorProps {
  initialNewsletter?: SmartNewsletter | null;
  onSave: (newsletter: Omit<SmartNewsletter, "id"> | SmartNewsletter) => void;
  onCancel: () => void;
}

export const SmartNewsletterEditor: React.FC<SmartNewsletterEditorProps> = ({
  initialNewsletter,
  onSave,
  onCancel,
}) => {
  const { spes } = useApp();

  const [selectedSpeId, setSelectedSpeId] = useState<string>(
    initialNewsletter?.speId || spes[0]?.id || "spe-01"
  );

  const currentSpe = spes.find((s) => s.id === selectedSpeId) || spes[0];

  const [editionName, setEditionName] = useState<string>(
    initialNewsletter?.editionName ||
      `Informativo Oficial aos Investidores ARV - ${currentSpe?.name || "SPE"} - Edição #${Math.floor(
        Math.random() * 20 + 10
      )}`
  );

  const [editionDate, setEditionDate] = useState<string>(
    initialNewsletter?.editionDate || new Date().toISOString().split("T")[0]
  );

  const [frequency, setFrequency] = useState<NewsletterFrequency>(
    initialNewsletter?.frequency || "Mensal"
  );

  const [channels, setChannels] = useState<NewsletterChannel[]>(
    initialNewsletter?.channels || ["EMAIL", "WHATSAPP", "PORTAL", "PUSH"]
  );

  const [status, setStatus] = useState<
    "Rascunho" | "Em Revisao" | "Aprovado" | "Publicado" | "Enviado"
  >(initialNewsletter?.status || "Rascunho");

  const [aiSummary, setAiSummary] = useState<string>(
    initialNewsletter?.aiSummary ||
      `Neste período, o empreendimento ${currentSpe?.name || "ARV Horizon"} manteve seu cronograma rigorosamente conforme o planejado, alcançando ${
        currentSpe?.progressPercentage || 64
      }% de execução física global. Agradecemos a confiança e seguimos com total transparência e foco no cumprimento dos prazos.`
  );

  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Card 1 state
  const [scheduleStatus, setScheduleStatus] = useState<NewsletterScheduleStatus>(
    initialNewsletter?.card1Resumo.scheduleStatus || "no_prazo"
  );
  const [engineerLead, setEngineerLead] = useState<string>(
    initialNewsletter?.card1Resumo.engineerLead || currentSpe?.manager || "Eng. Ricardo Alencar"
  );

  // Card 2 state
  const [monthlyHighlightText, setMonthlyHighlightText] = useState<string>(
    initialNewsletter?.card2Evolucao.monthlyHighlightText ||
      `Avanço constante de +2% no cronograma físico da obra. Conclusão da estrutura do bloco principal e avanço no revestimento.`
  );

  // Handle Channel checkbox toggle
  const toggleChannel = (channel: NewsletterChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Call Gemini Backend API for AI Text Generation
  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/ai/newsletter-summary", {
        method: "POST",
        headers: { "Content-[#10]": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          speName: currentSpe?.name,
          progressPercentage: currentSpe?.progressPercentage || 64,
          completedStages: ["Fundação Profunda", "Estrutura dos Pavimentos"],
          inProgressStages: ["Instalações Elétricas e Hidráulicas"],
          commercialHighlight: "Últimas unidades liberadas com tabela exclusiva para cotistas",
        }),
      });

      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error("Erro ao gerar resumo com IA:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveForm = (isSend: boolean = false) => {
    const finalNewsletter: any = {
      id: initialNewsletter?.id || `news-${Date.now()}`,
      editionName,
      editionDate,
      frequency,
      speId: selectedSpeId,
      speName: currentSpe?.name || "SPE ARV",
      developmentName: currentSpe?.name.replace("SPE ", "") || "ARV Residence",
      coverImage:
        currentSpe?.bannerImage ||
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      status: isSend ? "Publicado" : status,
      channels,
      aiSummary,

      card1Resumo: {
        speName: currentSpe?.name || "SPE ARV",
        developmentName: currentSpe?.name.replace("SPE ", "") || "ARV Residence",
        city: currentSpe?.city || "Fortaleza - CE",
        neighborhood: "Meireles",
        engineerLead,
        startDate: "2024-03-15",
        estimatedCompletion: currentSpe?.deadline || "2027-06-30",
        executedPercentage: currentSpe?.progressPercentage || 64,
        investorsCount: 32,
        totalRaised: currentSpe?.totalCaptação || 62000000,
        scheduleStatus,
      },

      card2Evolucao: initialNewsletter?.card2Evolucao || {
        executedPercentage: currentSpe?.progressPercentage || 64,
        plannedPercentage: 62,
        completedStages: ["Fundação Profunda", "Estrutura Geral"],
        inProgressStages: ["Instalações Hidráulicas e Elétricas"],
        nextStages: ["Revestimento de Fachada"],
        monthlyHighlightText,
        previousMonthPhoto:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        currentMonthPhoto:
          "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },

      card3Galeria: initialNewsletter?.card3Galeria || [
        {
          id: "gal-01",
          title: "Avanço da Estrutura Externa",
          type: "drone",
          url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
          date: editionDate,
          description: "Captura de drone mostrando a estrutura do topo da torre.",
        },
      ],

      card4Indicadores: initialNewsletter?.card4Indicadores || {
        physicalProgress: currentSpe?.progressPercentage || 64,
        scheduleAdherencePct: 102,
        safetyDaysNoAccidents: 420,
        licensesStatus: "Alvará de Construção e LI Válidos",
        documentationStatus: "Matrícula Individualizada em Dia",
        investmentRealized: 41500000,
        nextMilestone: "Início do Revestimento Interno",
      },

      card5NovidadesComerciais: initialNewsletter?.card5NovidadesComerciais || [
        {
          id: "com-01",
          title: "Oportunidade de Reinvestimento",
          description: "Unidades remanescentes com carência diferenciada para cotistas.",
          image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
          badge: "Exclusivo Cotistas",
          ctaText: "Ver Tabela",
          ctaUrl: "/portal",
        },
      ],

      card6Comunicados: initialNewsletter?.card6Comunicados || [
        {
          id: "ann-01",
          type: "Prestação de Contas",
          title: "Demonstrativos Contábeis do Mês",
          content: "Notas fiscais e balancetes da SPE aprovados e anexados no Portal.",
          date: editionDate,
        },
      ],

      card7Eventos: initialNewsletter?.card7Eventos || [
        {
          id: "evt-01",
          type: "Assembleia",
          title: "Assembleia de Acompanhamento Ordinária",
          date: "2026-08-15",
          time: "19:00",
          location: "Auditório ARV / Zoom",
        },
      ],

      card8Timeline: initialNewsletter?.card8Timeline || [
        { id: "tl-01", stage: "Fundação", status: "completed", estimatedDate: "Concluído" },
        { id: "tl-02", stage: "Estrutura", status: "completed", estimatedDate: "Concluído" },
        { id: "tl-03", stage: "Instalações", status: "in_progress", estimatedDate: "Em Execução" },
      ],

      card9Faqs: initialNewsletter?.card9Faqs || [
        {
          id: "faq-01",
          question: "Como solicitar informe de rendimentos?",
          answer: "Acesse a aba 'Documentos' do seu Portal do Investidor ARV.",
        },
      ],

      card10Portal: initialNewsletter?.card10Portal || {
        newDocsCount: 3,
        newPhotosCount: 12,
        unreadMessagesCount: 1,
        upcomingPaymentsCount: 0,
        notificationsCount: 2,
        ctaUrl: "/portal",
      },

      card11Gerente: initialNewsletter?.card11Gerente || {
        name: engineerLead,
        role: "Gerente de Relações com Investidores (RI)",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
        phone: "(85) 99876-5432",
        whatsapp: "+5585998765432",
        email: "ricardo.alencar@arvinc.com.br",
      },

      stats: initialNewsletter?.stats || {
        sentCount: 0,
        deliveryRate: 100,
        openRate: 0,
        clicksPerSection: {},
        docDownloads: 0,
        photoViews: 0,
        portalVisitsGenerated: 0,
        mostAccessedSPE: currentSpe?.name || "",
        engagementByInvestor: [],
      },
    };

    onSave(finalNewsletter);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Editor de Newsletter Inteligente ARV
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure as informações automáticas e revise o conteúdo antes do disparo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSaveForm(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSaveForm(true)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Aprovar & Disparar Agora
          </button>
        </div>
      </div>

      {/* Basic Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            Selecione a SPE do Empreendimento
          </label>
          <select
            value={selectedSpeId}
            onChange={(e) => setSelectedSpeId(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
          >
            {spes.map((spe) => (
              <option key={spe.id} value={spe.id}>
                {spe.name} ({spe.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            Frequência de Automação
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as NewsletterFrequency)}
            className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
          >
            <option value="Semanal">Semanal (Toda Segunda)</option>
            <option value="Quinzenal">Quinzenal (1º e 15º dia)</option>
            <option value="Mensal">Mensal (Última Sesta do mês)</option>
            <option value="Sob demanda">Sob Demanda (Avulso)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            Data da Edição
          </label>
          <input
            type="date"
            value={editionDate}
            onChange={(e) => setEditionDate(e.target.value)}
            className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
            Status da Edição
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
          >
            <option value="Rascunho">Rascunho</option>
            <option value="Em Revisao">Em Revisão pelo RI</option>
            <option value="Aprovado">Aprovado para Disparo</option>
            <option value="Publicado">Publicado & Disparado</option>
          </select>
        </div>
      </div>

      {/* Target Distribution Channels */}
      <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Canais de Distribuição da Newsletter
        </label>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          {[
            { id: "EMAIL", label: "Disparo por E-mail (HTML)" },
            { id: "WHATSAPP", label: "Notificação via WhatsApp API" },
            { id: "PORTAL", label: "Publicação no Portal do Investidor" },
            { id: "PUSH", label: "Notificação Push (Aplicativo)" },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={channels.includes(item.id as NewsletterChannel)}
                onChange={() => toggleChannel(item.id as NewsletterChannel)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* AI Institutional Text Generator Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-3 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            Redação Institucional com Inteligência Artificial (Gemini)
          </div>
          <button
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Gerar Texto Institucional com IA
          </button>
        </div>

        <p className="text-xs text-slate-300">
          A IA analisa as medições físicas da obra, andamento dos contratos da SPE e comunicados comerciais para compor o texto do informativo aos investidores.
        </p>

        <textarea
          rows={4}
          value={aiSummary}
          onChange={(e) => setAiSummary(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
          placeholder="O texto gerado pela IA aparecerá aqui para você editar livremente..."
        />
      </div>

      {/* Specific Card Customizations */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Ajuste fino dos Cards Específicos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="font-bold text-slate-900 dark:text-white block">
              Card 1 – Status do Cronograma (Indicador Visual)
            </label>
            <select
              value={scheduleStatus}
              onChange={(e) => setScheduleStatus(e.target.value as NewsletterScheduleStatus)}
              className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
            >
              <option value="no_prazo">🟢 Obra no Prazo (Indicador Verde)</option>
              <option value="atencao">🟡 Atenção no Cronograma (Indicador Amarelo)</option>
              <option value="atrasado">🔴 Em Atraso (Indicador Vermelho)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="font-bold text-slate-900 dark:text-white block">
              Card 1 – Responsável Técnico da Obra
            </label>
            <input
              type="text"
              value={engineerLead}
              onChange={(e) => setEngineerLead(e.target.value)}
              className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <label className="font-bold text-slate-900 dark:text-white block">
            Card 2 – Destaque do Mês na Evolução da Obra
          </label>
          <textarea
            rows={2}
            value={monthlyHighlightText}
            onChange={(e) => setMonthlyHighlightText(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

    </div>
  );
};
