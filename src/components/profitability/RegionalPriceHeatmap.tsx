import React from "react";
import {
  MapPin,
  TrendingUp,
  Building,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface RegionalData {
  state: "SC" | "CE";
  city: string;
  neighborhood: string;
  averagePriceM2: number;
  arvAveragePriceM2: number;
  yoyAppreciation: number; // Valorização anual do bairro
  occupancyRateEst: number; // Taxa de ocupação estimada (locação/estadias)
  activeProjects: string[];
  description: string;
}

const REGIONAL_MARKET_DATA: RegionalData[] = [
  {
    state: "SC",
    city: "Florianópolis",
    neighborhood: "Trindade (Bairro Universitário UFSC)",
    averagePriceM2: 12400,
    arvAveragePriceM2: 14850,
    yoyAppreciation: 15.6,
    occupancyRateEst: 94,
    activeProjects: ["SPE ARV GRID LTDA", "SPE 13 - T58 SPOT SPE LTDA"],
    description:
      "Região de altíssima densidade universitária e corporativa com enorme demanda por Studios compactos, Studios Garden e locação flexível.",
  },
  {
    state: "SC",
    city: "Florianópolis",
    neighborhood: "Saco dos Limões (Sul da Ilha / Acesso Centro)",
    averagePriceM2: 12800,
    arvAveragePriceM2: 14200,
    yoyAppreciation: 14.2,
    occupancyRateEst: 91,
    activeProjects: ["SPE ARV MERIDIEM - Saco dos Limões"],
    description:
      "Eixo estratégico de conexão entre o Centro Histórico e o Sul da Ilha, com expansão imobiliária moderna e valorização acelerada.",
  },
  {
    state: "SC",
    city: "Florianópolis",
    neighborhood: "Itacorubi / Córrego Grande",
    averagePriceM2: 13200,
    arvAveragePriceM2: 14200,
    yoyAppreciation: 13.5,
    occupancyRateEst: 89,
    activeProjects: ["SPE ARV Innovation Park (Fase Planejamento)"],
    description:
      "Pólo de inovação tecnológica de SC com expansão imobiliária contínua e padrão médio-alto.",
  },
  {
    state: "CE",
    city: "Fortaleza",
    neighborhood: "Meireles / Beira Mar",
    averagePriceM2: 16200,
    arvAveragePriceM2: 18900,
    yoyAppreciation: 16.2,
    occupancyRateEst: 88,
    activeProjects: ["SPE ARV Vista Mar Residence", "SPE ARV Eco Residence"],
    description:
      "Região mais nobre da capital cearense, com valorização constante de alto padrão e forte apelo para investidores de alta renda.",
  },
  {
    state: "CE",
    city: "Fortaleza",
    neighborhood: "Cocó / Parque Ecológico",
    averagePriceM2: 10800,
    arvAveragePriceM2: 11500,
    yoyAppreciation: 11.4,
    occupancyRateEst: 85,
    activeProjects: ["SPE ARV Parque Cocó Vista"],
    description:
      "Bairro arborizado de perfil familiar, com alta liquidez para locação de longo prazo e plantas de 2 e 3 suítes.",
  },
  {
    state: "CE",
    city: "Fortaleza",
    neighborhood: "Aldeota (Eixo Comercial Santos Dumont)",
    averagePriceM2: 14500,
    arvAveragePriceM2: 16000,
    yoyAppreciation: 12.8,
    occupancyRateEst: 91,
    activeProjects: ["SPE ARV Corporate Santos Dumont"],
    description:
      "Coração financeiro e médico de Fortaleza, com forte absorção de salas comerciais e lajes corporativas premium.",
  },
  {
    state: "CE",
    city: "Aquiraz",
    neighborhood: "Porto das Dunas (Eixo Turístico)",
    averagePriceM2: 13800,
    arvAveragePriceM2: 15000,
    yoyAppreciation: 17.5,
    occupancyRateEst: 82,
    activeProjects: ["SPE ARV Grand Bay Resort"],
    description:
      "Destino turístico de padrão internacional (Beach Park), gerando alto yield com locação por temporada (short stay).",
  },
];

export const RegionalPriceHeatmap: React.FC = () => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Mapa de Inteligência Regional e Valorização Imobiliária
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mapeamento dos pólos de investimento da ARV em Santa Catarina e no Ceará.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REGIONAL_MARKET_DATA.map((reg, idx) => {
          const premium =
            ((reg.arvAveragePriceM2 - reg.averagePriceM2) / reg.averagePriceM2) * 100;
          return (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      {reg.state}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {reg.city}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +{reg.yoyAppreciation}% a.a.
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {reg.neighborhood}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {reg.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Média Geral do Bairro:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(reg.averagePriceM2)}/m²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    Empreendimentos ARV:
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(reg.arvAveragePriceM2)}/m²
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Ocupação / Demanda Est.:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {reg.occupancyRateEst}%
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Empreendimentos Ativos:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {reg.activeProjects.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
