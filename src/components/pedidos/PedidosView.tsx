import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  FileText,
  MessageCircle,
  RotateCcw,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  Calendar,
  X,
  Check,
  ShoppingBag
} from 'lucide-react';
import { Pedido, PedidoEstado, PedidoItem } from '../../types';
import { store } from '../../services/store';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { generateRemitoPDF } from '../../services/pdfService';
import { sendRemitoWhatsApp, sendOrderReadyWhatsApp } from '../../services/whatsappService';

interface PedidosViewProps {
  onNavigateToCatalog?: () => void;
}

export const PedidosView: React.FC<PedidosViewProps> = ({ onNavigateToCatalog }) => {
  const state = store.getState();
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Estados para nuevo pedido
  const [clientId, setClientId] = useState(state.clientes[0]?.id || '');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'cuenta_corriente' | 'efectivo' | 'transferencia' | 'cheque'>('cuenta_corriente');
  const [orderNotes, setOrderNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Items del nuevo pedido
  const [items, setItems] = useState<{ productId: string; quantity: number; unit: 'kg' | 'pieza' }[]>([
    { productId: state.productosTerminados[0]?.id || '', quantity: 10, unit: 'kg' }
  ]);

  const selectedClient = state.clientes.find(c => c.id === clientId) || state.clientes[0];
  const priceList = selectedClient?.price_list || 'mayorista';

  const statuses: { id: string; label: string }[] = [
    { id: 'todas', label: 'Todos los Pedidos' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'en_preparacion', label: 'En Preparación' },
    { id: 'listo', label: 'Listos en Frío' },
    { id: 'en_reparto', label: 'En Reparto' },
    { id: 'entregado', label: 'Entregados' },
  ];

  const filteredPedidos = state.pedidos.filter(p => {
    const matchesStatus = filterStatus === 'todas' || p.status === filterStatus;
    const matchesSearch = p.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.remito_number && p.remito_number.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const addItemRow = () => {
    setItems([...items, { productId: state.productosTerminados[0]?.id || '', quantity: 5, unit: 'kg' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    let subtotal = 0;
    const finalItems: PedidoItem[] = items.map(item => {
      const prod = state.productosTerminados.find(p => p.id === item.productId);
      const unitPrice = prod ? prod.prices[priceList] || prod.prices.mayorista : 5000;
      const itemSub = unitPrice * item.quantity;
      subtotal += itemSub;

      return {
        product_id: item.productId,
        product_name: prod ? prod.name : 'Producto',
        quantity: item.quantity,
        unit: item.unit,
        unit_price: unitPrice,
        subtotal: itemSub
      };
    });

    const tax_amount = subtotal * 0.21;
    const total = subtotal + tax_amount;

    store.addPedido({
      client_id: selectedClient.id,
      client_name: selectedClient.fantasy_name || selectedClient.business_name,
      client_cuit: selectedClient.cuit,
      client_zone: selectedClient.zone,
      client_address: selectedClient.address,
      client_phone: selectedClient.phone,
      client_price_list: priceList,
      date: new Date().toISOString().slice(0, 10),
      delivery_date: deliveryDate,
      status: 'pendiente',
      items: finalItems,
      subtotal,
      discount_pct: 0,
      tax_amount,
      total,
      payment_method: orderPaymentMethod,
      payment_status: 'pendiente',
      paid_amount: 0,
      is_recurring: isRecurring,
      notes: orderNotes
    });

    setShowNewModal(false);
  };

  const handleAdvanceStatus = (pedido: Pedido) => {
    const nextMap: Record<PedidoEstado, PedidoEstado> = {
      pendiente: 'en_preparacion',
      en_preparacion: 'listo',
      listo: 'en_reparto',
      en_reparto: 'entregado',
      entregado: 'entregado',
      cancelado: 'cancelado'
    };
    const nextStatus = nextMap[pedido.status];
    store.updatePedidoStatus(pedido.id, nextStatus);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Pedidos, Ventas y Remitos
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Carga ágil de pedidos, seguimiento de estados en planta, emisión de remitos oficiales en PDF y aviso por WhatsApp
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToCatalog && (
            <button
              onClick={onNavigateToCatalog}
              className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>Ver Catálogo Digital</span>
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>

      {/* Filtros de Estado y Búsqueda */}
      <div className="bg-white dark:bg-[#201d1c] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° pedido, cliente o remito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#781d28]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition ${
                filterStatus === st.id
                  ? 'bg-[#781d28] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista / Tabla de Pedidos */}
      <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Pedido / Fecha</th>
                <th className="py-3 px-4">Cliente / Zona</th>
                <th className="py-3 px-4">Entrega</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Pago</th>
                <th className="py-3 px-4 text-right">Comprobantes & Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filteredPedidos.map((pedido) => {
                const client = state.clientes.find(c => c.id === pedido.client_id);

                return (
                  <tr key={pedido.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold font-mono text-[#781d28] dark:text-[#f8a5af] text-sm block">
                          {pedido.order_number}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{formatDate(pedido.date)}</span>
                        {pedido.is_recurring && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold mt-0.5">
                            Recurrente
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 block">{pedido.client_name}</span>
                        <span className="text-[10px] text-stone-400">{pedido.client_zone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-300">
                      {formatDate(pedido.delivery_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-semibold text-[11px]">
                        {pedido.items.length} productos
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold font-mono text-stone-900 dark:text-stone-100 text-sm">
                      {formatCurrency(pedido.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${getOrderStatusColor(pedido.status)}`}>
                        {pedido.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 capitalize text-[11px] text-stone-600 dark:text-stone-400">
                      {pedido.payment_method.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Botón Avanzar Estado */}
                        {pedido.status !== 'entregado' && (
                          <button
                            onClick={() => handleAdvanceStatus(pedido)}
                            title="Avanzar al siguiente estado"
                            className="px-2 py-1 text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 rounded-lg transition"
                          >
                            Avanzar
                          </button>
                        )}

                        {/* Botón Descarga Remito PDF */}
                        <button
                          onClick={() => generateRemitoPDF(pedido, client, state.empresa)}
                          title="Descargar Remito R Oficial en PDF"
                          className="p-1.5 text-[#781d28] dark:text-[#f8a5af] hover:bg-[#781d28]/10 rounded-lg transition"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Botón WhatsApp */}
                        <button
                          onClick={() => {
                            if (pedido.status === 'listo') {
                              sendOrderReadyWhatsApp(pedido, client, state.empresa);
                            } else {
                              sendRemitoWhatsApp(pedido, client, state.empresa);
                            }
                          }}
                          title="Enviar remito / aviso por WhatsApp"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Repetir Pedido */}
                        <button
                          onClick={() => store.repeatOrder(pedido.id)}
                          title="Repetir este mismo pedido para la próxima semana"
                          className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Pedido Rápido con Múltiples Renglones */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Carga de Pedido de Venta</h3>
                <p className="text-xs text-white/80">Selección de cliente, precios automáticos según lista y fecha de entrega</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Cliente y Condiciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cliente / Razón Social
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium"
                  >
                    {state.clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fantasy_name || c.business_name} ({c.zone} - Lista {c.price_list})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fecha de Entrega Deseada
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Renglones de Productos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Productos del Pedido (Lista: {priceList})
                  </span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-semibold text-[#781d28] dark:text-[#f8a5af] hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Producto</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const prod = state.productosTerminados.find(p => p.id === item.productId);
                    const unitPrice = prod ? prod.prices[priceList] || prod.prices.mayorista : 0;
                    const rowSubtotal = unitPrice * item.quantity;

                    return (
                      <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center gap-2">
                        <div className="flex-1 w-full">
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].productId = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                          >
                            {state.productosTerminados.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].quantity = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono text-center"
                          />
                        </div>

                        <div className="w-20">
                          <select
                            value={item.unit}
                            onChange={(e: any) => {
                              const newItems = [...items];
                              newItems[idx].unit = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                          >
                            <option value="kg">kg</option>
                            <option value="pieza">pieza</option>
                          </select>
                        </div>

                        <div className="w-28 text-right font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                          {formatCurrency(rowSubtotal)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Medios de Pago y Notas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Condición de Pago
                  </label>
                  <select
                    value={orderPaymentMethod}
                    onChange={(e: any) => setOrderPaymentMethod(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="cuenta_corriente">Cuenta Corriente Comercial</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo contra Entrega</option>
                    <option value="cheque">Cheque de Pago Diferido</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="rec_check"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-[#781d28] rounded border-stone-300 focus:ring-[#781d28]"
                  />
                  <label htmlFor="rec_check" className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                    Pedido semanal recurrente (repetir automáticamente)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Indicaciones para el Chofer / Repartidor
                </label>
                <input
                  type="text"
                  placeholder="Ej: Entregar por rampa de descarga, solicitar sello de fiambrera..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              {/* Botones */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-700 flex justify-end space-x-2">
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
                  Emitir Pedido y Remito
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
