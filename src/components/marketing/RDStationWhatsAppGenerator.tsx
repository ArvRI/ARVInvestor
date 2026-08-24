import React, { useState } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  FileCode,
  Building,
  User,
  MapPin,
  Layers,
  FileText,
  Video,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { MarketingLead } from "../../types";
import { useApp } from "../../context/AppContext";

export interface LeadWhatsAppInput {
  name?: string;
  speOfInterest?: string;
  location?: string;
  typology?: string;
  presentationLink?: string;
  videoLink?: string;
}

export function generateARVWhatsAppMessage(input: LeadWhatsAppInput): string {
  const fullName = input.name?.trim() || "Cliente";
  const firstName = fullName.split(" ")[0] || fullName;
  const propertyName = input.speOfInterest?.trim() || "Empreendimento ARV";

  const topics: string[] = [];

  if (input.location?.trim()) {
    topics.push(`📍 *Localização:* ${input.location.trim()}`);
  }
  if (input.typology?.trim()) {
    topics.push(`📐 *Tipologia:* ${input.typology.trim()}`);
  }
  if (input.presentationLink?.trim()) {
    topics.push(`📄 *Apresentação:* ${input.presentationLink.trim()}`);
  }
  if (input.videoLink?.trim()) {
    topics.push(`🎥 *Vídeo:* ${input.videoLink.trim()}`);
  }

  const topicsBlock =
    topics.length > 0
      ? `\n\nConfira abaixo os principais destaques do imóvel:\n\n${topics.join("\n")}`
      : "";

  return `Olá, *${firstName}*! Tudo bem?

Recebemos o seu cadastro com interesse no *${propertyName}* da Construtora ARV.${topicsBlock}

Um dos nossos corretores especialistas entrará em contato em breve para apresentar todos os detalhes e tirar suas dúvidas.

Como podemos te ajudar hoje?`;
}

interface RDStationWhatsAppGeneratorProps {
  selectedLead?: MarketingLead | null;
  onSelectLead?: (lead: MarketingLead) => void;
}

