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
  const matchedSpe = spes.find((s) => s.name === speName) || spes[0];
  const dealValue = activeLead.dealValue || 1200000;
  const brokerName = activeLead.assignedBroker || "Camila Vasconcelos";

  // Document checklist status
  const docChecklist = [
    { label: "RG / CNH (Frente e Verso)", file: docs.rg, required: true, desc: "PDF ou Foto em alta resolução do RG com CPF ou CNH dentro do prazo" },
    { label: "Comprovante de CPF / CNPJ", file: docs.cpf, required: true, desc: "Cartão do CPF / Comprovante de Inscrição da Receita Federal" },
    { label: "Comprovante de Residência Atualizado", file: docs.residence, required: true, desc: "Conta de Água, Luz ou Telefone fixa emitida há no máximo 90 dias" },
    { label: "Certidão de Estado Civil / Casamento", file: docs.marriageCert, required: false, desc: "Certidão de Nascimento (solteiro), Casamento ou Pacto Antenupcial" },
    { label: "Comprovante de Renda / Extrato", file: null, required: false, desc: "Holerite, DECORE ou 3 últimos extratos bancários para análise" },
    { label: "Dados Bancários & Chave PIX", file: null, required: true, desc: "Comprovante de titularidade da conta para crédito de futuros dividendos" },
  ];

  const requiredAttachedCount = docChecklist.filter((d) => d.required && !!d.file).length;
  const isAllRequiredDocsAttached = requiredAttachedCount >= 3;
  const isCpfValid = cpfCnpj !== "Não informado" && cpfCnpj.length >= 11;
  const isEmailValid = email.includes("@");

  const isContractReady = isAllRequiredDocsAttached && isCpfValid && isEmailValid;

  // Formatted Message tailored for the Broker who made the sale
  const formattedBrokerGuideMessage = `
==================================================
📋 CHECKLIST DE DOCUMENTOS DO CLIENTE (GUIA DO CORRETOR)
CONSTRUTORA ARV INC. • DEPARTAMENTO COMERCIAL / MARKETING
==================================================

Prezado(a) Corretor(a): ${brokerName}
Parabéns pela venda do imóvel! 👏🚀

📍 DADOS DA OPERAÇÃO:
• Cliente Comprador: ${clientName}
• Empreendimento / SPE: ${speName}
• Valor da Operação: R$ ${Number(dealValue).toLocaleString("pt-BR")}

Para darmos entrada na confecção da Minuta do Contrato no nosso setor jurídico, por gentileza solicite e nos envie os seguintes documentos do cliente:

📌 DOCUMENTOS OBRIGATÓRIOS A SOLICITAR AO CLIENTE:
1. 📄 RG e CPF (ou CNH atualizada) - Frente e Verso em PDF/Foto Legível
2. 🏠 Comprovante de Residência recente (Água, Luz ou Telefone - emitido nos últimos 90 dias)
3. 💍 Certidão de Estado Civil (Nascimento se Solteiro, Casamento se Casado)
4. 🏦 Dados Bancários completos para pagamento de Dividendos/Rendimentos (Banco, Agência, C/C e Chave PIX)
5. 💼 Comprovante de Renda / Extrato Bancário (quando houver parcelamento)

--------------------------------------------------
STATUS ATUAL NO SISTEMA DA ARV:
- RG/CNH: ${docs.rg ? "✅ Já recebido" : "⚠️ SOLICITAR AO CLIENTE"}
- CPF: ${docs.cpf ? "✅ Já recebido" : "⚠️ SOLICITAR AO CLIENTE"}
- Comprovante Residência: ${docs.residence ? "✅ Já recebido" : "⚠️ SOLICITAR AO CLIENTE"}
- Certidão Estado Civil: ${docs.marriageCert ? "✅ Já recebido" : "⚠️ SOLICITAR AO CLIENTE"}

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
PARA ELABORAÇÃO DE CONTRATO - CONSTRUTORA ARV INC.
==================================================

1. DADOS PESSOAIS DO COMPRADOR
--------------------------------------------------
- Nome Completo: ${clientName}
- CPF / CNPJ: ${cpfCnpj}
- RG / Órgão Emissor: ${rg}
- Data de Nascimento: ${birthDate}
- Estado Civil: ${civilStatus}
- Profissão: ${profession}
- Nacionalidade: ${nationality}

2. CONTATOS
--------------------------------------------------
- Telefone Principal: ${phone}
- WhatsApp Direct: ${whatsapp}
- E-mail: ${email}

3. ENDEREÇO RESIDENCIAL / FISCAL
--------------------------------------------------
- Logradouro/Nº: ${address}
- CEP: ${zipCode}
- Cidade/UF: ${city} - ${state}

4. DADOS BANCÁRIOS (DIVIDENDOS / APORTES)
--------------------------------------------------
- Banco: ${bank}
- Agência: ${agency}
- Conta Corrente: ${account}
- Chave PIX: ${pix}
- Renda Declarada: R$ ${Number(income).toLocaleString("pt-BR")}

5. DADOS DO EMPREENDIMENTO / NEGÓCIO
--------------------------------------------------
- SPE / Empreendimento: ${speName}
- Valor do Negócio (VGV): R$ ${Number(dealValue).toLocaleString("pt-BR")}
- Corretor Responsável: ${brokerName}
- Data de Transmissão: ${new Date().toLocaleDateString("pt-BR")}

6. CHECKLIST DE DOCUMENTOS ANEXADOS
--------------------------------------------------
- RG/CNH: ${docs.rg ? "ANEXADO (" + docs.rg + ")" : "PENDENTE"}
- CPF: ${docs.cpf ? "ANEXADO (" + docs.cpf + ")" : "PENDENTE"}
- Comp. Residência: ${docs.residence ? "ANEXADO (" + docs.residence + ")" : "PENDENTE"}
- Certidão Estado Civil: ${docs.marriageCert ? "ANEXADO (" + docs.marriageCert + ")" : "PENDENTE"}

STATUS FINAL DA ANÁLISE: ${isContractReady ? "APROVADO PARA EMISSÃO DE MINUTA" : "PENDENTE DE COMPLEMENTAÇÃO"}
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
    const missingDocs = docChecklist
      .filter((d) => !d.file)
      .map((d) => d.label)
      .join(", ");

    const text = encodeURIComponent(
      `Olá ${clientName}, tudo bem? Aqui é ${brokerName} da Construtora ARV. Para darmos andamento à minuta do seu contrato para a ${speName}, precisamos que nos envie: ${
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
              <ShieldCheck className="w-4 h-4" /> Card Resumo Unificado de Documentação do Cliente
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> APTO PARA EMISSÃO DO CONTRATO
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> COMPLEMENTAÇÃO PENDENTE
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
              <Send className="w-3.5 h-3.5" /> 📲 Guia do Corretor (O que solicitar ao Cliente)
            </button>
            <button
              onClick={() => setCardMode("contract_summary")}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                cardMode === "contract_summary"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 📋 Ficha Completa (Para Minuta de Contrato)
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
                    <Sparkles className="w-3 h-3 text-blue-300" /> Card de Instrições do Comercial ao Corretor
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    Checklist de Documentos a Solicitar do Cliente Comprador
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Envie este resumo ao corretor responsável <span className="font-bold text-blue-300">{brokerName}</span> para acelerar a emissão do contrato.
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
                        <Copy className="w-4 h-4" /> Copiar Texto
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

            {/* Document Required Grid Items */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Relação Visual de Documentos Necessários
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docChecklist.map((doc, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                      doc.file
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          {doc.label}
                        </span>
                        {doc.file ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-300 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> ANEXADO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-300 shrink-0">
                            <AlertTriangle className="w-3 h-3" /> SOLICITAR
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {doc.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">
                        {doc.required ? "• Requisito Obrigatório" : "• Opcional / Recomendado"}
                      </span>
                      {doc.file && (
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[120px]">
                          {doc.file}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Text Box formatted for Broker message */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Mensagem Formatada Pronta para Enviar ao Corretor
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
                Ficha Pronta para Cópia e Preenchimento Inicial da Minuta
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
                      <Copy className="w-3.5 h-3.5" /> Copiar Resumo para o Contrato
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendWhatsAppRequest}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Solicitar Docs (WhatsApp)
                </button>

                <button
                  onClick={handlePrintCard}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
                </button>
              </div>
            </div>

        {/* 4 Grid Columns Summary Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Dados Pessoais */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <User className="w-3.5 h-3.5" /> 1. Dados do Investidor
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Nome Completo</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{clientName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">CPF / CNPJ</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{cpfCnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RG / Órgão</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{rg}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nascimento</span>
                  <span className="text-slate-800 dark:text-slate-200">{birthDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estado Civil</span>
                  <span className="text-slate-800 dark:text-slate-200">{civilStatus}</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Profissão / Atuação</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{profession}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Contatos & Endereço */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <MapPin className="w-3.5 h-3.5" /> 2. Contato & Endereço
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 block text-[10px]">E-mail para Notificações</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">{email}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Telefone</span>
                  <span className="text-slate-800 dark:text-slate-200">{phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">WhatsApp</span>
                  <span className="text-emerald-600 font-semibold">{whatsapp}</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Endereço Completo</span>
                <span className="text-slate-800 dark:text-slate-200 block font-medium">{address}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Cidade / Estado / CEP</span>
                <span className="text-slate-800 dark:text-slate-200">{city} - {state} (CEP: {zipCode})</span>
              </div>
            </div>
          </div>

          {/* Box 3: Dados Bancários & Negócio */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <CreditCard className="w-3.5 h-3.5" /> 3. Dados Bancários & SPE
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 block text-[10px]">SPE de Destino</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{speName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Valor do Negócio</span>
                  <span className="font-bold text-emerald-600">R$ {(Number(dealValue) / 1000).toLocaleString("pt-BR")} mil</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Corretor</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{brokerName}</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
                <span className="text-slate-400 block text-[10px]">Conta Dividendos</span>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {bank} • Ag: {agency} • C/C: {account}
                </div>
                <div className="text-[10px] text-slate-500">Chave PIX: {pix}</div>
              </div>
            </div>
          </div>

          {/* Box 4: Central de Documentos Obrigatórios */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-1.5">
              <Upload className="w-3.5 h-3.5" /> 4. Status de Anexo de Docs
            </div>

            <div className="space-y-2 pt-1">
              {docChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                    {item.label}
                  </span>
                  {item.file ? (
                    <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> OK
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      PENDENTE
                    </span>
                  )}
                </div>
              ))}
            </div>

            {onNavigateToContract && (
              <div className="pt-2">
                <button
                  onClick={onNavigateToContract}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Ir para Minuta (Card 7)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Formatted Text Box Preview */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider">
              Prévia do Bloco Formatado (Pronto para Copiar/Colar)
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
