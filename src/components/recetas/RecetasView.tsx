import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Scale,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { Receta, Insumo } from '../../types';
import { store } from '../../services/store';
import { formatCurrency, formatWeight } from '../../utils/formatters';

export const RecetasView: React.FC = () => {
  const state = store.getState();
  const [selectedReceta, setSelectedReceta] = useState<Receta>(state.recetas[0]);
  const [showNewModal, setShowNewModal] = useState(false);

  // Función para recalcular dinámicamente el costo del kilo de una receta según precios actuales
  const calculateLiveCost = (receta: Receta) => {
    let totalBatchCost = 0;
    receta.ingredients.forEach(ing => {
      const ins = state.insumos.find(i => i.id === ing.insumo_id);
      const unitCost = ins ? ins.cost_per_unit : 0;
      totalBatchCost += ing.quantity * unitCost;
    });

    // Kilos netos resultantes considerando rendimiento/merma
    const netKg = (receta.batch_size_kg * receta.expected_yield_pct) / 100;
    return netKg > 0 ? totalBatchCost / netKg : 0;
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Fórmulas, Recetas y Estructura de Costos
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Fórmulas maestras de chacinados, rendimiento esperado, merma de secado y precios sugeridos por lista
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Receta</span>
        </button>
      </div>

      {/* Grid de 2 columnas: Lista de Recetas a la izquierda, Detalle de Costeo a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Tarjetas de Recetas */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block px-1">
            Catálogo de Fórmulas Maestras ({state.recetas.length})
          </span>

          {state.recetas.map((r) => {
            const isSelected = selectedReceta?.id === r.id;
            const liveCost = calculateLiveCost(r);

            return (
              <div
                key={r.id}
                onClick={() => setSelectedReceta(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#201d1c] border-[#781d28] shadow-md ring-2 ring-[#781d28]/20'
                    : 'bg-white/80 dark:bg-[#1a1716] border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected
                      ? 'bg-[#781d28] text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">{r.product_name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono">{r.code} | Rend. {r.expected_yield_pct}%</p>
                    <p className="text-[11px] font-bold text-[#781d28] dark:text-[#f8a5af] mt-0.5">
                      Costo: {formatCurrency(liveCost)}/kg
                    </p>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-[#781d28] translate-x-1' : 'text-stone-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Detalle Completo de la Receta Seleccionada */}
        <div className="lg:col-span-2 space-y-5">
          {selectedReceta && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
              
              {/* Título de la Receta y Rendimiento */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                      {selectedReceta.product_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {selectedReceta.code}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 capitalize mt-0.5">
                    Categoría: {selectedReceta.category.replace('_', ' ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-right">
                    <span className="text-[10px] font-semibold block">Rendimiento Esperado</span>
                    <span className="text-base font-bold font-mono">{selectedReceta.expected_yield_pct}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-right">
                    <span className="text-[10px] font-semibold block">Merma Estimada</span>
                    <span className="text-base font-bold font-mono">{selectedReceta.expected_waste_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Lista de Ingredientes (BOM - Bill of Materials) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Ingredientes para Batch Base de {selectedReceta.batch_size_kg} kg Brutos
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Rendimiento neto: {formatWeight((selectedReceta.batch_size_kg * selectedReceta.expected_yield_pct) / 100)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf6f0] dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2 px-3">Insumo</th>
                        <th className="py-2 px-3">Cant. Requerida</th>
                        <th className="py-2 px-3">Precio Actual Insumo</th>
                        <th className="py-2 px-3 text-right">Costo Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                      {selectedReceta.ingredients.map((ing, i) => {
                        const ins = state.insumos.find(item => item.id === ing.insumo_id);
                        const unitCost = ins ? ins.cost_per_unit : 0;
                        const sub = ing.quantity * unitCost;

                        return (
                          <tr key={i} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30">
                            <td className="py-2.5 px-3 font-medium text-stone-800 dark:text-stone-200">
                              {ing.insumo_name}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-stone-500">
                              {formatCurrency(unitCost)}/{ing.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold font-mono text-stone-900 dark:text-stone-100">
                              {formatCurrency(sub)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-stone-50 dark:bg-stone-800/80 font-bold border-t border-stone-200 dark:border-stone-700">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-stone-700 dark:text-stone-300">
                          Costo Total del Batch ({selectedReceta.batch_size_kg} kg brutos):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-900 dark:text-stone-100">
                          {formatCurrency(calculateLiveCost(selectedReceta) * ((selectedReceta.batch_size_kg * selectedReceta.expected_yield_pct) / 100))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Tarjetas de Listas de Precios y Márgenes Sugeridos */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Listas de Precios y Márgenes de Ganancia Calculados
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Mayorista */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#faf6f0] dark:bg-stone-800/40">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-stone-800 dark:text-stone-200">Lista Mayorista</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        +{selectedReceta.margins.mayorista_pct}%
                      </span>
                    </div>
                    <p className="text-lg font-bold font-serif text-[#781d28] dark:text-[#f8a5af]">
                      {formatCurrency(selectedReceta.prices.mayorista)}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1">Fiambrerías y Queserías</span>
                  </div>

                  {/* Minorista */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#faf6f0] dark:bg-stone-800/40">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-stone-800 dark:text-stone-200">Lista Minorista</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        +{selectedReceta.margins.minorista_pct}%
                      </span>
                    </div>
                    <p className="text-lg font-bold font-serif text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(selectedReceta.prices.minorista)}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1">Venta Directa de Fábrica</span>
                  </div>

                  {/* Distribuidor */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#faf6f0] dark:bg-stone-800/40">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-stone-800 dark:text-stone-200">Distribuidor</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        +{selectedReceta.margins.distribuidor_pct}%
                      </span>
                    </div>
                    <p className="text-lg font-bold font-serif text-blue-700 dark:text-blue-400">
                      {formatCurrency(selectedReceta.prices.distribuidor)}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1">Supermercados y Grandes Cuentas</span>
                  </div>

                </div>
              </div>

              {/* Protocolo de Elaboración */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Protocolo Técnico de Elaboración
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl">
                  {selectedReceta.instructions.map((inst, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {inst}
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
