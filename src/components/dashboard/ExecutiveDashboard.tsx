import React, { useState } from "react";
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Award,
  Calendar,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { useApp } from "../../context/AppContext";

export const ExecutiveDashboard: React.FC = () => {
  const { spes, investors, contracts } = useApp();
  const [selectedSpeFilter, setSelectedSpeFilter] = useState<string>("ALL");

  // KPI calculations
  const totalVgvAll = spes.reduce((acc, s) => acc + s.totalVgv, 0);
  const totalCaptaçãoAll = spes.reduce((acc, s) => acc + s.totalCaptação, 0);
  const percentCaptaçãoAll = Number(((totalCaptaçãoAll / totalVgvAll) * 100).toFixed(1));

  // Chart Data 1: VGV Captado vs Meta por SPE
  const vgvBySpeData = spes.map((s) => ({
    name: s.name.replace("SPE ARV ", ""),
    captado: Math.round(s.totalCaptação / 1000000),
    meta: Math.round(s.totalVgv / 1000000),
  }));

  // Chart Data 2: Evolução de Aportes por Mês (2025/2026)
  const monthlyCaptaçãoData = [
    { mes: "Jan/25", valor: 12 },
    { mes: "Mar/25", valor: 18 },
    { mes: "Mai/25", valor: 25 },
    { mes: "Jul/25", valor: 32 },
    { mes: "Set/25", valor: 45 },
    { mes: "Nov/25", valor: 58 },
    { mes: "Jan/26", valor: 72 },
    { mes: "Mar/26", valor: 95 },
    { mes: "Mai/26", valor: 120 },
    { mes: "Jul/26", valor: 138 },
  ];

  // Chart Data 3: Score Tier Distribution
  const tierCountsMap: Record<string, number> = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0, Risco: 0 };
  investors.forEach((i) => {
    tierCountsMap[i.tier] = (tierCountsMap[i.tier] || 0) + 1;
  });

  const tierDistributionData = Object.keys(tierCountsMap).map((key) => ({
    name: key,
    value: tierCountsMap[key],
  }));

  const COLORS = ["#a855f7", "#f59e0b", "#64748b", "#f97316", "#f43f5e"];

  // Top Investors Ranking
  const topInvestors = [...investors]
    .map((inv) => {
      const invContracts = contracts.filter((c) => c.investorId === inv.id);
      const total = invContracts.reduce((acc, c) => acc + c.investedAmount, 0);
      return { ...inv, totalInvested: total };
    })
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-amber-500" /> Dashboard Executivo & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Métricas estratégicas de VGV, performance de captação por SPE, curva de aportes e analytics do portfólio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSpeFilter}
            onChange={(e) => setSelectedSpeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            <option value="ALL">Todas as SPEs (Consolidado ARV)</option>
            {spes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">AUM / VGV Total</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
            R$ {(totalVgvAll / 1000000).toFixed(1)} Milhões
          </h3>
          <div className="flex items-center mt-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>12% vs mês anterior</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Investidores Ativos</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{investors.length}</h3>
          <p className="text-xs text-slate-400 mt-2">+4 novos esta semana</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Score Médio</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-400">
            78.4 <span className="text-sm font-normal text-slate-400">/100</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2">Classificação: <span className="text-blue-600 dark:text-blue-400 font-medium">Gold</span></p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Obras em Andamento</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">05</h3>
          <p className="text-xs text-slate-400 mt-2">02 com entrega em 180 dias</p>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Captação vs VGV por SPE */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Captação Realizada vs VGV Previsto (R$ Milhões)</h3>
            <span className="text-xs text-slate-400 font-medium">Comparativo SPE</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vgvBySpeData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="captado" fill="#1d4ed8" name="Captado (R$M)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" fill="#cbd5e1" name="Meta VGV (R$M)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Evolução Temporal de Captação */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Curva de Captação Acumulada (2025 - 2026)</h3>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold">R$ 138M Acumulados</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCaptaçãoData}>
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="valor" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorCap)" name="R$ Milhões" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Pie Chart Score Tier & Top Investors Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Distribution by Tier */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Distribuição do Portfólio por Tier</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierDistributionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] justify-center">
            {tierDistributionData.map((t, idx) => (
              <span key={t.name} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                {t.name}: {t.value}
              </span>
            ))}
          </div>
        </div>

        {/* Top 5 Investors Ranking Table */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Top Investidores</h3>
            <span className="text-blue-700 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">Ver todos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-4 py-3">Investidor</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-right">Total Investido</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topInvestors.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={inv.avatarUrl} alt={inv.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{inv.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {inv.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold italic ${
                        inv.tier === "Platinum"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : inv.tier === "Gold"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {inv.tier.toUpperCase()} {inv.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                      R$ {inv.totalInvested.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 text-[10px] font-bold">
                        ATIVO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
