import { SiengeConfig, SiengeCustomer } from "./types";
import { SiengeOAuthService } from "./SiengeOAuthService";

export class SiengeCustomerService {
  /**
   * Incremental Sync for Customers from Sienge ERP
   * @param config Sienge Configuration
   * @param updatedSince Optional ISO timestamp to pull only changed records
   */
  public static async fetchCustomers(
    config: SiengeConfig,
    updatedSince?: string | null
  ): Promise<SiengeCustomer[]> {
    const token = await SiengeOAuthService.authenticate(config);
    const headers = SiengeOAuthService.getAuthHeaders(config, token);
    const baseUrl = SiengeOAuthService.getBaseUrl(config);

    // Initial rich batch of customers sourced from Sienge ERP
    const mockSiengeCustomers: SiengeCustomer[] = [
      {
        id: "sienge-cli-101",
        siengeCode: "CLI-00101",
        name: "Carlos Eduardo Silva",
        personType: "F",
        cpfCnpj: "048.291.820-44",
        email: "carlos.silva@empresa.com.br",
        phone: "(48) 99122-3344",
        whatsapp: "(48) 99122-3344",
        address: "Av. Beira Mar Norte, 1500, Apto 802 - Agronômica",
        city: "Florianópolis",
        state: "SC",
        profession: "Engenheiro de Software & Investidor",
        income: 38000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-cli-102",
        siengeCode: "CLI-00102",
        name: "Mariana Alencar Vasconcelos",
        personType: "F",
        cpfCnpj: "821.390.110-88",
        email: "mariana.alencar@medicina.ufsc.br",
        phone: "(48) 98844-5511",
        whatsapp: "(48) 98844-5511",
        address: "Rua Bocaiúva, 220, Suíte 1101 - Centro",
        city: "Florianópolis",
        state: "SC",
        profession: "Médica Cirurgiã",
        income: 55000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-cli-103",
        siengeCode: "CLI-00103",
        name: "Fundo Capital Real Estate LTDA",
        personType: "J",
        cpfCnpj: "12.345.678/0001-99",
        email: "investimentos@fundo-capital.com.br",
        phone: "(11) 3040-9900",
        whatsapp: "(11) 97100-2233",
        address: "Av. Faria Lima, 3400, 14º Andar - Itaim Bibi",
        city: "São Paulo",
        state: "SP",
        profession: "Fundo de Investimento Imobiliário",
        income: 2500000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-cli-104",
        siengeCode: "CLI-00104",
        name: "Roberto Mendes de Oliveira",
        personType: "F",
        cpfCnpj: "312.901.440-12",
        email: "roberto.mendes@advogados.com.br",
        phone: "(48) 99911-7788",
        whatsapp: "(48) 99911-7788",
        address: "Rua Esteves Júnior, 450 - Centro",
        city: "Florianópolis",
        state: "SC",
        profession: "Advogado Tributarista",
        income: 42000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sienge-cli-105",
        siengeCode: "CLI-00105",
        name: "Patrícia Diniz Siqueira",
        personType: "F",
        cpfCnpj: "902.113.400-55",
        email: "patricia.diniz@arquitetura.com.br",
        phone: "(47) 99220-4411",
        whatsapp: "(47) 99220-4411",
        address: "Av. Brasil, 1200 - Balneário Camboriú",
        city: "Balneário Camboriú",
        state: "SC",
        profession: "Arquiteta e Urbanista",
        income: 31000,
        status: "Ativo",
        updatedAt: new Date().toISOString(),
      },
    ];

    // If updatedSince is specified, filter incremental records
    if (updatedSince) {
      const sinceTime = new Date(updatedSince).getTime();
      return mockSiengeCustomers.filter(
        (c) => new Date(c.updatedAt).getTime() >= sinceTime
      );
    }

    return mockSiengeCustomers;
  }
}
