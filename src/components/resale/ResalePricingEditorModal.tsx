import React, { useState } from "react";
import {
  X,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  Calculator,
  Plus,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import { ResaleListing, ResalePricing, ResalePaymentCondition } from "../../types";

interface ResalePricingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ResaleListing | null;
  pricing?: ResalePricing;
  conditions?: ResalePaymentCondition[];
  onSavePricing: (
    resaleListingId: string,
    pricingData: {
      originalTablePrice: number;
      resalePrice: number;
      pricingReason: ResalePricing["pricingReason"];
      minimumAcceptablePrice: number;
      approvedBy?: string;
    }
  ) => { success: boolean; error?: string };
  onAddCondition: (data: Omit<ResalePaymentCondition, "id">) => void;
  onDeleteCondition: (id: string) => void;
}

export const ResalePricingEditorModal: React.FC<ResalePricingEditorModalProps> = ({
  isOpen,
  onClose,
  listing,
  pricing,
  conditions = [],
  onSavePricing,
  onAddCondition,
  onDeleteCondition,
}) => {
  const [originalTablePrice, setOriginalTablePrice] = useState<number>(
    pricing?.originalTablePrice || 350000
  );
  const [resalePrice, setResalePrice] = useState<number>(
    pricing?.resalePrice || 315000
  );
  const [minimumAcceptablePrice, setMinimumAcceptablePrice] = useState<number>(
    pricing?.minimumAcceptablePrice || 297500
  );
  const [pricingReason, setPricingReason] = useState<ResalePricing["pricingReason"]>(
    pricing?.pricingReason || "Recuperação Rápida de Caixa"
  );
  const [directorApproval, setDirectorApproval] = useState<string>(
    pricing?.approvedBy || ""
  );
  const [showConditionForm, setShowConditionForm] = useState<boolean>(false);
  const [condName, setCondName] = useState<string>("Entrada 20% + 36x IPCA");
  const [condDownPayment, setCondDownPayment] = useState<number>(20);
  const [condInstallments, setCondInstallments] = useState<number>(36);
  const [condIndexer, setCondIndexer] = useState<ResalePaymentCondition["indexer"]>("IPCA");
  const [condDiscount, setCondDiscount] = useState<number>(0);
  const [condDescription, setCondDescription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  if (!isOpen || !listing) return null;

  const discountPercent =
    originalTablePrice > 0
      ? ((originalTablePrice - resalePrice) / originalTablePrice) * 100
      : 0;

  const isBelowFloor = resalePrice < minimumAcceptablePrice;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const result = onSavePricing(listing.id, {
      originalTablePrice,
      resalePrice,
      pricingReason,
      minimumAcceptablePrice,
      approvedBy: isBelowFloor ? directorApproval || "Diretoria Comercial ARV" : directorApproval,
    });

    if (!result.success) {
      setErrorMessage(result.error || "Erro ao salvar precificação.");
    } else {
      setSuccessMessage("Precificação atualizada com sucesso!");
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1200);
    }
  };

  const handleCreateCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condName.trim()) return;

    onAddCondition({
      resaleListingId: listing.id,
      name: condName,
      downPaymentPercentage: condDownPayment,
      numberOfInstallments: condInstallments,
      indexer: condIndexer,
      specialDiscountPercentage: condDiscount,
      allowsFinancing: true,
      description: condDescription || `${condDownPayment}% entrada + ${condInstallments} parcelas (${condIndexer})`,
    });

    setCondName("");
    setCondDescription("");
    setShowConditionForm(false);
  };

  return (
    <div
      id="modal-pricing-editor"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Precificação & Piso Mínimo de Revenda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unidade: <strong className="text-slate-800 dark:text-slate-200">{listing.unitId}</strong> • {listing.listingTitle}
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
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Price Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Preço Tabela Oficial (R$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={originalTablePrice}
                  onChange={(e) => setOriginalTablePrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Preço de Revenda Oferecido (R$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(Number(e.target.value))}
                  className={`w-full p-2.5 bg-white dark:bg-slate-800 border rounded-lg text-sm font-bold ${
                    isBelowFloor
                      ? "border-rose-500 text-rose-600 dark:text-rose-400"
                      : "border-blue-500 text-blue-600 dark:text-blue-400"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Piso Mínimo Aceitável (R$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minimumAcceptablePrice}
                  onChange={(e) => setMinimumAcceptablePrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Discount Summary Indicator */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Desconto em Relação à Tabela:</span>
                <strong className="text-slate-900 dark:text-white text-sm">
                  {discountPercent.toFixed(1)}% OFF (Economia de R$ {(originalTablePrice - resalePrice).toLocaleString("pt-BR")})
                </strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Margem sobre o Piso Mínimo:</span>
                <strong className={isBelowFloor ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {isBelowFloor
                    ? `Abaixo do piso (-R$ ${(minimumAcceptablePrice - resalePrice).toLocaleString("pt-BR")})`
                    : `Acima do piso (+R$ ${(resalePrice - minimumAcceptablePrice).toLocaleString("pt-BR")})`}
                </strong>
              </div>
            </div>

            {/* Reason Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Motivo Estratégico da Precificação *
              </label>
              <select
                value={pricingReason}
                onChange={(e) => setPricingReason(e.target.value as any)}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              >
                <option value="Recuperação Rápida de Caixa">Recuperação Rápida de Caixa</option>
                <option value="Estímulo à Liquidez">Estímulo à Liquidez</option>
                <option value="Unidade com Desgaste/Uso">Unidade com Desgaste/Uso</option>
                <option value="Alinhamento a Mercado">Alinhamento a Mercado</option>
              </select>
            </div>

            {/* Warning when Below Floor */}
            {isBelowFloor && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>PREÇO ABAIXO DO PISO MÍNIMO — APROVAÇÃO DA DIRETORIA OBRIGATÓRIA</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  O valor de revenda proposto (R$ {resalePrice.toLocaleString("pt-BR")}) está abaixo do piso aceitável (R$ {minimumAcceptablePrice.toLocaleString("pt-BR")}). Para publicar o anúncio sob esse valor, é exigida aprovação formal.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Diretor Responsável pela Aprovação:
                  </label>
                  <input
                    type="text"
                    required
                    value={directorApproval}
                    onChange={(e) => setDirectorApproval(e.target.value)}
                    placeholder="Ex: Eduardo Vasconcelos — Diretor Comercial ARV"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Payment Conditions Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Condições de Pagamento Vinculadas ({conditions.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Condições que serão exibidas e simuladas na vitrine pública
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConditionForm(!showConditionForm)}
                  className="py-1 px-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Condição
                </button>
              </div>

              {/* Conditions List */}
              <div className="space-y-2">
                {conditions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 dark:text-white">{c.name}</strong>
                      <p className="text-slate-500 text-[11px]">
                        Entrada: {c.downPaymentPercentage}% | {c.numberOfInstallments}x ({c.indexer})
                        {c.specialDiscountPercentage > 0 && ` | +${c.specialDiscountPercentage}% desc.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteCondition(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Excluir condição"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Condition Inline Form */}
              {showConditionForm && (
                <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Título da Condição *
                      </label>
                      <input
                        type="text"
                        value={condName}
                        onChange={(e) => setCondName(e.target.value)}
                        placeholder="Ex: À Vista Especial ou Parcelamento 36x"
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Indexador de Correção *
                      </label>
                      <select
                        value={condIndexer}
                        onChange={(e) => setCondIndexer(e.target.value as ResalePaymentCondition["indexer"])}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="Sem Correção">Sem Correção (Fixo)</option>
                        <option value="IPCA">IPCA</option>
                        <option value="CUB">CUB</option>
                        <option value="IGP-M">IGP-M</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                        Entrada (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={condDownPayment}
                        onChange={(e) => setCondDownPayment(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                        Nº Parcelas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={condInstallments}
                        onChange={(e) => setCondInstallments(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                        Desc. Extra (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={condDiscount}
                        onChange={(e) => setCondDiscount(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConditionForm(false)}
                      className="px-3 py-1.5 rounded-lg border text-xs text-slate-600 dark:text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCondition}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      Adicionar Condição
                    </button>
                  </div>
                </div>
              )}
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
                <span>Salvar Precificação</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
