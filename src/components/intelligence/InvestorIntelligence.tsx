import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  BrainCircuit,
  Sparkles,
  Send,
  TrendingUp,
  AlertTriangle,
  Bot,
  RefreshCw,
  PieChart,
  Award,
  BarChart3,
  Search,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { InvestorClassificationDashboard, computeInvestorTier } from "./InvestorClassificationDashboard";

export const InvestorIntelligence: React.FC = () => {
  const { investors, spes, contracts } = useApp();

  const [activeTab, setActiveTab] = useState<"classification" | "advisor">("classification");
  const [promptInput, setPromptInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset suggestions for Gemini Advisor
  const presetPrompts = [
    "Quem é Marcelo Moreira Ferraz?",
    "Quais investidores possuem maior potencial para reinvestimento?",
    "Faça um resumo executivo da carteira da SPE T58 Spot.",
    "Apresente o ranking dos maiores investidores e corretores.",
    "Quais clientes estão classificados como Promotores e Detratores?",
    "Quais clientes estão em zona de risco de churn e qual o plano de retenção?",
  ];

  // Mask CPF for security (e.g. 123.***.***-45)
  const maskCpf = (cpf?: string) => {
    if (!cpf) return "N/A";
    if (cpf.length < 11) return "***";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}.***.***-${cleaned.substring(9)}`;
    }
    if (cleaned.length === 14) {
      return `${cleaned.substring(0, 2)}.***.***/****-${cleaned.substring(12)}`;
    }
    return "***";
  };

  const handleRunAiAnalysis = async (customPrompt?: string) => {
    const query = customPrompt || promptInput;
    if (!query) return;

    setIsLoading(true);
    setAiResponse(null);

    // Build complete context of the portfolio for ARV IA
    const enrichedInvestors = investors.map((inv) => {
      const invContracts = contracts.filter((c) => c.investorId === inv.id);
      const totalInvested = invContracts.reduce((acc, c) => acc + c.investedAmount, 0);
      const computedTier = computeInvestorTier(totalInvested, inv.cpfCnpj, inv.profession);
      const speList = Array.from(
        new Set(
          invContracts
            .map((c) => spes.find((s) => s.id === c.speId)?.name)
            .filter(Boolean)
        )
      );

      return {
        id: inv.id,
        name: inv.name,
        cpfCnpjMasked: maskCpf(inv.cpfCnpj),
        city: inv.city,
        state: inv.state,
        profession: inv.profession,
        category: inv.profession?.toLowerCase().includes("médic")
          ? "Médico"
          : inv.profession?.toLowerCase().includes("advog")
          ? "Advogado"
          : inv.profession?.toLowerCase().includes("engenh")
          ? "Engenheiro"
          : inv.profession?.toLowerCase().includes("empres")
          ? "Empresário"
          : "Pessoa Física",
        porte: computedTier,
        perfil: inv.score >= 85 ? "Patrimonial" : inv.score >= 70 ? "Estratégico" : "Conservador",
        relacionamento: inv.tier || "Gold",
        score: inv.score,
        npsCategory: inv.npsCategory || (inv.satisfactionScore >= 8 ? "Promotor" : inv.satisfactionScore >= 6 ? "Neutro" : "Detrator"),
        totalInvested,
        contractsCount: invContracts.length,
        speList,
        consultant: inv.consultant || "Camila Vasconcelos",
        notes: inv.notes,
      };
    });

    const enrichedContracts = contracts.map((c) => {
      const inv = investors.find((i) => i.id === c.investorId);
      const spe = spes.find((s) => s.id === c.speId);
      return {
        contractNumber: c.contractNumber,
        investorName: inv?.name || "Desconhecido",
        speName: spe?.name || "SPE ARV",
        investedAmount: c.investedAmount,
        expectedRoiPercentage: c.expectedRoiPercentage,
        status: c.status,
      };
    });

    const enrichedSpes = spes.map((s) => ({
      id: s.id,
      name: s.name,
      cnpjMasked: maskCpf(s.cnpj),
      totalVgv: s.totalVgv,
      totalCaptação: s.totalCaptação,
      percentSold: s.percentSold,
      progressPercentage: s.progressPercentage,
      status: s.status,
    }));

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          contextData: {
            company: "ARV Investimentos Imobiliários",
            system: "ARVInvestor",
            currentVenture: "T58 Spot",
            investorsCount: investors.length,
            contractsCount: contracts.length,
            spesCount: spes.length,
            investors: enrichedInvestors,
            contracts: enrichedContracts,
            spes: enrichedSpes,
          },
        }),
      });

      const data = await response.json();
      setAiResponse(data.reply || data.response || data.error || "Análise concluída.");
    } catch (err) {
      console.error(err);
      setAiResponse("Essa informação não está disponível na base do empreendimento.");
    } finally {
      setIsLoading(false);
    }
  };

  // High propensity investors & churn risk
  const highPropensity = investors.filter((i) => i.score >= 80).slice(0, 4);
  const riskInvestors = investors.filter((i) => i.score < 50);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Sub-Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-500" /> ARV IA - Diretor Virtual de RI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assistente executivo inteligente da ARVInvestor para análises estratégicas da carteira de investidores e SPEs.
          </p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("classification")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "classification"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-500" /> Dashboard de Classificação
          </button>

          <button
            onClick={() => setActiveTab("advisor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "advisor"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Bot className="w-4 h-4 text-purple-500" /> Copiloto ARV IA (Diretoria de RI)
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: CLASSIFICATION DASHBOARD */}
      {activeTab === "classification" && <InvestorClassificationDashboard />}

      {/* TAB CONTENT 2: AI ADVISOR & CHURN PREDICTION */}
      {activeTab === "advisor" && (
        <div className="space-y-6 animate-in fade-in">
          {/* AI Assistant Interactive Console */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white flex items-center gap-2">
                    ARV IA — Assistente de Relações com Investidores
                  </h2>
                  <p className="text-xs text-slate-400">
                    Diretor Virtual de RI • Conectado à base de dados do empreendimento T58 Spot
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Base Conectada
              </span>
            </div>

            {/* Preset Prompt Buttons */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Perguntas Executivas Frequentes:
              </div>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(p);
                      handleRunAiAnalysis(p);
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs text-slate-200 transition-all border border-white/10 text-left font-medium"
                  >
                    ⚡ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="relative">
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Pergunte ao ARV IA sobre qualquer investidor, contrato, VGV, corretor ou análise estratégica..."
                className="w-full pl-4 pr-12 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
              />
              <button
                onClick={() => handleRunAiAnalysis()}
                disabled={isLoading || !promptInput}
                className="absolute right-3 bottom-3 p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl transition-all shadow-md"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* AI Output Response Box */}
            {aiResponse && (
              <div className="p-6 bg-slate-950/90 border border-amber-500/30 rounded-2xl text-xs space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-amber-400 border-b border-amber-500/20 pb-3">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Parecer Executivo do Diretor de RI
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">ARVInvestor AI Engine</span>
                </div>
                <div className="text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none text-xs">
                  <Markdown>{aiResponse}</Markdown>
                </div>
              </div>
            )}
          </div>

          {/* Grid: Propensity & Risk Predictive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Propensão de Reaporte (Up-sell / Cross-sell) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Clientes para Reinvestimento
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full">
                  Score &ge; 80
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {highPropensity.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={inv.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={inv.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inv.name}</div>
                        <div className="text-[10px] text-slate-400">{inv.profession} • {inv.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">98% Propensão</div>
                      <div className="text-[10px] text-slate-400">Score {inv.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Clientes em Risco de Churn */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Investidores em Alerta de Insatisfação
                </h3>
                <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-2.5 py-0.5 rounded-full">
                  Score &lt; 50
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {riskInvestors.map((inv) => (
                  <div key={inv.id} className="p-3 bg-rose-500/5 dark:bg-rose-950/20 rounded-2xl border border-rose-500/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={inv.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={inv.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inv.name}</div>
                        <div className="text-[10px] text-rose-500">Sem acessos ao portal há &gt;60 dias</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600 dark:text-rose-400">Score {inv.score}</div>
                      <span className="text-[10px] text-slate-400">Risco Alto</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

