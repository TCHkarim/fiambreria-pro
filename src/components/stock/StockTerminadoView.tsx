import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin,
  SlidersHorizontal,
  Plus,
  Scale,
  X
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { LoteProducto } from '../../types';

export const StockTerminadoView: React.FC = () => {
  const state = store.getState();
  const [selectedChamber, setSelectedChamber] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState<LoteProducto | null>(null);
  const [adjustKg, setAdjustKg] = useState(0);

  // Ordenar lotes por FEFO (First Expired, First Out)
  const sortedLotes = [...state.lotes].sort((a, b) => 
    new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
  );

  const filteredLotes = sortedLotes.filter(l => {
    const matchesChamber = selectedChamber === 'todas' || l.chamber_location.toLowerCase().includes(selectedChamber.toLowerCase());
    const matchesSearch = l.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.batch_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChamber && matchesSearch;
  });

  const getDaysToExpiration = (dateStr: string) => {
    const diff = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return Math.ceil(diff);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;
    showAdjustModal.current_kg = adjustKg;
    // recalcular stock en producto
    const prod = state.productosTerminados.find(p => p.id === showAdjustModal.product_id);
    if (prod) {
      prod.stock_total_kg = state.lotes.filter(l => l.product_id === prod.id).reduce((acc, l) => acc + l.current_kg, 0);
    }
    store.logAudit('Ajuste Inventario Lote', 'Stock', `Ajustado lote ${showAdjustModal.batch_number} a ${adjustKg} kg`);
    setShowAdjustModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Stock de Producto Terminado y Lotes (FEFO)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Inventario ordenado por criterio FEFO (primero en vencer, primero en salir) y ubicación en cámaras
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen por Cámara */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'Secadero Tradicional Tandil', desc: 'Salames Picado Grueso, Fino y Bondiolas', temp: '14.2°C', count: '488.5 kg', color: 'border-l-4 border-l-[#781d28]' },
          { name: 'Cámara 3 - Despacho', desc: 'Jamones Cocidos y Mortadelas al Vacío', temp: '3.4°C', count: '451.0 kg', color: 'border-l-4 border-l-blue-600' },
          { name: 'Cámara 2 - Despacho Rápido', desc: 'Paletas Sandwicheras y Queso de Cerdo', temp: '2.8°C', count: '465.0 kg', color: 'border-l-4 border-l-amber-600' },
        ].map((c, idx) => (
          <div key={idx} className={`p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs ${c.color}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">{c.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {c.temp}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">{c.desc}</p>
            <p className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
              {c.count} disponibles
            </p>
          </div>
        ))}
      </div>

      {/* Buscador y Filtro de Ubicación */}
      <div className="bg-white dark:bg-[#201d1c] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por variedad o número de lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#781d28]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {[
            { id: 'todas', label: 'Todas las Cámaras' },
            { id: 'secadero', label: 'Secadero Tandil' },
            { id: 'cámara 3', label: 'Cámara 3 (Despacho)' },
            { id: 'cámara 2', label: 'Cámara 2' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedChamber(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition ${
                selectedChamber === cat.id
                  ? 'bg-[#781d28] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla FEFO de Lotes */}
      <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Prioridad FEFO / Lote</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Kilos Disponibles</th>
                <th className="py-3 px-4">Piezas</th>
                <th className="py-3 px-4">Elaboración</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filteredLotes.map((lote, idx) => {
                const daysLeft = getDaysToExpiration(lote.expiration_date);
                const isUrgent = daysLeft <= 30;

                return (
                  <tr key={lote.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`} title="Orden de salida FEFO">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{lote.batch_number}</span>
                          {idx === 0 && (
                            <span className="block text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                              ★ Salida Prioritaria
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-800 dark:text-stone-200">
                      {lote.product_name}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      {lote.chamber_location}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                      {formatWeight(lote.current_kg)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-400">
                      {lote.pieces_count} u.
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 font-mono">
                      {formatDate(lote.production_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-stone-800 dark:text-stone-200">{formatDate(lote.expiration_date)}</span>
                        <span className={`block text-[10px] font-bold ${
                          daysLeft <= 15 ? 'text-rose-600 animate-pulse' : daysLeft <= 30 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {daysLeft > 0 ? `Vence en ${daysLeft} días` : '¡VENCIDO!'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setShowAdjustModal(lote);
                          setAdjustKg(lote.current_kg);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#781d28] dark:text-[#f8a5af] bg-[#781d28]/10 hover:bg-[#781d28]/20 rounded-lg transition"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajuste Físico de Inventario */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Ajuste de Inventario Físico</h3>
                <p className="text-xs text-white/80">{showAdjustModal.batch_number} - {showAdjustModal.product_name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kilos reales contados en cámara
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustKg}
                  onChange={(e) => setAdjustKg(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono font-bold text-base"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(null)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Confirmar Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
