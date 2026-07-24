import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Send,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Bot,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const InvestorIntelligence: React.FC = () => {
  const { investors, spes } = useApp();

  const [promptInput, setPromptInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset suggestions
  const presetPrompts = [
    "Quais investidores da base possuem maior propensão de reaporte para um lançamento de alto padrão?",
    "Quais clientes estão em zona de risco de churn e qual o plano de retenção recomendado?",
    "Gere uma mensagem de WhatsApp para convidar investidores Platinum para um jantar exclusivo com a diretoria ARV.",
    "Faça um diagnóstico completo do perfil dos 30 investidores da carteira da Construtora ARV.",
  ];

  const handleRunAiAnalysis = async (customPrompt?: string) => {
    const query = customPrompt || promptInput;
    if (!query) return;

    setIsLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          contextData: {
            investorsCount: investors.length,
            spesCount: spes.length,
            sampleInvestors: investors.slice(0, 5).map((i) => ({
              name: i.name,
              score: i.score,
              tier: i.tier,
              profession: i.profession,
            })),
          },
        }),
      });

      const data = await response.json();
      setAiResponse(data.reply || data.error || "Análise concluída com sucesso.");
    } catch (err) {
      console.error(err);
      setAiResponse("Falha ao comunicar com o servidor da Inteligência ARV. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // High propensity investors
  const highPropensity = investors.filter((i) => i.score >= 80).slice(0, 4);
  const riskInvestors = investors.filter((i) => i.score < 50);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-500" /> Investor Intelligence (Módulo de IA & Insights)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Motor preditivo acionado pelo Gemini AI para análise de propensão de reaporte, prevenção de churn e recomendação inteligente.
          </p>
        </div>
      </div>

      {/* AI Assistant Interactive Console */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              Assistente IA para Relações com Investidores (ARV Advisor)
            </h2>
            <p className="text-xs text-slate-400">Modelos Gemini 2.5 Flash operando no servidor backend em tempo real</p>
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sugestões de Análise Pronta:</div>
          <div className="flex flex-wrap gap-2">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(p);
                  handleRunAiAnalysis(p);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs text-slate-200 transition-all border border-white/10 text-left"
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
            placeholder="Digite qualquer pergunta estratégica sobre a base de investidores da Construtora ARV..."
            className="w-full pl-4 pr-12 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
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
          <div className="p-5 bg-slate-950/90 border border-amber-500/30 rounded-2xl text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-400 border-b border-amber-500/20 pb-2">
              <Sparkles className="w-4 h-4" /> Resposta da Inteligência ARV
            </div>
            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {aiResponse}
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
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Propensão de Reaporte (Novos Lançamentos)
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full">
              Score &gt; 80
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {highPropensity.map((inv) => (
              <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={inv.avatarUrl} alt={inv.name} className="w-8 h-8 rounded-full object-cover" />
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
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Investidores em Alerta / Risco de Insatisfação
            </h3>
            <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-2.5 py-0.5 rounded-full">
              Score &lt; 50
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {riskInvestors.map((inv) => (
              <div key={inv.id} className="p-3 bg-rose-500/5 dark:bg-rose-950/20 rounded-2xl border border-rose-500/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={inv.avatarUrl} alt={inv.name} className="w-8 h-8 rounded-full object-cover" />
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
  );
};
