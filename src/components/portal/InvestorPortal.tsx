import React, { useState } from "react";
import {
  Wallet,
  Building,
  TrendingUp,
  Calendar,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ARVLogo } from "../common/ARVLogo";
import { SmartNewsletterPreview } from "../communication/SmartNewsletterPreview";
import { WeeklyConstructionReportViewer } from "../spes/WeeklyConstructionReportViewer";
import { InvestorProfitabilityCard } from "../profitability/InvestorProfitabilityCard";

export const InvestorPortal: React.FC = () => {
  const {
    currentInvestor,
    contracts,
    spes,
    developments,
    constructionProgresses,
    payments,
    documents,
    assemblies,
    notifications,
    newsletters,
    updateAssemblyRsvp,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "carteira" | "unidade" | "obra" | "documentos" | "financeiro" | "comunicacao" | "assembleias"
  >("overview");

  // Investor specific filtered data
  const myContracts = contracts.filter((c) => c.investorId === currentInvestor.id);
  const mySpeIds = Array.from(new Set(myContracts.map((c) => c.speId)));
  const mySpeList = spes.filter((s) => mySpeIds.includes(s.id));
  const myTotalInvested = myContracts.reduce((acc, c) => acc + c.investedAmount, 0);
  const myPayments = payments.filter((p) => p.investorId === currentInvestor.id);
  const myDividendsPaid = myPayments
    .filter((p) => p.type === "Dividendo Trimestral" && p.status === "Pago")
    .reduce((acc, p) => acc + p.amount, 0);

  const selectedSpe = mySpeList[0] || spes[0];
  const selectedProgress =
    constructionProgresses.find((p) => p.speId === selectedSpe.id) ||
    constructionProgresses[0];

  const myAssemblies = assemblies.filter((a) => mySpeIds.includes(a.speId));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Profile Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Background ARV Watermark Logo */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ARVLogo lightMode size="xl" className="scale-150" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentInvestor.avatarUrl}
              alt={currentInvestor.name}
              className="w-16 h-16 rounded-xl border-2 border-blue-500/80 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{currentInvestor.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                  {currentInvestor.tier}
                </span>
                <ARVLogo lightMode size="sm" showTagline className="hidden sm:inline-flex opacity-90" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investidor desde {currentInvestor.createdAt} • Consultor: <span className="text-slate-200">{currentInvestor.consultant}</span>
              </p>
            </div>
          </div>

          {/* Key KPI Header Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Patrimônio Investido</div>
              <div className="text-base sm:text-lg font-bold text-blue-400">
                R$ {(myTotalInvested / 1000).toLocaleString("pt-BR")} mil
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-slate-400">SPEs Participantes</div>
              <div className="text-base sm:text-lg font-bold text-white">
                {mySpeList.length} Empreendimentos
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Dividendos Recebidos</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400">
                R$ {(myDividendsPaid / 1000).toLocaleString("pt-BR")} mil
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Sub-tabs */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-800 overflow-x-auto pb-1 text-xs">
          {[
            { id: "overview", label: "Visão Geral", icon: LayoutDashboardIcon },
            { id: "carteira", label: "Minha Carteira", icon: Wallet },
            { id: "unidade", label: "Minha Unidade", icon: Building },
            { id: "obra", label: "Andamento da Obra", icon: TrendingUp },
            { id: "documentos", label: "Documentos", icon: FileText },
            { id: "financeiro", label: "Financeiro & Extrato", icon: DollarSign },
            { id: "comunicacao", label: "Comunicação", icon: MessageSquare },
            { id: "assembleias", label: "Assembleias", icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-700 text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Investor Profitability Benchmark Card */}
          {myContracts.length > 0 && (
            <InvestorProfitabilityCard contractId={myContracts[0]?.id} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main SPE Summary Cards */}
            <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-4 flex items-center justify-between">
                <span>Obras que Você Participa ({mySpeList.length})</span>
                <span className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer" onClick={() => setActiveSubTab("obra")}>
                  Ver todas as obras →
                </span>
              </h2>

              <div className="space-y-4">
                {mySpeList.map((spe) => {
                  const prog = constructionProgresses.find((p) => p.speId === spe.id) || selectedProgress;
                  return (
                    <div
                      key={spe.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <img
                          src={spe.bannerImage}
                          alt={spe.name}
                          className="w-20 h-16 rounded-lg object-cover shadow-xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{spe.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{spe.address}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                              {spe.status}
                            </span>
                            <span className="text-xs text-slate-500">Entrega: {spe.deadline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-48 space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">Avanço Físico:</span>
                          <span className="text-blue-700 dark:text-blue-400 font-bold">{prog.overallPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${prog.overallPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Notifications & Bulletins */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Comunicados & Notificações Recentes</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex gap-3 items-start">
                    <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widget: Próximas Assembleias & Documentos Recentes */}
          <div className="space-y-6">
            {/* Próximas Assembleias Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Próximas Assembleias
              </h3>
              {myAssemblies.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Nenhuma assembleia pendente.</div>
              ) : (
                <div className="space-y-3">
                  {myAssemblies.map((ass) => {
                    const myRsvp = ass.rsvpStatus[currentInvestor.id] || "Pendente";
                    return (
                      <div key={ass.id} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{ass.title}</div>
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> {ass.date} às {ass.time}
                        </div>
                        <div className="text-slate-500 truncate">{ass.location}</div>
                        <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-400">Sua Presença:</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => updateAssemblyRsvp(ass.id, currentInvestor.id, "Confirmado")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                myRsvp === "Confirmado"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-500/20"
                              }`}
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => updateAssemblyRsvp(ass.id, currentInvestor.id, "Recusado")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                myRsvp === "Recusado"
                                  ? "bg-rose-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-rose-500/20"
                              }`}
                            >
                              Ausente
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Documentos Recentes Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Documentos & Informes
              </h3>
              <div className="space-y-2 text-xs">
                {documents.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400">{doc.category} • {doc.fileSize}</div>
                    </div>
                    <button className="text-amber-600 dark:text-amber-400 p-1.5 hover:bg-amber-500/10 rounded-lg">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* SUB-TAB 2: MINHA CARTEIRA */}
      {activeSubTab === "carteira" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Minha Carteira de Investimentos</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Contrato</th>
                  <th className="p-3.5">SPE / Empreendimento</th>
                  <th className="p-3.5">Unidade</th>
                  <th className="p-3.5">Valor Investido</th>
                  <th className="p-3.5">% SPE</th>
                  <th className="p-3.5">Data Aquisição</th>
                  <th className="p-3.5">Rentabilidade Prevista</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myContracts.map((c) => {
                  const spe = spes.find((s) => s.id === c.speId);
                  const dev = developments.find((d) => d.id === c.developmentId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{c.contractNumber}</td>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">{spe?.name}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{dev?.name || "Unidade Cota"}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        R$ {c.investedAmount.toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{c.speSharePercentage}%</td>
                      <td className="p-3.5 text-slate-500">{c.purchaseDate}</td>
                      <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        +{c.expectedRoiPercentage}% a.a.
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MINHA UNIDADE */}
      {activeSubTab === "unidade" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Minha Unidade no {selectedSpe.name}</h2>
              <p className="text-xs text-slate-500">{selectedSpe.address}</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
              Unidade 2201 - Torre Sky Suites
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={selectedSpe.bannerImage}
                alt="Planta e Foto da Unidade"
                className="w-full h-64 rounded-2xl object-cover shadow-md"
              />
              <div className="grid grid-cols-3 gap-2 mt-3">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" alt="Vista" className="w-full h-20 rounded-xl object-cover" />
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80" alt="Sala" className="w-full h-20 rounded-xl object-cover" />
                <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" alt="Suíte" className="w-full h-20 rounded-xl object-cover" />
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Memorial Descritivo & Ficha Técnica</div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Área Privativa:</span><span className="font-semibold text-slate-900 dark:text-slate-100">280,50 m²</span></div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Suítes:</span><span className="font-semibold text-slate-900 dark:text-slate-100">4 Suítes Master com closet</span></div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Vagas de Garagem:</span><span className="font-semibold text-slate-900 dark:text-slate-100">4 Vagas cobertas + Carregador Elétrico</span></div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Diferenciais:</span><span className="font-semibold text-slate-900 dark:text-slate-100">Piscina na varanda, Automação Somfy</span></div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">Documentação da Unidade</div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                  <span>Planta Baixa Humanizada (.pdf)</span>
                  <button className="text-amber-600 font-semibold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Baixar</button>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>Memorial de Acabamento (.pdf)</span>
                  <button className="text-amber-600 font-semibold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Baixar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ANDAMENTO DA OBRA (TIMELINE MODERNA) */}
      {activeSubTab === "obra" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Acompanhamento e Cronograma de Obra</h2>
              <p className="text-xs text-slate-500">{selectedSpe.name} • Atualizado em {selectedProgress.lastUpdateDate}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-amber-500">{selectedProgress.overallPercentage}%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Avanço Físico Total</div>
            </div>
          </div>

          {/* Timeline Stages */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {selectedProgress.stages.map((st) => (
              <div
                key={st.stage}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{st.stage}</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{st.percentage}%</div>
                <div className="text-[10px] text-slate-400">Meta: {st.targetDate}</div>
                <span
                  className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                    st.percentage === 100
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {st.status}
                </span>
              </div>
            ))}
          </div>

          {/* Drone Video & Photos Gallery */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" /> Galeria de Fotos e Imagens de Drone da Obra
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedProgress.photos.map((ph, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                  <img src={ph} alt={`Foto Obra ${idx}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 text-white text-xs">
                    Registro Técnico de Obra #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Construction Report (Planejamento Semanal de Obra - Meridiem) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <WeeklyConstructionReportViewer
              report={selectedProgress.weeklyReport}
              speName={selectedSpe.name}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DOCUMENTOS */}
      {activeSubTab === "documentos" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Central de Download de Documentos</h2>
          <p className="text-xs text-slate-500">Acesse contratos, aditivos, atas de assembleias e balancetes de prestação de contas.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {documents.slice(0, 10).map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.category} • {doc.uploadDate} • {doc.fileSize}</div>
                </div>
                <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1 shadow-xs">
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: FINANCEIRO */}
      {activeSubTab === "financeiro" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Extrato Financeiro e Distribuição de Dividendos</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Data Vencimento / Crédito</th>
                  <th className="p-3.5">Tipo de Lançamento</th>
                  <th className="p-3.5">Empreendimento / SPE</th>
                  <th className="p-3.5">Valor (R$)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">{p.dueDate}</td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{p.type}</td>
                    <td className="p-3.5 text-slate-500">{spes.find((s) => s.id === p.speId)?.name}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {p.amount.toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: COMUNICAÇÃO & NEWSLETTERS */}
      {activeSubTab === "comunicacao" && (
        <div className="space-y-6">
          {newsletters.filter((n) => n.status === "Publicado" || n.status === "Enviado").length > 0 ? (
            <div className="space-y-8">
              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                  📰 Newsletters Inteligentes das Suas SPEs
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Informativos exclusivos com relatórios da engenharia, fotos de drone e avanço do cronograma
                </p>
              </div>

              {newsletters
                .filter((n) => n.status === "Publicado" || n.status === "Enviado")
                .map((news) => (
                  <SmartNewsletterPreview key={news.id} newsletter={news} isInteractive={false} />
                ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Central de Mensagens e Comunicados Oficial</h2>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{n.title}</span>
                      <span className="text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 8: ASSEMBLEIAS */}
      {activeSubTab === "assembleias" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Agenda de Assembleias de Investidores</h2>
          <div className="space-y-4">
            {assemblies.map((ass) => {
              const myRsvp = ass.rsvpStatus[currentInvestor.id] || "Pendente";
              return (
                <div key={ass.id} className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ass.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{ass.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-bold">
                      {ass.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-500/10">
                    <div><strong>Data & Hora:</strong> {ass.date} às {ass.time}</div>
                    <div><strong>Local:</strong> {ass.location}</div>
                    {ass.virtualLink && (
                      <div>
                        <strong>Link Virtual:</strong>{" "}
                        <a href={ass.virtualLink} target="_blank" rel="noreferrer" className="text-amber-600 underline">
                          Acessar Sala do Meet
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-medium">Sua Confirmação de Presença:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAssemblyRsvp(ass.id, currentInvestor.id, "Confirmado")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === "Confirmado"
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-500/20"
                        }`}
                      >
                        Confirmar Presença
                      </button>
                      <button
                        onClick={() => updateAssemblyRsvp(ass.id, currentInvestor.id, "Recusado")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          myRsvp === "Recusado"
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-rose-500/20"
                        }`}
                      >
                        Não poderei ir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function LayoutDashboardIcon(props: any) {
  return <Wallet {...props} />;
}
