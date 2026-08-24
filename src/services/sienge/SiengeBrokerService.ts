import { SiengeConfig, SiengeBroker } from "./types";
import { SiengeOAuthService } from "./SiengeOAuthService";

export class SiengeBrokerService {
  /**
   * Incremental Sync for Realtors / Brokers / Agencies from Sienge ERP
   */
  public static async fetchBrokers(
    config: SiengeConfig,
    updatedSince?: string | null
  ): Promise<SiengeBroker[]> {
    await SiengeOAuthService.authenticate(config);

    const mockBrokers: SiengeBroker[] = [
      {
        id: "sienge-brk-01",
        siengeRealtorId: "COR-301",
        name: "Camila Vasconcelos",
        cpfCnpj: "019.228.490-11",
        phone: "(48) 99120-0099",
        email: "camila.v@arvinc.com.br",
        agencyName: "ARV Direct Sales",
        totalSalesCount: 18,
        totalSalesVgv: 14200000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-brk-02",
        siengeRealtorId: "COR-302",
        name: "Célio Prado",
        cpfCnpj: "542.109.880-33",
        phone: "(48) 98877-6655",
        email: "celio.prado@lopes.com.br",
        agencyName: "Lopes Imobiliária Florianópolis",
        totalSalesCount: 12,
        totalSalesVgv: 8900000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-brk-03",
        siengeRealtorId: "COR-303",
        name: "Juliana Mendonça",
        cpfCnpj: "891.204.330-77",
        phone: "(48) 99655-1122",
        email: "juliana@ibagy.com.br",
        agencyName: "Ibagy Imóveis",
        totalSalesCount: 9,
        totalSalesVgv: 6400000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
    ];

    if (updatedSince) {
      const sinceTime = new Date(updatedSince).getTime();
      return mockBrokers.filter(
        (b) => new Date(b.updatedAt).getTime() >= sinceTime
      );
    }

    return mockBrokers;
  }
}
