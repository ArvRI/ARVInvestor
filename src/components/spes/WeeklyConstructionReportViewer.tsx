import React, { useState } from "react";
import {
  FileText,
  Printer,
  Copy,
  Check,
  Building2,
  MapPin,
  UserCheck,
  Calendar,
  Users,
  HardHat,
  Plus,
  Save,
  Sparkles,
  Download,
  Share2,
} from "lucide-react";
import { WeeklyConstructionReport, WeeklyWorkItem, LaborTeamItem } from "../../types";
import { useApp } from "../../context/AppContext";

interface WeeklyConstructionReportViewerProps {
  report?: WeeklyConstructionReport;
  speName?: string;
  onUpdateReport?: (updated: WeeklyConstructionReport) => void;
}

export const WeeklyConstructionReportViewer: React.FC<WeeklyConstructionReportViewerProps> = ({
  report: initialReport,
  speName,
  onUpdateReport,
}) => {
  const { constructionProgresses, spes } = useApp();

  // Find Meridiem or fallback report
  const meridiemProgress = constructionProgresses.find(
    (p) => p.weeklyReport && (p.weeklyReport.obraName.toLowerCase().includes("meridiem") || p.speId === "spe-meridiem")
  );

  const defaultReport: WeeklyConstructionReport = meridiemProgress?.weeklyReport || {
    id: "rep-meridiem-01",
    speId: "spe-meridiem",
    obraName: "MERIDIEM",
    location: "Rua João Motta Espezim, 1093 – Saco dos Limões, Florianópolis – SC, 88045-401",
    engineer: "Eng. Sérgio d'Aquino",
    referenceWeek: "27/07/2026 A 31/07/2026",
    plannedServices: [
      {
        category: "ELÉTRICA",
        service: "Chumbamento das Caixinhas de Parede Primeiro Pavimento",
        currentPercentage: 55.0,
        dailyChecklist: { segunda: 3.0, terca: 3.0, quarta: 3.0 },
        forecastPercentage: 64.0,
      },
      {
        category: "ELÉTRICA",
        service: "Chumbamento das Caixinhas de Parede Tipo 03",
        currentPercentage: 82.0,
        dailyChecklist: { quinta: 2.0, sexta: 2.0 },
        forecastPercentage: 86.0,
      },
      {
        category: "ELÉTRICA",
        service: "Cortes de Elétrica Paredes do Tipo 04",
        currentPercentage: 69.0,
        dailyChecklist: { quarta: 1.0, quinta: 1.0, sexta: 1.0 },
        forecastPercentage: 72.0,
      },
      {
        category: "ALVENARIA",
        service: "Limpeza dos Pavimentos Tipo",
        currentPercentage: 85.0,
        dailyChecklist: { segunda: 1.0, terca: 1.0, quarta: 1.0, quinta: 1.0, sexta: 1.0 },
        forecastPercentage: 90.0,
      },
      {
        category: "ALVENARIA",
        service: "Elevação das Churrasqueiras",
        currentPercentage: 0.0,
        dailyChecklist: { segunda: 1.0, terca: 1.0, quarta: 1.0, quinta: 1.0, sexta: 1.0 },
        forecastPercentage: 5.0,
      },
      {
        category: "REBOCO",
        service: "Reboco de Fachada - Esquerda",
        currentPercentage: 29.0,
        dailyChecklist: { segunda: 2.0, terca: 2.0, quarta: 2.0, quinta: 2.0, sexta: 2.0 },
        forecastPercentage: 39.0,
      },
      {
        category: "REBOCO",
        service: "Reboco Interno - Requados Tipo 04",
        currentPercentage: 45.0,
        dailyChecklist: { segunda: 1.0, terca: 1.0, quarta: 1.0, quinta: 1.0, sexta: 1.0 },
        forecastPercentage: 50.0,
      },
      {
        category: "REBOCO",
        service: "Instalação da Tela Fachadeira - Fundos",
        currentPercentage: 40.0,
        dailyChecklist: { segunda: 20.0, terca: 20.0, quarta: 20.0 },
        forecastPercentage: 100.0,
      },
      {
        category: "CONTRAMARCOS",
        service: "Instalação dos Contramarcos - Fachada Esquerda",
        currentPercentage: 59.0,
        dailyChecklist: { segunda: 3.0, terca: 3.0, quarta: 3.0, quinta: 3.0, sexta: 3.0 },
        forecastPercentage: 74.0,
      },
    ],
    laborTeam: [
      { functionName: "Mestre de obras", quantity: 1, company: "D.N.A" },
      { functionName: "Meio oficial carpintaria", quantity: 1, company: "D.N.A" },
      { functionName: "Pedreiro", quantity: 4, company: "D.N.A" },
      { functionName: "Meio oficial pedreiro", quantity: 2, company: "D.N.A" },
      { functionName: "Ajudante", quantity: 7, company: "D.N.A" },
      { functionName: "Armador", quantity: 1, company: "D.N.A" },
      { functionName: "Eletricista", quantity: 1, company: "D.N.A" },
      { functionName: "Encanador", quantity: 0, company: "ARAÚJO" },
      { functionName: "Téc. De Refrigeração", quantity: 0, company: "B.P.O" },
      { functionName: "Guincheiro", quantity: 1, company: "D.N.A" },
      { functionName: "Betoneiro", quantity: 1, company: "D.N.A" },
    ],
    totalWorkers: 19,
  };

  const [reportData, setReportData] = useState<WeeklyConstructionReport>(initialReport || defaultReport);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Group services by category
  const categories = Array.from(new Set(reportData.plannedServices.map((s) => s.category)));

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const lines = [
      `🏗️ *PLANEJAMENTO SEMANAL DE OBRA - ${reportData.obraName.toUpperCase()}*`,
      `📍 *Localização:* ${reportData.location}`,
      `👷‍♂️ *Engenheiro Responsável:* ${reportData.engineer}`,
      `📅 *Semana de Referência:* ${reportData.referenceWeek}`,
      ``,
      `📊 *RESUMO DOS SERVIÇOS & AVANÇO PREVISTO:*`,
    ];

    reportData.plannedServices.forEach((s) => {
      lines.push(`• *${s.service}*: ${s.currentPercentage.toFixed(1)}% ➔ ${s.forecastPercentage.toFixed(1)}% (${s.category})`);
    });

    lines.push(``);
    lines.push(`👷‍♀️ *MÃO DE OBRA NO CANTEIRO:* Total de ${reportData.totalWorkers} colaboradores alocados.`);
    lines.push(`_Relatório gerado pelo Portal de Engenharia Construtora ARV_`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const calculateTotalWorkers = (team: LaborTeamItem[]) => {
    return team.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in print) */}
      <div className="print:hidden bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <HardHat className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Planejamento Semanal de Obra (Modelo Oficial ARV - {reportData.obraName})
            </h3>
            <p className="text-xs text-slate-400">
              Engenharia & Tecnologia • Semana {reportData.referenceWeek}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? "Copiado!" : "Copiar para WhatsApp"}
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white text-slate-900 border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-lg max-w-6xl mx-auto space-y-6 text-xs font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Header Block with Logos & Metadata (Matches PDF Layout) */}
        <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
          {/* Top Header Row */}
          <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-slate-800 bg-white">
            {/* Left: Obra Name & Location */}
            <div className="col-span-12 md:col-span-4 p-3.5 space-y-1 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">OBRA:</span>
                <span className="font-extrabold text-blue-900 text-sm tracking-wide">{reportData.obraName}</span>
              </div>
              <div className="text-[10px] text-slate-700 leading-tight">
                <strong className="text-slate-900">LOCALIZAÇÃO:</strong> {reportData.location}
              </div>
              <div className="text-[10px] text-slate-600 pt-1">
                Desenvolvido por: <strong className="text-slate-900">{reportData.engineer}</strong>
              </div>
            </div>

            {/* Middle: ARV Logo */}
            <div className="col-span-12 md:col-span-4 p-3 flex items-center justify-center bg-white border-y md:border-y-0 md:border-x-2 border-slate-800">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-blue-800 tracking-tighter">ARV</span>
                  <div className="text-[9px] font-bold uppercase text-slate-600 text-left leading-none border-l-2 border-blue-800 pl-1">
                    Incorporação<br />& Tecnologia
                  </div>
                </div>
              </div>
            </div>

            {/* Right: MERIDIEM Emblem / Secondary Logo */}
            <div className="col-span-12 md:col-span-4 p-3 flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-0.5">
                <div className="inline-block border border-amber-500/40 bg-amber-50 rounded-full px-3 py-0.5 text-amber-900 font-extrabold text-xs tracking-widest uppercase">
                  {reportData.obraName}
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                  SACO DOS LIMÕES | FLORIPA
                </div>
              </div>
            </div>
          </div>

          {/* Title Row */}
          <div className="bg-blue-900 text-white text-center py-2 border-t-2 border-slate-800 font-extrabold text-sm uppercase tracking-wider">
            PLANEJAMENTO SEMANAL DE OBRA
          </div>

          {/* Reference Week Banner */}
          <div className="bg-slate-200 text-slate-900 text-center py-1.5 border-t-2 border-slate-800 font-bold text-xs uppercase tracking-wide">
            SEMANA DE REFERÊNCIA: <span className="text-blue-900 font-black">{reportData.referenceWeek}</span>
          </div>
        </div>

        {/* SECTION 1: SERVIÇOS PREVISTOS & CHECK LIST */}
        <div className="space-y-2">
          <div className="overflow-x-auto border-2 border-slate-800 rounded-xl">
            <table className="w-full text-center text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-800 font-bold uppercase text-[10px]">
                  <th className="p-2 text-left border-r border-slate-800 w-[30%]">SERVIÇOS PREVISTOS</th>
                  <th className="p-2 border-r border-slate-800 w-[12%]">% EVOLUÇÃO ATUAL</th>
                  <th className="p-2 border-r border-slate-800" colSpan={6}>
                    CHECK LIST (INCREMENTO DIÁRIO %)
                  </th>
                  <th className="p-2 border-r border-slate-800 w-[12%]">% EVOLUÇÃO PREVISTA</th>
                  <th className="p-2 text-left w-[16%]">OBSERVAÇÕES</th>
                </tr>
                <tr className="bg-slate-200 text-slate-800 border-b-2 border-slate-800 text-[9px] font-bold">
                  <th className="p-1 border-r border-slate-800 text-left"></th>
                  <th className="p-1 border-r border-slate-800"></th>
                  <th className="p-1 border-r border-slate-800 w-12">SEGUNDA</th>
                  <th className="p-1 border-r border-slate-800 w-12">TERÇA</th>
                  <th className="p-1 border-r border-slate-800 w-12">QUARTA</th>
                  <th className="p-1 border-r border-slate-800 w-12">QUINTA</th>
                  <th className="p-1 border-r border-slate-800 w-12">SEXTA</th>
                  <th className="p-1 border-r border-slate-800 w-12">SÁBADO</th>
                  <th className="p-1 border-r border-slate-800"></th>
                  <th className="p-1 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {categories.map((cat) => {
                  const items = reportData.plannedServices.filter((s) => s.category === cat);
                  return (
                    <React.Fragment key={cat}>
                      {/* Category Header Row */}
                      <tr className="bg-sky-700 text-white font-black text-[11px] text-left">
                        <td colSpan={10} className="p-2 uppercase tracking-wide border-b border-slate-800">
                          {cat}
                        </td>
                      </tr>

                      {/* Item Rows */}
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 text-slate-900 border-b border-slate-300">
                          <td className="p-2 text-left font-medium border-r border-slate-400">
                            {item.service}
                          </td>
                          <td className="p-2 font-bold border-r border-slate-400 bg-slate-50">
                            {item.currentPercentage.toFixed(2)}%
                          </td>

                          {/* Daily Checklist Cells */}
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.segunda ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.segunda ? `${item.dailyChecklist.segunda.toFixed(2)}%` : ""}
                          </td>
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.terca ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.terca ? `${item.dailyChecklist.terca.toFixed(2)}%` : ""}
                          </td>
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.quarta ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.quarta ? `${item.dailyChecklist.quarta.toFixed(2)}%` : ""}
                          </td>
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.quinta ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.quinta ? `${item.dailyChecklist.quinta.toFixed(2)}%` : ""}
                          </td>
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.sexta ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.sexta ? `${item.dailyChecklist.sexta.toFixed(2)}%` : ""}
                          </td>
                          <td className={`p-2 border-r border-slate-400 font-bold ${item.dailyChecklist.sabado ? "bg-emerald-500 text-white font-extrabold" : ""}`}>
                            {item.dailyChecklist.sabado ? `${item.dailyChecklist.sabado.toFixed(2)}%` : ""}
                          </td>

                          <td className="p-2 font-bold border-r border-slate-400 bg-slate-100">
                            {item.forecastPercentage.toFixed(2)}%
                          </td>
                          <td className="p-2 text-left text-[10px] text-slate-600">
                            {item.observations || "-"}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: MÃO DE OBRA - EQUIPE */}
        <div className="space-y-2">
          <div className="bg-lime-600 text-white font-extrabold p-2 border-2 border-slate-800 rounded-t-xl text-center uppercase tracking-wider text-xs">
            MÃO DE OBRA - EQUIPE DO CANTEIRO DE OBRA
          </div>

          <div className="border-2 border-t-0 border-slate-800 rounded-b-xl overflow-hidden">
            <table className="w-full text-center text-[11px] border-collapse">
              <thead>
                <tr className="bg-lime-500 text-slate-950 font-extrabold border-b border-slate-800 text-[10px] uppercase">
                  <th className="p-2 text-left border-r border-slate-800 w-[40%]">FUNÇÃO</th>
                  <th className="p-2 border-r border-slate-800 w-[20%]">QUANTIDADE</th>
                  <th className="p-2 border-r border-slate-800 w-[20%]">EMPRESA</th>
                  <th className="p-2 text-left w-[20%]">OBSERVAÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {reportData.laborTeam.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 text-slate-900">
                    <td className="p-2 text-left font-semibold border-r border-slate-400">{row.functionName}</td>
                    <td className="p-2 font-bold border-r border-slate-400">{row.quantity}</td>
                    <td className="p-2 font-semibold border-r border-slate-400 text-slate-700">{row.company}</td>
                    <td className="p-2 text-left text-[10px] text-slate-500">{row.observation || ""}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sky-300 text-slate-950 font-black text-xs border-t-2 border-slate-800">
                  <td className="p-2.5 text-left uppercase">TOTAL DE FUNCIONÁRIOS EM CAMPO:</td>
                  <td className="p-2.5 text-center text-sm font-black">{calculateTotalWorkers(reportData.laborTeam)}</td>
                  <td colSpan={2} className="p-2.5 text-left text-[10px] font-normal italic">Equipe alocada para o período de {reportData.referenceWeek}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Approval & Signature Box */}
        <div className="pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div>
            <span>Documento oficial de acompanhamento semanal de canteiro • </span>
            <strong>Engenharia ARV Incorporação & Tecnologia</strong>
          </div>
          <div className="text-right">
            <span>Aprovado por: </span>
            <strong className="text-slate-800">{reportData.engineer}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
