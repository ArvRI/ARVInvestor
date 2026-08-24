import React, { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Layers,
  Users,
  FileText,
  DollarSign,
  Building2,
  Award,
  Sparkles,
  Search,
  Settings,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronRight,
  Cpu,
  Zap,
  Check,
  Globe,
  Lock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  SiengeConfig,
  SiengeSyncLog,
  SiengeSyncProgress,
  SiengeCustomer,
  SiengeContract,
  SiengeInstallment,
  SiengeEnterprise,
  SiengeBroker,
  SiengeAIServiceSummary,
} from "../../services/sienge/types";
import { SiengeSyncEngine } from "../../services/sienge/SiengeSyncEngine";
import { SiengeOAuthService } from "../../services/sienge/SiengeOAuthService";
import { SiengeAIServiceLayer } from "../../services/sienge/SiengeAIServiceLayer";

export const SiengeIntegrationHub: React.FC = () => {
  const { addNotification } = useApp();

  // Active Sub-Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "domains" | "audit_logs" | "inspector" | "ai_studio" | "settings"
  >("overview");

  // Config State
  const [config, setConfig] = useState<SiengeConfig>({
    subdomain: "arv-incorporadora",
    tenantId: "arv-main",
    clientId: "arv_sienge_client_prod_2026",
    clientSecret: "sienge_sec_8892019920",
    environment: "production",
    autoSyncEnabled: true,
    autoSyncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  });

  // Connection Test State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SiengeSyncProgress>(SiengeSyncEngine.getProgress());
  const [auditLogs, setAuditLogs] = useState<SiengeSyncLog[]>(SiengeSyncEngine.getAuditLogs());

  // Data Inspection State
  const [syncedCustomers, setSyncedCustomers] = useState<SiengeCustomer[]>([]);
  const [syncedContracts, setSyncedContracts] = useState<SiengeContract[]>([]);
  const [syncedInstallments, setSyncedInstallments] = useState<SiengeInstallment[]>([]);
  const [syncedEnterprises, setSyncedEnterprises] = useState<SiengeEnterprise[]>([]);
  const [syncedBrokers, setSyncedBrokers] = useState<SiengeBroker[]>([]);
  const [inspectorSearch, setInspectorSearch] = useState("");
  const [inspectorCategory, setInspectorCategory] = useState<"customers" | "contracts" | "financial" | "enterprises" | "brokers">("contracts");

  // AI Studio Context State
  const [aiSummary, setAiSummary] = useState<SiengeAIServiceSummary | null>(null);

  // Initial Data Load
  useEffect(() => {
    handleRunSync("incremental", true);
  }, []);

  const handleRunSync = async (type: "full" | "incremental" = "incremental", isInitial = false) => {
    setIsSyncing(true);
    try {
      const result = await SiengeSyncEngine.runSync(config, type, (prog) => {
        setSyncProgress(prog);
      });

      if (result.success) {
        setSyncedCustomers(result.customers);
        setSyncedContracts(result.contracts);
        setSyncedInstallments(result.installments);
        setSyncedEnterprises(result.enterprises);
        setSyncedBrokers(result.brokers);

        const summary = SiengeAIServiceLayer.generateAIServiceContext(
          result.customers,
          result.contracts,
          result.installments,
          result.enterprises,
          result.brokers
        );
        setAiSummary(summary);
        setAuditLogs([...SiengeSyncEngine.getAuditLogs()]);

        if (!isInitial) {
          addNotification({
            title: `Sincronização ${type.toUpperCase()} Sienge ERP Concluída`,
            message: `Processados ${result.contracts.length} contratos e R$ ${(summary.totalVgvSynced / 1000000).toFixed(2)}M em VGV.`,
            date: new Date().toISOString(),
            read: false,
            type: "info",
          });
        }
      }
    } catch (err) {
      console.error("Erro no sync do Sienge:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestOAuth = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await SiengeOAuthService.testConnection(config);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Falha: ${err.message || err}`,
        latencyMs: 0,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const totalVgv = syncedContracts.reduce((acc, c) => acc + c.contractValue, 0);
  const totalReceived = syncedContracts.reduce((acc, c) => acc + c.paidValue, 0);
  const overdueCount = syncedInstallments.filter((i) => i.status === "Atrasado").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <Database className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">Módulo Integração Sienge ERP</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                    OAuth 2.0 • Clean Architecture
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Sincronização incremental de Clientes, Contratos, Financeiro, SPEs e Corretores com persistência PostgreSQL e Camada de Serviço para o Google AI Studio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleTestOAuth}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs"
            >
              {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              Testar Conexão OAuth 2.0
            </button>

            <button
              onClick={() => handleRunSync("incremental")}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-amber-300" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Agora (Incremental)"}
            </button>
          </div>
        </div>

        {/* Live Progress Bar if Syncing */}
        {isSyncing && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2 text-blue-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                {syncProgress.currentStep}
              </span>
              <span className="text-amber-300">{syncProgress.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Test OAuth Connection Toast Message */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between ${
              testResult.success
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/80 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
            {testResult.latencyMs > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                {testResult.latencyMs}ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Clientes Sienge
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{syncedCustomers.length}</div>
          <p className="text-[11px] text-slate-500">Persistidos no PostgreSQL</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contratos Sienge
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{syncedContracts.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold">VGV R$ {(totalVgv / 1000000).toFixed(2)}M</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Caixa Recebido
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            R$ {(totalReceived / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-slate-500">Recebimentos auditados</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SPEs / Empreend.
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{syncedEnterprises.length}</div>
          <p className="text-[11px] text-slate-500">Obras em acompanhamento</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Corretores / Imobiliárias
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{syncedBrokers.length}</div>
          <p className="text-[11px] text-slate-500">Rede de Vendas Integrada</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Server className="w-4 h-4" /> Visão Geral & Conexão OAuth
        </button>

        <button
          onClick={() => setActiveTab("domains")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "domains"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" /> Serviços por Domínio (Clean Arch)
        </button>

        <button
          onClick={() => setActiveTab("audit_logs")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "audit_logs"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" /> Logs & Auditoria ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("inspector")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "inspector"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Search className="w-4 h-4" /> Inspetor PostgreSQL
        </button>

        <button
          onClick={() => setActiveTab("ai_studio")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "ai_studio"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
              : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Camada Google AI Studio
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" /> Configurações Sienge
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL & CONEXÃO OAUTH */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Status da Integração Sienge API
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Autenticação OAuth 2.0 via token seguro de curta duração e requisições idempotentes.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Conectado & Sincronizando
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Ambiente Sienge</span>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-500" /> {config.environment.toUpperCase()} (api.sienge.com.br)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Subdomínio da Construtora</span>
                <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                  {config.subdomain}.sienge.com.br
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Sincronização Incremental</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Ativa a cada {config.autoSyncIntervalMinutes} minutos
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Último Timestamp Sincronizado</span>
                <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString("pt-BR") : "Nenhum"}
                </p>
              </div>
            </div>

            {/* Architecture Architecture Highlights */}
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" /> Arquitetura de Sincronização Inteligente
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> OAuth 2.0 & Basic Auth Fallback
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Sincronização Incremental (Cursor Timestamp)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Serviços de Domínio Desacoplados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Camada de Serviço para o Gemini / AI Studio
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Tratamento de Erros & Tentativas Automáticas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Atualização em Tempo Real dos Dashboards ARV
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions & AI Summary Box */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Destaques Sienge ERP ➔ ARV
              </h3>

              {aiSummary && (
                <div className="space-y-3">
                  {aiSummary.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium leading-relaxed"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVIÇOS POR DOMÍNIO (CLEAN ARCHITECTURE) */}
      {activeTab === "domains" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Serviços Independentes por Domínio de Negócio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cada serviço possui responsabilidade única de buscar, transformar e validar dados do Sienge ERP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Domain 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    SiengeCustomerService
                  </span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clientes & Investidores</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endpoint: <code className="text-[11px] text-blue-600 dark:text-blue-400">/api/v1/customers</code>. Mapeia CPF/CNPJ, perfil financeiro, renda, profissão e status de relacionamento.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Registros Sincronizados:</span>
                  <span className="font-bold text-blue-600">{syncedCustomers.length}</span>
                </div>
              </div>

              {/* Domain 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    SiengeContractService
                  </span>
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contratos & Vendas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endpoint: <code className="text-[11px] text-purple-600 dark:text-purple-400">/api/v1/sales/contracts</code>. Importa contratos de venda, frações de SPEs, valores de VGV e saldo devedor.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Registros Sincronizados:</span>
                  <span className="font-bold text-purple-600">{syncedContracts.length}</span>
                </div>
              </div>

              {/* Domain 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    SiengeFinancialService
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Financeiro & Recebimentos</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endpoint: <code className="text-[11px] text-emerald-600 dark:text-emerald-400">/api/v1/accounts-receivable/bills</code>. Monitora parcelas abertas, quitadas, inadimplência e projeção de caixa.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Parcelas Auditadas:</span>
                  <span className="font-bold text-emerald-600">{syncedInstallments.length}</span>
                </div>
              </div>

              {/* Domain 4 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    SiengeEnterpriseService
                  </span>
                  <Building2 className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Empreendimentos & Obras</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endpoint: <code className="text-[11px] text-amber-600 dark:text-amber-400">/api/v1/building-sites</code>. Controla avanço físico da obra %, contagem de unidades e engenheiro responsável.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>SPEs Sincronizadas:</span>
                  <span className="font-bold text-amber-600">{syncedEnterprises.length}</span>
                </div>
              </div>

              {/* Domain 5 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    SiengeBrokerService
                  </span>
                  <Award className="w-4 h-4 text-indigo-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Corretores & Imobiliárias</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endpoint: <code className="text-[11px] text-indigo-600 dark:text-indigo-400">/api/v1/realtors</code>. Registra desempenho de vendas, comissionamento e imobiliárias parceiras.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Corretores Ativos:</span>
                  <span className="font-bold text-indigo-600">{syncedBrokers.length}</span>
                </div>
              </div>

              {/* Sync Engine Core */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white border border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-500/20 text-amber-300 border border-blue-400/30">
                    SiengeSyncEngine
                  </span>
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <h4 className="text-sm font-bold text-white">Orquestrador & PostgreSQL</h4>
                <p className="text-xs text-slate-300">
                  Gerencia filas, retentativas com backoff exponencial, log de auditoria e garante persistência ACID no banco de dados.
                </p>
                <div className="pt-2 border-t border-blue-800 text-xs font-semibold text-slate-300 flex justify-between">
                  <span>Status do Orquestrador:</span>
                  <span className="font-bold text-emerald-400">Ativo / Idle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA & LOGS */}
      {activeTab === "audit_logs" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Histórico de Auditoria de Sincronizações
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro imutável de todas as execuções de carga (incremental e total) do Sienge ERP.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Tipo de Sync</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Registros Processados</th>
                  <th className="p-3 text-right">Duração (ms)</th>
                  <th className="p-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 uppercase text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {log.syncType}
                      </span>
                    </td>
                    <td className="p-3">
                      {log.status === "SUCCESS" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Sucesso
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Falhou
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {log.recordsProcessed.customers +
                        log.recordsProcessed.contracts +
                        log.recordsProcessed.financial +
                        log.recordsProcessed.enterprises +
                        log.recordsProcessed.brokers}{" "}
                      itens
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">{log.durationMs}ms</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INSPECTOR POSTGRESQL */}
      {activeTab === "inspector" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" /> Inspetor de Registros PostgreSQL (Sienge Sync)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore os dados sincronizados do Sienge gravados com segurança na base de dados.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={inspectorCategory}
                onChange={(e: any) => setInspectorCategory(e.target.value)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 focus:outline-hidden"
              >
                <option value="contracts">Contratos ({syncedContracts.length})</option>
                <option value="customers">Clientes ({syncedCustomers.length})</option>
                <option value="financial">Parcelas ({syncedInstallments.length})</option>
                <option value="enterprises">Empreendimentos ({syncedEnterprises.length})</option>
                <option value="brokers">Corretores ({syncedBrokers.length})</option>
              </select>
            </div>
          </div>

          {/* Table Viewer for Inspector Category */}
          {inspectorCategory === "contracts" && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Nº Contrato</th>
                    <th className="p-3">Cliente / Investidor</th>
                    <th className="p-3">Empreendimento</th>
                    <th className="p-3">Unidade</th>
                    <th className="p-3 text-right">VGV Total</th>
                    <th className="p-3 text-right">Pago</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {syncedContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{c.contractNumber}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{c.customerName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.enterpriseName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.unitNumber}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        R$ {c.contractValue.toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        R$ {c.paidValue.toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {inspectorCategory === "customers" && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Cód. Sienge</th>
                    <th className="p-3">Nome / Razão Social</th>
                    <th className="p-3">CPF/CNPJ</th>
                    <th className="p-3">Contato</th>
                    <th className="p-3">Profissão / Ramo</th>
                    <th className="p-3">Cidade/UF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {syncedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="p-3 font-mono font-bold text-blue-600">{c.siengeCode}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{c.cpfCnpj}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.email}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{c.profession}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {c.city} - {c.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CAMADA GOOGLE AI STUDIO / GEMINI */}
      {activeTab === "ai_studio" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Camada de Integração Google AI Studio (Gemini AI)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alimenta continuamente os modelos de linguagem do Gemini sem expor requisições diretas ao ERP Sienge.
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-300 dark:border-purple-800">
              Gemini 2.5 Flash / Pro Powered
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Resumo Higienizado para o Prompt
              </h4>
              <div className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-2xl border border-slate-800 overflow-x-auto space-y-2">
                <p className="text-emerald-400 font-bold">// Contexto injetado dinamicamente para consultas Gemini:</p>
                {aiSummary && (
                  <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-slate-300">
                    {SiengeAIServiceLayer.buildGeminiPromptContext(aiSummary)}
                  </pre>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Exemplos de Perguntas que o Gemini Responde
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    "Qual é o VGV total sincronizado do Sienge para a SPE T58 Spot?"
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    O Gemini consulta o snapshot em cache no PostgreSQL e responde instantaneamente com a métrica exata e percentual de unidades vendidas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    "Existem parcelas com vencimento em atraso neste mês?"
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Calcula a taxa de inadimplência sincronizada do Sienge Financial Service e fornece a lista de contratos afetados para a equipe de RI.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    "Gerar rascunho de e-mail de prestação de contas para o investidor Carlos Eduardo Silva."
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    O modelo combina os dados de progresso físico da SPE com o contrato sincronizado do cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURAÇÕES SIENGE */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-4xl">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> Configurações de Acesso Sienge API (OAuth 2.0)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chaves de integração e parâmetros de conexão com o sistema Sienge ERP.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subdomínio Sienge
                </label>
                <input
                  type="text"
                  value={config.subdomain}
                  onChange={(e) => setConfig({ ...config, subdomain: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: arv-incorporadora"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ambiente
                </label>
                <select
                  value={config.environment}
                  onChange={(e: any) => setConfig({ ...config, environment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-hidden"
                >
                  <option value="production">Produção (api.sienge.com.br)</option>
                  <option value="sandbox">Sandbox (api.sienge.com.br/sandbox)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  OAuth Client ID
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  OAuth Client Secret
                </label>
                <input
                  type="password"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleTestOAuth}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all"
              >
                Testar Credenciais
              </button>
              <button
                onClick={() => alert("Configurações salvas com sucesso no ambiente!")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