export const RDStationWhatsAppGenerator: React.FC<RDStationWhatsAppGeneratorProps> = ({
  selectedLead,
  onSelectLead,
}) => {
  const { leads, spes } = useApp();

  const [activeTab, setActiveTab] = useState<"visual" | "raw_json">("visual");

  // Form state
  const [formData, setFormData] = useState<LeadWhatsAppInput>({
    name: selectedLead?.name || "Carlos Eduardo Silva",
    speOfInterest: selectedLead?.speOfInterest || "13 - T58 SPOT SPE LTDA",
    location: "Trindade, Florianópolis - SC (Próximo à UFSC)",
    typology: "Studio & Loft Inteligente | 38m² a 52m²",
    presentationLink: "https://arvinc.com.br/t58-apresentacao.pdf",
    videoLink: "https://youtube.com/watch?v=arv-t58-spot",
  });

  const [rawJson, setRawJson] = useState<string>(
    JSON.stringify(
      {
        lead: {
          id: "rd-889102",
          name: "Carlos Eduardo Silva",
          email: "carlos.silva@empresa.com.br",
          personal_phone: "(48) 99122-3344",
          first_conversion: {
            conversion_identifier: "download_ebook_investimento_t58",
            source: "rdstation",
          },
          custom_fields: {
            spe: "13 - T58 SPOT SPE LTDA",
            localizacao: "Trindade, Florianópolis - SC (Próximo à UFSC)",
            tipologia: "Studio & Loft Inteligente | 38m² a 52m²",
            link_apresentacao: "https://arvinc.com.br/t58-apresentacao.pdf",
            link_video: "https://youtube.com/watch?v=arv-t58-spot",
          },
        },
      },
      null,
      2
    )
  );

  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // When selected lead changes
  React.useEffect(() => {
    if (selectedLead) {
      const matchedSpe = spes.find((s) => s.name === selectedLead.speOfInterest);
      setFormData({
        name: selectedLead.name,
        speOfInterest: selectedLead.speOfInterest || "13 - T58 SPOT SPE LTDA",
        location: matchedSpe ? `${matchedSpe.address}, ${matchedSpe.city}` : "Florianópolis - SC",
        typology: "Studios e Suítes Corporativas",
        presentationLink: `https://arvinc.com.br/${(selectedLead.speOfInterest || "spe").toLowerCase().replace(/[^a-z0-9]/g, "-")}-deck.pdf`,
        videoLink: "",
      });
    }
  }, [selectedLead, spes]);

  const generatedMessage = generateARVWhatsAppMessage(formData);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedLead?.whatsapp || selectedLead?.phone || "";
    const cleanPhone = phone.replace(/\D/g, "");
    const encodedMsg = encodeURIComponent(generatedMessage);
    const targetUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;

    window.open(targetUrl, "_blank");
  };

  const handleParseRawJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(rawJson);
      const leadObj = parsed.lead || parsed.leads?.[0] || parsed;
      const custom = leadObj.custom_fields || {};

      const name = leadObj.name || leadObj.nome || leadObj.email?.split("@")[0] || "Cliente";
      const spe = custom.spe || custom.empreendimento || leadObj.speOfInterest || "13 - T58 SPOT SPE LTDA";
      const loc = custom.localizacao || custom.location || "";
      const typ = custom.tipologia || custom.metragem || "";
      const pres = custom.link_apresentacao || custom.apresentacao || custom.pdf || "";
      const vid = custom.link_video || custom.video || "";

      setFormData({
        name,
        speOfInterest: spe,
        location: loc,
        typology: typ,
        presentationLink: pres,
        videoLink: vid,
      });

      setActiveTab("visual");
    } catch (err: any) {
      setJsonError("JSON do RD Station inválido. Verifique a sintaxe e tente novamente.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-300">
              RD Station ➔ WhatsApp AI
            </span>
            <span className="text-xs text-slate-500 font-medium">Construtora ARV</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Gerador de Mensagens de WhatsApp para Leads RD Station
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transforme dados brutos do RD Station em mensagens de engajamento consultivo, cordiais e personalizadas.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "visual"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Formulário & Leads CRM
          </button>
          <button
            onClick={() => setActiveTab("raw_json")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "raw_json"
                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Payload Bruto RD Station (JSON)
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs WhatsApp Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-6 space-y-4">
          {activeTab === "visual" ? (
            <div className="space-y-3">
              {/* Select from existing CRM Leads */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Selecionar Lead Importado do RD Station / CRM:
                </label>
                <select
                  value={selectedLead?.id || ""}
                  onChange={(e) => {
                    const found = leads.find((l) => l.id === e.target.value);
                    if (found && onSelectLead) {
                      onSelectLead(found);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Usar Entrada Manual / Personalizada --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.speOfInterest || "Sem SPE"}) - {l.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Cliente (Lead) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium pl-8"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Empreendimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Empreendimento de Interesse (SPE / Lançamento) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.speOfInterest}
                    onChange={(e) => setFormData({ ...formData, speOfInterest: e.target.value })}
                    placeholder="Ex: ARV Horizon Residence ou 13 - T58 SPOT SPE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium pl-8"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Localização (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Localização do Imóvel (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Deixe em branco se não fornecido</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Av. Beira Mar, 1200 - Meireles, Fortaleza/CE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 pl-8"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Tipologia (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Tipologia / Metragem (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Deixe em branco se não fornecido</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.typology}
                    onChange={(e) => setFormData({ ...formData, typology: e.target.value })}
                    placeholder="Ex: 2 e 3 Suítes | 68m² a 112m²"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 pl-8"
                  />
                  <Layers className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Link Apresentação (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Link da Apresentação / PDF (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Deixe em branco se não fornecido</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.presentationLink}
                    onChange={(e) => setFormData({ ...formData, presentationLink: e.target.value })}
                    placeholder="Ex: https://arvinc.com.br/horizon.pdf"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 pl-8"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Link Vídeo (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Link do Vídeo / Tour Virtual (Opcional)</span>
                  <span className="text-[10px] text-slate-400">Deixe em branco se não fornecido</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.videoLink}
                    onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                    placeholder="Ex: https://youtube.com/watch?v=123"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 pl-8"
                  />
                  <Video className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          ) : (
            /* Raw JSON Input Tab */
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Cole aqui o JSON bruto recebido do RD Station (Webhook / API):
              </label>
              <textarea
                rows={12}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />

              {jsonError && (
                <p className="text-xs text-rose-500 font-semibold">{jsonError}</p>
              )}

              <button
                onClick={handleParseRawJson}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Processar e Extrair Dados do RD Station
              </button>
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp Live Mockup & Output */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Prévia Visual da Mensagem de WhatsApp (Formato Oficial ARV)
            </span>

            <button
              onClick={handleCopyMessage}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Mensagem
                </>
              )}
            </button>
          </div>

          {/* WhatsApp UI Card Container */}
          <div className="bg-[#efeae2] dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner relative overflow-hidden space-y-3">
            {/* WhatsApp Header Mockup */}
            <div className="bg-[#075e54] text-white p-2.5 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold">
                  ARV
                </div>
                <div>
                  <span className="text-xs font-bold block leading-none">
                    Construtora ARV • Atendimento
                  </span>
                  <span className="text-[10px] text-emerald-200">Online | Comercial Lead RD</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                {formData.name?.split(" ")[0]}
              </span>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3.5 rounded-xl rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 max-w-[92%] font-sans text-xs leading-relaxed whitespace-pre-wrap select-all">
              {generatedMessage}
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * Negritos e quebras de linha formatados nativamente para WhatsApp.
              </p>

              <button
                onClick={handleOpenWhatsApp}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Abrir no WhatsApp Web
              </button>
            </div>
          </div>

          {/* Quick Rules Checklist Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              ✅ Diretrizes de Formatação e Estilo Aplicadas:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 list-disc list-inside text-[10px]">
              <li>Saudação cordial com primeiro nome</li>
              <li>Confirmação do empreendimento</li>
              <li>Tópicos formatados com emojis</li>
              <li>Campos vazios omitidos (sem fakes)</li>
              <li>Negrito em pontos de destaque</li>
              <li>CTA sutil de contato com corretor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
