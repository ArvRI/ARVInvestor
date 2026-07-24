import React, { useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface NewInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId: string;
  investorName: string;
}

export const NewInteractionModal: React.FC<NewInteractionModalProps> = ({
  isOpen,
  onClose,
  investorId,
  investorName,
}) => {
  const { addInteraction, recalculateScore } = useApp();

  const [formData, setFormData] = useState({
    type: "WhatsApp" as "Email" | "WhatsApp" | "Telefone" | "Reunião" | "Visita" | "Ocorrência" | "Solicitação",
    title: "",
    notes: "",
    author: "Camila Vasconcelos",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addInteraction({
      investorId,
      type: formData.type,
      date: new Date().toISOString().split("T")[0],
      author: formData.author,
      title: formData.title,
      notes: formData.notes,
      status: "Concluído",
    });

    recalculateScore(investorId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Registrar Interação CRM</h3>
              <p className="text-xs text-slate-500">{investorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Tipo de Contato
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telefone">Ligação Telefônica</option>
                <option value="Email">E-mail</option>
                <option value="Reunião">Reunião Presencial</option>
                <option value="Visita">Visita ao Canteiro de Obra</option>
                <option value="Ocorrência">Ocorrência / Dúvida</option>
                <option value="Solicitação">Solicitação de Documento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Atendente / Consultor
              </label>
              <select
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              >
                <option value="Camila Vasconcelos">Camila Vasconcelos</option>
                <option value="Gabriel Fontes">Gabriel Fontes</option>
                <option value="Mariana Barreto">Mariana Barreto</option>
                <option value="Eng. Ricardo Alencar">Eng. Ricardo Alencar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Assunto Principal *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Confirmação de recebimento de informe de rendimentos"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Resumo do Diálogo / Detalhes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anote pontos combinados, dúvidas tiradas ou próximos passos..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" /> Registrar Interação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
