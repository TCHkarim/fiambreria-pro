import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  History,
  X,
  Check
} from 'lucide-react';
import { Proveedor } from '../../types';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';

export const ProveedoresView: React.FC = () => {
  const state = store.getState();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);

  const [newProv, setNewProv] = useState<Partial<Proveedor>>({
    business_name: '',
    cuit: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    payment_terms: 'Cheque 30 días fecha factura',
    balance: 0,
    notes: ''
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addProveedor({
      business_name: newProv.business_name || 'Proveedor S.A.',
      cuit: newProv.cuit || '30-00000000-0',
      contact_name: newProv.contact_name || '',
      phone: newProv.phone || '',
      email: newProv.email || '',
      address: newProv.address || '',
      payment_terms: newProv.payment_terms || 'Contado',
      balance: Number(newProv.balance) || 0,
      notes: newProv.notes
    });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Proveedores y Compras de Insumos
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Ficha de proveedores de carne, especias, tripas y envases. Condiciones comerciales y saldos
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Grid de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {state.proveedores.map((prov) => {
          // Insumos provistos por este proveedor
          const insumosProvistos = state.insumos.filter(i => i.supplier_id === prov.id);

          return (
            <div
              key={prov.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/30 transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#781d28]/10 text-[#781d28] dark:text-[#f8a5af] flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {prov.business_name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-mono">CUIT: {prov.cuit}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Saldo Adeudado</span>
                  <span className={`text-xs font-bold font-mono ${
                    prov.balance > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600'
                  }`}>
                    {formatCurrency(prov.balance)}
                  </span>
                </div>
              </div>

              {/* Contacto y Condiciones */}
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{prov.phone} ({prov.contact_name})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{prov.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{prov.address}</span>
                </div>
              </div>

              {/* Insumos que provee */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Insumos que abastece ({insumosProvistos.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {insumosProvistos.map(i => (
                    <span 
                      key={i.id}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    >
                      {i.name} ({formatCurrency(i.cost_per_unit)}/{i.unit})
                    </span>
                  ))}
                </div>
              </div>

              {/* Condiciones comerciales y acciones */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-500 font-medium">
                  Condición: <strong className="text-stone-700 dark:text-stone-300">{prov.payment_terms}</strong>
                </span>

                <button
                  onClick={() => setSelectedProveedor(prov)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#781d28] dark:text-[#f8a5af] hover:underline"
                >
                  Ver Ficha Completa
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Historial y Comparativa de Precios de Materia Prima */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
            Comparador y Evolución de Precios de Materia Prima (Últimos 90 días)
          </h3>
          <p className="text-[11px] text-stone-500">
            Análisis de costos de carne de cerdo, cortes vacunos y tripas para cálculo de recetas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf6f0] dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Corte / Insumo</th>
                <th className="py-2.5 px-3">Proveedor Principal</th>
                <th className="py-2.5 px-3">Precio Sep 2026</th>
                <th className="py-2.5 px-3">Precio Oct 2026</th>
                <th className="py-2.5 px-3">Precio Actual (Nov)</th>
                <th className="py-2.5 px-3">Variación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono">
              {[
                { name: 'Carne Cerdo Magra (Pernil)', prov: 'Los Pampas', sep: 3600, oct: 3950, nov: 4200, varPct: '+6.3%' },
                { name: 'Tocino Dorsal (Lardo Firme)', prov: 'Los Pampas', sep: 2450, oct: 2700, nov: 2900, varPct: '+7.4%' },
                { name: 'Carne Vacuna Magra (Nalga)', prov: 'Los Pampas', sep: 5100, oct: 5450, nov: 5800, varPct: '+6.4%' },
                { name: 'Bondiola de Cerdo Fresca', prov: 'Los Pampas', sep: 5600, oct: 6100, nov: 6400, varPct: '+4.9%' },
                { name: 'Tripa Porcina 38/42 mm (m)', prov: 'Tripas Arg', sep: 160, oct: 170, nov: 180, varPct: '+5.8%' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="py-2.5 px-3 font-sans font-semibold text-stone-800 dark:text-stone-200">{row.name}</td>
                  <td className="py-2.5 px-3 font-sans text-stone-500">{row.prov}</td>
                  <td className="py-2.5 px-3 text-stone-400">{formatCurrency(row.sep)}</td>
                  <td className="py-2.5 px-3 text-stone-500">{formatCurrency(row.oct)}</td>
                  <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100">{formatCurrency(row.nov)}</td>
                  <td className="py-2.5 px-3 text-amber-700 dark:text-amber-400 font-bold">{row.varPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alta Proveedor */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Registrar Nuevo Proveedor</h3>
                <p className="text-xs text-white/80">Carga de frigorífico o distribuidor de insumos</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Frigorífico San José S.A."
                  value={newProv.business_name}
                  onChange={(e) => setNewProv({ ...newProv, business_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="30-71234567-8"
                    value={newProv.cuit}
                    onChange={(e) => setNewProv({ ...newProv, cuit: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Marcelo Ramos"
                    value={newProv.contact_name}
                    onChange={(e) => setNewProv({ ...newProv, contact_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+54 11 4567-8900"
                    value={newProv.phone}
                    onChange={(e) => setNewProv({ ...newProv, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Email de Ventas/Pagos
                  </label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.com.ar"
                    value={newProv.email}
                    onChange={(e) => setNewProv({ ...newProv, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Dirección del Depósito / Planta
                </label>
                <input
                  type="text"
                  placeholder="Calle, número, localidad"
                  value={newProv.address}
                  onChange={(e) => setNewProv({ ...newProv, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cheque 30 días, Contado..."
                    value={newProv.payment_terms}
                    onChange={(e) => setNewProv({ ...newProv, payment_terms: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Saldo Inicial ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProv.balance}
                    onChange={(e) => setNewProv({ ...newProv, balance: Number(e.target.value) })}
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
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
