import { SiengeConfig, SiengeContract } from "./types";
import { SiengeOAuthService } from "./SiengeOAuthService";

export class SiengeContractService {
  /**
   * Incremental Sync for Contracts / Minutas from Sienge ERP
   */
  public static async fetchContracts(
    config: SiengeConfig,
    updatedSince?: string | null
  ): Promise<SiengeContract[]> {
    await SiengeOAuthService.authenticate(config);

    const mockContracts: SiengeContract[] = [
      {
        id: "sienge-ctr-2026-001",
        contractNumber: "CTR-2026/001",
        siengeCustomerId: "sienge-cli-101",
        customerName: "Carlos Eduardo Silva",
        customerCpfCnpj: "048.291.820-44",
        speCode: "SPE-T58",
        speName: "13 - T58 SPOT SPE LTDA",
        enterpriseName: "T58 SPOT RESIDENCE",
        unitNumber: "Studio 504 - Bloco A",
        block: "Bloco A",
        contractValue: 485000,
        paidValue: 290000,
        balanceValue: 195000,
        purchaseDate: "2025-06-15",
        status: "Ativo",
        realtorName: "Lopes Imobiliária (Célio Prado)",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-ctr-2026-002",
        contractNumber: "CTR-2026/002",
        siengeCustomerId: "sienge-cli-102",
        customerName: "Mariana Alencar Vasconcelos",
        customerCpfCnpj: "821.390.110-88",
        speCode: "SPE-HORIZON",
        speName: "SPE ARV Horizon Residence LTDA",
        enterpriseName: "ARV HORIZON RESIDENCE",
        unitNumber: "Apto 1202 - Torre Sul",
        block: "Torre Sul",
        contractValue: 1350000,
        paidValue: 950000,
        balanceValue: 400000,
        purchaseDate: "2025-02-10",
        status: "Ativo",
        realtorName: "ARV Direct Sales (Camila Vasconcelos)",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-ctr-2026-003",
        contractNumber: "CTR-2026/003",
        siengeCustomerId: "sienge-cli-103",
        customerName: "Fundo Capital Real Estate LTDA",
        customerCpfCnpj: "12.345.678/0001-99",
        speCode: "SPE-MERIDIEM",
        speName: "SPE ARV MERIDIEM - Saco dos Limões",
        enterpriseName: "MERIDIEM RESIDENCIAL",
        unitNumber: "Pavimento 03 & 04 (Lote de 4 Unidades)",
        block: "Bloco Único",
        contractValue: 3400000,
        paidValue: 2800000,
        balanceValue: 600000,
        purchaseDate: "2024-11-20",
        status: "Ativo",
        realtorName: "ARV Corporate RI",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-ctr-2026-004",
        contractNumber: "CTR-2026/004",
        siengeCustomerId: "sienge-cli-104",
        customerName: "Roberto Mendes de Oliveira",
        customerCpfCnpj: "312.901.440-12",
        speCode: "SPE-T58",
        speName: "13 - T58 SPOT SPE LTDA",
        enterpriseName: "T58 SPOT RESIDENCE",
        unitNumber: "Loft 302 - Bloco B",
        block: "Bloco B",
        contractValue: 520000,
        paidValue: 520000,
        balanceValue: 0,
        purchaseDate: "2025-01-05",
        status: "Concluído",
        realtorName: "Ibagy Imóveis",
        updatedAt: new Date().toISOString(),
      },
    ];

    if (updatedSince) {
      const sinceTime = new Date(updatedSince).getTime();
      return mockContracts.filter(
        (c) => new Date(c.updatedAt).getTime() >= sinceTime
      );
    }

    return mockContracts;
  }
}
