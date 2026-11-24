import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Calendar,
  Layers,
  History,
  X,
  Check
} from 'lucide-react';
import { Insumo, InsumoCategory } from '../../types';
import { store } from '../../services/store';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InsumosView: React.FC = () => {
  const state = store.getState();
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState<Insumo | null>(null);
  const [adjustType, setAdjustType] = useState<'ingreso' | 'egreso' | 'ajuste'>('ingreso');
  const [adjustQty, setAdjustQty] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Recepción de mercadería de proveedor');
  const [supplierLot, setSupplierLot] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [newInsumo, setNewInsumo] = useState<Partial<Insumo>>({
    code: `INS-${Date.now().toString().slice(-4)}`,
    name: '',
    category: 'carnes',
    unit: 'kg',
    current_stock: 100,
    min_stock: 25,
    cost_per_unit: 4500,
    supplier_id: state.proveedores[0]?.id || '',
    supplier_lot: 'LOT-PROV-001',
    expiration_date: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
    location: 'Cámara 1 - Desposte'
  });

  const categories = [
    { id: 'todas', label: 'Todas las Categorías' },
    { id: 'carnes', label: 'Carnes de Cerdo y Vacunas' },
    { id: 'especias_condimentos', label: 'Especias y Condimentos' },
    { id: 'aditivos_curantes', label: 'Sales de Cura y Aditivos' },
    { id: 'tripas_envolturas', label: 'Tripas y Envolturas' },
    { id: 'envasado_packaging', label: 'Envases y Bolsas Vacío' },
  ];

  const filteredInsumos = state.insumos.filter(insumo => {
    const matchesCategory = selectedCategory === 'todas' || insumo.category === selectedCategory;
    const matchesSearch = insumo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          insumo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          insumo.supplier_lot.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjustModal) return;
    store.adjustInsumoStock(showAdjustModal.id, adjustQty, adjustType, adjustReason, supplierLot);
    setShowAdjustModal(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prov = state.proveedores.find(p => p.id === newInsumo.supplier_id);
    store.addInsumo({
      code: newInsumo.code || `INS-${Date.now().toString().slice(-4)}`,
      name: newInsumo.name || 'Materia Prima',
      category: newInsumo.category as InsumoCategory,
      unit: newInsumo.unit || 'kg',
      current_stock: Number(newInsumo.current_stock) || 0,
      min_stock: Number(newInsumo.min_stock) || 0,
      cost_per_unit: Number(newInsumo.cost_per_unit) || 0,
      supplier_id: newInsumo.supplier_id || '',
      supplier_name: prov?.business_name,
      supplier_lot: newInsumo.supplier_lot || 'LOTE-DEFAULT',
      expiration_date: newInsumo.expiration_date || new Date().toISOString().slice(0, 10),
      location: newInsumo.location || 'Depósito'
    });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Materia Prima e Insumos de Fábrica
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Control de inventario, lotes de proveedores, alertas de stock mínimo y costos
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Insumo</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-[#201d1c] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o lote de proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#781d28]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-[#781d28] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf6f0] dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Código / Nombre</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Stock Actual</th>
                <th className="py-3 px-4">Mínimo</th>
                <th className="py-3 px-4">Lote Proveedor</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4">Costo Unit.</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filteredInsumos.map((insumo) => {
                const isCritical = insumo.current_stock <= insumo.min_stock;
                return (
                  <tr key={insumo.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isCritical 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}>
                          <Wheat className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 dark:text-stone-100">{insumo.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">{insumo.code} - {insumo.location}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 capitalize text-stone-600 dark:text-stone-400">
                      {insumo.category.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold font-mono text-sm ${
                          isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {insumo.current_stock.toLocaleString('es-AR')} {insumo.unit}
                        </span>
                        {isCritical && (
                          <span className="p-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" title="Stock Crítico">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 font-mono">
                      {insumo.min_stock} {insumo.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-700 dark:text-stone-300">
                      {insumo.supplier_lot || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                      {formatDate(insumo.expiration_date)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {formatCurrency(insumo.cost_per_unit)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setShowAdjustModal(insumo);
                          setAdjustQty(50);
                          setSupplierLot(insumo.supplier_lot);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#781d28] dark:text-[#f8a5af] bg-[#781d28]/10 hover:bg-[#781d28]/20 rounded-lg transition"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuste de Stock */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Movimiento de Stock</h3>
                <p className="text-xs text-white/80">{showAdjustModal.name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ingreso')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                      adjustType === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Ingreso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('egreso')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                      adjustType === 'egreso' ? 'bg-rose-600 text-white border-rose-600' : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Egreso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('ajuste')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                      adjustType === 'ajuste' ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Fijar Total</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cantidad ({showAdjustModal.unit})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Lote de Proveedor (remito / etiqueta)
                </label>
                <input
                  type="text"
                  value={supplierLot}
                  onChange={(e) => setSupplierLot(e.target.value)}
                  placeholder="Ej: LOT-PAMPA-9012"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Motivo del Movimiento
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Recepción, merma por descarte, ajuste de inventario..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(null)}
                  className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alta de Insumo Completo */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Nuevo Insumo / Materia Prima</h3>
                <p className="text-xs text-white/80">Incorporar nuevo componente a la lista de insumos</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nombre descriptivo del Insumo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tripa Natural Porcina 38/42 mm"
                  value={newInsumo.name}
                  onChange={(e) => setNewInsumo({ ...newInsumo, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    value={newInsumo.code}
                    onChange={(e) => setNewInsumo({ ...newInsumo, code: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newInsumo.category}
                    onChange={(e: any) => setNewInsumo({ ...newInsumo, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="carnes">Carnes Porcinas y Vacunas</option>
                    <option value="especias_condimentos">Especias y Condimentos</option>
                    <option value="aditivos_curantes">Sales de Cura y Aditivos</option>
                    <option value="tripas_envolturas">Tripas y Envolturas</option>
                    <option value="envasado_packaging">Bolsas al Vacío y Envases</option>
                    <option value="otros">Otros Insumos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unidad
                  </label>
                  <select
                    value={newInsumo.unit}
                    onChange={(e: any) => setNewInsumo({ ...newInsumo, unit: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="kg">kg</option>
                    <option value="g">gramos</option>
                    <option value="metro">metros</option>
                    <option value="unidad">unidad</option>
                    <option value="l">litros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newInsumo.current_stock}
                    onChange={(e) => setNewInsumo({ ...newInsumo, current_stock: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newInsumo.min_stock}
                    onChange={(e) => setNewInsumo({ ...newInsumo, min_stock: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Costo Unitario ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newInsumo.cost_per_unit}
                    onChange={(e) => setNewInsumo({ ...newInsumo, cost_per_unit: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Proveedor Habitual
                  </label>
                  <select
                    value={newInsumo.supplier_id}
                    onChange={(e) => setNewInsumo({ ...newInsumo, supplier_id: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    {state.proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.business_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Lote de Proveedor
                  </label>
                  <input
                    type="text"
                    value={newInsumo.supplier_lot}
                    onChange={(e) => setNewInsumo({ ...newInsumo, supplier_lot: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={newInsumo.expiration_date}
                    onChange={(e) => setNewInsumo({ ...newInsumo, expiration_date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Dar de Alta Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
