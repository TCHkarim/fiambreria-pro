import React, { useState } from 'react';
import {
  ReceiptText,
  DollarSign,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Calendar,
  Layers,
  PieChart,
  CheckCircle,
  QrCode,
  X,
  Check
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MovimientoCaja } from '../../types';

export const FinanzasView: React.FC = () => {
  const state = store.getState();
  const [activeTab, setActiveTab] = useState<'caja' | 'facturacion' | 'rentabilidad'>('caja');
  const [showCajaModal, setShowCajaModal] = useState(false);

  // Estados nuevo movimiento caja
  const [movType, setMovType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [movCategory, setMovCategory] = useState<MovimientoCaja['category']>('cobranza_cliente');
  const [movAmount, setMovAmount] = useState(50000);
  const [movPaymentMethod, setMovPaymentMethod] = useState<'efectivo' | 'transferencia' | 'cheque'>('efectivo');
  const [movDesc, setMovDesc] = useState('');
  const [movResponsible, setMovResponsible] = useState(state.currentUser.name);

  // Cálculos de Caja
  const totalIngresos = state.movimientosCaja.filter(m => m.type === 'ingreso').reduce((acc, m) => acc + m.amount, 0);
  const totalEgresos = state.movimientosCaja.filter(m => m.type === 'egreso').reduce((acc, m) => acc + m.amount, 0);
  const saldoCaja = totalIngresos - totalEgresos;

  const handleCajaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addMovimientoCaja({
      type: movType,
      category: movCategory,
      amount: movAmount,
      payment_method: movPaymentMethod,
      description: movDesc || 'Movimiento de caja diaria',
      responsible: movResponsible
    });
    setShowCajaModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Facturación, Caja Diaria y Finanzas
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Comprobantes con IVA discriminado (ARCA/AFIP ready), control de caja chica y rentabilidad por producto
          </p>
        </div>

        <button
          onClick={() => setShowCajaModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Movimiento de Caja</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        {[
          { id: 'caja', label: 'Caja Diaria y Arqueo' },
          { id: 'facturacion', label: 'Comprobantes e IVA (AFIP / ARCA)' },
          { id: 'rentabilidad', label: 'Análisis de Rentabilidad' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === t.id
                ? 'bg-[#781d28] text-white shadow-xs'
                : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CAJA DIARIA */}
      {activeTab === 'caja' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Tarjetas Resumen de Caja */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Ingresos del Día</span>
              <p className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalIngresos)}
              </p>
              <span className="text-[11px] text-stone-500">Cobranzas y mostrador</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Egresos y Gastos</span>
              <p className="text-xl font-serif font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(totalEgresos)}
              </p>
              <span className="text-[11px] text-stone-500">Combustible, insumos y compras</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#781d28] to-[#9b2837] text-white shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">Saldo Actual en Caja</span>
              <p className="text-2xl font-serif font-bold mt-1">
                {formatCurrency(saldoCaja)}
              </p>
              <span className="text-[11px] text-white/80">Efectivo disponible en planta</span>
            </div>
          </div>

          {/* Tabla de Movimientos de Caja */}
          <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Concepto / Descripción</th>
                    <th className="py-3 px-4">Medio de Pago</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {state.movimientosCaja.map((mov) => {
                    const isIngreso = mov.type === 'ingreso';

                    return (
                      <tr key={mov.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="py-3.5 px-4 font-mono text-stone-500">{mov.date_time}</td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isIngreso ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isIngreso ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            <span>{mov.type}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-stone-800 dark:text-stone-200">
                          {mov.description}
                        </td>

                        <td className="py-3.5 px-4 capitalize text-stone-600 dark:text-stone-400">
                          {mov.payment_method}
                        </td>

                        <td className="py-3.5 px-4 text-stone-500">
                          {mov.responsible}
                        </td>

                        <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                          isIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isIngreso ? '+' : '-'}{formatCurrency(mov.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: COMPROBANTES E IVA */}
      {activeTab === 'facturacion' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start space-x-3 text-xs">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-200">
                Módulo Preparado para Facturación Electrónica AFIP / ARCA
              </p>
              <p className="text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
                Estructura de comprobantes con IVA discriminado (21% y 10.5%), alícuotas según Código Alimentario, simulación de CAE con vencimiento y código de barras reglamentario para Facturas A y B.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Comprobante N°</th>
                    <th className="py-3 px-4">Cliente / CUIT</th>
                    <th className="py-3 px-4">Neto Gravado</th>
                    <th className="py-3 px-4">IVA 21%</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">CAE Oficial</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {state.pedidos.map((p, idx) => {
                    const client = state.clientes.find(c => c.id === p.client_id);
                    const isRI = client?.iva_condition === 'Responsable Inscripto';
                    const tipoFactura = isRI ? 'Factura A' : 'Factura B';
                    const numFactura = `0001-${String(idx + 8420).padStart(8, '0')}`;
                    const caeMock = `742019842${idx}091`;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="py-3.5 px-4">
                          <span className="font-bold font-mono text-stone-900 dark:text-stone-100 block">
                            {tipoFactura} {numFactura}
                          </span>
                          <span className="text-[10px] text-stone-400">Ref: {p.order_number}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-800 dark:text-stone-200 block">{p.client_name}</span>
                          <span className="text-[10px] font-mono text-stone-400">CUIT: {p.client_cuit}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-stone-700 dark:text-stone-300">
                          {formatCurrency(p.subtotal)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-400">
                          {formatCurrency(p.tax_amount)}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#781d28] dark:text-[#f8a5af]">
                          {formatCurrency(p.total)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                            CAE: {caeMock}
                          </span>
                          <span className="text-[10px] text-stone-400">Vto: 10 días</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            Autorizada
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RENTABILIDAD */}
      {activeTab === 'rentabilidad' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">
              Margen Bruto de Ganancia por Variedad de Chacinado
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Comparativa de Costo de Elaboración vs Precio de Venta Mayorista
            </p>

            <div className="space-y-3">
              {state.recetas.map((r) => {
                const cost = r.calculated_cost_per_kg;
                const price = r.prices.mayorista;
                const margin = price - cost;
                const marginPct = Math.round((margin / price) * 100);

                return (
                  <div key={r.id} className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{r.product_name}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Margen: {formatCurrency(margin)}/kg ({marginPct}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span>Costo Insumos: {formatCurrency(cost)}</span>
                      <span>Venta Mayorista: {formatCurrency(price)}</span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div style={{ width: `${marginPct}%` }} className="h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimiento de Caja */}
      {showCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">Registrar Movimiento de Caja</h3>
              <button onClick={() => setShowCajaModal(false)} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCajaSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovType('ingreso')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                      movType === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Ingreso a Caja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovType('egreso')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                      movType === 'egreso' ? 'bg-rose-600 text-white border-rose-600' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Egreso / Retiro</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Monto ($ ARS)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={movAmount}
                  onChange={(e) => setMovAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Concepto / Detalle
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cobranza fiambrería, compra de elementos de limpieza..."
                  value={movDesc}
                  onChange={(e) => setMovDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCajaModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-sm"
                >
                  Registrar en Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
