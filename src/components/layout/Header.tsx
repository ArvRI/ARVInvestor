import React, { useState } from "react";
import {
  Search,
  Moon,
  Sun,
  Bell,
  UserCheck,
  Building2,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import { ARVLogo } from "../common/ARVLogo";

interface HeaderProps {
  onOpenNewInvestor: () => void;
  onOpenNewSPE: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewInvestor, onOpenNewSPE }) => {
  const {
    currentRole,
    setCurrentRole,
    currentInvestorId,
    setCurrentInvestorId,
    currentInvestor,
    investors,
    darkMode,
    toggleDarkMode,
    setIsSearchOpen,
    notifications,
    markNotificationRead,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isInvestorDropdownOpen, setIsInvestorDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Administrador (Acesso Total)",
    RI_MANAGER: "Gerente Relações com Investidores",
    COMERCIAL: "Comercial / Vendas",
    FINANCEIRO: "Financeiro & Controladoria",
    ENGENHARIA: "Engenharia & Obras",
    MARKETING: "Marketing & Comunicação",
    INVESTOR: "Visão do Investidor",
  };

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors">
      {/* Left Area: Brand Logo on mobile & Global Search Trigger */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
          <ARVLogo size="sm" />
        </div>

        <div className="relative w-64 sm:w-80 md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            readOnly
            onClick={() => setIsSearchOpen(true)}
            placeholder="Buscar investidores, SPEs ou documentos..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md py-2 pl-10 pr-12 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-2.5 px-1.5 py-0.5 bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Active Investor Switcher when in INVESTOR role or previewing */}
        <div className="relative">
          <button
            onClick={() => setIsInvestorDropdownOpen(!isInvestorDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-medium transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span className="max-w-[140px] truncate font-semibold">{currentInvestor.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isInvestorDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Simular Acesso do Investidor
              </div>
              {investors.slice(0, 10).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setCurrentInvestorId(inv.id);
                    setIsInvestorDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    inv.id === currentInvestorId
                      ? "font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="truncate">
                    <div>{inv.name}</div>
                    <div className="text-[10px] text-slate-400">Score {inv.score} • {inv.tier}</div>
                  </div>
                  {inv.id === currentInvestorId && <Check className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Actions, Notifications, Role Switcher, Dark Mode */}
      <div className="flex items-center gap-3">
        {/* Quick Add Buttons */}
        {currentRole !== "INVESTOR" && (
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenNewInvestor}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Novo Investimento
            </button>
            <button
              onClick={onOpenNewSPE}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" /> SPE
            </button>
          </div>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Alternar Tema Claro/Escuro"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Comunicados e Alertas</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  {unreadNotifs.length} novos
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      n.read
                        ? "bg-slate-50 dark:bg-slate-800/30 opacity-70"
                        : "bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      {n.title}
                      <span className="text-[10px] text-slate-400 font-normal">{n.date}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 transition-colors shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="hidden md:inline">{roleLabels[currentRole].split(" ")[0]}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Perfil de Acesso (Perfil Demo)
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    r === currentRole
                      ? "font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{roleLabels[r]}</span>
                  {r === currentRole && <Check className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
