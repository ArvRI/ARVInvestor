import React, { useState } from "react";
import { SmartNewsletter } from "../../types";
import { ARVLogo } from "../common/ARVLogo";
import {
  Calendar,
  Building2,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Camera,
  PlayCircle,
  ShieldCheck,
  FileCheck,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Download,
  Share2,
} from "lucide-react";

interface SmartNewsletterPreviewProps {
  newsletter: SmartNewsletter;
  isInteractive?: boolean;
  onEdit?: () => void;
  onSend?: () => void;
}

export const SmartNewsletterPreview: React.FC<SmartNewsletterPreviewProps> = ({
  newsletter,
  isInteractive = true,
  onEdit,
  onSend,
}) => {
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const getStatusBadge = (status: "no_prazo" | "atencao" | "atrasado") => {
    switch (status) {
      case "no_prazo":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Obra no Prazo
          </span>
        );
      case "atencao":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Atenção no Cronograma
          </span>
        );
      case "atrasado":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Em Atraso
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-100 dark:bg-slate-900/80 p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Action Bar for Manager */}
      {isInteractive && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-800/50">
              {newsletter.status}
            </span>
            <span>Frequência: <strong>{newsletter.frequency}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 transition-colors"
              >
                Editar Card a Card
              </button>
            )}
            {onSend && (
              <button
                onClick={onSend}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Aprovar & Disparar
              </button>
            )}
          </div>
        </div>
      )}

      {/* TEMPLATE CONTAINER FOR THE NEWSLETTER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        
        {/* CABEÇALHO DA NEWSLETTER */}
        <header className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-6 mb-6">
            <ARVLogo size="md" variant="light" className="h-10" />
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Informativo Oficial aos Investidores
              </span>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {newsletter.editionDate}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {newsletter.speName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {newsletter.editionName}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2 pt-1">
              <Building2 className="w-4 h-4 text-amber-400" />
              Empreendimento: <strong>{newsletter.developmentName}</strong>
            </p>
          </div>

          {/* Foto Principal do Empreendimento */}
          <div className="mt-6 rounded-xl overflow-hidden border border-slate-700/60 shadow-lg group relative h-64 sm:h-80">
            <img
              src={newsletter.coverImage}
              alt={newsletter.developmentName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <p className="text-xs text-amber-300 uppercase tracking-wide font-medium">Perspectiva Atualizada</p>
                <p className="text-base font-bold text-white">{newsletter.developmentName}</p>
              </div>
              <span className="text-xs bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-slate-700">
                Fortaleza - CE
              </span>
            </div>
          </div>

          {/* AI Summary Banner */}
          {newsletter.aiSummary && (
            <div className="mt-6 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                Resumo da Diretoria & IA Institucional ARV
              </div>
              <p>{newsletter.aiSummary}</p>
            </div>
          )}
        </header>

        {/* CARD 1 – RESUMO EXECUTIVO DA SPE */}
        <section className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                01
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Resumo Executivo da SPE
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dados contratuais, responsáveis e status financeiro
                </p>
              </div>
            </div>
            {getStatusBadge(newsletter.card1Resumo.scheduleStatus)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs sm:text-sm pt-2">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Nome da SPE</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{newsletter.card1Resumo.speName}</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Empreendimento</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{newsletter.card1Resumo.developmentName}</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Localização</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {newsletter.card1Resumo.neighborhood}, {newsletter.card1Resumo.city}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Responsável pela Obra</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-500" />
                {newsletter.card1Resumo.engineerLead}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Início das Obras</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{newsletter.card1Resumo.startDate}</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Previsão de Conclusão</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{newsletter.card1Resumo.estimatedCompletion}</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Número de Investidores</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                {newsletter.card1Resumo.investorsCount} investidores cotistas
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Valor Total Captado</span>
              <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                R$ {newsletter.card1Resumo.totalRaised.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Percentual Geral Executado</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${newsletter.card1Resumo.executedPercentage}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {newsletter.card1Resumo.executedPercentage}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2 – EVOLUÇÃO DA OBRA */}
        <section className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              02
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Evolução da Obra
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento das etapas físicas e medição do período
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {newsletter.card2Evolucao.monthlyHighlightText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                  ✓ Etapas Concluídas:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  {newsletter.card2Evolucao.completedStages.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-amber-600 dark:text-amber-400 font-semibold block mb-1">
                  ⚡ Em Andamento:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  {newsletter.card2Evolucao.inProgressStages.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 dark:text-blue-400 font-semibold block mb-1">
                  🎯 Próximas Etapas:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  {newsletter.card2Evolucao.nextStages.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Fotos Comparativas do Período */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              Comparativo de Evolução Fotográfica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 group">
                <img
                  src={newsletter.card2Evolucao.previousMonthPhoto}
                  alt="Mês Anterior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-medium px-2.5 py-1 rounded-md">
                  Mês Anterior
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-48 group">
                <img
                  src={newsletter.card2Evolucao.currentMonthPhoto}
                  alt="Mês Atual"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
                  Mês Atual (Evolução)
                </span>
              </div>
            </div>

            {newsletter.card2Evolucao.videoUrl && (
              <div className="pt-2 text-center">
                <a
                  href={newsletter.card2Evolucao.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition-all border border-slate-700 shadow-sm"
                >
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  Assistir Vídeo HD do Canteiro de Obras
                </a>
              </div>
            )}
          </div>
        </section>

        {/* CARD 3 – GALERIA DE FOTOS E DRONE */}
        <section className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              03
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Galeria de Fotos & Imagens de Drone
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registros visuais recentes do avanço da edificação
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {newsletter.card3Galeria.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImageModal(item.url)}
                className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-xs cursor-pointer hover:border-amber-500 transition-all"
              >
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
                    {item.type}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-2">
                    {item.date} • Clique para ampliar
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 4 – INDICADORES DA OBRA */}
        <section className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              04
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Indicadores Chave da Obra (KPIs)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Governança, licenças, conformidade e segurança do trabalho
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Aderência ao Cronograma
              </span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {newsletter.card4Indicadores.scheduleAdherencePct}%
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                +2% em relação ao planejado
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Segurança do Trabalho
              </span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {newsletter.card4Indicadores.safetyDaysNoAccidents} dias
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Sem acidentes com afastamento
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                Status de Licenças
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2">
                {newsletter.card4Indicadores.licensesStatus}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                Documentação do Imóvel
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2">
                {newsletter.card4Indicadores.documentationStatus}
              </p>
            </div>
          </div>
        </section>

        {/* CARD 5 – NOVIDADES COMERCIAIS */}
        <section className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              05
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Novidades Comerciais da ARV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Oportunidades de reinvestimento e comunicados de vendas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newsletter.card5NovidadesComerciais.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <a
                    href={item.ctaUrl}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    {item.ctaText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 6 – COMUNICADOS DA ARV */}
        <section className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              06
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Comunicados Institucionais
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informativos de prestação de contas, governança e assembleias
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {newsletter.card6Comunicados.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50">
                    {ann.type}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {ann.date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  {ann.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 7 – PRÓXIMOS EVENTOS */}
        <section className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
              07
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Próximos Eventos & Reuniões
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calendário de encontros, visitas técnicas e assembleias
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newsletter.card7Eventos.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 shadow-xs"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center font-bold shrink-0 border border-amber-500/20">
                  <span className="text-[10px] uppercase tracking-wider">{evt.date.split("-")[1]}</span>
                  <span className="text-base">{evt.date.split("-")[2]}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                    {evt.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>🕒 {evt.time}</span>
                    <span>📍 {evt.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 8 – PRÓXIMAS ETAPAS DA OBRA (TIMELINE) */}
        <section className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              08
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Próximas Etapas da Obra (Cronograma)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Linha do tempo física até a entrega das chaves
              </p>
            </div>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
            {newsletter.card8Timeline.map((step) => (
              <div key={step.id} className="flex items-start gap-3 relative pl-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                    step.status === "completed"
                      ? "bg-emerald-500 text-white"
                      : step.status === "in_progress"
                      ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {step.status === "completed" ? "✓" : "•"}
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {step.stage}
                    </h4>
                    {step.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{step.notes}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    {step.estimatedDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARD 9 – PERGUNTAS FREQUENTES (FAQ) */}
        <section className="p-6 sm:p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
              09
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Perguntas Frequentes (FAQ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dúvidas recorrentes dos cotistas para o estágio atual
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {newsletter.card9Faqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CARD 10 – PORTAL DO INVESTIDOR */}
        <section className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                10
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Acesse Seu Portal do Investidor ARV
                </h2>
                <p className="text-xs text-slate-300">
                  Acompanhe documentos, demonstrativos financeiros e relatórios em tempo real
                </p>
              </div>
            </div>
            <a
              href="/portal"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              Acessar Portal do Investidor
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <span className="text-xl font-black text-amber-400 block">
                {newsletter.card10Portal.newDocsCount}
              </span>
              <span className="text-[11px] text-slate-300">Novos Documentos</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <span className="text-xl font-black text-amber-400 block">
                {newsletter.card10Portal.newPhotosCount}
              </span>
              <span className="text-[11px] text-slate-300">Fotos & Vídeos Recentes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <span className="text-xl font-black text-amber-400 block">
                {newsletter.card10Portal.unreadMessagesCount}
              </span>
              <span className="text-[11px] text-slate-300">Mensagens não Lidas</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <span className="text-xl font-black text-amber-400 block">
                {newsletter.card10Portal.notificationsCount}
              </span>
              <span className="text-[11px] text-slate-300">Notificações do Sistema</span>
            </div>
          </div>
        </section>

        {/* CARD 11 – CONTATO DO GERENTE */}
        <footer className="p-6 sm:p-8 bg-slate-100 dark:bg-slate-950 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              11
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Fale com o Seu Gerente de Relacionamento (RI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atendimento personalizado e suporte contínuo ao investidor
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img
                src={newsletter.card11Gerente.avatarUrl}
                alt={newsletter.card11Gerente.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-sm shrink-0"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {newsletter.card11Gerente.name}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {newsletter.card11Gerente.role}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {newsletter.card11Gerente.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {newsletter.card11Gerente.email}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${newsletter.card11Gerente.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              Falar pelo WhatsApp Direct
            </a>
          </div>

          <div className="text-center pt-4 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
            <p>© 2026 ARV Construtora e Incorporadora. Todos os direitos reservados.</p>
            <p>Este informativo é de uso exclusivo dos cotistas e investidores cadastrados nas SPEs ARV.</p>
          </div>
        </footer>

      </div>

      {/* Lightbox Modal for Photo Gallery */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-2 text-xs font-bold z-10 transition-colors"
            >
              ✕ Fechar
            </button>
            <img src={selectedImageModal} alt="Visualização em alta resolução" className="w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
