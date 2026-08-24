import React, { useState } from "react";
import {
  FileText,
  User,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  Building,
  Upload,
  Calendar,
  Globe,
  Heart,
  Mail,
} from "lucide-react";
import { MarketingLead } from "../../types";
import { useApp } from "../../context/AppContext";
import { ARVLogo } from "../common/ARVLogo";

interface CustomerDocSummaryCardProps {
  lead?: MarketingLead | null;
  onNavigateToContract?: () => void;
  onCloseModal?: () => void;
}

export const CustomerDocSummaryCard: React.FC<CustomerDocSummaryCardProps> = ({
  lead,
  onNavigateToContract,
  onCloseModal,
}) => {
  const { leads, spes } = useApp();
  const activeLead = lead || leads[0];

  const [cardMode, setCardMode] = useState<"broker_guide" | "contract_summary">("broker_guide");
  const [copiedBrokerMsg, setCopiedBrokerMsg] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!activeLead) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Nenhum lead/cliente selecionado para exibir o resumo de documentação.
      </div>
    );
  }

  // Fallbacks and computation
  const clientName = activeLead.name || "Não informado";
  const cpfCnpj = activeLead.cpfCnpj || "Não informado";
  const rg = activeLead.rg || "Não informado";
  const birthDate = activeLead.birthDate || "Não informada";
  const civilStatus = activeLead.civilStatus || "Não informado";
  const profession = activeLead.profession || "Não informada";
  const nationality = activeLead.nationality || "Brasileiro(a)";

  const phone = activeLead.phone || activeLead.whatsapp || "Não informado";
  const whatsapp = activeLead.whatsapp || activeLead.phone || "Não informado";
  const email = activeLead.email || "Não informado";

  const address = activeLead.address || "Não informado";
  const zipCode = activeLead.zipCode || "Não informado";
  const city = activeLead.city || "Fortaleza";
  const state = activeLead.state || "CE";

  const bank = activeLead.bankInfo?.bank || "Banco Itaú (341)";
  const agency = activeLead.bankInfo?.agency || "0412";
  const account = activeLead.bankInfo?.account || "88120-4";
  const pix = activeLead.bankInfo?.pix || cpfCnpj;
  const income = activeLead.bankInfo?.income || 50000;

  const docs = activeLead.uploadedDocs || {
    rg: "rg_frente_verso.pdf",
    cpf: "cpf_documento.pdf",
    residence: "comprovante_residencia.pdf",
    marriageCert: "certidao_estado_civil.pdf",
  };

  const speName = activeLead.speOfInterest || spes[0]?.name || "SPE ARV Horizon Residence";
  const dealValue = activeLead.dealValue || 1200000;
  const brokerName = activeLead.assignedBroker || "Camila Vasconcelos";

  const isCpfValid = cpfCnpj !== "Não informado" && cpfCnpj.length >= 11;
  const isEmailValid = email.includes("@");

  // The 8 requested client document & data items
  const clientFieldsList = [
    {
      num: "1",
      label: "Nome completo",
      val: clientName,
      file: null,
      icon: User,
      isValid: clientName !== "Não informado",
      desc: "Nome completo impresso conforme documento oficial com foto",
    },
    {
      num: "2",
      label: "RG e CPF",
      val: `RG: ${rg} | CPF: ${cpfCnpj}`,
      file: docs.rg || docs.cpf,
      icon: ShieldCheck,
      isValid: isCpfValid && rg !== "Não informado",
      desc: "Número do RG com órgão emissor e CPF (ou CNH atualizada)",
    },
    {
      num: "3",
      label: "Data de nascimento",
      val: birthDate,
      file: null,
      icon: Calendar,
      isValid: birthDate !== "Não informada",
      desc: "Data de nascimento completa do titular comprador",
    },
    {
      num: "4",
      label: "Nacionalidade",
      val: nationality,
      file: null,
      icon: Globe,
      isValid: !!nationality,
      desc: "País de origem / nacionalidade (ex: Brasileira)",
    },
    {
      num: "5",
      label: "Estado civil",
      val: civilStatus,
      file: docs.marriageCert,
      icon: Heart,
      isValid: civilStatus !== "Não informado",
      desc: "Estado civil e certidão correspondente (Solteiro/Casado/Divorciado)",
    },
    {
      num: "6",
      label: "Endereço completo",
      val: `${address}, ${city} - ${state} (CEP: ${zipCode})`,
      file: docs.residence,
      icon: MapPin,
      isValid: address !== "Não informado",
      desc: "Logradouro, número, complemento, bairro, cidade/UF e CEP",
    },
    {
      num: "7",
      label: "E-mail",
      val: email,
      file: null,
      icon: Mail,
      isValid: isEmailValid,
      desc: "E-mail oficial para recebimento da minuta e assinatura digital",
    },
    {
      num: "8",
      label: "Telefone",
      val: phone,
      file: null,
      icon: Phone,
      isValid: phone !== "Não informado",
      desc: "Telefone com DDD / WhatsApp direto para notificações",
    },
  ];

  const validFieldsCount = clientFieldsList.filter((item) => item.isValid).length;
  const isContractReady = validFieldsCount >= 6 && isCpfValid && isEmailValid;

  // Formatted Message tailored for the Broker who made the sale
  const formattedBrokerGuideMessage = `
==================================================
📋 CHECKLIST DE DOCUMENTOS DO CLIENTE (GUIA DO CORRETOR)
CONSTRUTORA ARV INC. • DEPARTAMENTO COMERCIAL
==================================================

Prezado(a) Corretor(a): ${brokerName}
Parabéns pela negociação! 👏🚀

📍 DADOS DA OPERAÇÃO:
• Cliente Comprador: ${clientName}
• Empreendimento / SPE: ${speName}
• Valor da Operação: R$ ${Number(dealValue).toLocaleString("pt-BR")}

📌 LISTA DE DOCUMENTOS E DADOS DO CLIENTE PARA A MINUTA:
1. 👤 Nome completo: ${clientName}
2. 🪪 RG e CPF: RG ${rg} | CPF ${cpfCnpj}
3. 🎂 Data de nascimento: ${birthDate}
4. 🌐 Nacionalidade: ${nationality}
5. 💍 Estado civil: ${civilStatus}
6. 🏠 Endereço completo: ${address}, ${city} - ${state} (CEP: ${zipCode})
7. ✉️ E-mail: ${email}
8. 📞 Telefone: ${phone}

--------------------------------------------------
STATUS DOS ANEXOS NO SISTEMA ARV:
- RG/CPF: ${docs.rg || docs.cpf ? "✅ Recebido (" + (docs.rg || docs.cpf) + ")" : "⚠️ PENDENTE - SOLICITAR"}
- Comprovante de Residência: ${docs.residence ? "✅ Recebido (" + docs.residence + ")" : "⚠️ PENDENTE - SOLICITAR"}
- Certidão de Estado Civil: ${docs.marriageCert ? "✅ Recebido (" + docs.marriageCert + ")" : "⚠️ PENDENTE - SOLICITAR"}

Qualquer dúvida, fale com o Backoffice Comercial ARV!
==================================================
`.trim();

  const handleCopyBrokerMsg = () => {
    navigator.clipboard.writeText(formattedBrokerGuideMessage);
    setCopiedBrokerMsg(true);
    setTimeout(() => setCopiedBrokerMsg(false), 2500);
  };

  const handleSendBrokerWhatsApp = () => {
    const text = encodeURIComponent(formattedBrokerGuideMessage);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Formatted Text Summary for one-click copy
  const formattedTextForContract = `
==================================================
RESUMO UNIFICADO DE DOCUMENTAÇÃO DO CLIENTE
LISTA OFICIAL DE CADASTRO - CONSTRUTORA ARV INC.
==================================================

1. Nome completo: ${clientName}
2. RG e CPF: RG ${rg} | CPF ${cpfCnpj}
3. Data de nascimento: ${birthDate}
4. Nacionalidade: ${nationality}
5. Estado civil: ${civilStatus}
6. Endereço completo: ${address}, ${city} - ${state} (CEP: ${zipCode})
7. E-mail: ${email}
8. Telefone: ${phone}

--------------------------------------------------
DADOS COMPLEMENTARES DA OPERAÇÃO:
- Profissão: ${profession}
- Dados Bancários: ${bank} • Ag: ${agency} • C/C: ${account} (PIX: ${pix})
- Renda Declarada: R$ ${Number(income).toLocaleString("pt-BR")}
- SPE de Destino: ${speName}
- Valor do Negócio: R$ ${Number(dealValue).toLocaleString("pt-BR")}
- Corretor Responsável: ${brokerName}

CHECKLIST DE DOCUMENTOS ANEXADOS:
- RG/CPF: ${docs.rg || docs.cpf ? "ANEXADO (" + (docs.rg || docs.cpf) + ")" : "PENDENTE"}
- Comprovante de Residência: ${docs.residence ? "ANEXADO (" + docs.residence + ")" : "PENDENTE"}
- Certidão Estado Civil: ${docs.marriageCert ? "ANEXADO (" + docs.marriageCert + ")" : "PENDENTE"}

STATUS DA ANÁLISE ARV: ${isContractReady ? "APROVADO PARA EMISSÃO DE MINUTA" : "PENDENTE DE COMPLEMENTAÇÃO"}
==================================================
`.trim();

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedTextForContract);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleSendWhatsAppRequest = () => {
    const missingDocs = clientFieldsList
      .filter((d) => !d.isValid)
      .map((d) => d.label)
      .join(", ");

    const text = encodeURIComponent(
      `Olá ${clientName}, tudo bem? Aqui é ${brokerName} da Construtora ARV. Para darmos andamento à minuta do seu contrato para a ${speName}, precisamos confirmar alguns dados/documentos: ${
        missingDocs || "seus documentos de cadastro"
      }. Podemos lhe auxiliar por aqui!`
    );

    const cleanPhone = whatsapp.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 shrink-0 hidden sm:block">
            <ARVLogo lightMode size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Card Resumo de Documentos do Cliente (ARV Inc.)
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              {clientName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              CPF: <span className="font-mono text-slate-200 font-bold">{cpfCnpj}</span> • SPE:{" "}
              <span className="text-blue-300 font-semibold">{speName}</span>
            </p>
          </div>
        </div>

        {/* Readiness Status Badge */}
        <div className="flex items-center gap-3">
          {isContractReady ? (
            <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DADOS COMPLETOS ({validFieldsCount}/8)
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> PENDENTE ({validFieldsCount}/8 PREENCHIDOS)
            </div>
          )}

          {onCloseModal && (
            <button
              onClick={onCloseModal}
              className="text-slate-400 hover:text-white p-1 text-lg font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-6 space-y-6 text-xs">
        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCardMode("broker_guide")}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                cardMode === "broker_guide"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Send className="w-3.5 h-3.5" /> 📲 Guia do Corretor (Lista de Solicitação)
            </button>
            <button
              onClick={() => setCardMode("contract_summary")}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                cardMode === "contract_summary"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 📋 Ficha Completa dos 8 Itens
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" /> Corretor Vendedor: <span className="text-slate-900 dark:text-slate-100 font-bold">{brokerName}</span>
          </div>
        </div>

        {/* MODE 1: VISUAL BROKER GUIDE CARD */}
        {cardMode === "broker_guide" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Visual Header Banner for Broker */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800/50 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3 h-3 text-blue-300" /> Lista de Documentos & Dados Obrigatórios do Cliente
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    Resumo dos 8 Itens do Cliente
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Envie a lista ao corretor responsável <span className="font-bold text-blue-300">{brokerName}</span> para conferência ou solicitação dos dados do cliente.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSendBrokerWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" /> Enviar ao Corretor (WhatsApp)
                  </button>

                  <button
                    onClick={handleCopyBrokerMsg}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedBrokerMsg ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Texto Formatado
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrintCard}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" /> Imprimir
                  </button>
                </div>
              </div>

              {/* Deal Summary Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cliente Comprador</span>
                    <span className="font-bold text-white truncate block">{clientName}</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Empreendimento / SPE</span>
                    <span className="font-bold text-blue-200 truncate block">{speName}</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Valor da Operação (VGV)</span>
                    <span className="font-bold text-emerald-400 block">R$ {Number(dealValue).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official 8 Items Grid */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Lista Oficial de Documentos e Dados do Cliente (8 Itens)
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {validFieldsCount} de 8 itens verificados
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {clientFieldsList.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.num}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        item.isValid
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                          : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 dark:text-slate-100">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {item.num}
                            </span>
                            {item.label}
                          </span>

                          {item.isValid ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] flex items-center gap-0.5 border border-emerald-300 shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-bold text-[9px] flex items-center gap-0.5 border border-amber-300 shrink-0">
                              <AlertTriangle className="w-3 h-3" /> SOLICITAR
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 break-words flex items-start gap-1.5 mt-1">
                          <IconComp className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{item.val}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Text Box formatted for Broker message */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Mensagem Formatada dos 8 Itens Pronta para Enviar
                </span>
                <button
                  onClick={handleCopyBrokerMsg}
                  className="text-xs text-blue-300 hover:text-white underline font-sans font-bold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedBrokerMsg ? "Copiado!" : "Copiar Texto"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto text-slate-300 scrollbar-thin">
                {formattedBrokerGuideMessage}
              </pre>
            </div>
          </div>
        )}

        {/* MODE 2: CONTRACT SUMMARY VIEW */}
        {cardMode === "contract_summary" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Ficha dos 8 Documentos e Dados do Cliente (Minuta ARV)
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyText}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                    copiedText
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Texto Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Resumo dos 8 Itens
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendWhatsAppRequest}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Solicitar Dados (WhatsApp)
                </button>

                <button
                  onClick={handlePrintCard}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
                </button>
              </div>
            </div>

            {/* List Table View for the 8 requested items */}
            <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <h4 className="font-bold text-blue-700 dark:text-blue-400 uppercase text-xs tracking-wider flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Ficha Resumo do Cliente — 8 Itens Solicitados
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  STATUS DA FICHA: {isContractReady ? "COMPLETA" : "PENDENTE DADOS"}
                </span>
              </h4>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {clientFieldsList.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div key={item.num} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2 sm:w-1/3">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {item.num}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
                            <IconComp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                        </div>
                      </div>

                      <div className="sm:w-1/2 font-semibold text-slate-800 dark:text-slate-200 text-xs break-words">
                        {item.val}
                      </div>

                      <div className="sm:w-1/6 flex justify-end">
                        {item.isValid ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" /> PENDENTE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional details & Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Dados Bancários e Negócio
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SPE / Empreendimento</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{speName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valor do Negócio (VGV)</span>
                      <span className="font-bold text-emerald-600">R$ {Number(dealValue).toLocaleString("pt-BR")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Profissão</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{profession}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Dados Bancários (Dividendos)</span>
                    <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 block">
                      {bank} • Ag: {agency} • C/C: {account}
                    </span>
                    <span className="text-[10px] text-slate-500">Chave PIX: {pix}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Arquivos Anexados
                  </span>
                  {onNavigateToContract && (
                    <button
                      onClick={onNavigateToContract}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Ir para Minutas →
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">RG / CPF Anexado:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{docs.rg || docs.cpf || "Pendente"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Comprovante de Residência:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{docs.residence || "Pendente"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Certidão Estado Civil:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{docs.marriageCert || "Pendente"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formatted Text Box Preview */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                  Prévia do Texto dos 8 Itens (Pronto para Copiar/Colar)
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-blue-300 hover:text-white underline font-sans font-bold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copiar Tudo
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto text-slate-300 scrollbar-thin">
                {formattedTextForContract}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

