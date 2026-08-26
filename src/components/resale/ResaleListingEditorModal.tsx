import React, { useState } from "react";
import {
  X,
  Sparkles,
  Image,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Plus,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import { ResaleListing, ResalePricing, SPE } from "../../types";

interface ResaleListingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ResaleListing | null;
  pricing?: ResalePricing;
  spe?: SPE;
  onSaveListing: (id: string, data: Partial<ResaleListing>) => void;
  onGenerateWithAI: (params: {
    unitNumber?: string;
    speName?: string;
    developmentName?: string;
    areaM2?: number;
    type?: string;
    floor?: string;
    solarPosition?: string;
    resalePrice?: number;
    originalTablePrice?: number;
    discountPercentage?: number;
    highlightTags?: string[];
    isDistrato?: boolean;
    customInstructions?: string;
  }) => Promise<{ headline: string; description: string; suggestedTags: string[] }>;
}

export const ResaleListingEditorModal: React.FC<ResaleListingEditorModalProps> = ({
  isOpen,
  onClose,
  listing,
  pricing,
  spe,
  onSaveListing,
  onGenerateWithAI,
}) => {
  const [title, setTitle] = useState<string>(listing?.listingTitle || "");
  const [description, setDescription] = useState<string>(listing?.listingDescription || "");
  const [tags, setTags] = useState<string[]>(listing?.highlightTags || ["Oportunidade", "Abaixo da Tabela"]);
  const [tagInput, setTagInput] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>(
    listing?.photos && listing.photos.length > 0
      ? listing.photos
      : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"]
  );
  const [photoInput, setPhotoInput] = useState<string>("");
  const [status, setStatus] = useState<ResaleListing["status"]>(listing?.status || "Em Preparação");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (!isOpen || !listing) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddPhoto = () => {
    if (photoInput.trim() && !photos.includes(photoInput.trim())) {
      setPhotos([...photos, photoInput.trim()]);
      setPhotoInput("");
    }
  };

  const handleRemovePhoto = (photoToRemove: string) => {
    setPhotos(photos.filter((p) => p !== photoToRemove));
  };

  const handleTriggerAI = async () => {
    setIsGeneratingAI(true);
    setFeedbackMsg(null);

    try {
      const generated = await onGenerateWithAI({
        unitNumber: listing.unitId,
        speName: spe?.name || "SPE ARV",
        developmentName: spe?.name,
        resalePrice: pricing?.resalePrice,
        originalTablePrice: pricing?.originalTablePrice,
        discountPercentage: pricing?.discountPercentageVsTable,
        highlightTags: tags,
        isDistrato: true,
        customInstructions: aiCustomPrompt,
      });

      if (generated.headline) {
        setTitle(generated.headline);
      }
      if (generated.description) {
        setDescription(generated.description);
      }
      if (generated.suggestedTags && generated.suggestedTags.length > 0) {
        const merged = Array.from(new Set([...tags, ...generated.suggestedTags]));
        setTags(merged);
      }

      setFeedbackMsg({
        text: "✨ Anúncio e copywriting gerados com sucesso pelo Gemini AI!",
        type: "success",
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: `Erro ao gerar com IA: ${err.message || "Tente novamente."}`,
        type: "error",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedbackMsg({ text: "O título do anúncio é obrigatório.", type: "error" });
      return;
    }
    if (!description.trim()) {
      setFeedbackMsg({ text: "A descrição do anúncio é obrigatória.", type: "error" });
      return;
    }

    onSaveListing(listing.id, {
      listingTitle: title,
      listingDescription: description,
      highlightTags: tags,
      photos,
      status,
    });

    onClose();
  };

  return (
    <div
      id="modal-listing-editor"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Editor de Anúncio de Revenda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unidade {listing.unitId} • {spe?.name || "SPE ARV"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {feedbackMsg && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
            >
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* AI Generation Action Card */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Gerador de Anúncio Inteligente com Gemini AI
                </span>
              </div>
              <button
                type="button"
                id="btn-generate-ai-description"
                onClick={handleTriggerAI}
                disabled={isGeneratingAI}
                className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Redigindo com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar / Otimizar com IA</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300">
              O modelo cria headlines persuasivas, copywriting institucional e tags de destaque baseando-se nos valores, metragem e perfil de investimento.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Título do Anúncio (Headline) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Oportunidade Única • Studio T58 Spot com 10.6% de desconto"
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Descrição Comercial Completa *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as características da unidade, diferenciais de acabamento, condição especial de pagamento..."
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tags de Destaque
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Adicionar tag (ex: Vista Livre, Sol da Manhã)..."
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Fotos da Unidade ({photos.length})
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="Insira a URL da imagem..."
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                Adicionar Foto
              </button>
            </div>
          </div>

          {/* Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status da Publicação *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              >
                <option value="Em Preparação">Em Preparação (Rascunho)</option>
                <option value="Publicado">Publicado na Vitrine</option>
                <option value="Pausado">Pausado</option>
                <option value="Reservado">Reservado</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Anúncio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
