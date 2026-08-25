import {
  CUBMonthlyRecord,
  PaymentConditionTemplate,
  PricingUnit,
  SimulatedInstallment,
  CommercialProposal,
} from "../../types/pricing";

export const HISTORICAL_CUB_RECORDS: CUBMonthlyRecord[] = [
  {
    monthYear: "2026-08",
    displayMonth: "Agosto/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3151.24,
    monthlyVariationPercent: 0.45,
    accumulated12mPercent: 5.12,
    accumulatedYearPercent: 3.48,
  },
  {
    monthYear: "2026-07",
    displayMonth: "Julho/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3137.12,
    monthlyVariationPercent: 0.38,
    accumulated12mPercent: 4.92,
    accumulatedYearPercent: 2.70,
  },
  {
    monthYear: "2026-06",
    displayMonth: "Junho/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3125.28,
    monthlyVariationPercent: 0.65,
    accumulated12mPercent: 5.10,
    accumulatedYearPercent: 2.31,
  },
  {
    monthYear: "2026-05",
    displayMonth: "Maio/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3105.10,
    monthlyVariationPercent: 0.54,
    accumulated12mPercent: 5.32,
    accumulatedYearPercent: 1.65,
  },
  {
    monthYear: "2026-04",
    displayMonth: "Abril/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3088.42,
    monthlyVariationPercent: 0.40,
    accumulated12mPercent: 5.48,
    accumulatedYearPercent: 1.10,
  },
  {
    monthYear: "2026-03",
    displayMonth: "Março/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3076.12,
    monthlyVariationPercent: 0.35,
    accumulated12mPercent: 5.60,
    accumulatedYearPercent: 0.70,
  },
  {
    monthYear: "2026-02",
    displayMonth: "Fevereiro/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3065.38,
    monthlyVariationPercent: 0.22,
    accumulated12mPercent: 5.81,
    accumulatedYearPercent: 0.35,
  },
  {
    monthYear: "2026-01",
    displayMonth: "Janeiro/2026",
    state: "SC",
    projectStandard: "R8-N (Residencial Padrão Normal)",
    valueBrl: 3058.64,
    monthlyVariationPercent: 0.13,
    accumulated12mPercent: 5.95,
    accumulatedYearPercent: 0.13,
  },
];

export const CURRENT_DEFAULT_CUB_SC = 3151.24; // R$ / m² (Sinduscon SC - Agosto/2026)

export class CUBService {
  /**
   * Converte valor em Reais (R$) para quantidade de CUBs
   */
  public static brlToCub(valueBrl: number, cubRate: number = CURRENT_DEFAULT_CUB_SC): number {
    if (!cubRate || cubRate <= 0) return 0;
    return Number((valueBrl / cubRate).toFixed(4));
  }

  /**
   * Converte quantidade de CUBs para valor em Reais (R$)
   */
  public static cubToBrl(cubs: number, cubRate: number = CURRENT_DEFAULT_CUB_SC): number {
    return Math.round(cubs * cubRate * 100) / 100;
  }

  /**
   * Simula o fluxo financeiro de parcelas para uma unidade com base no template de pagamento
   */
  public static simulatePaymentSchedule(
    unitPriceBrl: number,
    template: PaymentConditionTemplate,
    cubRate: number = CURRENT_DEFAULT_CUB_SC,
    discountPercent: number = 0,
    startDate: Date = new Date()
  ): {
    finalPriceBrl: number;
    finalPriceCubs: number;
    downPaymentValue: number;
    monthlyValue: number;
    balloonValue: number;
    keysValue: number;
    installments: SimulatedInstallment[];
  } {
    const discountedPriceBrl = unitPriceBrl * (1 - discountPercent / 100);
    const finalPriceCubs = this.brlToCub(discountedPriceBrl, cubRate);

    // Parcelas de Sinal / Entrada
    const downPaymentTotalBrl = discountedPriceBrl * (template.downPaymentPercent / 100);
    const downInstallmentsCount = Math.max(1, template.downPaymentInstallments || 1);
    const downPerInstallmentBrl = downPaymentTotalBrl / downInstallmentsCount;

    // Parcelas Mensais
    const monthlyTotalBrl = discountedPriceBrl * (template.monthlyInstallmentsPercent / 100);
    const monthlyCount = template.monthlyInstallmentsCount;
    const monthlyPerInstallmentBrl = monthlyCount > 0 ? monthlyTotalBrl / monthlyCount : 0;

    // Balões / Intermediárias
    const balloonTotalBrl = discountedPriceBrl * (template.balloonInstallmentsPercent / 100);
    const balloonCount = template.balloonInstallmentsCount;
    const balloonPerInstallmentBrl = balloonCount > 0 ? balloonTotalBrl / balloonCount : 0;

    // Chaves / Financiamento Bancário Final
    const keysTotalBrl = discountedPriceBrl * (template.keysPaymentPercent / 100);

    const installments: SimulatedInstallment[] = [];
    let currentNumber = 1;

    // 1. Gera Sinal / Entradas
    for (let i = 0; i < downInstallmentsCount; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      installments.push({
        number: currentNumber++,
        type: i === 0 ? "Sinal" : "Entrada Parcelada",
        dueDate: d.toISOString().split("T")[0],
        valueBrl: downPerInstallmentBrl,
        valueCubs: this.brlToCub(downPerInstallmentBrl, cubRate),
        percentageOfTotal: template.downPaymentPercent / downInstallmentsCount,
        correctionNote: i === 0 ? "Valor fixo no ato da assinatura" : "Sem juros até 60 dias",
      });
    }

    // 2. Gera Mensais e Intermediárias intercaladas
    const balloonInterval = monthlyCount > 0 && balloonCount > 0 ? Math.floor(monthlyCount / balloonCount) : 6;
    let balloonsGenerated = 0;

    for (let m = 1; m <= monthlyCount; m++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + downInstallmentsCount - 1 + m);

      // Mensal
      installments.push({
        number: currentNumber++,
        type: "Mensal",
        dueDate: d.toISOString().split("T")[0],
        valueBrl: monthlyPerInstallmentBrl,
        valueCubs: this.brlToCub(monthlyPerInstallmentBrl, cubRate),
        percentageOfTotal: template.monthlyInstallmentsPercent / monthlyCount,
        correctionNote: `Corrigida mensalmente pela variação do ${template.correctionIndex}`,
      });

      // Se for mês de reforço semestral/anual
      if (balloonCount > 0 && balloonsGenerated < balloonCount && m % balloonInterval === 0) {
        balloonsGenerated++;
        installments.push({
          number: currentNumber++,
          type: "Reforço Semestral",
          dueDate: d.toISOString().split("T")[0],
          valueBrl: balloonPerInstallmentBrl,
          valueCubs: this.brlToCub(balloonPerInstallmentBrl, cubRate),
          percentageOfTotal: template.balloonInstallmentsPercent / balloonCount,
          correctionNote: `Reforço semestral ${balloonsGenerated}/${balloonCount} corrigido por ${template.correctionIndex}`,
        });
      }
    }

