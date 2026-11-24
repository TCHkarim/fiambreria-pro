import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Thermometer,
  Layers,
  ArrowRight,
  AlertCircle,
  Scale,
  Sparkles,
  X,
  Check,
  Tag
} from 'lucide-react';
import { OrdenProduccion, EtapaProduccionNombre } from '../../types';
import { store } from '../../services/store';
import { formatDate, formatWeight, getProductionStageLabel } from '../../utils/formatters';

export const ProduccionView: React.FC = () => {
  const state = store.getState();
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [selectedOp, setSelectedOp] = useState<OrdenProduccion>(state.ordenesProduccion[0]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState<OrdenProduccion | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<OrdenProduccion | null>(null);

  // Estados para Avanzar Etapa
  const [stageNotes, setStageNotes] = useState('');
  const [stageTemp, setStageTemp] = useState<number | undefined>(14.0);

  // Estados para Finalizar Orden
  const [actualKg, setActualKg] = useState(105);
  const [actualPieces, setActualPieces] = useState(300);
  const [actualWasteKg, setActualWasteKg] = useState(45);

  // Estados para Nueva Orden
  const [newRecipeId, setNewRecipeId] = useState(state.recetas[0]?.id || '');
  const [newTargetKg, setNewTargetKg] = useState(120);
  const [newPlannedDate, setNewPlannedDate] = useState(new Date().toISOString().slice(0, 10));
  const [newResponsible, setNewResponsible] = useState('Esteban Morales');
  const [newChamber, setNewChamber] = useState('Secadero Tandil - Jaula A');
  const [newNotes, setNewNotes] = useState('');

  const filteredOps = state.ordenesProduccion.filter(op => {
    if (filterStatus === 'todas') return true;
    return op.status === filterStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = store.addOrdenProduccion({
      recipe_id: newRecipeId,
      target_quantity_kg: newTargetKg,
      planned_date: newPlannedDate,
      responsible_user: newResponsible,
      chamber_location: newChamber,
      notes: newNotes
    });
    setSelectedOp(created);
    setShowNewModal(false);
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdvanceModal) return;
    const stage = showAdvanceModal.current_stage as EtapaProduccionNombre;
    store.advanceProductionStage(showAdvanceModal.id, stage, stageNotes, stageTemp);
    setShowAdvanceModal(null);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteModal) return;
    store.completeProduction(showCompleteModal.id, actualKg, actualPieces, actualWasteKg);
    setShowCompleteModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Órdenes de Producción y Elaboración
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Control de 6 etapas de chacinados, descuento automático de insumos, cálculo de rendimiento real y mermas
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Producción</span>
        </button>
      </div>

      {/* Filtros de Estado */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['todas', 'planificada', 'en_proceso', 'completada'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-[#781d28] text-white shadow-xs'
                : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {st === 'todas' ? 'Todas las Órdenes' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid: Lista a la izquierda, Detalle y Timeline a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Tarjetas de Órdenes */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block px-1">
            Órdenes Activas ({filteredOps.length})
          </span>

          {filteredOps.map((op) => {
            const isSelected = selectedOp?.id === op.id;
            return (
              <div
                key={op.id}
                onClick={() => setSelectedOp(op)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                  isSelected
                    ? 'bg-white dark:bg-[#201d1c] border-[#781d28] shadow-md ring-2 ring-[#781d28]/20'
                    : 'bg-white/80 dark:bg-[#1a1716] border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold font-mono text-xs text-[#781d28] dark:text-[#f8a5af]">{op.code}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {op.batch_number}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 mt-1">{op.product_name}</h4>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    op.status === 'completada' ? 'bg-emerald-100 text-emerald-800' :
                    op.status === 'en_proceso' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {op.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <span>Obj: <strong>{formatWeight(op.target_quantity_kg)}</strong></span>
                  <span>Etapa: <strong className="text-stone-700 dark:text-stone-300 capitalize">{op.current_stage.replace('_', ' ')}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna 2 & 3: Detalle de Orden y Timeline de 6 Etapas */}
        <div className="lg:col-span-2 space-y-5">
          {selectedOp && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
              
              {/* Encabezado de la OP */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                      {selectedOp.product_name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#781d28]/10 text-[#781d28] dark:text-[#f8a5af] rounded-lg">
                      {selectedOp.code}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Lote asignado: <strong className="font-mono text-stone-700 dark:text-stone-200">{selectedOp.batch_number}</strong> | Responsable: {selectedOp.responsible_user}
                  </p>
                </div>

                {/* Botones de Acción de la OP */}
                <div className="flex items-center space-x-2">
                  {selectedOp.status === 'en_proceso' && selectedOp.current_stage !== 'finalizado' && (
                    <button
                      onClick={() => setShowAdvanceModal(selectedOp)}
                      className="px-3.5 py-1.5 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Avanzar Etapa</span>
                    </button>
                  )}

                  {selectedOp.status === 'en_proceso' && (
                    <button
                      onClick={() => setShowCompleteModal(selectedOp)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Finalizar y Crear Lote</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Métricas de la Producción */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Kilos Objetivo</span>
                  <span className="text-base font-bold font-mono text-stone-800 dark:text-stone-100">
                    {formatWeight(selectedOp.target_quantity_kg)}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Kilos Reales Netos</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedOp.actual_quantity_kg > 0 ? formatWeight(selectedOp.actual_quantity_kg) : 'En proceso...'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Rendimiento Real</span>
                  <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                    {selectedOp.yield_pct > 0 ? `${selectedOp.yield_pct}%` : '-'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Merma de Secado/Cocción</span>
                  <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                    {selectedOp.waste_kg > 0 ? formatWeight(selectedOp.waste_kg) : '-'}
                  </span>
                </div>
              </div>

              {/* TIMELINE DE LAS 6 ETAPAS DEL PROCESO */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  Seguimiento de las 6 Etapas de Elaboración
                </h4>

                <div className="space-y-3">
                  {selectedOp.stages_log.map((stage, idx) => {
                    const isCompleted = stage.status === 'completada';
                    const isCurrent = stage.status === 'en_curso';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition flex items-start justify-between ${
                          isCompleted
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                            : isCurrent
                            ? 'bg-[#781d28]/5 dark:bg-[#781d28]/20 border-[#781d28] ring-1 ring-[#781d28]'
                            : 'bg-stone-50/60 dark:bg-stone-800/20 border-stone-200 dark:border-stone-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-[#781d28] text-white animate-pulse' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{stage.stage_label}</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {stage.notes || 'Pendiente de inicio'}
                            </p>
                            {stage.temperature_c !== undefined && (
                              <div className="flex items-center space-x-1 text-[11px] font-mono text-stone-600 dark:text-stone-300 mt-1">
                                <Thermometer className="w-3 h-3 text-[#781d28]" />
                                <span>Temp control: {stage.temperature_c}°C</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-[10px] text-stone-400 font-mono">
                          {stage.started_at && <p>Inicio: {stage.started_at}</p>}
                          {stage.completed_at && <p className="text-emerald-700 dark:text-emerald-400 font-bold">Fin: {stage.completed_at}</p>}
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-sans uppercase font-bold text-[9px] ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {stage.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lotes de Insumos Usados (Trazabilidad hacia atrás) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Lotes de Insumos Descontados (Trazabilidad en Origen)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedOp.used_lots.map((lot, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-200">{lot.insumo_name}</p>
                        <p className="text-[10px] font-mono text-stone-400">Lote Prov: {lot.supplier_lot}</p>
                      </div>
                      <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                        {lot.quantity_used} {lot.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Modal Avanzar Etapa */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Completar Etapa Actual</h3>
                <p className="text-xs text-white/80">{getProductionStageLabel(showAdvanceModal.current_stage)}</p>
              </div>
              <button onClick={() => setShowAdvanceModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdvanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Temperatura Registrada en Etapa (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={stageTemp}
                  onChange={(e) => setStageTemp(Number(e.target.value))}
                  placeholder="Ej: 14.2"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Observaciones de Calidad / Proceso
                </label>
                <textarea
                  rows={3}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Ej: Ligado uniforme a 4 minutos. Salame atado a 4 cabos sin aire..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(null)}
                  className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Validar y Avanzar Etapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Finalizar y Crear Lote */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Finalizar Producción y Generar Lote</h3>
                <p className="text-xs text-white/80">{showCompleteModal.product_name}</p>
              </div>
              <button onClick={() => setShowCompleteModal(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kilos Reales Netos Pesados al Envasar
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={actualKg}
                  onChange={(e) => setActualKg(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono text-base font-bold text-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cantidad de Piezas / Bastones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={actualPieces}
                    onChange={(e) => setActualPieces(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Merma Real en Kilos
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={actualWasteKg}
                    onChange={(e) => setActualWasteKg(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Lote a incorporar al Stock Terminado:
                </p>
                <p className="font-mono text-[#781d28] dark:text-[#f8a5af] font-bold text-sm">
                  {showCompleteModal.batch_number}
                </p>
                <p className="text-stone-500 text-[11px]">
                  Rendimiento resultante: {((actualKg / showCompleteModal.target_quantity_kg) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(null)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm"
                >
                  Confirmar e Ingresar a Cámara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Orden de Producción */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Planificar Nueva Orden de Producción</h3>
                <p className="text-xs text-white/80">Lanzamiento de elaboración según fórmula maestra</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Receta / Variedad a Producir
                </label>
                <select
                  value={newRecipeId}
                  onChange={(e) => setNewRecipeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.recetas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.product_name} ({r.code} - Rend. {r.expected_yield_pct}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kilos a Elaborar (Objetivo)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={newTargetKg}
                    onChange={(e) => setNewTargetKg(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fecha Planificada
                  </label>
                  <input
                    type="date"
                    value={newPlannedDate}
                    onChange={(e) => setNewPlannedDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Responsable de Cuadrilla
                  </label>
                  <input
                    type="text"
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cámara / Secadero Asignado
                  </label>
                  <input
                    type="text"
                    value={newChamber}
                    onChange={(e) => setNewChamber(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Notas de Producción
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Destino especial, pedido mayorista, especificación de atado..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Lanzar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
