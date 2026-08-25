import React, { useState } from "react";
import {
  X,
  Building,
  DollarSign,
  Compass,
  Car,
  Layers,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  Calculator,
  Save,
} from "lucide-react";
import { PricingUnit, PriceTable, UnitStatus, SolarOrientation, GarageType, UnitType } from "../../types/pricing";
import { CUBService } from "../../services/pricing/CUBService";

interface UnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: PricingUnit | null;
  table: PriceTable;
  onSaveUnit: (updatedUnit: PricingUnit) => void;
  onOpenSimulator: (unit: PricingUnit) => void;
}

export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  isOpen,
  onClose,
  unit,
  table,
  onSaveUnit,
  onOpenSimulator,
}) => {
  if (!isOpen || !unit) return null;

  const [unitNumber, setUnitNumber] = useState(unit.unitNumber);
  const [type, setType] = useState<UnitType>(unit.type);
  const [floor, setFloor] = useState(unit.floor);
  const [privateAreaM2, setPrivateAreaM2] = useState(unit.privateAreaM2);
  const [totalAreaM2, setTotalAreaM2] = useState(unit.totalAreaM2);
  const [garageType, setGarageType] = useState<GarageType>(unit.garageType);
  const [garageNumber, setGarageNumber] = useState(unit.garageNumber || "");
  const [solarOrientation, setSolarOrientation] = useState<SolarOrientation>(unit.solarOrientation);
  const [viewDescription, setViewDescription] = useState(unit.viewDescription);
  const [basePrice, setBasePrice] = useState(unit.basePrice);
  const [status, setStatus] = useState<UnitStatus>(unit.status);
  const [discountMaxPercent, setDiscountMaxPercent] = useState(unit.discountMaxPercent);
  const [commissionPercent, setCommissionPercent] = useState(unit.commissionPercent);
  const [reservedBy, setReservedBy] = useState(unit.reservedBy || "");
  const [reservedUntil, setReservedUntil] = useState(unit.reservedUntil || "");
  const [buyerName, setBuyerName] = useState(unit.buyerName || "");
  const [notes, setNotes] = useState(unit.notes || "");

  // Cálculos automáticos
  const cubPrice = CUBService.brlToCub(basePrice, table.cubReferenceValue);
  const pricePerM2 = privateAreaM2 > 0 ? Number((basePrice / privateAreaM2).toFixed(2)) : 0;
  const cubPerM2 = privateAreaM2 > 0 ? Number((cubPrice / privateAreaM2).toFixed(2)) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PricingUnit = {
      ...unit,
      unitNumber,
      type,
      floor: Number(floor),
      privateAreaM2: Number(privateAreaM2),
      totalAreaM2: Number(totalAreaM2),
      garageType,
      garageNumber,
      solarOrientation,
      viewDescription,
      basePrice: Number(basePrice),
      cubPrice,
      pricePerM2,
      cubPerM2,
      status,
      discountMaxPercent: Number(discountMaxPercent),
      commissionPercent: Number(commissionPercent),
      reservedBy: status === "Reservada" ? reservedBy : undefined,
      reservedUntil: status === "Reservada" ? reservedUntil : undefined,
      buyerName: status === "Vendida" ? buyerName : undefined,
      notes,
    };

    onSaveUnit(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {unit.unitNumber} - {unit.type}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    status === "Disponível"
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : status === "Reservada"
                      ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      : status === "Vendida"
                      ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {table.speName} • {table.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSimulator(unit);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              <Calculator className="w-3.5 h-3.5" /> Simular Proposta
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Main Price & CUB highlight box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valor Base de Venda (R$)
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-bold text-blue-600">R$</span>
                <input
                  type="number"
                  step="1000"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-base font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valor em CUBs / SC
              </span>
              <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-1 font-mono">
                {cubPrice.toFixed(2)} CUBs
              </div>
              <span className="text-[10px] text-slate-400">
                (Ref. CUB: R$ {table.cubReferenceValue.toLocaleString("pt-BR")})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Preço por m² Privativo
              </span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                R$ {pricePerM2.toLocaleString("pt-BR")} / m²
              </div>
              <span className="text-[10px] text-slate-400">({cubPerM2.toFixed(2)} CUBs/m²)</span>
            </div>
          </div>

          {/* Unit Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Identificação / Nº
              </label>
              <input
                type="text"
                required
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipologia
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
              >
                <option value="Studio">Studio</option>
                <option value="1 Suíte + 1 Quarto">1 Suíte + 1 Quarto</option>
                <option value="2 Quartos">2 Quartos</option>
                <option value="2 Suítes">2 Suítes</option>
                <option value="3 Suítes">3 Suítes</option>
                <option value="Cobertura Duplex">Cobertura Duplex</option>
                <option value="Cobertura Linear">Cobertura Linear</option>
                <option value="Garden">Garden</option>
                <option value="Sala Comercial">Sala Comercial</option>
                <option value="Loja Térrea">Loja Térrea</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Andar / Pavimento
              </label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Comercial
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-900 dark:text-white"
              >
                <option value="Disponível">Disponível</option>
                <option value="Reservada">Reservada</option>
                <option value="Vendida">Vendida</option>
                <option value="Bloqueada">Bloqueada</option>
                <option value="Permuta">Permuta</option>
              </select>
            </div>
          </div>

          {/* Areas & Garages */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Área Privativa (m²)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={privateAreaM2}
                onChange={(e) => setPrivateAreaM2(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Área Total (m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalAreaM2}
                onChange={(e) => setTotalAreaM2(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vagas de Garagem
              </label>
              <select
                value={garageType}
                onChange={(e: any) => setGarageType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Simples Coberta">Simples Coberta</option>
                <option value="Dupla Coberta">Dupla Coberta</option>
                <option value="Dupla Descoberta">Dupla Descoberta</option>
                <option value="Vaga + Hobby Box">Vaga + Hobby Box</option>
                <option value="Sem Vaga">Sem Vaga</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Posição Solar
              </label>
              <select
                value={solarOrientation}
                onChange={(e: any) => setSolarOrientation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold"
              >
                <option value="Norte">Norte (Sol Pleno)</option>
                <option value="Nordeste">Nordeste (Manhã)</option>
                <option value="Leste">Leste (Sol da Manhã)</option>
                <option value="Oeste">Oeste (Sol da Tarde)</option>
                <option value="Sul">Sul (Fresco)</option>
              </select>
            </div>
          </div>

          {/* View Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descrição da Vista & Diferenciais da Unidade
            </label>
            <input
              type="text"
              value={viewDescription}
              onChange={(e) => setViewDescription(e.target.value)}
              placeholder="Ex: Vista mar lateral, sacada com churrasqueira a carvão e ponto de ar condicionado"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Reservation / Buyer Info if not available */}
          {status === "Reservada" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                Dados da Reserva
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reservado por (Corretor / Imobiliária / Cliente)
                  </label>
                  <input
                    type="text"
                    value={reservedBy}
                    onChange={(e) => setReservedBy(e.target.value)}
                    placeholder="Nome do corretor ou interessado"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Válido até
                  </label>
                  <input
                    type="date"
                    value={reservedUntil}
                    onChange={(e) => setReservedUntil(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {status === "Vendida" && (
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
              <h4 className="text-xs font-black uppercase text-purple-800 dark:text-purple-300 tracking-wider">
                Comprador / Investidor Titular
              </h4>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Nome do cotista ou adquirente"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
