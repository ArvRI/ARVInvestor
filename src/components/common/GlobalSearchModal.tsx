import React, { useState } from "react";
import { Search, X, User, Building, FileText, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface GlobalSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectInvestor?: (id: string) => void;
  onSelectSPE?: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onSelectInvestor,
  onSelectSPE,
}) => {
  const {
    investors,
    spes,
    documents,
    contracts,
    isSearchOpen,
    setIsSearchOpen,
    setCurrentInvestorId,
  } = useApp();
  const [query, setQuery] = useState("");

  const modalOpen = propsIsOpen !== undefined ? propsIsOpen : isSearchOpen;
  const handleClose = propsOnClose || (() => setIsSearchOpen(false));

  if (!modalOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredInvestors = q
    ? investors.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.cpfCnpj.includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const filteredSPEs = q
    ? spes.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.cnpj.includes(q) ||
          s.city.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredDocs = q
    ? documents.filter((d) => d.title.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const filteredContracts = q
    ? contracts.filter((c) => c.contractNumber.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const hasResults =
    filteredInvestors.length > 0 ||
    filteredSPEs.length > 0 ||
    filteredDocs.length > 0 ||
    filteredContracts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por investidor, CPF, SPE, contrato ou documento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="ml-2 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Digite ao menos 2 caracteres para pesquisar na base de dados do ARV Investor Hub.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Nenhum resultado encontrado para &quot;<span className="font-semibold text-slate-700 dark:text-slate-300">{query}</span>&quot;.
            </div>
          )}

          {/* Investors Section */}
          {filteredInvestors.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Investidores ({filteredInvestors.length})
              </div>
              <div className="space-y-1">
                {filteredInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      if (onSelectInvestor) onSelectInvestor(inv.id);
                      else setCurrentInvestorId(inv.id);
                      handleClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={inv.avatarUrl} alt={inv.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {inv.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          CPF: {inv.cpfCnpj} • {inv.city} • Score {inv.score} ({inv.tier})
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPEs Section */}
          {filteredSPEs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> SPEs & Empreendimentos ({filteredSPEs.length})
              </div>
              <div className="space-y-1">
                {filteredSPEs.map((spe) => (
                  <div
                    key={spe.id}
                    onClick={() => {
                      if (onSelectSPE) onSelectSPE(spe.id);
                      handleClose();
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {spe.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        CNPJ: {spe.cnpj} • VGV R$ {(spe.totalVgv / 1000000).toFixed(1)}M • Status: {spe.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documentos ({filteredDocs.length})
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</span>
                      <span className="text-slate-400 ml-2">({doc.category} - {doc.fileSize})</span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">Download</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
