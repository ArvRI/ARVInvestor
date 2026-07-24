import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Building,
  Key,
  FileText,
  Users,
  CheckSquare,
  MessageSquare,
  Mail,
  Send,
  Phone,
  QrCode,
  Video,
  Download,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { CustomerOnboardingProgress } from "../../types";
import { ARVLogo } from "../common/ARVLogo";

interface CustomerOnboardingFlowProps {
  selectedOnboardingId?: string;
}

export const CustomerOnboardingFlow: React.FC<CustomerOnboardingFlowProps> = ({
  selectedOnboardingId,
}) => {
  const { onboardings, updateOnboardingStep, updateOnboardingChecklist, spes, investors } = useApp();

  const [activeOnbId, setActiveOnbId] = useState<string>(
    selectedOnboardingId || onboardings[0]?.id || "onb-01"
  );

  const activeOnb = onboardings.find((o) => o.id === activeOnbId) || onboardings[0];
  const matchedSpe = spes.find((s) => s.id === activeOnb?.speId) || spes[0];
  const matchedInvestor = investors.find((i) => i.id === activeOnb?.investorId);

  const [simulatedChannels, setSimulatedChannels] = useState({
    whatsappSent: true,
    emailSent: true,
    portalNotifSent: true,
  });

  const STEPS = [
    { num: 1, title: "Etapa 1: Boas-vindas", icon: MessageSquare },
    { num: 2, title: "Etapa 2: Empreendimento", icon: Building },
    { num: 3, title: "Etapa 3: Acesso Portal", icon: Key },
    { num: 4, title: "Etapa 4: Documentação", icon: FileText },
    { num: 5, title: "Etapa 5: Apresentação Equipe", icon: Users },
    { num: 6, title: "Etapa 6: Checklist Cliente", icon: CheckSquare },
  ];

  if (!activeOnb) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Nenhum processo de onboarding cadastrado no momento.
      </div>
    );
  }

  const currentStep = activeOnb.currentStep || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Onboarding Selector & Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shrink-0 hidden sm:block">
            <ARVLogo lightMode size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Fluxo de Onboarding Automático do Cliente
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Cliente: {activeOnb.investorName} ({activeOnb.unitNumber})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeOnb.speName} • Data do Contrato: {activeOnb.startDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-400 font-medium">Selecionar Cliente:</label>
          <select
            value={activeOnbId}
            onChange={(e) => setActiveOnbId(e.target.value)}
            className="px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {onboardings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.investorName} - {o.speName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Steps Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {STEPS.map((st) => {
          const Icon = st.icon;
          const isActive = currentStep === st.num;
          const isDone = currentStep > st.num;

          return (
            <button
              key={st.num}
              onClick={() => updateOnboardingStep(activeOnb.id, st.num)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                  : isDone
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-bold">0{st.num}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold mt-2 truncate">{st.title.split(":")[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* ETAPA 1: MENSAGEM DE BOAS-VINDAS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 1 – Mensagem de Boas-vindas Multicanal
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-md">
                Enviado Automático
              </span>
            </div>

            {/* Channels Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">WhatsApp Business API</div>
                    <div className="text-[10px] text-slate-500">Enviado para {matchedInvestor?.whatsapp || "(85) 99821-4411"}</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">E-mail de Boas-vindas</div>
                    <div className="text-[10px] text-slate-500">Enviado para {matchedInvestor?.email || "cliente@arv.com.br"}</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>

              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Notificação no Portal</div>
                    <div className="text-[10px] text-slate-500">Push & Banner de Boas-Vindas</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            {/* Template Message Preview Card */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-3 leading-relaxed">
              <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[11px] tracking-wider">
                Conteúdo Enviado ao Cliente
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Prezado(a) {activeOnb.investorName}, parabéns pela excelente aquisição!
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Agradecemos profundamente pela sua confiança na <strong>Construtora ARV</strong>. É uma grande honra tê-lo(a) como investidor(a) na <strong>{activeOnb.speName}</strong>.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-[11px]">
                <div>• <strong>Gerente de Relacionamento:</strong> Camila Vasconcelos</div>
                <div>• <strong>Telefone Direto / WhatsApp:</strong> (85) 99120-0099</div>
                <div>• <strong>E-mail Atendimento:</strong> ri@arvinc.com.br</div>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: DADOS DO EMPREENDIMENTO */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 2 – Resumo Técnico do Empreendimento
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{matchedSpe.name}</h4>
                      <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> {matchedSpe.address}, {matchedSpe.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold rounded-md">
                      CNPJ: {matchedSpe.cnpj}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300">{matchedSpe.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Unidade Adquirida</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">{activeOnb.unitNumber}</span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Previsão de Entrega</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{matchedSpe.deadline}</span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avanço da Obra</span>
                      <span className="font-bold text-emerald-600 text-sm">{matchedSpe.progressPercentage}% Concluído</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 dark:text-slate-100">Galeria & Planta Baixa</div>
                <img
                  src={matchedSpe.bannerImage}
                  alt={matchedSpe.name}
                  className="w-full h-40 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <button className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs">
                  <Download className="w-4 h-4" /> Baixar Planta Humanizada (PDF)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: ACESSO AO PORTAL */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Key className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 3 – Credenciais & Guia de Acesso ao Portal do Investidor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Credenciais Provisórias</div>

                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 block font-semibold">Link do Portal</label>
                    <a
                      href="https://arvinc.com.br/portal"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 dark:text-blue-400 font-bold underline flex items-center gap-1 mt-0.5"
                    >
                      https://arvinc.com.br/portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div>
                    <label className="text-slate-400 block font-semibold">Usuário de Acesso (E-mail)</label>
                    <div className="font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                      {matchedInvestor?.email || "cliente@arv.com.br"}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block font-semibold">Senha Provisória</label>
                    <div className="font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-emerald-600">
                      ARV#2026!Invest
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">QR Code de Acesso Rápido</div>
                  <p className="text-slate-500 mt-1">Escaneie com a câmera do celular para acessar no App.</p>
                </div>

                <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 mx-auto flex items-center justify-center text-slate-800">
                  <QrCode className="w-20 h-20" />
                </div>

                <button className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs">
                  <Video className="w-4 h-4" /> Assistir Vídeo Explicativo do Portal (2 min)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: DOCUMENTAÇÃO */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 4 – Repositório de Documentos Contratuais & FAQ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { title: "Contrato Social de SPE & Cotas", file: "contrato_cotas_spe.pdf", size: "2.4 MB" },
                { title: "Memorial Descritivo do Imóvel", file: "memorial_descritivo_arv.pdf", size: "4.1 MB" },
                { title: "Regulamento do Círculo de Investidores", file: "regulamento_hub.pdf", size: "1.2 MB" },
                { title: "Cronograma Financeiro e Aportes", file: "cronograma_aportes.pdf", size: "850 KB" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</div>
                      <div className="text-[10px] text-slate-400">{doc.file} • {doc.size}</div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg flex items-center gap-1 shadow-xs">
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 5: APRESENTAÇÃO DA EQUIPE */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 5 – Equipe Dedicada de Atendimento ao Investidor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { name: "Camila Vasconcelos", role: "Gerente de Relacionamento (RI)", phone: "(85) 99120-0099", email: "camila@arvinc.com.br", img: "https://i.pravatar.cc/150?u=camila" },
                { name: "Lucas Andrade", role: "Consultor Comercial SPE", phone: "(85) 98844-3311", email: "lucas.andrade@arvinc.com.br", img: "https://i.pravatar.cc/150?u=lucas" },
                { name: "Eng. Ricardo Alencar", role: "Engenheiro Responsável da Obra", phone: "(85) 99710-5500", email: "ricardo.engenharia@arvinc.com.br", img: "https://i.pravatar.cc/150?u=ricardo" },
                { name: "Mariana Sampaio", role: "Gestora Financeiro & Dividendos", phone: "(85) 99400-8822", email: "financeiro@arvinc.com.br", img: "https://i.pravatar.cc/150?u=mariana" },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                  <img src={m.img} alt={m.name} className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-blue-600 shadow-sm" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{m.name}</div>
                    <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">{m.role}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
                    <div>{m.phone}</div>
                    <div className="truncate">{m.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 6: CHECKLIST DO CLIENTE */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckSquare className="w-5 h-5 text-blue-700 dark:text-blue-400" /> Etapa 6 – Checklist de Acompanhamento do Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { key: "contractSigned", label: "Contrato Assinado Digitalmente" },
                { key: "docsUploaded", label: "Documentação de Cadastro Enviada" },
                { key: "registrationApproved", label: "Cadastro e CPF Aprovados pela ARV" },
                { key: "portalReleased", label: "Acesso ao Portal Liberado" },
                { key: "firstAccessDone", label: "Primeiro Acesso Realizado pelo Cliente" },
                { key: "paymentConfigured", label: "Conta para Dividendos Configurada" },
              ].map((item) => {
                const isChecked = (activeOnb.checklist as any)?.[item.key] ?? false;

                return (
                  <div
                    key={item.key}
                    onClick={() => updateOnboardingChecklist(activeOnb.id, item.key, !isChecked)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500"
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => updateOnboardingStep(activeOnb.id, Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-slate-400">Etapa {currentStep} de 6</span>

          <button
            onClick={() => updateOnboardingStep(activeOnb.id, Math.min(6, currentStep + 1))}
            disabled={currentStep === 6}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg disabled:opacity-40 shadow-xs"
          >
            Próxima Etapa
          </button>
        </div>
      </div>
    </div>
  );
};
