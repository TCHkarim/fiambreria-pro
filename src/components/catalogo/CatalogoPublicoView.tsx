import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  Check,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Phone
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';
import { openWhatsApp } from '../../services/whatsappService';

export const CatalogoPublicoView: React.FC = () => {
  const state = store.getState();
  const [selectedList, setSelectedList] = useState<'mayorista' | 'minorista'>('mayorista');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerZone, setCustomerZone] = useState('Zona Norte');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const updateCart = (productId: string, delta: number) => {
    const current = cart[productId] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      const copy = { ...cart };
      delete copy[productId];
      setCart(copy);
    } else {
      setCart({ ...cart, [productId]: next });
    }
  };

  const cartItems = Object.entries(cart).map(([prodId, qty]) => {
    const prod = state.productosTerminados.find(p => p.id === prodId);
    const unitPrice = prod?.prices[selectedList] || 0;
    return {
      prod,
      qty,
      unitPrice,
      subtotal: unitPrice * qty
    };
  }).filter(item => item.prod !== undefined);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSendOrderWhatsApp = () => {
    if (cartItems.length === 0) {
      alert('Por favor sumá al menos un producto a tu pedido');
      return;
    }
    if (!customerName || !customerAddress) {
      alert('Por favor completá tu nombre/comercio y dirección de entrega');
      return;
    }

    const message = `🥓 *PEDIDO NUEVO - DON BAUTISTA FIAMBRES*
🏪 *Cliente / Comercio:* ${customerName}
📍 *Dirección:* ${customerAddress} (${customerZone})
📱 *Teléfono:* ${customerPhone || 'El de este chat'}
📅 *Fecha de entrega preferida:* ${preferredDate}
🏷️ *Lista aplicada:* ${selectedList.toUpperCase()}

🛒 *Detalle de Productos:*
${cartItems.map(i => `• ${i.qty} ${i.prod?.unit || 'kg'} - ${i.prod?.name} (${formatCurrency(i.subtotal)})`).join('\n')}

💰 *TOTAL ESTIMADO:* ${formatCurrency(cartTotal)}

📝 *Observaciones:* ${notes || 'Sin observaciones adicionales'}

¡Aguardamos su confirmación de stock y horario de entrega de fábrica!`;

    // Abrir WhatsApp con el número de la fábrica
    openWhatsApp(state.empresa.whatsapp || '5491155443322', message);
  };

  const copyCatalogLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Bienvenida Artesanal */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#781d28] via-[#8c2230] to-[#5c121c] text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/20 rounded-full">
            CATÁLOGO DIRECTO DE FÁBRICA
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Chacinados & Fiambres Artesanales Don Bautista
          </h2>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
            Elaboración con carnes seleccionadas, secado tradicional en Tandil y bajo contenido de sodio. Armá tu pedido por mayor o menor y recibilo en tu comercio.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={copyCatalogLink}
              className="px-3.5 py-1.5 bg-white text-[#781d28] hover:bg-stone-100 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace para Clientes'}</span>
            </button>
            <span className="text-[11px] text-white/70">
              SENASA Estab. N° 4512 | Envíos en CABA y Gran Buenos Aires
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Lista de Precios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#201d1c] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Precios según condición:
          </span>
          <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
            <button
              onClick={() => setSelectedList('mayorista')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                selectedList === 'mayorista' ? 'bg-[#781d28] text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Mayorista (Fiambrerías & Gastronomía)
            </button>
            <button
              onClick={() => setSelectedList('minorista')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                selectedList === 'minorista' ? 'bg-[#781d28] text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Minorista (Venta Mostrador)
            </button>
          </div>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          {cartItems.length} producto(s) en tu pedido | Total: <strong className="text-[#781d28] dark:text-[#f8a5af] font-mono text-sm">{formatCurrency(cartTotal)}</strong>
        </div>
      </div>

      {/* Grid: Lista de Productos y Carrito Flotante */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productos Disponibles (2 Columnas) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.productosTerminados.map((prod) => {
            const qtyInCart = cart[prod.id] || 0;
            const price = prod.prices[selectedList] || prod.prices.mayorista;

            return (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        {prod.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                        {prod.name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Precio por {prod.unit}:</span>
                    <span className="text-base font-bold font-serif text-[#781d28] dark:text-[#f8a5af]">
                      {formatCurrency(price)}
                    </span>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center space-x-2">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                        <button
                          onClick={() => updateCart(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center hover:bg-stone-200 transition shadow-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold font-mono text-xs px-2 text-stone-900 dark:text-stone-100">
                          {qtyInCart} {prod.unit}
                        </span>
                        <button
                          onClick={() => updateCart(prod.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#781d28] text-white flex items-center justify-center hover:bg-[#5c121c] transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateCart(prod.id, prod.unit === 'kg' ? 5 : 1)}
                        className="px-3.5 py-1.5 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Carrito Flotante y Formulario de Envío por WhatsApp */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#781d28]" />
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  Resumen de tu Pedido
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#781d28]">
                {cartItems.length} items
              </span>
            </div>

            {/* Lista de Items en Carrito */}
            {cartItems.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center italic">
                Seleccioná productos del catálogo para armar tu pedido
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-800 dark:text-stone-200">{item.prod?.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {item.qty} {item.prod?.unit} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Carrito */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-sm">
              <span className="font-bold text-stone-700 dark:text-stone-300">Total Estimado:</span>
              <span className="font-serif font-bold text-lg text-[#781d28] dark:text-[#f8a5af]">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            {/* Formulario de Datos para WhatsApp */}
            <div className="space-y-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                  Nombre de Fantasía o Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fiambrería Don Pepe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                  Dirección y Localidad
                </label>
                <input
                  type="text"
                  placeholder="Calle, altura, barrio"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                    Zona
                  </label>
                  <select
                    value={customerZone}
                    onChange={(e) => setCustomerZone(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Oeste">Zona Oeste</option>
                    <option value="Zona Sur">Zona Sur</option>
                    <option value="CABA Centro">CABA Centro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                    Fecha Deseada
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                  Indicaciones / Aclaraciones
                </label>
                <input
                  type="text"
                  placeholder="Horario de recepción, feteado, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Botón WhatsApp */}
            <button
              onClick={handleSendOrderWhatsApp}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Pedido por WhatsApp</span>
            </button>
            <p className="text-[10px] text-stone-400 text-center leading-tight">
              Al hacer clic se abrirá WhatsApp con el pedido redactado para el equipo de ventas de Don Bautista.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
