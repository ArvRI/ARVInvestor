import React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  PieChart,
  BrainCircuit,
  UserCheck,
  Building,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Database,
  Calculator,
  Tag,
  Receipt,
  Table,
} from "lucide-react";
import { ARVLogo } from "../common/ARVLogo";
import { useApp } from "../../context/AppContext";

export type ActiveTab =
  | "portal"
  | "crm"
  | "pricing"
  | "profitability"
  | "marketing"
  | "spes"
  | "communication"
  | "dashboard"
  | "intelligence"
  | "sienge";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, investors, spes, contracts, darkMode, toggleDarkMode } = useApp();

  const navItems = [
    {
      id: "portal" as ActiveTab,
      label: "Portal do Investidor",
      icon: UserCheck,
      badge: "Investidor",
      allowedRoles: ["ADMIN", "RI_MANAGER", "INVESTOR", "COMERCIAL", "FINANCEIRO"],
    },
    {
      id: "crm" as ActiveTab,
      label: "CRM Investidores",
      icon: Users,
      badge: `${investors.length}`,
      allowedRoles: ["ADMIN", "RI_MANAGER", "COMERCIAL", "MARKETING"],
    },
    {
      id: "pricing" as ActiveTab,
      label: "Tabela de Vendas & CUB",
      icon: Table,
      badge: "Preços",
      allowedRoles: ["ADMIN", "RI_MANAGER", "COMERCIAL", "FINANCEIRO", "ENGENHARIA", "MARKETING"],
    },
    {
      id: "profitability" as ActiveTab,
      label: "Rentabilidade & Comparativos",
      icon: TrendingUp,
      badge: "CDI / IPCA",
      allowedRoles: ["ADMIN", "RI_MANAGER", "FINANCEIRO", "COMERCIAL", "INVESTOR", "MARKETING"],
    },
    {
      id: "marketing" as ActiveTab,
      label: "Marketing & Funil",
      icon: Target,
      badge: "Módulo 7",
      allowedRoles: ["ADMIN", "RI_MANAGER", "COMERCIAL", "MARKETING"],
    },
    {
      id: "spes" as ActiveTab,
      label: "SPEs & Obras",
      icon: Building2,
      badge: `${spes.length}`,
      allowedRoles: ["ADMIN", "RI_MANAGER", "FINANCEIRO", "ENGENHARIA", "COMERCIAL"],
    },
    {
      id: "communication" as ActiveTab,
      label: "Comunicação",
      icon: Mail,
      badge: "Newsletter",
      allowedRoles: ["ADMIN", "RI_MANAGER", "MARKETING"],
    },
    {
      id: "dashboard" as ActiveTab,
      label: "Dashboard Executivo",
      icon: PieChart,
      badge: "BI",
      allowedRoles: ["ADMIN", "RI_MANAGER", "FINANCEIRO", "COMERCIAL"],
    },
    {
      id: "intelligence" as ActiveTab,
      label: "Intelligence IA",
      icon: BrainCircuit,
      badge: "Score",
      allowedRoles: ["ADMIN", "RI_MANAGER", "COMERCIAL", "MARKETING"],
    },
    {
      id: "sienge" as ActiveTab,
      label: "Integração Sienge ERP",
      icon: Database,
      badge: "OAuth 2.0",
      allowedRoles: ["ADMIN", "RI_MANAGER", "FINANCEIRO", "COMERCIAL", "ENGENHARIA", "MARKETING"],
    },
  ];

  const totalVgv = spes.reduce((acc, curr) => acc + curr.totalVgv, 0);

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 select-none shrink-0 transition-colors">
      {/* Top Logo & Brand Area */}
      <div>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <ARVLogo showTagline size="md" />
        </div>

        {/* Quick System KPIs */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <Building className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>5 SPEs Ativas</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>R$ {(totalVgv / 1000000).toFixed(0)}M VGV</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Módulos da Plataforma
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAllowed =
              currentRole === "ADMIN" || item.allowedRoles.includes(currentRole);

            if (!isAllowed) return null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Footer Info & Theme Switcher */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
            AR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Admin ARV</p>
            <p className="text-[10px] text-slate-500 truncate">{contracts.length} Contratos</p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
          title={darkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          aria-label="Alternar Tema Claro/Escuro"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </aside>
  );
};
