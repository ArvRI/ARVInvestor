import React, { useState, useMemo } from "react";
import {
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  Filter,
  Building2,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Award,
  Search,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Layers,
  Briefcase,
  Percent,
  ChevronRight,
  BrainCircuit,
  Info,
  SlidersHorizontal,
  LineChart as LineChartIcon,
  Activity,
  MapPin,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { InvestorTier } from "../../types";

const TIER_COLORS: Record<InvestorTier, string> = {
  Private: "#8b5cf6",       // Purple
  Prime: "#10b981",         // Emerald
  Select: "#eab308",        // Amber
  Essencial: "#3b82f6",     // Blue
  Institucional: "#6366f1", // Indigo
};

export function computeInvestorTier(totalInvested: number, cpfCnpj?: string, profession?: string): InvestorTier {
  const isCorporate =
    (cpfCnpj && (cpfCnpj.length > 14 || cpfCnpj.includes("/") || cpfCnpj.includes("CNPJ"))) ||
    (profession && /fundo|holding|empresa|institucional|pj|s\.a\.|ltda/i.test(profession));

  if (isCorporate) return "Institucional";
  if (totalInvested > 2000000) return "Private";
  if (totalInvested > 800000) return "Prime";
  if (totalInvested > 300000) return "Select";
  return "Essencial";
}

export const InvestorClassificationDashboard: React.FC = () => {
  const { investors, spes, contracts, darkMode, setCurrentInvestorId } = useApp();

  const [selectedSpeId, setSelectedSpeId] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // ----------------------------------------------------
  // COMPUTED METRICS: Per-Investor Data Aggregation
  // ----------------------------------------------------
  const investorMetrics = useMemo(() => {
    return investors.map((inv) => {
      // Find all contracts for this investor
      const invContracts = contracts.filter((c) => c.investorId === inv.id);
      const totalInvested = invContracts.reduce((acc, c) => acc + (c.investedAmount || 0), 0);
      
      // Get list of SPEs this investor participates in
      const speIds = Array.from(new Set(invContracts.map((c) => c.speId)));
      const speList = spes.filter((s) => speIds.includes(s.id));

      // Share breakdown per SPE
      const speShares = invContracts.reduce<Record<string, { amount: number; sharePct: number }>>(
        (acc, c) => {
          if (!acc[c.speId]) {
            acc[c.speId] = { amount: 0, sharePct: 0 };
          }
          acc[c.speId].amount += c.investedAmount || 0;
          acc[c.speId].sharePct += c.speSharePercentage || 0;
          return acc;
        },
        {}
      );

      // Compute official tier based on total invested & corporate nature
      const computedTier = computeInvestorTier(totalInvested, inv.cpfCnpj, inv.profession);

      let bracket = "Essencial (até R$ 300 mil)";
      if (computedTier === "Institucional") {
        bracket = "Institucional (Empresas/Fundos)";
      } else if (computedTier === "Private") {
        bracket = "Private (acima de R$ 2 milhões)";
      } else if (computedTier === "Prime") {
        bracket = "Prime (R$ 800 mil a R$ 2 milhões)";
      } else if (computedTier === "Select") {
        bracket = "Select (R$ 300 mil a R$ 800 mil)";
      }

      return {
        ...inv,
        tier: computedTier,
        totalInvested,
        contractsCount: invContracts.length,
        speList,
        speIds,
        speShares,
        bracket,
      };
    });
  }, [investors, contracts, spes]);

  // ----------------------------------------------------
  // CUSTOM CHART BUILDER STATE & LOGIC
  // ----------------------------------------------------
  const [customGroupBy, setCustomGroupBy] = useState<"tier" | "profession" | "city" | "spe" | "relacionamento" | "npsCategory">("tier");
  const [customMetric, setCustomMetric] = useState<"totalInvested" | "investorCount" | "avgTicket" | "avgScore">("totalInvested");
  const [customChartType, setCustomChartType] = useState<"bar" | "pie" | "line" | "area">("bar");
  const [customSpeFilter, setCustomSpeFilter] = useState<string>("ALL");
  const [customTierFilter, setCustomTierFilter] = useState<string>("ALL");
  const [customProfessionFilter, setCustomProfessionFilter] = useState<string>("ALL");

  const availableProfessions = useMemo(() => {
    const list = Array.from(new Set(investors.map((i) => i.profession).filter(Boolean)));
    return list.sort();
  }, [investors]);

  const customChartData = useMemo(() => {
    const filtered = investorMetrics.filter((inv) => {
      if (customSpeFilter !== "ALL" && !inv.speIds.includes(customSpeFilter)) return false;
      if (customTierFilter !== "ALL" && inv.tier !== customTierFilter) return false;
      if (customProfessionFilter !== "ALL" && inv.profession !== customProfessionFilter) return false;
      return true;
    });

    const groupMap: Record<string, { key: string; totalInvested: number; investorCount: number; totalScore: number }> = {};

    filtered.forEach((inv) => {
      let groupKey = "Outros";

      if (customGroupBy === "tier") {
        groupKey = inv.tier;
      } else if (customGroupBy === "profession") {
        groupKey = inv.profession || "Não informada";
      } else if (customGroupBy === "city") {
        groupKey = inv.city ? `${inv.city} - ${inv.state || "CE"}` : "Não informada";
      } else if (customGroupBy === "relacionamento") {
        groupKey = inv.tier || "Gold";
      } else if (customGroupBy === "npsCategory") {
        groupKey = inv.npsCategory || (inv.satisfactionScore >= 8 ? "Promotor" : inv.satisfactionScore >= 6 ? "Neutro" : "Detrator");
      } else if (customGroupBy === "spe") {
        if (inv.speList.length === 0) {
          groupKey = "Sem SPE";
          if (!groupMap[groupKey]) {
            groupMap[groupKey] = { key: groupKey, totalInvested: 0, investorCount: 0, totalScore: 0 };
          }
          groupMap[groupKey].totalInvested += inv.totalInvested;
          groupMap[groupKey].investorCount += 1;
          groupMap[groupKey].totalScore += inv.score;
        } else {
          inv.speList.forEach((speObj) => {
            const speName = speObj.name.split("-")[0].trim();
            if (!groupMap[speName]) {
              groupMap[speName] = { key: speName, totalInvested: 0, investorCount: 0, totalScore: 0 };
            }
            const shareAmount = inv.speShares[speObj.id]?.amount || 0;
            groupMap[speName].totalInvested += shareAmount;
            groupMap[speName].investorCount += 1;
            groupMap[speName].totalScore += inv.score;
          });
          return;
        }
      }

      if (customGroupBy !== "spe") {
        if (!groupMap[groupKey]) {
          groupMap[groupKey] = { key: groupKey, totalInvested: 0, investorCount: 0, totalScore: 0 };
        }
        groupMap[groupKey].totalInvested += inv.totalInvested;
        groupMap[groupKey].investorCount += 1;
        groupMap[groupKey].totalScore += inv.score;
      }
    });

    const result = Object.values(groupMap).map((item) => {
      const avgTicket = item.investorCount > 0 ? item.totalInvested / item.investorCount : 0;
      const avgScore = item.investorCount > 0 ? Math.round(item.totalScore / item.investorCount) : 0;

      let value = 0;
      let displayValueFormatted = "";

      if (customMetric === "totalInvested") {
        value = Number((item.totalInvested / 1000).toFixed(1));
        displayValueFormatted = `R$ ${(item.totalInvested / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
      } else if (customMetric === "investorCount") {
        value = item.investorCount;
        displayValueFormatted = `${item.investorCount} cotistas`;
      } else if (customMetric === "avgTicket") {
        value = Number((avgTicket / 1000).toFixed(1));
        displayValueFormatted = `R$ ${(avgTicket / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}k`;
      } else if (customMetric === "avgScore") {
        value = avgScore;
        displayValueFormatted = `${avgScore} pts`;
      }

      return {
        name: item.key,
        value,
        totalInvestedRaw: item.totalInvested,
        investorCountRaw: item.investorCount,
        avgTicketRaw: avgTicket,
        avgScoreRaw: avgScore,
        displayValueFormatted,
      };
    });

    return result.sort((a, b) => b.value - a.value);
  }, [investorMetrics, customGroupBy, customMetric, customSpeFilter, customTierFilter, customProfessionFilter]);

  const handleExportCustomChartCSV = () => {
    if (customChartData.length === 0) return;
    const headers = ["Categoria", "Valor Gráfico", "Total Investido (R$)", "Qtd Investidores", "Ticket Médio (R$)", "Score Médio"];
    const rows = customChartData.map((d) => [
      `"${d.name}"`,
      d.value,
      d.totalInvestedRaw,
      d.investorCountRaw,
      Math.round(d.avgTicketRaw),
      d.avgScoreRaw,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `arv_grafico_customizado_${customGroupBy}_${customMetric}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tooltipStyle = useMemo(
    () =>
      darkMode
        ? {
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#f8fafc",
            fontSize: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          }
        : {
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            color: "#0f172a",
            fontSize: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
    [darkMode]
  );

  // ----------------------------------------------------
  // COMPUTED METRICS: Per-SPE Data Aggregation
  // ----------------------------------------------------
  const speClassification = useMemo(() => {
    return spes.map((spe) => {
      const speContracts = contracts.filter((c) => c.speId === spe.id);
      const uniqueInvestorIds = Array.from(new Set(speContracts.map((c) => c.investorId)));
      const speInvestors = investorMetrics.filter((im) => uniqueInvestorIds.includes(im.id));

      const totalCaptação = spe.totalCaptação || 1;
      const totalInvestedInSpe = speContracts.reduce((acc, c) => acc + (c.investedAmount || 0), 0);

      // Ranking top cotistas in this SPE
      const cotistasRanked = speInvestors
        .map((inv) => {
          const share = inv.speShares[spe.id] || { amount: 0, sharePct: 0 };
          return {
            investor: inv,
            amount: share.amount,
            sharePct: share.sharePct > 0 ? share.sharePct : (share.amount / totalCaptação) * 100,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      // Top 3 Concentration %
      const top3TotalAmount = cotistasRanked.slice(0, 3).reduce((acc, c) => acc + c.amount, 0);
      const top3ConcentrationPct = totalInvestedInSpe > 0 ? (top3TotalAmount / totalInvestedInSpe) * 100 : 0;

      // Tier Breakdown inside this SPE
      const tierCounts: Record<InvestorTier, number> = {
        Essencial: 0,
        Select: 0,
        Prime: 0,
        Private: 0,
        Institucional: 0,
      };
      speInvestors.forEach((inv) => {
        if (tierCounts[inv.tier] !== undefined) {
          tierCounts[inv.tier] += 1;
        }
      });

      return {
        spe,
        investorsCount: uniqueInvestorIds.length,
        totalInvestedInSpe,
        cotistasRanked,
        top3ConcentrationPct: Number(top3ConcentrationPct.toFixed(1)),
        tierCounts,
        isHighConcentration: top3ConcentrationPct > 50,
      };
    });
  }, [spes, contracts, investorMetrics]);

  // ----------------------------------------------------
  // FILTERING LOGIC FOR INVESTORS LIST
  // ----------------------------------------------------
  const filteredInvestors = useMemo(() => {
    return investorMetrics.filter((inv) => {
      // SPE Filter
      if (selectedSpeId !== "ALL" && !inv.speIds.includes(selectedSpeId)) {
        return false;
      }
      // Tier Filter
      if (selectedTier !== "ALL" && inv.tier !== selectedTier) {
        return false;
      }
      // Bracket Filter
      if (selectedCategory !== "ALL" && inv.bracket !== selectedCategory) {
        return false;
      }
      // Search Text Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = inv.name.toLowerCase().includes(q);
        const matchesProf = inv.profession.toLowerCase().includes(q);
        const matchesCity = inv.city.toLowerCase().includes(q);
        const matchesCpf = inv.cpfCnpj.includes(q);
        return matchesName || matchesProf || matchesCity || matchesCpf;
      }
      return true;
    });
  }, [investorMetrics, selectedSpeId, selectedTier, selectedCategory, searchQuery]);

  // ----------------------------------------------------
  // CHART DATA 1: Tier Distribution Donut
  // ----------------------------------------------------
  const tierDistributionData = useMemo(() => {
    const counts: Record<InvestorTier, { count: number; volume: number }> = {
      Essencial: { count: 0, volume: 0 },
      Select: { count: 0, volume: 0 },
      Prime: { count: 0, volume: 0 },
      Private: { count: 0, volume: 0 },
      Institucional: { count: 0, volume: 0 },
    };

    investorMetrics.forEach((inv) => {
      if (counts[inv.tier]) {
        counts[inv.tier].count += 1;
        counts[inv.tier].volume += inv.totalInvested;
      }
    });

    return (Object.keys(counts) as InvestorTier[]).map((tier) => ({
      name: `${tier}`,
      tier,
      value: counts[tier].count,
      volume: counts[tier].volume,
    }));
  }, [investorMetrics]);

  // ----------------------------------------------------
  // CHART DATA 2: SPE Investors vs. VGV Captação
  // ----------------------------------------------------
  const speBarChartData = useMemo(() => {
    return speClassification.map((item) => ({
      name: item.spe.name.split("-")[0].trim().substring(0, 15),
      fullSpeName: item.spe.name,
      Cotistas: item.investorsCount,
      "Captação (R$M)": Number((item.totalInvestedInSpe / 1000000).toFixed(2)),
      ConcentraçãoTop3: item.top3ConcentrationPct,
    }));
  }, [speClassification]);

  // ----------------------------------------------------
  // CHART DATA 3: Profession / Segment Breakdown
  // ----------------------------------------------------
  const professionData = useMemo(() => {
    const map: Record<string, number> = {};
    investors.forEach((inv) => {
      const prof = inv.profession || "Outros";
      map[prof] = (map[prof] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [investors]);

  // Overall Global KPI Summary
  const totalGlobalVolume = investorMetrics.reduce((acc, i) => acc + i.totalInvested, 0);
  const totalInvestorsCount = investors.length;
  const privateCount = investorMetrics.filter((i) => i.tier === "Private").length;
  const primeCount = investorMetrics.filter((i) => i.tier === "Prime").length;
  const selectCount = investorMetrics.filter((i) => i.tier === "Select").length;
  const essencialCount = investorMetrics.filter((i) => i.tier === "Essencial").length;
  const institucionalCount = investorMetrics.filter((i) => i.tier === "Institucional").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* SECTION HEADER & INTRO */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Classificação Inteligente & Matriz de Concentração
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Classificação de Investidores & Cotistas por SPE
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Mapeamento analítico de perfis (Tiers, Scoring, Segmento Profissional) e distribuição de pulverização de cotas por cada Sociedade de Propósito Específico (SPE).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <BrainCircuit className="w-8 h-8 text-amber-400 animate-pulse shrink-0" />
            <div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Algoritmo Preditivo</div>
              <div className="text-xs font-bold text-white">Score & HHI Matrix 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" /> Base Total de Cotistas
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalInvestorsCount}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Mapeados
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-500" /> Total Aportado em SPEs
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            R$ {(totalGlobalVolume / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-slate-400">
            Ticket Médio: R$ {totalInvestorsCount > 0 ? (totalGlobalVolume / totalInvestorsCount / 1000).toFixed(0) : 0}k
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-500" /> Private & Prime
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {privateCount + primeCount} <span className="text-xs font-medium text-slate-400">({(((privateCount + primeCount) / (totalInvestorsCount || 1)) * 100).toFixed(0)}%)</span>
          </div>
          <span className="text-[10px] text-purple-500 font-medium">
            {privateCount} Private (&gt;2M) | {primeCount} Prime (800k-2M)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-500" /> SPEs em Monitoramento
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {spes.length} SPEs
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Saúde de Cotas: Estável
          </span>
        </div>
      </div>

      {/* CHARTS ROW: TIER DISTRIBUTION & SPE CONCENTRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Classificação por Tier (Donut) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" /> Perfil por Tier de Score
              </h2>
              <p className="text-[11px] text-slate-400">Distribuição por volume de aporte e engajamento</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.tier]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {tierDistributionData.map((td) => (
              <div key={td.tier} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIER_COLORS[td.tier] }} />
                  <span className="font-medium">Tier {td.tier}</span>
                </div>
                <div className="font-bold">
                  {td.value} invest. <span className="text-[10px] text-slate-400 font-normal">(R$ {(td.volume / 1000).toFixed(0)}k)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Distribuição por SPE (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Distribuição de Cotistas e Captação por SPE
              </h2>
              <p className="text-[11px] text-slate-400">Comparativo do número de investidores e volume total captado por empreendimento</p>
            </div>
            <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
              Total {spes.length} SPEs
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speBarChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Cotistas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Captação (R$M)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Profession Insights */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Segmentos Profissionais Predominantes:
            </span>
            <div className="flex flex-wrap gap-2">
              {professionData.map((p) => (
                <span key={p.name} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {p.name}: <strong>{p.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPE CONCENTRATION MATRIX & AI INSIGHTS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Índice de Pulverização HHI
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Matriz de Concentração de Cotas por SPE
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Avaliação do risco de dependência de grandes cotistas por Sociedade de Propósito Específico
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Filtrar SPE:</label>
            <select
              value={selectedSpeId}
              onChange={(e) => setSelectedSpeId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas as SPEs ({spes.length})</option>
              {spes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid of SPE Cards showing Concentration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speClassification
            .filter((item) => selectedSpeId === "ALL" || item.spe.id === selectedSpeId)
            .map((item) => {
              const top1 = item.cotistasRanked[0];
              const top2 = item.cotistasRanked[1];
              const top3 = item.cotistasRanked[2];

              return (
                <div
                  key={item.spe.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    item.isHighConcentration
                      ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.spe.status}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs line-clamp-1">
                        {item.spe.name}
                      </h3>
                    </div>
                    {item.isHighConcentration ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                        <ShieldAlert className="w-3 h-3 text-amber-500" /> Alta Concentração
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Diversificado
                      </span>
                    )}
                  </div>

                  {/* Progress Bar of Top 3 Concentration */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Concentração Top 3 Cotistas:</span>
                      <span className={item.isHighConcentration ? "text-amber-600 dark:text-amber-400 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                        {item.top3ConcentrationPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isHighConcentration ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, item.top3ConcentrationPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics summary */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total de Cotistas:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.investorsCount} cotistas</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Captação Atual:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        R$ {(item.totalInvestedInSpe / 1000).toFixed(0)}k
                      </strong>
                    </div>
                  </div>

                  {/* Top Cotista Highlights */}
                  {top1 && (
                    <div className="text-[11px] space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium block">Maior Cotista:</span>
                      <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                        <span className="truncate max-w-[140px] font-bold">{top1.investor.name}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          R$ {(top1.amount / 1000).toFixed(0)}k ({top1.sharePct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* CUSTOM INTERACTIVE CHART BUILDER & MULTIDIMENSIONAL ANALYTICS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-purple-500" /> Ferramenta de Análise Dinâmica
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Gerador de Gráficos Personalizados & Filtros Avançados
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monte visões gráficas sob medida cruzando perfil do cliente, volume de aportes, SPEs, cidades e métricas de desempenho.
            </p>
          </div>

          <button
            onClick={handleExportCustomChartCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start lg:self-auto border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" /> Exportar Dados (.CSV)
          </button>
        </div>

        {/* QUICK PRESETS BAR */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Atalhos de Análise Executiva Pronta:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCustomGroupBy("tier");
                setCustomMetric("totalInvested");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              📊 Volume por Porte
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("spe");
                setCustomMetric("totalInvested");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              🏢 Volume por SPE
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("profession");
                setCustomMetric("totalInvested");
                setCustomChartType("pie");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              💼 Volume por Profissão
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("city");
                setCustomMetric("investorCount");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              📍 Clientes por Cidade
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("tier");
                setCustomMetric("avgTicket");
                setCustomChartType("area");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              💎 Ticket Médio por Porte
            </button>

            <button
              onClick={() => {
                setCustomGroupBy("npsCategory");
                setCustomMetric("avgScore");
                setCustomChartType("bar");
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              🎯 Score RI por NPS
            </button>
          </div>
        </div>

        {/* CONTROLS MATRIX (FILTERS & CHART PARAMS) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Group By (Eixo X) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Agrupar por (Eixo X):
              </label>
              <select
                value={customGroupBy}
                onChange={(e) => setCustomGroupBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="tier">Porte / Tier do Cliente</option>
                <option value="spe">SPE / Empreendimento</option>
                <option value="profession">Profissão / Segmento</option>
                <option value="city">Cidade / Estado</option>
                <option value="relacionamento">Nível de Relacionamento</option>
                <option value="npsCategory">Classificação NPS</option>
              </select>
            </div>

            {/* 2. Metric (Eixo Y) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Métrica Analisada:
              </label>
              <select
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="totalInvested">Volume Total (R$ mil)</option>
                <option value="investorCount">Quantidade de Cotistas</option>
                <option value="avgTicket">Ticket Médio (R$ mil)</option>
                <option value="avgScore">Score Médio RI (pts)</option>
              </select>
            </div>

            {/* 3. Chart Format */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Visualização:
              </label>
              <select
                value={customChartType}
                onChange={(e) => setCustomChartType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="bar">📊 Gráfico de Barras</option>
                <option value="pie">🍕 Gráfico de Pizza / Rosca</option>
                <option value="line">📈 Gráfico de Linha</option>
                <option value="area">🏔️ Gráfico de Área</option>
              </select>
            </div>

            {/* 4. Filter SPE */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar SPE:
              </label>
              <select
                value={customSpeFilter}
                onChange={(e) => setCustomSpeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todas as SPEs ({spes.length})</option>
                {spes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Filter Tier */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar Porte/Tier:
              </label>
              <select
                value={customTierFilter}
                onChange={(e) => setCustomTierFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todos os Tiers</option>
                <option value="Essencial">Essencial (&lt; R$ 300k)</option>
                <option value="Select">Select (300k - 800k)</option>
                <option value="Prime">Prime (800k - 2M)</option>
                <option value="Private">Private (&gt; R$ 2M)</option>
                <option value="Institucional">Institucional</option>
              </select>
            </div>

            {/* 6. Filter Profession */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Filtrar Profissão:
              </label>
              <select
                value={customProfessionFilter}
                onChange={(e) => setCustomProfessionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todas as Profissões</option>
                {availableProfessions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CUSTOM SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total do Gráfico</span>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              R$ {(customChartData.reduce((acc, c) => acc + c.totalInvestedRaw, 0) / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10px] text-slate-500">
              {customChartData.reduce((acc, c) => acc + c.investorCountRaw, 0)} cotistas mapeados
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Categorias no Eixo X</span>
            <div className="font-extrabold text-purple-600 dark:text-purple-400 text-base">
              {customChartData.length} grupos
            </div>
            <span className="text-[10px] text-slate-500">Agrupados por {customGroupBy}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Maior Destaque</span>
            <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base truncate">
              {customChartData[0]?.name || "N/A"}
            </div>
            <span className="text-[10px] text-slate-500">{customChartData[0]?.displayValueFormatted || "-"}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Média por Categoria</span>
            <div className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
              {customChartData.length > 0
                ? (
                    customChartData.reduce((acc, c) => acc + c.value, 0) / customChartData.length
                  ).toFixed(1)
                : 0}{" "}
              <span className="text-[10px] font-normal text-slate-400">
                {customMetric === "totalInvested" || customMetric === "avgTicket" ? "k (R$)" : customMetric === "avgScore" ? "pts" : "cot."}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Média simples dos grupos</span>
          </div>
        </div>

        {/* DYNAMIC CHART RENDERER CONTAINER */}
        <div className="h-80 w-full pt-2">
          {customChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Info className="w-8 h-8 text-slate-400 mb-2" />
              Nenhum dado encontrado para os filtros selecionados. Tente alterar os filtros de SPE, Porte ou Profissão.
            </div>
          ) : customChartType === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    customMetric === "totalInvested"
                      ? "Volume Total (R$)"
                      : customMetric === "avgTicket"
                      ? "Ticket Médio (R$)"
                      : customMetric === "avgScore"
                      ? "Score Médio"
                      : "Cotistas",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="value" name={customGroupBy.toUpperCase()} radius={[6, 6, 0, 0]}>
                  {customChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name as InvestorTier] || ["#3b82f6", "#10b981", "#eab308", "#8b5cf6", "#f43f5e", "#06b6d4", "#ec4899", "#6366f1", "#f97316"][index % 9]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : customChartType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {customChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name as InvestorTier] || ["#3b82f6", "#10b981", "#eab308", "#8b5cf6", "#f43f5e", "#06b6d4", "#ec4899", "#6366f1", "#f97316"][index % 9]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Métrica",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : customChartType === "line" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Valor",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#8b5cf6" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any, props: any) => [
                    props.payload.displayValueFormatted,
                    "Valor",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* FILTERABLE INVESTOR CLASSIFICATION LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Tabela de Classificação Individual de Cotistas ({filteredInvestors.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Filtre investidores por SPE, Tier de Score e Categoria de Portfolio
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cotista, CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas as Classificações</option>
              <option value="Essencial">Essencial (até R$ 300k)</option>
              <option value="Select">Select (R$ 300k - 800k)</option>
              <option value="Prime">Prime (R$ 800k - 2M)</option>
              <option value="Private">Private (&gt; R$ 2M)</option>
              <option value="Institucional">Institucional (Empresas/Fundos)</option>
            </select>

            {/* Bracket Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas as Faixas de Aporte</option>
              <option value="Essencial (até R$ 300 mil)">Essencial (até R$ 300 mil)</option>
              <option value="Select (R$ 300 mil a R$ 800 mil)">Select (R$ 300k - R$ 800k)</option>
              <option value="Prime (R$ 800 mil a R$ 2 milhões)">Prime (R$ 800k - R$ 2M)</option>
              <option value="Private (acima de R$ 2 milhões)">Private (acima de R$ 2M)</option>
              <option value="Institucional (Empresas/Fundos)">Institucional (Empresas/Fundos)</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="p-3">Investidor / Cotista</th>
                <th className="p-3">Classificação Tier</th>
                <th className="p-3">Profissão / Cidade</th>
                <th className="p-3">SPEs Vinculadas</th>
                <th className="p-3 text-right">Total Aportado</th>
                <th className="p-3 text-center">Score RI</th>
                <th className="p-3 text-center">NPS</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nenhum cotista encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={inv.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                          alt={inv.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{inv.name}</div>
                          <div className="text-[10px] text-slate-400">{inv.cpfCnpj}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: `${TIER_COLORS[inv.tier]}20`,
                          color: TIER_COLORS[inv.tier],
                          border: `1px solid ${TIER_COLORS[inv.tier]}40`,
                        }}
                      >
                        {inv.tier}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{inv.bracket}</span>
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{inv.profession}</div>
                      <div className="text-[10px] text-slate-400">{inv.city} - {inv.state}</div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {inv.speList.length === 0 ? (
                          <span className="text-[10px] text-slate-400">Sem SPE ativa</span>
                        ) : (
                          inv.speList.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                              {s.name.split("-")[0].trim()}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">
                        R$ {inv.totalInvested.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-slate-400">{inv.contractsCount} contratos</div>
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-block font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                        {inv.score}/100
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.npsCategory === "Promotor"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : inv.npsCategory === "Neutro"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {inv.npsCategory}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setCurrentInvestorId(inv.id)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold rounded-lg border border-blue-200 dark:border-blue-800 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        Abrir Ficha <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
