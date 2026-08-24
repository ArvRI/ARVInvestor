import React, { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  FileCheck,
  CreditCard,
  CheckCircle2,
  FileText,
  PenTool,
  Award,
  Upload,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  Copy,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { MarketingLead } from "../../types";
import { CustomerDocSummaryCard } from "./CustomerDocSummaryCard";
import { ARVLogo } from "../common/ARVLogo";

interface BrokerOnboardingWizardProps {
  initialLead?: MarketingLead | null;
  onFinish?: () => void;
}

export const BrokerOnboardingWizard: React.FC<BrokerOnboardingWizardProps> = ({
  initialLead,
  onFinish,
}) => {
  const { leads, updateLead, moveLeadStage, spes } = useApp();

  const activeLead = initialLead || leads[0];

  const [activeCardStep, setActiveCardStep] = useState<number>(1);
  const [showDocSummaryModal, setShowDocSummaryModal] = useState(false);

  // Form State initialized from activeLead
  const [formData, setFormData] = useState({
    name: activeLead?.name || "",
    cpfCnpj: activeLead?.cpfCnpj || "",
    rg: activeLead?.rg || "",
    birthDate: activeLead?.birthDate || "",
    civilStatus: activeLead?.civilStatus || "Casado(a)",
    nationality: activeLead?.nationality || "Brasileiro(a)",
    profession: activeLead?.profession || "",
    phone: activeLead?.phone || "",
    whatsapp: activeLead?.whatsapp || "",
    email: activeLead?.email || "",
    zipCode: activeLead?.zipCode || "",
    address: activeLead?.address || "",
    city: activeLead?.city || "Fortaleza",
    state: activeLead?.state || "CE",
    bank: activeLead?.bankInfo?.bank || "Banco Itaú (341)",
    agency: activeLead?.bankInfo?.agency || "0412",
    account: activeLead?.bankInfo?.account || "88120-4",
    pix: activeLead?.bankInfo?.pix || activeLead?.cpfCnpj || "",
    income: activeLead?.bankInfo?.income || 50000,
    electronicSignatureProvider: activeLead?.electronicSignatureProvider || "Clicksign",
    speOfInterest: activeLead?.speOfInterest || spes[0]?.name || "SPE ARV Horizon Residence",
    dealValue: activeLead?.dealValue || 1200000,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    rg: activeLead?.uploadedDocs?.rg || "rg_frente_verso.pdf",
    cpf: activeLead?.uploadedDocs?.cpf || "cpf_documento.pdf",
    residence: activeLead?.uploadedDocs?.residence || "comprovante_residencia.pdf",
    marriageCert: activeLead?.uploadedDocs?.marriageCert || "certidao_estado_civil.pdf",
  });

  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [signatureSent, setSignatureSent] = useState(
    activeLead?.electronicSignatureStatus === "Enviado" || activeLead?.electronicSignatureStatus === "Assinado"
  );
  const [signatureSigned, setSignatureSigned] = useState(
    activeLead?.electronicSignatureStatus === "Assinado"
  );

  // Automatic Validation Logic for Card 6
  const isCpfValid = formData.cpfCnpj.length >= 11;
  const isEmailValid = formData.email.includes("@") && formData.email.includes(".");
  const areMandatoryFieldsPresent =
    formData.name.length > 3 && formData.phone.length > 8 && formData.address.length > 5;
  const areDocsComplete = !!(uploadedFiles.rg && uploadedFiles.cpf && uploadedFiles.residence);
  const isDuplicatesCheckPassed = true;

  const isCard6Valid =
    isCpfValid && isEmailValid && areMandatoryFieldsPresent && areDocsComplete && isDuplicatesCheckPassed;

  const handleSaveFormData = () => {
    if (!activeLead) return;
    updateLead(activeLead.id, {
      name: formData.name,
      cpfCnpj: formData.cpfCnpj,
      rg: formData.rg,
      birthDate: formData.birthDate,
      civilStatus: formData.civilStatus,
      nationality: formData.nationality,
      profession: formData.profession,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      zipCode: formData.zipCode,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      speOfInterest: formData.speOfInterest,
      dealValue: formData.dealValue,
      bankInfo: {
        bank: formData.bank,
        agency: formData.agency,
        account: formData.account,
        pix: formData.pix,
        income: Number(formData.income),
      },
      uploadedDocs: uploadedFiles,
      validationStatus: {
        mandatoryFieldsValid: areMandatoryFieldsPresent,
        cpfValid: isCpfValid,
        emailValid: isEmailValid,
        docsComplete: areDocsComplete,
        duplicatesCheck: isDuplicatesCheckPassed,
      },
      electronicSignatureProvider: formData.electronicSignatureProvider as any,
    });
  };

  const handleSimulateFileUpload = (docKey: keyof typeof uploadedFiles) => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      setUploadedFiles((prev) => ({
        ...prev,
        [docKey]: `${String(docKey)}_anexo_validado_${Date.now()}.pdf`,
      }));
      setIsSimulatingUpload(false);
    }, 600);
  };

  const handleSendElectronicSignature = () => {
    handleSaveFormData();
    setSignatureSent(true);
    if (activeLead) {
      updateLead(activeLead.id, {
        electronicSignatureStatus: "Enviado",
        electronicSignatureUrl: `https://${formData.electronicSignatureProvider.toLowerCase()}.com/sign/arv-${activeLead.id}`,
      });
    }
  };

  const handleSimulateClientSigning = () => {
    setSignatureSigned(true);
    if (activeLead) {
      updateLead(activeLead.id, {
        electronicSignatureStatus: "Assinado",
      });
    }
  };

  const handleCompleteSaleAndOnboarding = () => {
    if (!activeLead) return;
    handleSaveFormData();
    moveLeadStage(activeLead.id, "Venda Concluída");
    if (onFinish) onFinish();
  };

  const CARDS = [
    { num: 1, title: "Card 1: Cadastro Inicial", icon: User },
    { num: 2, title: "Card 2: Contato Direct", icon: Phone },
    { num: 3, title: "Card 3: Endereço", icon: MapPin },
    { num: 4, title: "Card 4: Central Documentos", icon: Upload },
    { num: 5, title: "Card 5: Dados Financeiros", icon: CreditCard },
    { num: 6, title: "Card 6: Conferência IA", icon: FileCheck },
    { num: 7, title: "Card 7: Minuta Contrato", icon: FileText },
    { num: 8, title: "Card 8: Assinatura Digital", icon: PenTool },
    { num: 9, title: "Card 9: Venda Finalizada", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shrink-0 hidden sm:block">
            <ARVLogo lightMode size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Cards do Corretor & Onboarding Interno
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Cliente: {formData.name || "Novo Investidor"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              SPE de Interesse: <strong className="text-slate-200">{formData.speOfInterest}</strong> •
              VGV da Unidade: <strong className="text-emerald-400">R$ {(Number(formData.dealValue) / 1000).toLocaleString("pt-BR")} mil</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              handleSaveFormData();
              setShowDocSummaryModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            📄 Card Resumo de Documentos
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Etapa Atual:</span>
            <span className="px-3 py-1 bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs">
              {CARDS[activeCardStep - 1].title}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Steps Navigator */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 overflow-x-auto pb-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const isActive = activeCardStep === c.num;
          const isDone = activeCardStep > c.num;

          return (
            <button
              key={c.num}
              onClick={() => {
                handleSaveFormData();
                setActiveCardStep(c.num);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                  : isDone
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-bold opacity-80">0{c.num}</span>
                <Icon className="w-3.5 h-3.5 shrink-0" />
              </div>
              <div className="text-[10px] font-bold truncate mt-1">{c.title.split(":")[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Card Content Display */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* CARD 1: CADASTRO INICIAL */}
        {activeCardStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 1 – Cadastro Inicial do Investidor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">CPF / CNPJ *</label>
                <input
                  type="text"
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">RG / Órgão Emissor</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  placeholder="2008019281-SSP/CE"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Estado Civil</label>
                <select
                  value={formData.civilStatus}
                  onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Profissão / Atuação</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="Ex: Médico, Empresário, Engenheiro"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* CARD 2: CONTATO */}
        {activeCardStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 2 – Canais de Contato Direct
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Telefone Principal</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">WhatsApp de Notificações</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">E-mail Principal</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* CARD 3: ENDEREÇO */}
        {activeCardStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 3 – Endereço Residencial / Fiscal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="60000-000"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Logradouro / Número / Bairro</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* CARD 4: DOCUMENTOS (UPLOAD) */}
        {activeCardStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 4 – Central de Documentos para Contratação
              </h3>
              <span className="text-xs text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                Link Seguro Enviado ao Cliente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { key: "rg" as const, label: "RG / CNH (Frente e Verso)" },
                { key: "cpf" as const, label: "Comprovante de CPF" },
                { key: "residence" as const, label: "Comprovante de Residência" },
                { key: "marriageCert" as const, label: "Certidão de Estado Civil / Casamento" },
              ].map((doc) => {
                const fileVal = uploadedFiles[doc.key];

                return (
                  <div
                    key={doc.key}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{doc.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {fileVal ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {fileVal}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">Pendente de Anexo</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateFileUpload(doc.key)}
                      disabled={isSimulatingUpload}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> {fileVal ? "Reenviar" : "Anexar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CARD 5: DADOS FINANCEIROS */}
        {activeCardStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 5 – Dados Financeiros para Pagamento de Dividendos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Instituição Bancária</label>
                <input
                  type="text"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Agência</label>
                <input
                  type="text"
                  value={formData.agency}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Número da Conta Corrente</label>
                <input
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Chave PIX Cadastrada</label>
                <input
                  type="text"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Renda Declarada Mensal (R$)</label>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* CARD 6: CONFERÊNCIA AUTOMÁTICA */}
        {activeCardStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 6 – Validação & Conferência IA do Corretor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Campos Obrigatórios</div>
                  <div className="text-[11px] text-slate-500">Nome, Telefone, Endereço e SPE</div>
                </div>
                {areMandatoryFieldsPresent ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> VÁLIDO
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">INCOMPLETO</span>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Formato do CPF / CNPJ</div>
                  <div className="text-[11px] text-slate-500">{formData.cpfCnpj || "Não informado"}</div>
                </div>
                {isCpfValid ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> REGULAR
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">INVÁLIDO</span>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Formato do E-mail</div>
                  <div className="text-[11px] text-slate-500">{formData.email}</div>
                </div>
                {isEmailValid ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> VÁLIDO
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">INVÁLIDO</span>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Documentação Anexa</div>
                  <div className="text-[11px] text-slate-500">3 anexos obrigatórios ok</div>
                </div>
                {areDocsComplete ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> COMPLETO
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">PENDENTE</span>
                )}
              </div>
            </div>

            {isCard6Valid ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Conferência Aprovada! O cadastro possui todos os requisitos para a geração do contrato.</span>
                </div>
                <button
                  onClick={() => {
                    handleSaveFormData();
                    setShowDocSummaryModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Ver Card Resumo Unificado
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Atenção: Verifique os campos pendentes antes de prosseguir com a minuta contratual.</span>
                </div>
                <button
                  onClick={() => {
                    handleSaveFormData();
                    setShowDocSummaryModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Checar Ficha de Docs
                </button>
              </div>
            )}
          </div>
        )}

        {/* CARD 7: CONTRATO (GERAÇÃO DE MINUTA) */}
        {activeCardStep === 7 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 7 – Minuta Contratual Pré-Preenchida Automática
              </h3>
              <button
                onClick={() => {
                  handleSaveFormData();
                  setShowDocSummaryModal(true);
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <FileText className="w-3.5 h-3.5" /> Open / Copiar Card Resumo do Cliente
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono space-y-3 leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="text-center font-bold text-sm uppercase underline">
                INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE COTAS DA SPE {formData.speOfInterest.toUpperCase()}
              </div>
              <p>
                <strong>PROMITENTE VENDEDORA:</strong> CONSTRUTORA ARV INC. S.A., inscrita no CNPJ sob o nº 42.189.302/0001-81, com sede em Fortaleza-CE.
              </p>
              <p>
                <strong>PROMITENTE COMPRADOR(A):</strong> {formData.name.toUpperCase()}, portador(a) do CPF nº {formData.cpfCnpj}, residente no endereço {formData.address}, {formData.city}-{formData.state}.
              </p>
              <p>
                <strong>OBJETO DO CONTRATO:</strong> Aquisição de cotas de participação na Sociedade de Propósito Específico <strong>{formData.speOfInterest}</strong>, no valor contratado de <strong>R$ {Number(formData.dealValue).toLocaleString("pt-BR")}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* CARD 8: ASSINATURA ELETRÔNICA */}
        {activeCardStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Card 8 – Assinatura Eletrônica Digital
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Plataforma de Assinatura Integrada
                </label>
                <select
                  value={formData.electronicSignatureProvider}
                  onChange={(e) => setFormData({ ...formData, electronicSignatureProvider: e.target.value as "Clicksign" | "DocuSign" | "ZapSign" })}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-blue-700 dark:text-blue-400"
                >
                  <option value="Clicksign">Clicksign Digital</option>
                  <option value="DocuSign">DocuSign Global</option>
                  <option value="ZapSign">ZapSign WhatsApp</option>
                </select>
              </div>

              {!signatureSent ? (
                <button
                  onClick={handleSendElectronicSignature}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" /> Disparar Minuta para Assinatura via {formData.electronicSignatureProvider}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300 font-semibold flex items-center justify-between">
                    <span>Link enviado para: {formData.email} e WhatsApp</span>
                    <a
                      href={`https://${formData.electronicSignatureProvider.toLowerCase()}.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 underline text-blue-700 dark:text-blue-400 font-bold"
                    >
                      Ver no Provedor <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {!signatureSigned ? (
                    <button
                      onClick={handleSimulateClientSigning}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Simular Webhook: Cliente Assinou o Contrato
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Contrato Digital Assinado com Sucesso por {formData.name}!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CARD 9: VENDA FINALIZADA */}
        {activeCardStep === 9 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Card 9 – Venda Concluída & Transição Automática
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Ao concluir a venda, o sistema atualizará o funil para <strong>Venda Concluída</strong>, criará o cadastro definitivo do investidor, vinculará à <strong>{formData.speOfInterest}</strong> e liberará o <strong>Onboarding Automático no Portal</strong>.
            </p>

            <button
              onClick={handleCompleteSaleAndOnboarding}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 mx-auto shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Finalizar Venda e Disparar Onboarding do Cliente
            </button>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => {
              handleSaveFormData();
              if (activeCardStep > 1) setActiveCardStep(activeCardStep - 1);
            }}
            disabled={activeCardStep === 1}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>

          <span className="text-slate-400 font-medium">Card {activeCardStep} de 9</span>

          <button
            onClick={() => {
              handleSaveFormData();
              if (activeCardStep < 9) setActiveCardStep(activeCardStep + 1);
            }}
            disabled={activeCardStep === 9}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
          >
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Documentation Summary Card Modal */}
      {showDocSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full my-8">
            <CustomerDocSummaryCard
              lead={activeLead}
              onNavigateToContract={() => {
                setShowDocSummaryModal(false);
                setActiveCardStep(7);
              }}
              onCloseModal={() => setShowDocSummaryModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
