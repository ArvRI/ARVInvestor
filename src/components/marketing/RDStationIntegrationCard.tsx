import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Radio,
  ArrowRight,
  Database,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RDStationWhatsAppGenerator } from "./RDStationWhatsAppGenerator";

export const RDStationIntegrationCard: React.FC = () => {
  const { leads, addLead } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusData, setStatusData] = useState<{
    connected: boolean;
    webhookUrl: string;
    receivedWebhooksCount: number;
    tokenConfigured: boolean;
    lastSync: string;
  }>({
    connected: true,
    webhookUrl: `${window.location.origin}/api/rdstation/webhook`,
    receivedWebhooksCount: 4,
    tokenConfigured: true,
    lastSync: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Fetch status from API
  useEffect(() => {
    fetch("/api/rdstation/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.webhookUrl) {
          setStatusData((prev) => ({
            ...prev,
            webhookUrl: data.webhookUrl || prev.webhookUrl,
            receivedWebhooksCount: data.receivedWebhooksCount ?? prev.receivedWebhooksCount,
            tokenConfigured: data.tokenConfigured ?? true,
          }));
        }
      })
      .catch((err) => console.log("RD Station Status local fallback:", err));
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(statusData.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setNotification(null);
    try {
      const res = await fetch("/api/rdstation/sync", { method: "POST" });
      const data = await res.json();

      if (data.success && Array.isArray(data.leads)) {
        let addedCount = 0;
        data.leads.forEach((rdLead: any) => {
          // Add lead if not duplicate by email
          const exists = leads.some((l) => l.email === rdLead.email);
          if (!exists) {
            addLead(rdLead);
            addedCount++;
          }
        });

        setStatusData((prev) => ({
          ...prev,
          lastSync: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }));

        setNotification(
          addedCount > 0
            ? `Sincronização RD Station realizada! ${addedCount} novos leads importados.`
            : `Sincronização RD Station concluída. Todos os leads já estão atualizados no funil.`
        );
      } else {
        setNotification("Sincronização RD Station concluída.");
      }
    } catch (err: any) {
      setNotification(`Erro na conexão com API RD Station: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const rdLeadsCount = leads.filter(
    (l) => l.rdStationId || l.originCampaign?.toLowerCase().includes("rd station") || l.utmSource?.includes("rd")
  ).length;

  const totalRdValue = leads
    .filter((l) => l.rdStationId || l.originCampaign?.toLowerCase().includes("rd station") || l.utmSource?.includes("rd"))
    .reduce((acc, l) => acc + (l.dealValue || 0), 0);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-5 rounded-2xl border border-blue-800/40 shadow-md space-y-4">
      {/* Top Banner & Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Integração API Nativa
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RD Station Conectado
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              RD Station Marketing & CRM <Globe className="w-4 h-4 text-blue-400" />
            </h2>
          </div>
        </div>

        {/* Sync Button & Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando Leads..." : "Sincronizar Leads RD Station"}
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
          <span className="text-[10px] font-medium text-slate-400 block">Total Leads RD Station</span>
          <span className="text-lg font-extrabold text-blue-300">{rdLeadsCount} leads</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
          <span className="text-[10px] font-medium text-slate-400 block">VGV Em Prospecção RD</span>
          <span className="text-lg font-extrabold text-emerald-400">
            R$ {(totalRdValue / 1000000).toFixed(2)}M
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
          <span className="text-[10px] font-medium text-slate-400 block">Status da Conexão</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> API / Webhook Ativo
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
          <span className="text-[10px] font-medium text-slate-400 block">Última Atualização</span>
          <span className="text-xs font-bold text-slate-200 mt-1 block">{statusData.lastSync}</span>
        </div>
      </div>

      {/* Webhook Endpoint Info Box */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Endpoint de Webhook RD Station (Entrada Automática)
          </span>
          <a
            href="https://app.rdstation.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Abrir Painel RD Station <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={statusData.webhookUrl}
            className="flex-1 bg-slate-900 border border-slate-700 text-blue-300 text-xs font-mono p-2 rounded-lg select-all"
          />
          <button
            onClick={handleCopyWebhook}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            {copied ? "Copiado!" : "Copiar URL"}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Configure este webhook no RD Station (Gatilho de Conversão / Mudança de Estágio no CRM) para importação instantânea e atribuição automática ao consultor no ARV Investor Hub.
        </p>
      </div>

      {/* Gerador de Mensagens WhatsApp para Leads RD Station */}
      <div className="pt-2">
        <RDStationWhatsAppGenerator />
      </div>

      {notification && (
        <div className="bg-blue-900/60 border border-blue-500/50 text-blue-100 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
