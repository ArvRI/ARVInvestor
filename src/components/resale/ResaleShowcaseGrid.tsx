import React, { useState } from "react";
import {
  Search,
  Filter,
  Building2,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  Eye,
} from "lucide-react";
import { ResaleListing, ResalePricing, ResalePaymentCondition, SPE } from "../../types";
import { ResaleListingCard } from "./ResaleListingCard";

interface ResaleShowcaseGridProps {
  listings: ResaleListing[];
  pricingList: ResalePricing[];
  conditionsList: ResalePaymentCondition[];
  spes: SPE[];
  onOpenLeadModal: (listing: ResaleListing) => void;
  onIncrementView?: (listingId: string) => void;
  isPublicView?: boolean;
}

export const ResaleShowcaseGrid: React.FC<ResaleShowcaseGridProps> = ({
  listings,
  pricingList,
  conditionsList,
  spes,
  onOpenLeadModal,
  onIncrementView,
  isPublicView = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpeId, setSelectedSpeId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"discount" | "price_asc" | "price_desc" | "recent">("discount");

  // Filtragem
  const filteredListings = listings.filter((listing) => {
    // Se for público, só exibe os publicados e reservados
    if (isPublicView && !["Publicado", "Reservado"].includes(listing.status)) {
      return false;
    }

    if (selectedStatus !== "all" && listing.status !== selectedStatus) {
      return false;
    }

    const matchesSearch =
      listing.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.listingDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.highlightTags && listing.highlightTags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesSearch;
  });

  // Ordenação
  const sortedListings = [...filteredListings].sort((a, b) => {
    const priceA = pricingList.find((p) => p.resaleListingId === a.id);
    const priceB = pricingList.find((p) => p.resaleListingId === b.id);

    if (sortBy === "discount") {
      return (priceB?.discountPercentageVsTable || 0) - (priceA?.discountPercentageVsTable || 0);
    }
    if (sortBy === "price_asc") {
      return (priceA?.resalePrice || 0) - (priceB?.resalePrice || 0);
    }
    if (sortBy === "price_desc") {
      return (priceB?.resalePrice || 0) - (priceA?.resalePrice || 0);
    }
    return b.id.localeCompare(a.id);
  });

  // Totais e Métricas da Vitrine
  const totalAvailable = listings.filter((l) => l.status === "Publicado").length;
  const avgDiscount =
    pricingList.length > 0
      ? pricingList.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) / pricingList.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oportunidades Exclusivas de Repasse & Revenda</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Vitrine de Unidades em Revenda
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Acesse imóveis e cotas de SPEs originados de distratos e devoluções negociadas, com condições comerciais diferenciadas e até <strong className="text-white">{avgDiscount.toFixed(1)}% de desconto</strong> em relação à tabela vigente.
          </p>
        </div>

        {/* Quick Highlights Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block">Unidades Disponíveis:</span>
            <strong className="text-lg font-bold text-white">{totalAvailable} unidades</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Desconto Médio:</span>
            <strong className="text-lg font-bold text-emerald-400">{avgDiscount.toFixed(1)}% OFF</strong>
          </div>
          <div className="hidden sm:block">
            <span className="text-slate-400 block">Transferência:</span>
            <strong className="text-lg font-bold text-blue-300">Imediata via Cessão / Escritura</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por unidade, empreendimento, tag ou palavra-chave..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="discount">Maior Desconto (%)</option>
              <option value="price_asc">Menor Preço (R$)</option>
              <option value="price_desc">Maior Preço (R$)</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {sortedListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            Nenhuma unidade encontrada para estes filtros
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente remover os termos de busca ou selecionar outro status para encontrar imóveis disponíveis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((listing) => {
            const pricing = pricingList.find((p) => p.resaleListingId === listing.id);
            const conditions = conditionsList.filter((c) => c.resaleListingId === listing.id);
            const spe = spes.find((s) => s.id === "spe-t58");

            return (
              <ResaleListingCard
                key={listing.id}
                listing={listing}
                pricing={pricing}
                conditions={conditions}
                speName={spe?.name}
                onOpenLeadModal={() => {
                  onIncrementView?.(listing.id);
                  onOpenLeadModal(listing);
                }}
                isPublicView={isPublicView}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