    // 3. Parcela de Chaves / Saldo Final
    if (keysTotalBrl > 0) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + downInstallmentsCount + monthlyCount);
      installments.push({
        number: currentNumber++,
        type: "Chaves / Financiamento",
        dueDate: d.toISOString().split("T")[0],
        valueBrl: keysTotalBrl,
        valueCubs: this.brlToCub(keysTotalBrl, cubRate),
        percentageOfTotal: template.keysPaymentPercent,
        correctionNote: "Recursos próprios ou Financiamento Bancário na entrega do habite-se",
      });
    }

    return {
      finalPriceBrl: discountedPriceBrl,
      finalPriceCubs,
      downPaymentValue: downPaymentTotalBrl,
      monthlyValue: monthlyPerInstallmentBrl,
      balloonValue: balloonPerInstallmentBrl,
      keysValue: keysTotalBrl,
      installments,
    };
  }

  /**
   * Gera texto formatado para envio direto via WhatsApp para o Investidor/Comprador
   */
  /**
   * Formata valor numérico para o padrão de moeda brasileira (R$)
   */
  public static formatCurrency(val: number): string {
    return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  /**
   * Formata quantidade de CUBs com 2 casas decimais
   */
  public static formatCub(cubs: number): string {
    return `${(cubs || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CUBs`;
  }

  public static generateWhatsAppProposalText(
    unit: PricingUnit,
    speName: string,
    templateName: string,
    simulated: ReturnType<typeof CUBService.simulatePaymentSchedule>,
    clientName: string = "Investidor",
    cubRate: number = CURRENT_DEFAULT_CUB_SC
  ): string {
    const formatBrl = (val: number) =>
      val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return `🏢 *PROPOSTA COMERCIAL ARV INCORPORADORA*
📍 *Empreendimento:* ${speName}
🔑 *Unidade:* ${unit.unitNumber} | *Tipologia:* ${unit.type}
📐 *Área Privativa:* ${unit.privateAreaM2} m² | *Garagem:* ${unit.garageType}
☀️ *Orientação Solar:* ${unit.solarOrientation} (${unit.viewDescription})

💰 *Valor de Tabela:* ${formatBrl(simulated.finalPriceBrl)}
📊 *Valor em CUBs:* ${simulated.finalPriceCubs.toFixed(2)} CUBs (Ref. CUB/SC: ${formatBrl(cubRate)})
📈 *Preço / m²:* ${formatBrl(simulated.finalPriceBrl / unit.privateAreaM2)}

📋 *CONDIÇÃO DE PAGAMENTO SUGERIDA (${templateName}):*
• *Entrada / Ato:* ${formatBrl(simulated.downPaymentValue)}
• *Mensais:* ${simulated.installments.filter((i) => i.type === "Mensal").length}x de ${formatBrl(simulated.monthlyValue)} (corrigidas por CUB/SC)
• *Reforços Semestrais:* ${simulated.installments.filter((i) => i.type.includes("Reforço")).length}x de ${formatBrl(simulated.balloonValue)}
• *Chaves / Saldo Final:* ${formatBrl(simulated.keysValue)}

ℹ️ _Valores válidos por 5 dias úteis e sujeitos a confirmação de disponibilidade._
✨ _Atendimento ARV Relacionamento com Investidores & Comercial_`;
  }
}
