import React, { useState, useEffect } from 'react';
import { Search, X, Package, Users, ShoppingCart, Wheat, Hash, ArrowRight } from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const state = store.getState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtrado de Resultados
  const filteredProducts = state.productosTerminados.filter(p => 
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  );

  const filteredClients = state.clientes.filter(c => 
    c.business_name.toLowerCase().includes(q) || 
    (c.fantasy_name && c.fantasy_name.toLowerCase().includes(q)) ||
    c.cuit.includes(q) ||
    c.zone.toLowerCase().includes(q)
  );

  const filteredOrders = state.pedidos.filter(o => 
    o.order_number.toLowerCase().includes(q) || 
    o.client_name.toLowerCase().includes(q) ||
    (o.remito_number && o.remito_number.toLowerCase().includes(q))
  );

  const filteredLotes = state.lotes.filter(l => 
    l.batch_number.toLowerCase().includes(q) ||
    l.product_name.toLowerCase().includes(q)
  );

  const filteredInsumos = state.insumos.filter(i => 
    i.name.toLowerCase().includes(q) || 
    i.code.toLowerCase().includes(q)
  );

  const totalResults = filteredProducts.length + filteredClients.length + filteredOrders.length + filteredLotes.length + filteredInsumos.length;

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#201d1c] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        
        {/* Barra de Búsqueda */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex items-center space-x-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por nombre de producto, cliente, lote, CUIT, pedido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-xs">Escribí para buscar en todo el sistema:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-[11px]">"Salame"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-[11px]">"Tandil"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-[11px]">"PED-1045"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-[11px]">"LOT-JAM"</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p className="text-xs">No se encontraron resultados para "{query}"</p>
            </div>
          ) : (
            <>
              {/* Productos */}
              {filteredProducts.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Productos Terminados ({filteredProducts.length})
                  </span>
                  <div className="space-y-1">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('stock')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-[#781d28]" />
                          <div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">{p.name}</span>
                            <span className="text-stone-400 ml-2">Stock: {p.stock_total_kg} kg</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes */}
              {filteredClients.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Clientes ({filteredClients.length})
                  </span>
                  <div className="space-y-1">
                    {filteredClients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('clientes')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">{c.fantasy_name || c.business_name}</span>
                            <span className="text-stone-400 ml-2">CUIT: {c.cuit} ({c.zone})</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300">
                          Saldo: {formatCurrency(c.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedidos */}
              {filteredOrders.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Pedidos y Ventas ({filteredOrders.length})
                  </span>
                  <div className="space-y-1">
                    {filteredOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect('pedidos')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">{o.order_number}</span>
                            <span className="text-stone-400 ml-2">{o.client_name} - {formatCurrency(o.total)}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 uppercase font-bold text-stone-600 dark:text-stone-300">
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lotes */}
              {filteredLotes.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Lotes de Producción ({filteredLotes.length})
                  </span>
                  <div className="space-y-1">
                    {filteredLotes.map(l => (
                      <div
                        key={l.id}
                        onClick={() => handleSelect('trazabilidad')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-purple-600" />
                          <div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">{l.batch_number}</span>
                            <span className="text-stone-400 ml-2">{l.product_name} - Vence: {l.expiration_date}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-stone-500">{l.chamber_location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insumos */}
              {filteredInsumos.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Materia Prima e Insumos ({filteredInsumos.length})
                  </span>
                  <div className="space-y-1">
                    {filteredInsumos.map(i => (
                      <div
                        key={i.id}
                        onClick={() => handleSelect('insumos')}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Wheat className="w-4 h-4 text-amber-600" />
                          <div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">{i.name}</span>
                            <span className="text-stone-400 ml-2">Stock: {i.current_stock} {i.unit}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono">{formatCurrency(i.cost_per_unit)}/{i.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
