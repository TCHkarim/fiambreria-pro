import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Thermometer,
  FileCheck,
  FileText,
  AlertOctagon,
  ArrowRight,
  Truck,
  Users,
  Wheat,
  Calendar,
  Layers,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  Check
} from 'lucide-react';
import { store } from '../../services/store';
import { formatDate, formatWeight, formatCurrency } from '../../utils/formatters';

export const TrazabilidadCalidadView: React.FC = () => {
  const state = store.getState();
  const [activeTab, setActiveTab] = useState<'genealogia' | 'temperaturas' | 'higiene' | 'documentos' | 'incidencias'>('genealogia');

  // Lote seleccionado para la genealogía completa
  const [searchLotCode, setSearchLotCode] = useState(state.lotes[1]?.batch_number || 'LOT-SAL-2026-07');
  const [showTempModal, setShowTempModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Estados nueva temperatura
  const [newChamberId, setNewChamberId] = useState('cam-2');
  const [newChamberName, setNewChamberName] = useState('Secadero Tandil (Salames & Bondiolas)');
  const [newTempC, setNewTempC] = useState(14.0);
  const [newHumidity, setNewHumidity] = useState(76);
  const [newTempOperator, setNewTempOperator] = useState('Esteban Morales');
  const [newTempNotes, setNewTempNotes] = useState('');

  // Buscar información del lote seleccionado
  const selectedLote = state.lotes.find(l => l.batch_number.toLowerCase() === searchLotCode.toLowerCase()) || state.lotes[0];
  const relatedOp = state.ordenesProduccion.find(op => op.batch_number === selectedLote?.batch_number);

  // Pedidos que contienen este lote
  const relatedOrders = state.pedidos.filter(p => 
    p.items.some(i => i.batch_number === selectedLote?.batch_number || i.product_id === selectedLote?.product_id)
  );

  const handleTempSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addControlTemperatura({
      chamber_id: newChamberId,
      chamber_name: newChamberName,
      date_time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      temperature_c: newTempC,
      humidity_pct: newHumidity,
      target_temp_min: newChamberId === 'cam-2' ? 12 : 1,
      target_temp_max: newChamberId === 'cam-2' ? 15 : 4,
      operator: newTempOperator,
      notes: newTempNotes
    });
    setShowTempModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Trazabilidad, Calidad y Buenas Prácticas (BPM)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Genealogía completa de lote a cliente, registro de temperaturas de cámaras, checklists sanitarios y habilitaciones SENASA
          </p>
        </div>
      </div>

      {/* Tabs Internas */}
      <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        {[
          { id: 'genealogia', label: 'Genealogía y Trazabilidad de Lote', icon: Search },
          { id: 'temperaturas', label: 'Control de Temperaturas Cámaras', icon: Thermometer },
          { id: 'higiene', label: 'Checklist de Higiene y BPM', icon: FileCheck },
          { id: 'documentos', label: 'Habilitaciones y Certificados Legales', icon: FileText },
          { id: 'incidencias', label: 'Gestión de Retiro / Incidencias', icon: AlertOctagon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#781d28] text-white shadow-xs'
                  : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENEALOGÍA Y TRAZABILIDAD */}
      {activeTab === 'genealogia' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Selector / Buscador de Lote */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                Rastrear Lote:
              </span>
              <select
                value={selectedLote?.batch_number}
                onChange={(e) => setSearchLotCode(e.target.value)}
                className="w-full sm:w-80 text-xs font-mono font-bold p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-[#781d28] dark:text-[#f8a5af]"
              >
                {state.lotes.map(l => (
                  <option key={l.id} value={l.batch_number}>
                    {l.batch_number} - {l.product_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-stone-500 text-right w-full sm:w-auto">
              Elaborado: <strong className="text-stone-700 dark:text-stone-300">{formatDate(selectedLote?.production_date)}</strong> | Vencimiento: <strong className="text-stone-700 dark:text-stone-300">{formatDate(selectedLote?.expiration_date)}</strong>
            </div>
          </div>

          {/* DIAGRAMA DE FLUJO DE TRAZABILIDAD (Materia Prima -> OP Planta -> Producto Terminado -> Clientes) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Paso 1: Insumos de Origen */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400">
                <Wheat className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">1. Materia Prima en Origen</h4>
              </div>
              <p className="text-[11px] text-stone-500">Lotes de proveedores ingresados e inspeccionados</p>

              <div className="space-y-2">
                {relatedOp?.used_lots.map((lot, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{lot.insumo_name}</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">Lote Prov: <strong>{lot.supplier_lot}</strong></p>
                    <p className="text-[10px] text-stone-500 font-mono">{lot.quantity_used} {lot.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Paso 2: Proceso de Elaboración */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-[#781d28] dark:text-[#f8a5af]">
                <Layers className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">2. Elaboración en Planta</h4>
              </div>
              <p className="text-[11px] text-stone-500">Orden de producción y etapas registradas</p>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 space-y-1 text-xs">
                <p className="font-bold text-stone-800 dark:text-stone-200">{relatedOp?.code}</p>
                <p className="text-[11px] text-stone-500">Responsable: {relatedOp?.responsible_user}</p>
                <p className="text-[11px] text-stone-500">Ubicación: {relatedOp?.chamber_location}</p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60 text-[10px] space-y-0.5">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ 6 etapas completadas</p>
                  <p className="text-stone-500">Rendimiento: {relatedOp?.yield_pct}%</p>
                  <p className="text-stone-500">Merma: {relatedOp?.waste_kg} kg</p>
                </div>
              </div>
            </div>

            {/* Paso 3: Stock y Guarda */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">3. Stock Terminado FEFO</h4>
              </div>
              <p className="text-[11px] text-stone-500">Lote envasado al vacío y rotulado</p>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 space-y-1.5 text-xs">
                <p className="font-mono font-bold text-base text-[#781d28] dark:text-[#f8a5af]">{selectedLote?.batch_number}</p>
                <p className="text-stone-700 dark:text-stone-300 font-medium">{selectedLote?.product_name}</p>
                <p className="text-stone-500 text-[11px]">Cámara: {selectedLote?.chamber_location}</p>
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60">
                  <span className="text-[10px] text-stone-400 block">Kilos Disponibles en Cámara:</span>
                  <span className="text-sm font-bold font-mono text-stone-900 dark:text-stone-100">
                    {formatWeight(selectedLote?.current_kg || 0)} ({selectedLote?.pieces_count} piezas)
                  </span>
                </div>
              </div>
            </div>

            {/* Paso 4: Clientes y Despacho */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <Users className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wide">4. Clientes Despachados</h4>
              </div>
              <p className="text-[11px] text-stone-500">Comercios y fiambrerías que recibieron este lote</p>

              <div className="space-y-2">
                {relatedOrders.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                    Lote aún sin despachos (100% en cámara).
                  </p>
                ) : (
                  relatedOrders.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs">
                      <p className="font-bold text-stone-800 dark:text-stone-200">{p.client_name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">Remito: {p.remito_number || p.order_number}</p>
                      <p className="text-[10px] text-stone-500">Entrega: {formatDate(p.delivery_date)} ({p.client_zone})</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: CONTROL DE TEMPERATURAS */}
      {activeTab === 'temperaturas' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Registro de Temperaturas de Cámaras Frigoríficas y Hornos
              </h3>
              <p className="text-xs text-stone-500">Monitoreo continuo para garantizar cadena de frío e inocuidad SENASA</p>
            </div>
            <button
              onClick={() => setShowTempModal(true)}
              className="px-3.5 py-1.5 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Medición</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400">
                  <tr>
                    <th className="py-3 px-4">Cámara / Equipo</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Temp. Registrada</th>
                    <th className="py-3 px-4">Rango Permitido</th>
                    <th className="py-3 px-4">Humedad %</th>
                    <th className="py-3 px-4">Operador</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {state.temperaturas.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-bold text-stone-800 dark:text-stone-200">{t.chamber_name}</td>
                      <td className="py-3 px-4 font-mono text-stone-500">{t.date_time}</td>
                      <td className="py-3 px-4 font-bold font-mono text-sm text-stone-900 dark:text-stone-100">
                        {t.temperature_c}°C
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-500">
                        {t.target_temp_min}°C a {t.target_temp_max}°C
                      </td>
                      <td className="py-3 px-4 font-mono">{t.humidity_pct ? `${t.humidity_pct}%` : '-'}</td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">{t.operator}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.is_alert ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {t.is_alert ? '¡ALERTA!' : 'Normal OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHECKLIST HIGIENE */}
      {activeTab === 'higiene' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Checklists de Higiene y Buenas Prácticas de Manufactura (BPM)
            </h3>
            <p className="text-xs text-stone-500">Control de sanitización de superficies, indumentaria, control de cloro y balanzas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.checklists.map((chk) => (
              <div key={chk.id} className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase">
                      Área: {chk.area.replace('_', ' ')}
                    </h4>
                    <p className="text-[11px] text-stone-500">Turno: {chk.shift} | Fecha: {formatDate(chk.date)}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Aprobado 100%
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {chk.items.map(item => (
                    <div key={item.id} className="flex items-start space-x-2 text-xs">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-800 dark:text-stone-200">{item.task}</span>
                        {item.notes && <span className="text-stone-400 text-[10px] ml-2">({item.notes})</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  Verificado por: <strong>{chk.verified_by}</strong> (Operador: {chk.operator})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HABILITACIONES Y CERTIFICADOS */}
      {activeTab === 'documentos' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Habilitaciones, Certificaciones y Análisis Bromatológicos
            </h3>
            <p className="text-xs text-stone-500">Control de vigencia y alertas de vencimientos oficiales</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.documentosLegales.map((doc) => (
              <div key={doc.id} className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                      {doc.entity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      doc.status === 'vigente' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">{doc.title}</h4>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">Cert N°: {doc.cert_number}</p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2">{doc.notes}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span>Vencimiento:</span>
                    <strong className="text-stone-800 dark:text-stone-200 font-mono">{formatDate(doc.expiration_date)}</strong>
                  </div>
                  <p className={`text-[10px] mt-1 font-bold ${
                    doc.days_to_expire <= 30 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'
                  }`}>
                    {doc.days_to_expire > 0 ? `Restan ${doc.days_to_expire} días` : '¡VENCIDO!'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INCIDENCIAS Y RETIRO DE PRODUCTO */}
      {activeTab === 'incidencias' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Sin Incidencias ni Retiros de Mercado Activos
              </h3>
              <p className="text-xs text-stone-500">
                Todos los lotes en circulación cumplen con los parámetros fisicoquímicos y microbiológicos de SENASA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Temperatura */}
      {showTempModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Registrar Control de Temperatura</h3>
                <p className="text-xs text-white/80">Planilla diaria de control de frío</p>
              </div>
              <button onClick={() => setShowTempModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTempSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cámara o Equipo
                </label>
                <select
                  value={newChamberName}
                  onChange={(e) => setNewChamberName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  <option value="Cámara 1 - Desposte y Carnes Frescas">Cámara 1 - Desposte (0° a 3°C)</option>
                  <option value="Secadero Tandil (Salames & Bondiolas)">Secadero Tandil (12° a 15°C)</option>
                  <option value="Cámara 3 - Despacho y Producto Terminado">Cámara 3 - Despacho (1° a 4°C)</option>
                  <option value="Horno de Vapor - Cocción Jamones">Horno de Vapor (75° a 82°C)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newTempC}
                    onChange={(e) => setNewTempC(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Humedad Relativa (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newHumidity}
                    onChange={(e) => setNewHumidity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Operador
                </label>
                <input
                  type="text"
                  value={newTempOperator}
                  onChange={(e) => setNewTempOperator(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTempModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Guardar Medición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
