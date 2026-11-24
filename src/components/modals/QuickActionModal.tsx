import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';

interface QuickActionModalProps {
  type: 'pedido' | 'produccion' | 'insumo' | 'cobranza' | null;
  onClose: () => void;
  onSuccess: (tabToOpen?: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  type,
  onClose,
  onSuccess
}) => {
  const state = store.getState();

  // Estados para Pedido Rápido
  const [selectedClientId, setSelectedClientId] = useState(state.clientes[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(state.productosTerminados[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'cuenta_corriente' | 'efectivo' | 'transferencia' | 'cheque'>('cuenta_corriente');

  // Estados para Producción Rápida
  const [selectedRecipeId, setSelectedRecipeId] = useState(state.recetas[0]?.id || '');
  const [targetKg, setTargetKg] = useState(100);
  const [responsibleUser, setResponsibleUser] = useState(state.currentUser.name);

  // Estados para Insumo Rápido
  const [insumoName, setInsumoName] = useState('');
  const [insumoCategory, setInsumoCategory] = useState<'carnes' | 'especias_condimentos' | 'aditivos_curantes' | 'tripas_envolturas' | 'envasado_packaging'>('carnes');
  const [insumoStock, setInsumoStock] = useState(100);
  const [insumoCost, setInsumoCost] = useState(4000);
  const [insumoSupplierId, setInsumoSupplierId] = useState(state.proveedores[0]?.id || '');

  // Estados para Cobranza Rápida
  const [cobranzaClientId, setCobranzaClientId] = useState(state.clientes[0]?.id || '');
  const [cobranzaAmount, setCobranzaAmount] = useState(100000);
  const [cobranzaMethod, setCobranzaMethod] = useState<'efectivo' | 'transferencia' | 'cheque' | 'mercado_pago'>('transferencia');
  const [cobranzaRef, setCobranzaRef] = useState('');

  if (!type) return null;

  // Manejo de envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'pedido') {
      const client = state.clientes.find(c => c.id === selectedClientId);
      const product = state.productosTerminados.find(p => p.id === selectedProductId);
      if (!client || !product) return;

      const unitPrice = product.prices[client.price_list] || product.prices.mayorista;
      const subtotal = unitPrice * orderQuantity;
      const tax_amount = subtotal * 0.21;
      const total = subtotal + tax_amount;

      store.addPedido({
        client_id: client.id,
        client_name: client.fantasy_name || client.business_name,
        client_cuit: client.cuit,
        client_zone: client.zone,
        client_address: client.address,
        client_phone: client.phone,
        client_price_list: client.price_list,
        date: new Date().toISOString().slice(0, 10),
        delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        status: 'pendiente',
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity: orderQuantity,
            unit: 'kg',
            unit_price: unitPrice,
            subtotal
          }
        ],
        subtotal,
        discount_pct: 0,
        tax_amount,
        total,
        payment_method: orderPaymentMethod,
        payment_status: 'pendiente',
        paid_amount: 0
      });
      onSuccess('pedidos');
    }

    if (type === 'produccion') {
      const recipe = state.recetas.find(r => r.id === selectedRecipeId);
      if (!recipe) return;

      store.addOrdenProduccion({
        recipe_id: recipe.id,
        target_quantity_kg: targetKg,
        planned_date: new Date().toISOString().slice(0, 10),
        responsible_user: responsibleUser,
        chamber_location: 'Cámara 1 - Desposte'
      });
      onSuccess('produccion');
    }

    if (type === 'insumo') {
      const prov = state.proveedores.find(p => p.id === insumoSupplierId);
      store.addInsumo({
        code: `INS-${Date.now().toString().slice(-4)}`,
        name: insumoName || 'Materia Prima Sin Nombre',
        category: insumoCategory,
        unit: 'kg',
        current_stock: insumoStock,
        min_stock: Math.round(insumoStock * 0.25),
        cost_per_unit: insumoCost,
        supplier_id: insumoSupplierId,
        supplier_name: prov?.business_name || '',
        supplier_lot: `LOT-PROV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        expiration_date: new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10)
      });
      onSuccess('insumos');
    }

    if (type === 'cobranza') {
      const client = state.clientes.find(c => c.id === cobranzaClientId);
      if (!client) return;

      store.addCobranza({
        client_id: client.id,
        client_name: client.fantasy_name || client.business_name,
        date: new Date().toISOString().slice(0, 10),
        amount: cobranzaAmount,
        payment_method: cobranzaMethod,
        reference_number: cobranzaRef || 'Cobranza Rápida Mostrador'
      });
      onSuccess('cobranzas');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg">
              {type === 'pedido' && 'Nuevo Pedido de Venta Rápido'}
              {type === 'produccion' && 'Lanzar Orden de Producción'}
              {type === 'insumo' && 'Alta Rápida de Materia Prima'}
              {type === 'cobranza' && 'Registrar Cobranza / Pago'}
            </h3>
            <p className="text-xs text-white/80">
              Formulario ágil para registrar operaciones de fábrica al instante
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Caso 1: PEDIDO */}
          {type === 'pedido' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cliente Destinatario
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-[#781d28]"
                >
                  {state.clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fantasy_name || c.business_name} ({c.zone} - Lista: {c.price_list})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Producto a despachar
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.productosTerminados.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock_total_kg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cantidad (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Condición de Pago
                  </label>
                  <select
                    value={orderPaymentMethod}
                    onChange={(e: any) => setOrderPaymentMethod(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="cuenta_corriente">Cuenta Corriente (30 días)</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo contra entrega</option>
                    <option value="cheque">Cheque de pago diferido</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Caso 2: PRODUCCIÓN */}
          {type === 'produccion' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Receta / Variedad a Elaborar
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.recetas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.product_name} ({r.code} - Rend. estimado {r.expected_yield_pct}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kilos a Producir (Batch)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={targetKg}
                    onChange={(e) => setTargetKg(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Jefe de Cuadrilla / Operario
                  </label>
                  <input
                    type="text"
                    value={responsibleUser}
                    onChange={(e) => setResponsibleUser(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 italic">
                * Al iniciar la orden se descontarán automáticamente los ingredientes de la receta de los lotes de materia prima en cámara.
              </p>
            </>
          )}

          {/* Caso 3: INSUMO */}
          {type === 'insumo' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nombre del Insumo / Materia Prima
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pernil fresco seleccionado"
                  value={insumoName}
                  onChange={(e) => setInsumoName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={insumoCategory}
                    onChange={(e: any) => setInsumoCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="carnes">Carnes Porcinas y Vacunas</option>
                    <option value="especias_condimentos">Especias y Condimentos</option>
                    <option value="aditivos_curantes">Sales de Cura y Aditivos</option>
                    <option value="tripas_envolturas">Tripas y Envolturas</option>
                    <option value="envasado_packaging">Bolsas al Vacío y Envases</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={insumoSupplierId}
                    onChange={(e) => setInsumoSupplierId(e.target.value)}
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
                    Cantidad Recibida (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={insumoStock}
                    onChange={(e) => setInsumoStock(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Costo Unitario ($/kg)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={insumoCost}
                    onChange={(e) => setInsumoCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>
            </>
          )}

          {/* Caso 4: COBRANZA */}
          {type === 'cobranza' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cliente
                </label>
                <select
                  value={cobranzaClientId}
                  onChange={(e) => setCobranzaClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  {state.clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fantasy_name || c.business_name} (Deuda actual: {formatCurrency(c.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Monto a Cobrar ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={cobranzaAmount}
                    onChange={(e) => setCobranzaAmount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Medio de Cobro
                  </label>
                  <select
                    value={cobranzaMethod}
                    onChange={(e: any) => setCobranzaMethod(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque Físico / eCheq</option>
                    <option value="mercado_pago">Mercado Pago / QR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  N° de Comprobante / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: TRANSF-89412 o Cheque Banco Galicia"
                  value={cobranzaRef}
                  onChange={(e) => setCobranzaRef(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>
            </>
          )}

          {/* Botones de acción */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar y Guardar</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
