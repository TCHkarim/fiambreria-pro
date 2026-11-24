import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
  Truck,
  Plus,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
  Flame,
  Scale
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency, formatWeight, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { generateRemitoPDF } from '../../services/pdfService';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  openQuickModal: (type: 'pedido' | 'produccion' | 'insumo' | 'cobranza') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  openQuickModal
}) => {
  const state = store.getState();
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes');

  // Cálculos de KPIs
  const totalVentas = state.pedidos.reduce((acc, p) => acc + (p.status !== 'cancelado' ? p.total : 0), 0);
  const totalKilosProduccion = state.ordenesProduccion.reduce((acc, op) => acc + op.actual_quantity_kg, 0);
  const totalCuentasPorCobrar = state.clientes.reduce((acc, c) => acc + (c.balance || 0), 0);
  const insumosCriticos = state.insumos.filter(i => i.current_stock <= i.min_stock);
  const lotesPorVencer = state.lotes.filter(l => {
    const diff = (new Date(l.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff > 0 && diff <= 30;
  });
  const pedidosPendientes = state.pedidos.filter(p => p.status === 'pendiente' || p.status === 'en_preparacion');
  const entregasHoy = state.repartos.flatMap(r => r.stops).filter(s => s.status === 'pendiente');

  return (
    <div className="space-y-6">
      
      {/* Barra Superior del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Panel de Control General
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Resumen operativo y comercial de la fábrica de chacinados
          </p>
        </div>

        {/* Selector de Período y Botón Rápido */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex p-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setPeriodo('hoy')}
              className={`px-3 py-1.5 rounded-lg transition ${periodo === 'hoy' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold' : 'text-stone-600 dark:text-stone-400'}`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-3 py-1.5 rounded-lg transition ${periodo === 'semana' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold' : 'text-stone-600 dark:text-stone-400'}`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-3 py-1.5 rounded-lg transition ${periodo === 'mes' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold' : 'text-stone-600 dark:text-stone-400'}`}
            >
              Este Mes
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Stocks Críticos o Documentación */}
      {(insumosCriticos.length > 0 || lotesPorVencer.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Atención requerida en Planta & Cámaras
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {insumosCriticos.length > 0 && `Hay ${insumosCriticos.length} insumo(s) por debajo del stock mínimo de seguridad.`}
                {lotesPorVencer.length > 0 && ` Hay ${lotesPorVencer.length} lote(s) en cámara próximos a vencer (FEFO prioritario).`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('insumos')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 text-xs font-semibold rounded-xl transition self-end sm:self-center"
          >
            Ver Insumos
          </button>
        </div>
      )}

      {/* Tarjetas Principales de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ventas */}
        <div 
          onClick={() => onNavigate('pedidos')}
          className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Ventas Facturadas</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
            {formatCurrency(totalVentas)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Producción en kg */}
        <div 
          onClick={() => onNavigate('produccion')}
          className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Producción Real</span>
            <div className="p-2 rounded-xl bg-[#781d28]/10 text-[#781d28] dark:text-[#f8a5af]">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
            {formatWeight(totalKilosProduccion)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-stone-500 dark:text-stone-400">
            <Scale className="w-3.5 h-3.5 text-stone-400" />
            <span>Rendimiento medio: 82.4%</span>
          </div>
        </div>

        {/* KPI 3: Cuentas por Cobrar */}
        <div 
          onClick={() => onNavigate('cobranzas')}
          className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Cuentas por Cobrar</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
            {formatCurrency(totalCuentasPorCobrar)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            <span>5 clientes con saldo pendiente</span>
          </div>
        </div>

        {/* KPI 4: Entregas y Pedidos */}
        <div 
          onClick={() => onNavigate('reparto')}
          className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Entregas de Hoy</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
            {entregasHoy.length} paradas
          </p>
          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            <span>Zona Norte en curso (Sprinter)</span>
          </div>
        </div>

      </div>

      {/* Botones de Acceso Rápido Siempre a Mano */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#781d28] via-[#8c2230] to-[#5c121c] text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-sm tracking-wide">Acciones Operativas Rápidas</h3>
            <p className="text-[11px] text-white/80">Dispará una nueva tarea de fábrica sin cambiar de pantalla</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openQuickModal('pedido')}
              className="px-3 py-1.5 bg-white text-[#781d28] hover:bg-stone-100 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Pedido</span>
            </button>
            <button
              onClick={() => openQuickModal('produccion')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Nueva Producción</span>
            </button>
            <button
              onClick={() => openQuickModal('cobranza')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gráficos de Tendencia Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Evolución de Ventas y Producción */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                Tendencia de Ventas Semanales (en miles de $ ARS)
              </h3>
              <p className="text-[11px] text-stone-500">Comparativa de despachos mayoristas vs minoristas</p>
            </div>
            <span className="text-xs font-semibold text-[#781d28] dark:text-[#f8a5af]">Noviembre 2026</span>
          </div>

          {/* Gráfico SVG artesanal limpio */}
          <div className="h-48 w-full flex items-end justify-between pt-6 px-2 gap-3 border-b border-stone-200 dark:border-stone-800">
            {[
              { label: 'Sem 1', valMayorista: 65, valMinorista: 25, total: '$920k' },
              { label: 'Sem 2', valMayorista: 80, valMinorista: 30, total: '$1.15M' },
              { label: 'Sem 3', valMayorista: 75, valMinorista: 35, total: '$1.08M' },
              { label: 'Sem 4', valMayorista: 95, valMinorista: 45, total: '$1.42M' },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-stone-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                  {col.total}
                </span>
                <div className="w-full max-w-[48px] flex flex-col items-center gap-1">
                  <div 
                    style={{ height: `${col.valMayorista}%` }} 
                    className="w-full bg-[#781d28] hover:bg-[#5c121c] rounded-t-lg transition-all"
                    title={`Mayorista: ${col.valMayorista}%`}
                  />
                  <div 
                    style={{ height: `${col.valMinorista}%` }} 
                    className="w-full bg-[#c68a35] hover:bg-[#a67127] rounded-b-lg transition-all"
                    title={`Minorista: ${col.valMinorista}%`}
                  />
                </div>
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-2">
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-6 mt-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#781d28]" />
              <span className="text-stone-600 dark:text-stone-400">Canal Mayorista & Distribuidores</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#c68a35]" />
              <span className="text-stone-600 dark:text-stone-400">Venta Minorista & Mostrador</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Variedad de Chacinado */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
              Mix de Producción en Kilos
            </h3>
            <p className="text-[11px] text-stone-500 mb-4">Participación por tipo de producto en planta</p>
            
            <div className="space-y-3">
              {[
                { name: 'Salames Curados (Tandil/Caroya)', pct: 38, color: 'bg-[#781d28]', kg: '345.5 kg' },
                { name: 'Jamón Cocido Artesanal', pct: 31, color: 'bg-rose-500', kg: '286.0 kg' },
                { name: 'Paleta Cocida Fiambrera', pct: 18, color: 'bg-amber-600', kg: '165.0 kg' },
                { name: 'Bondiola Curada & Especialidades', pct: 13, color: 'bg-purple-600', kg: '120.0 kg' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{item.name}</span>
                    <span className="font-bold text-stone-800 dark:text-stone-100">{item.kg} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${item.pct}%` }} 
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('stock')}
            className="w-full mt-4 py-2 text-xs font-semibold text-[#781d28] dark:text-[#f8a5af] bg-[#781d28]/10 hover:bg-[#781d28]/20 rounded-xl transition"
          >
            Ver Stock Detallado por Lotes
          </button>
        </div>

      </div>

      {/* Dos Columnas Inferiores: Entregas del Día y Últimos Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Entregas del Día */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#781d28]" />
              <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                Entregas Programadas para Hoy
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reparto')}
              className="text-xs text-[#781d28] dark:text-[#f8a5af] hover:underline flex items-center space-x-1"
            >
              <span>Ver Hoja de Ruta</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {state.repartos[0]?.stops.map((stop, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition flex items-center justify-between"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{stop.client_name}</p>
                    <p className="text-[11px] text-stone-500">{stop.address}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-mono">
                      {stop.notes || 'Entrega estándar'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {formatCurrency(stop.total_amount)}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                    stop.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Últimos Pedidos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                Últimos Pedidos Registrados
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pedidos')}
              className="text-xs text-[#781d28] dark:text-[#f8a5af] hover:underline flex items-center space-x-1"
            >
              <span>Ver Todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {state.pedidos.slice(0, 4).map((p) => {
              const client = state.clientes.find(c => c.id === p.client_id);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{p.order_number}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getOrderStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mt-0.5">{p.client_name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {p.items.length} productos | Entrega: {formatDate(p.delivery_date)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {formatCurrency(p.total)}
                      </p>
                      <span className="text-[10px] text-stone-400 capitalize">{p.payment_method.replace('_', ' ')}</span>
                    </div>

                    <button
                      onClick={() => generateRemitoPDF(p, client, state.empresa)}
                      title="Descargar Remito PDF Oficial"
                      className="p-1.5 rounded-lg text-[#781d28] dark:text-[#f8a5af] hover:bg-[#781d28]/10 transition"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
