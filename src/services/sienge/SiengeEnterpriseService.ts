import { SiengeConfig, SiengeEnterprise } from "./types";
import { SiengeOAuthService } from "./SiengeOAuthService";

export class SiengeEnterpriseService {
  /**
   * Incremental Sync for Enterprises / SPEs / Building Sites from Sienge ERP
   */
  public static async fetchEnterprises(
    config: SiengeConfig,
    updatedSince?: string | null
  ): Promise<SiengeEnterprise[]> {
    await SiengeOAuthService.authenticate(config);

    const mockEnterprises: SiengeEnterprise[] = [
      {
        id: "sienge-emp-01",
        siengeBuildingSiteId: "OBR-1001",
        code: "SPE-T58",
        name: "T58 SPOT RESIDENCE",
        speName: "13 - T58 SPOT SPE LTDA",
        address: "Rua Lauro Linhares, 2100 - Trindade",
        city: "Florianópolis",
        state: "SC",
        totalUnits: 72,
        soldUnits: 56,
        reservedUnits: 4,
        availableUnits: 12,
        totalVgv: 35000000,
        physicalProgress: 78.5,
        engineerInCharge: "Eng. Ricardo Alencar",
        status: "Em Obras",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-emp-02",
        siengeBuildingSiteId: "OBR-1002",
        code: "SPE-HORIZON",
        name: "ARV HORIZON RESIDENCE",
        speName: "SPE ARV Horizon Residence LTDA",
        address: "Av. Beira Mar Norte, 2400",
        city: "Florianópolis",
        state: "SC",
        totalUnits: 48,
        soldUnits: 42,
        reservedUnits: 2,
        availableUnits: 4,
        totalVgv: 62000000,
        physicalProgress: 92.0,
        engineerInCharge: "Eng. Matheus Silveira",
        status: "Em Obras",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-emp-03",
        siengeBuildingSiteId: "OBR-1003",
        code: "SPE-MERIDIEM",
        name: "MERIDIEM RESIDENCIAL",
        speName: "SPE ARV MERIDIEM - Saco dos Limões",
        address: "Rua João Motta Espezim, 1093 - Saco dos Limões",
        city: "Florianópolis",
        state: "SC",
        totalUnits: 60,
        soldUnits: 53,
        reservedUnits: 3,
        availableUnits: 4,
        totalVgv: 38000000,
        physicalProgress: 58.0,
        engineerInCharge: "Eng. Sérgio d'Aquino",
        status: "Em Obras",
        updatedAt: new Date().toISOString(),
      },
    ];

    if (updatedSince) {
      const sinceTime = new Date(updatedSince).getTime();
      return mockEnterprises.filter(
        (e) => new Date(e.updatedAt).getTime() >= sinceTime
      );
    }

    return mockEnterprises;
  }
}
