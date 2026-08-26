import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  AlertTriangle,
  Calculator,
  Percent,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Building2,
  Sparkles,
} from "lucide-react";
import { Contract, Investor, SPE, ReturnRecord } from "../../types";

interface RegisterReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  investors: Investor[];
  spes: SPE[];
  onRegisterReturn: (data: {
    unitId: string;
    speId: string;
    originalContractId: string;
    originalInvestorId: string;
    returnType: ReturnRecord["returnType"];
    returnDate: string;
    originalContractAmount: number;
    amountRefundedToInvestor: number;
    retentionPercentage: number;
    penaltyClauseAmount?: number;
    legalStatus: ReturnRecord["legalStatus"];
    notes: string;
    documentUrl?: string;
    originalTablePrice?: number;
    autoStartResale?: boolean;
    defaultDiscountPercent?: number;
  }) => void;
}

export const RegisterReturnModal: React.FC<RegisterReturnModalProps> = ({
  isOpen,
  onClose,
  contracts,
  investors,
  spes,
  onRegisterReturn,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [returnType, setReturnType] = useState<ReturnRecord["returnType"]>("Distrato Amigável");
  const [legalStatus, setLegalStatus] = useState<ReturnRecord["legalStatus"]>("Concluído");
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [retentionPercentage, setRetentionPercentage] = useState<number>(25); // Padrão Lei 13.786/2018
  const [penaltyClauseAmount, setPenaltyClauseAmount] = useState<number>(0);
  const [originalTablePrice, setOriginalTablePrice] = useState<number>(0);
  const [autoStartResale, setAutoStartResale] = useState<boolean>(true);
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState<number>(10);
  const [notes, setNotes] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");

  const activeContracts = contracts.filter((c) => c.status !== "Distratado");

  // Preenche dados ao escolher o contrato
  const selectedContract = contracts.find((c) => c.id === selectedContractId);
  const selectedInvestor = investors.find((i) => i.id === selectedContract?.investorId);
  const selectedSpe = spes.find((s) => s.id === selectedContract?.speId);

  useEffect(() => {
    if (selectedContract) {
      const baseValue = selectedContract.investedAmount || 0;
      setOriginalTablePrice(Math.round(baseValue * 1.15));
    }
  }, [selectedContractId]);

  if (!isOpen) return null;

  const contractAmount = selectedContract?.investedAmount || 0;
  const retentionAmount = (contractAmount * retentionPercentage) / 100;
  const calculatedRefund = Math.max(0, contractAmount - retentionAmount - penaltyClauseAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    onRegisterReturn({
      unitId: selectedContract.unitId,
      speId: selectedContract.speId,
      originalContractId: selectedContract.id,
      originalInvestorId: selectedContract.investorId,
      returnType,
      returnDate,
      originalContractAmount: contractAmount,
      amountRefundedToInvestor: calculatedRefund,
      retentionPercentage,
      penaltyClauseAmount,
      legalStatus,
      notes: notes || `Distrato registrado para a unidade ${selectedContract.unitId} (${returnType}).`,
      documentUrl: documentUrl || "#",
      originalTablePrice,
      autoStartResale,
      defaultDiscountPercent,
    });

    onClose();
  };

  return (
    <div
      id="modal-register-return"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Formalizar Distrato / Devolução de Unidade
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conforme Lei do Distrato Imobiliário nº 13.786/2018 e governança ARV
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selecionar Contrato Ativo */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Selecione o Contrato / Unidade para Devolução *
            </label>
            <select
              required
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Selecione um contrato ativo...</option>
              {activeContracts.map((c) => {
                const inv = investors.find((i) => i.id === c.investorId);
                const spe = spes.find((s) => s.id === c.speId);
                return (
                  <option key={c.id} value={c.id}>
                    {c.contractNumber} — {inv?.name || "Investidor"} (Unidade {c.unitId} • {spe?.name || "SPE"} — R$ {c.investedAmount.toLocaleString("pt-BR")})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedContract && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Investidor Titular:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedInvestor?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Empreendimento / SPE:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedSpe?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Valor Original Contratado:</span>
                  <strong className="text-slate-900 dark:text-white">
                    R$ {contractAmount.toLocaleString("pt-BR")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Modalidade e Status Jurídico */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Modalidade de Devolução *
              </label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value as any)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              >
                <option value="Distrato Amigável">Distrato Amigável</option>
                <option value="Distrato Judicial">Distrato Judicial</option>
                <option value="Rescisão por Inadimplência">Rescisão por Inadimplência</option>
                <option value="Devolução em Leilão/Retomada">Devolução em Leilão/Retomada</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Status Jurídico *
              </label>
              <select
                value={legalStatus}
                onChange={(e) => setLegalStatus(e.target.value as any)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              >
                <option value="Concluído">Concluído</option>
                <option value="Em Negociação">Em Negociação</option>
                <option value="Em Processo Judicial">Em Processo Judicial</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Data do Distrato *
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Cálculo Financeiro do Distrato */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-300">
              <Calculator className="w-4 h-4" />
              <span>Simulador Financeiro de Restituição ao Investidor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  % de Retenção Construtora (Lei 13.786: até 25% / 50% c/ afetação):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={retentionPercentage}
                    onChange={(e) => setRetentionPercentage(Number(e.target.value))}
                    className="w-24 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    = R$ {retentionAmount.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Multa Contratual / Deduções Adicionais (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  value={penaltyClauseAmount}
                  onChange={(e) => setPenaltyClauseAmount(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Valor Líquido a Devolver ao Investidor:</span>
              <strong className="text-sm font-bold text-rose-700 dark:text-rose-400">
                R$ {calculatedRefund.toLocaleString("pt-BR")}
              </strong>
            </div>
          </div>

          {/* Automação de Entrada na Esteira de Revenda */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Cadastrar Automaticamente na Esteira de Revenda
                </span>
              </div>
              <input
                type="checkbox"
                id="check-auto-resale"
                checked={autoStartResale}
                onChange={(e) => setAutoStartResale(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            {autoStartResale && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                    Preço Tabela Atualizado da Unidade (R$):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={originalTablePrice}
                    onChange={(e) => setOriginalTablePrice(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                    Desconto Inicial de Revenda vs Tabela (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={defaultDiscountPercent}
                    onChange={(e) => setDefaultDiscountPercent(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-bold text-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações e URL do Termo */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Observações / Histórico da Negociação
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Distrato formalizado em comum acordo devido a reestruturação patrimonial do investidor..."
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>
          </div>

          {/* Submit */}
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
              disabled={!selectedContractId}
              className="py-2 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Formalizar Devolução</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
