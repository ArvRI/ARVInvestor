import React, { useState } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  FileText,
  Users,
  Video,
  DollarSign,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Upload,
  Download,
  Building,
  Edit2,
  Save,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { SPE, ConstructionStage } from "../../types";
import { WeeklyConstructionReportViewer } from "./WeeklyConstructionReportViewer";

interface SPEManagementProps {
  onOpenNewSPE: () => void;
}

export const SPEManagement: React.FC<SPEManagementProps> = ({ onOpenNewSPE }) => {
  const {
    spes,
    contracts,
    investors,
    constructionProgresses,
    suppliers,
    documents,
    updateStageProgress,
  } = useApp();

  const [selectedSpeId, setSelectedSpeId] = useState<string>(spes[0]?.id || "spe-01");
  const [activeSpeTab, setActiveSpeTab] = useState<
    "overview" | "captable" | "progress" | "weekly_report" | "suppliers" | "docs" | "gallery"
  >("overview");

  const [editingStage, setEditingStage] = useState<ConstructionStage | null>(null);
  const [editPercentage, setEditPercentage] = useState<number>(50);

  const spe = spes.find((s) => s.id === selectedSpeId) || spes[0];
  const speContracts = contracts.filter((c) => c.speId === spe.id);
  const speSuppliers = suppliers.filter((s) => s.speId === spe.id);
  const speDocs = documents.filter((d) => d.speId === spe.id);
  const speProgress =
    constructionProgresses.find((p) => p.speId === spe.id) ||
    constructionProgresses[0];

  // Investor Cap Table calculation
  const capTableMap = new Map<string, { investorName: string; totalAmount: number; sharePercent: number }>();

  speContracts.forEach((ctr) => {
    const inv = investors.find((i) => i.id === ctr.investorId);
    const name = inv?.name || "Investidor Cota";
    const existing = capTableMap.get(ctr.investorId) || { investorName: name, totalAmount: 0, sharePercent: 0 };
    const newTotal = existing.totalAmount + ctr.investedAmount;
    const newShare = Number(((newTotal / spe.totalCaptação) * 100).toFixed(2));
    capTableMap.set(ctr.investorId, { investorName: name, totalAmount: newTotal, sharePercent: newShare });
  });

  const capTableList = Array.from(capTableMap.values());

  const handleSaveStageProgress = (stage: ConstructionStage) => {
    updateStageProgress(spe.id, stage, editPercentage);
    setEditingStage(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-700 dark:text-blue-400" /> Módulo de SPEs (Empreendimentos)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão patrimonial de Sociedades de Propósito Específico, Cap Table de Cotistas, Fornecedores e Cronograma Físico.
          </p>
        </div>

        <button
          onClick={onOpenNewSPE}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Cadastrar Nova SPE
        </button>
      </div>

      {/* SPE Selector Horizontal Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {spes.map((s) => {
          const isSelected = s.id === selectedSpeId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSpeId(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-blue-700 text-white border-blue-700 shadow-xs font-semibold"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/50"
              }`}
            >
              <Building className="w-4 h-4" />
              <div>
                <div>{s.name}</div>
                <div className={`text-[10px] font-normal ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  VGV R$ {(s.totalVgv / 1000000).toFixed(1)}M • {s.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected SPE Banner Hero Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                CNPJ: {spe.cnpj}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {spe.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-white">{spe.name}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> {spe.address}, {spe.city} • Eng. Responsável: <span className="text-slate-200">{spe.manager}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-slate-400">VGV Geral Previsto</div>
              <div className="text-base font-bold text-blue-400">R$ {(spe.totalVgv / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Capital Captado</div>
              <div className="text-base font-bold text-emerald-400">R$ {(spe.totalCaptação / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Avanço da Obra</div>
              <div className="text-base font-bold text-white">{speProgress.overallPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Sub-tabs for SPE Detail */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-800 text-xs overflow-x-auto">
          {[
            { id: "overview", label: "Ficha Técnica", icon: Building },
            { id: "captable", label: `Cap Table de Investidores (${capTableList.length})`, icon: Users },
            { id: "progress", label: `Cronograma Físico (${speProgress.overallPercentage}%)`, icon: TrendingUp },
            { id: "weekly_report", label: "📋 Relatório Semanal de Obra", icon: FileText },
            { id: "suppliers", label: `Contratos Fornecedores (${speSuppliers.length})`, icon: Briefcase },
            { id: "docs", label: `Documentação & Licenças (${speDocs.length})`, icon: FileText },
            { id: "gallery", label: "Galeria & Drone", icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSpeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSpeTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-700 text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: FICHA TÉCNICA */}
      {activeSpeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Descrição do Projeto & Conceito Arquitetônico</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {spe.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div><strong className="text-slate-900 dark:text-slate-100">Endereço Completo:</strong> <span className="text-slate-500 block">{spe.address}, {spe.city}</span></div>
              <div><strong className="text-slate-900 dark:text-slate-100">Prazo de Entrega:</strong> <span className="text-slate-500 block">{spe.deadline}</span></div>
              <div><strong className="text-slate-900 dark:text-slate-100">Percentual Comercializado:</strong> <span className="text-emerald-600 font-bold block">{spe.percentSold}% das cotas</span></div>
              <div><strong className="text-slate-900 dark:text-slate-100">Gestor de Obras:</strong> <span className="text-slate-500 block">{spe.manager}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Imagem Principal do Empreendimento</h3>
            <img src={spe.bannerImage} alt={spe.name} className="w-full h-48 rounded-2xl object-cover shadow-sm" />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CAP TABLE DE INVESTIDORES */}
      {activeSpeTab === "captable" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Cap Table - Quadro de Cotistas da {spe.name}</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Nome do Investidor / Cotista</th>
                  <th className="p-3.5">Capital Aportado na SPE</th>
                  <th className="p-3.5">% de Participação no VGV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {capTableList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{item.investorName}</td>
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">R$ {item.totalAmount.toLocaleString("pt-BR")}</td>
                    <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400">{item.sharePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CRONOGRAMA FÍSICO INTERATIVO */}
      {activeSpeTab === "progress" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Edição de Progresso Físico das Etapas da Obra</h3>
            <span className="text-xs text-slate-500">Engenheiros autorizados podem atualizar o percentual</span>
          </div>

          <div className="space-y-4">
            {speProgress.stages.map((st) => (
              <div key={st.stage} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st.stage}</div>
                  <div className="text-slate-500">Meta: {st.targetDate} • Status: <strong className="text-amber-600">{st.status}</strong></div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  {editingStage === st.stage ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editPercentage}
                        onChange={(e) => setEditPercentage(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-sm bg-white dark:bg-slate-800"
                      />
                      <span className="font-bold">%</span>
                      <button
                        onClick={() => handleSaveStageProgress(st.stage)}
                        className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-amber-500">{st.percentage}%</span>
                      <button
                        onClick={() => {
                          setEditingStage(st.stage);
                          setEditPercentage(st.percentage);
                        }}
                        className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors"
                        title="Atualizar percentual"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: RELATÓRIO SEMANAL DE OBRA */}
      {activeSpeTab === "weekly_report" && (
        <WeeklyConstructionReportViewer
          report={speProgress.weeklyReport}
          speName={spe.name}
        />
      )}

      {/* SUB-TAB 4: FORNECEDORES */}
      {activeSpeTab === "suppliers" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Contratos de Fornecedores Homologados</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Fornecedor</th>
                  <th className="p-3.5">Categoria do Serviço</th>
                  <th className="p-3.5">Valor do Contrato</th>
                  <th className="p-3.5">Prazo de Vigência</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {speSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{sup.supplierName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{sup.serviceCategory}</td>
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">R$ {sup.amount.toLocaleString("pt-BR")}</td>
                    <td className="p-3.5 text-slate-500">{sup.startDate} a {sup.endDate}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        {sup.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DOCUMENTAÇÃO & LICENÇAS */}
      {activeSpeTab === "docs" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Licenças Ambientais, Alvarás e Matrículas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {speDocs.map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.category} • {doc.fileSize}</div>
                </div>
                <button className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: GALERIA & DRONE */}
      {activeSpeTab === "gallery" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Galeria de Imagens de Alta Resolução</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {speProgress.photos.map((ph, idx) => (
              <img key={idx} src={ph} alt={`Acompanhamento SPE ${idx}`} className="w-full h-48 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
