import { SiengeConfig, SiengeInstallment } from "./types";
import { SiengeOAuthService } from "./SiengeOAuthService";

export class SiengeFinancialService {
  /**
   * Incremental Sync for Installments & Receivables from Sienge ERP
   */
  public static async fetchInstallments(
    config: SiengeConfig,
    updatedSince?: string | null
  ): Promise<SiengeInstallment[]> {
    await SiengeOAuthService.authenticate(config);

    const mockInstallments: SiengeInstallment[] = [
      {
        id: "sienge-fin-501",
        contractId: "sienge-ctr-2026-001",
        contractNumber: "CTR-2026/001",
        installmentNumber: "01/36",
        dueDate: "2026-07-10",
        originalAmount: 12500,
        fineAmount: 0,
        discountAmount: 0,
        paidAmount: 12500,
        openAmount: 0,
        status: "Pago",
        paymentDate: "2026-07-09",
        type: "Mensal",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-fin-502",
        contractId: "sienge-ctr-2026-001",
        contractNumber: "CTR-2026/001",
        installmentNumber: "02/36",
        dueDate: "2026-08-10",
        originalAmount: 12500,
        fineAmount: 0,
        discountAmount: 0,
        paidAmount: 0,
        openAmount: 12500,
        status: "Aberto",
        type: "Mensal",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-fin-503",
        contractId: "sienge-ctr-2026-002",
        contractNumber: "CTR-2026/002",
        installmentNumber: "Semestral 02",
        dueDate: "2026-06-30",
        originalAmount: 85000,
        fineAmount: 1700,
        discountAmount: 0,
        paidAmount: 0,
        openAmount: 86700,
        status: "Atrasado",
        type: "Semestral",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-fin-504",
        contractId: "sienge-ctr-2026-003",
        contractNumber: "CTR-2026/003",
        installmentNumber: "Aporte 04/04",
        dueDate: "2026-07-25",
        originalAmount: 400000,
        fineAmount: 0,
        discountAmount: 0,
        paidAmount: 400000,
        openAmount: 0,
        status: "Pago",
        paymentDate: "2026-07-24",
        type: "Balão",
        updatedAt: new Date().toISOString(),
      },
    ];

    if (updatedSince) {
      const sinceTime = new Date(updatedSince).getTime();
      return mockInstallments.filter(
        (i) => new Date(i.updatedAt).getTime() >= sinceTime
      );
    }

    return mockInstallments;
  }
}
