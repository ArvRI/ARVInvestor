import {
  SiengeAIServiceSummary,
  SiengeCustomer,
  SiengeContract,
  SiengeInstallment,
  SiengeEnterprise,
  SiengeBroker,
} from "./types";
import { SiengeSyncEngine } from "./SiengeSyncEngine";

export class SiengeAIServiceLayer {
  /**
   * Generates a structured, sanitized data snapshot of Sienge synced records
   * for Gemini AI Studio natural language queries.
   */
  public static generateAIServiceContext(
    customers: SiengeCustomer[],
    contracts: SiengeContract[],
    installments: SiengeInstallment[],
    enterprises: SiengeEnterprise[],
    brokers: SiengeBroker[]
  ): SiengeAIServiceSummary {
    const totalVgvSynced = contracts.reduce((acc, c) => acc + c.contractValue, 0);
    const totalReceivedSynced = contracts.reduce((acc, c) => acc + c.paidValue, 0);
    const totalReceivableSynced = contracts.reduce((acc, c) => acc + c.balanceValue, 0);

    const overdueCount = installments.filter((i) => i.status === "Atrasado").length;
    const totalInstallmentsCount = installments.length || 1;
    const delinquencyRate = Number(((overdueCount / totalInstallmentsCount) * 100).toFixed(1));

    const lastSyncLog = SiengeSyncEngine.getAuditLogs()[0];

    const highlights: string[] = [
      `VGV Total Sincronizado do Sienge ERP: R$ ${(totalVgvSynced / 1000000).toFixed(2)}M em ${contracts.length} contratos ativos.`,
      `Valor Total Recebido: R$ ${(totalReceivedSynced / 1000000).toFixed(2)}M (${((totalReceivedSynced / (totalVgvSynced || 1)) * 100).toFixed(1)}% de adimplência acumulada).`,
      `Taxa de Inadimplência Atual: ${delinquencyRate}% (${overdueCount} parcelas vencidas sob acompanhamento financeiro).`,
      `Empreendimentos em Acompanhamento: ${enterprises.length} SPEs com avanço físico médio de ${(enterprises.reduce((acc, e) => acc + e.physicalProgress, 0) / (enterprises.length || 1)).toFixed(1)}%.`,
      `Rede de Corretores/Imobiliárias: ${brokers.length} parceiros cadastrados com R$ ${(brokers.reduce((acc, b) => acc + b.totalSalesVgv, 0) / 1000000).toFixed(2)}M em vendas Sienge.`,
    ];

    const enterprisesOverview = enterprises.map((e) => ({
      name: e.name,
      totalVgv: e.totalVgv,
      unitsSold: e.soldUnits,
      totalUnits: e.totalUnits,
      progressPercentage: e.physicalProgress,
    }));

    return {
      enterpriseCount: enterprises.length,
      activeContractsCount: contracts.length,
      totalVgvSynced,
      totalReceivedSynced,
      totalReceivableSynced,
      delinquencyRate,
      activeCustomersCount: customers.length,
      activeBrokersCount: brokers.length,
      lastIncrementalSyncAt: lastSyncLog ? lastSyncLog.timestamp : null,
      highlights,
      enterprisesOverview,
      recentSyncAuditLogs: SiengeSyncEngine.getAuditLogs().slice(0, 5),
    };
  }

  /**
   * Safe natural language context string for Gemini prompt injection
   */
  public static buildGeminiPromptContext(summary: SiengeAIServiceSummary): string {
    return `
=== SIENGE ERP SYNCHRONIZED CONTEXT (ARVINVESTOR CRM) ===
Sincronização Incremental Mais Recente: ${summary.lastIncrementalSyncAt || "Nunca"}
- Total de Empreendimentos/SPEs: ${summary.enterpriseCount}
- Contratos Ativos Importados: ${summary.activeContractsCount}
- VGV Total Sincronizado: R$ ${summary.totalVgvSynced.toLocaleString("pt-BR")}
- Total Já Recebido (Caixa): R$ ${summary.totalReceivedSynced.toLocaleString("pt-BR")}
- Saldo a Receber: R$ ${summary.totalReceivableSynced.toLocaleString("pt-BR")}
- Taxa de Inadimplência: ${summary.delinquencyRate}%
- Investidores/Clientes Sincronizados: ${summary.activeCustomersCount}

DESTAQUES DO SISTEMA:
${summary.highlights.map((h) => `• ${h}`).join("\n")}
==========================================================
`;
  }
}
