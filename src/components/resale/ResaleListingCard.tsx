import React, { useState } from "react";
import {
  Eye,
  Users,
  Tag,
  Building2,
  Maximize2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { ResaleListing, ResalePricing, ResalePaymentCondition } from "../../types";

interface ResaleListingCardProps {
  listing: ResaleListing;
  pricing?: ResalePricing;
  conditions?: ResalePaymentCondition[];
  speName?: string;
  onOpenLeadModal?: (listing: ResaleListing) => void;
  onEditListing?: (listing: ResaleListing) => void;
  onEditPricing?: (listing: ResaleListing) => void;
  onPublish?: (listingId: string) => void;
  onPause?: (listingId: string) => void;
  onReserve?: (listingId: string) => void;
  onMarkSold?: (listing: ResaleListing) => void;
  isPublicView?: boolean;
}

export const ResaleListingCard: React.FC<ResaleListingCardProps> = ({
  listing,
  pricing,
  conditions = [],
  speName,
  onOpenLeadModal,
  onEditListing,
  onEditPricing,
  onPublish,
  onPause,
  onReserve,
  onMarkSold,
  isPublicView = false,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
      ];

  const statusBadgeColor = {
    "Em Preparação": "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    "Publicado": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    "Pausado": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    "Reservado": "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    "Vendido": "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  }[listing.status] || "bg-slate-100 text-slate-800";

  const discount = pricing?.discountPercentageVsTable || 0;
  const resalePrice = pricing?.resalePrice || 0;
  const originalPrice = pricing?.originalTablePrice || 0;

  return (
    <div
      id={`resale-card-${listing.id}`}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Photo Container with Carousel & Badges */}
        <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={photos[activePhotoIdx]}
            alt={listing.listingTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Top Status and Discount Tags */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs flex items-center gap-1.5 ${statusBadgeColor}`}
            >
              {listing.status === "Publicado" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {listing.status === "Em Preparação" && <Clock className="w-3.5 h-3.5" />}
              {listing.status === "Reservado" && <Sparkles className="w-3.5 h-3.5" />}
              {listing.status}
            </span>

            {discount > 0 && (
              <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {discount.toFixed(1)}% OFF
              </span>
            )}
          </div>

          {/* Photo Dots Navigator */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activePhotoIdx === idx ? "bg-white w-4" : "bg-white/50"
                  }`}
                  aria-label={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Spe Badge */}
          <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{speName || "SPE ARV Invest"}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {listing.listingTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {listing.listingDescription}
            </p>
          </div>

          {/* Tags */}
          {listing.highlightTags && listing.highlightTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {listing.highlightTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Pricing Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Valor de Revenda:</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                R$ {resalePrice.toLocaleString("pt-BR")}
              </span>
            </div>

            {originalPrice > resalePrice && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 line-through">
                  Tabela: R$ {originalPrice.toLocaleString("pt-BR")}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  Economia de R$ {(originalPrice - resalePrice).toLocaleString("pt-BR")}
                </span>
              </div>
            )}
          </div>

          {/* Payment Conditions Summary */}
          {conditions.length > 0 && (
            <div className="space-y-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Condições em Destaque:</span>
              <div className="space-y-1">
                {conditions.slice(0, 2).map((cond) => (
                  <div
                    key={cond.id}
                    className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 px-2 py-1 rounded border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="font-medium truncate max-w-[170px]">{cond.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {cond.numberOfInstallments > 1
                        ? `${cond.numberOfInstallments}x (${cond.indexer})`
                        : "À Vista"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Bar (Internal Mode) */}
          {!isPublicView && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.viewsCount || 0} visualizações</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {listing.leadsGeneratedCount || 0} leads captados
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 pt-0">
        {isPublicView ? (
          <button
            id={`btn-interest-${listing.id}`}
            onClick={() => onOpenLeadModal?.(listing)}
            disabled={listing.status === "Vendido"}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              listing.status === "Vendido"
                ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {listing.status === "Vendido" ? (
              "Unidade Já Comercializada"
            ) : (
              <>
                <span>Manifestar Interesse / Proposta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEditListing?.(listing)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Editar Anúncio
              </button>
              <button
                onClick={() => onEditPricing?.(listing)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Precificação
              </button>
            </div>

            <div className="flex items-center gap-2">
              {listing.status === "Em Preparação" && (
                <button
                  onClick={() => onPublish?.(listing.id)}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Publicar na Vitrine
                </button>
              )}

              {listing.status === "Publicado" && (
                <>
                  <button
                    onClick={() => onPause?.(listing.id)}
                    className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Pausar
                  </button>
                  <button
                    onClick={() => onReserve?.(listing.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Reservar Unidade
                  </button>
                </>
              )}

              {(listing.status === "Reservado" || listing.status === "Publicado") && (
                <button
                  onClick={() => onMarkSold?.(listing)}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Concluir Venda
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
