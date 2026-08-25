import React, { useState } from "react";
import { X, Table, Building2, Calendar, DollarSign, Percent, Plus, Check } from "lucide-react";
import { PriceTable, PaymentConditionTemplate } from "../../types/pricing";
import { CURRENT_DEFAULT_CUB_SC } from "../../services/pricing/CUBService";
import { SPE } from "../../types";

interface NewPriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  spes: SPE[];
  onSave: (newTable: PriceTable) => void;
  baseTableToClone?: PriceTable | null;
}

export const NewPriceTableModal: React.FC<NewPriceTableModalProps> = ({
  isOpen,
  onClose,
  spes,
  onSave,
  baseTableToClone,
}) => {
  if (!isOpen) return null;

  const [selectedSpeId, setSelectedSpeId] = useState(
    baseTableToClone?.speId || spes[0]?.id || "spe-meridiem"
  );
  const [name, setName] = useState(
    baseTableToClone
      ? `${baseTableToClone.name} (Nova Revisão)`
      : "Tabela de Vendas - Vigência 2026"
  );
  const [version, setVersion] = useState(
    baseTableToClone ? `v${(parseFloat(baseTableToClone.version.replace("v", "")) + 0.1).toFixed(1)}` : "v1.0"
  );
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [cubRate, setCubRate] = useState(baseTableToClone?.cubReferenceValue || CURRENT_DEFAULT_CUB_SC);
  const [cubReferenceDate, setCubReferenceDate] = useState(
    baseTableToClone?.cubReferenceDate || "Agosto/2026"
  );
  const [commissionPercent, setCommissionPercent] = useState(
    baseTableToClone?.defaultCommissionPercent || 5.0
  );
  const [description, setDescription] = useState(
    baseTableToClone?.description || "Tabela oficial aprovada pela diretoria comercial."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const speObj = spes.find((s) => s.id === selectedSpeId);

    const newTable: PriceTable = {
      id: `tab-${selectedSpeId}-${Date.now()}`,
      speId: selectedSpeId,
      speName: speObj ? speObj.name : "SPE ARV",
      name,
      version,
      status: "Ativa",
      validFrom,
      validUntil,
      cubReferenceValue: Number(cubRate),
      cubReferenceDate,
      standardCorrectionIndex: "CUB/SC Médio R8-N",
      totalUnitsCount: baseTableToClone ? baseTableToClone.totalUnitsCount : 36,
      availableUnitsCount: baseTableToClone ? baseTableToClone.availableUnitsCount : 24,
      reservedUnitsCount: 0,
      soldUnitsCount: baseTableToClone ? baseTableToClone.soldUnitsCount : 12,
      totalVgv: baseTableToClone ? baseTableToClone.totalVgv : 32000000,
      availableVgv: baseTableToClone ? baseTableToClone.availableVgv : 22000000,
      soldVgv: baseTableToClone ? baseTableToClone.soldVgv : 10000000,
      averagePricePerM2: baseTableToClone ? baseTableToClone.averagePricePerM2 : 12500,
      averageCubPerM2: Number(( (baseTableToClone ? baseTableToClone.averagePricePerM2 : 12500) / Number(cubRate) ).toFixed(2)),
      defaultCommissionPercent: Number(commissionPercent),
      paymentTemplates: baseTableToClone?.paymentTemplates || [],
      description,
      updatedAt: new Date().toISOString(),
      updatedBy: "Gestão Comercial ARV",
    };

    onSave(newTable);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {baseTableToClone ? "Clonar / Nova Revisão de Tabela de Vendas" : "Criar Nova Tabela de Preços de Vendas"}
              </h2>
              <p className="text-xs text-slate-500">
                Defina os parâmetros de vigência, CUB indexador e comissionamento.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Empreendimento / SPE
            </label>
            <select
              value={selectedSpeId}
              onChange={(e) => setSelectedSpeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {spes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Tabela de Vendas
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tabela de Lançamento 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Versão
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vigência Inicial (Início)
              </label>
              <input
                type="date"
                required
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vigência Final (Validade)
              </label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CUB & Indices */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
            <h4 className="text-xs font-black uppercase text-blue-900 dark:text-blue-300 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" /> Parâmetros de Indexação pelo CUB
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Valor CUB/SC Ref. (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cubRate}
                  onChange={(e) => setCubRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Mês/Ano de Referência
                </label>
                <input
                  type="text"
                  value={cubReferenceDate}
                  onChange={(e) => setCubReferenceDate(e.target.value)}
                  placeholder="Ex: Agosto/2026"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Comissão Padrão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observações e Diretrizes Comerciais
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes como condições para corretores parceiros, campanhas de premiação, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" /> Salvar Tabela de Vendas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
