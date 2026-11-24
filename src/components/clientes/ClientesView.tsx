import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  Star,
  Clock,
  X,
  Check
} from 'lucide-react';
import { Cliente, CondicionIva, PriceListType } from '../../types';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';
import { sendCobranzaReminderWhatsApp } from '../../services/whatsappService';

export const ClientesView: React.FC = () => {
  const state = store.getState();
  const [selectedZone, setSelectedZone] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  const [newClient, setNewClient] = useState<Partial<Cliente>>({
    business_name: '',
    fantasy_name: '',
    cuit: '',
    iva_condition: 'Responsable Inscripto',
    address: '',
    city: 'Buenos Aires',
    zone: 'Zona Norte',
    delivery_schedule: 'Lunes y Miércoles 09:00 a 13:00',
    price_list: 'mayorista',
    credit_limit: 1000000,
    balance: 0,
    phone: '',
    whatsapp: '',
    email: '',
    contact_person: '',
    is_active: true
  });

  const zones = ['todas', 'Zona Norte', 'Zona Oeste', 'Zona Sur', 'CABA Centro'];

  const filteredClients = state.clientes.filter(c => {
    const matchesZone = selectedZone === 'todas' || c.zone === selectedZone;
    const matchesSearch = c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.fantasy_name && c.fantasy_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          c.cuit.includes(searchTerm) ||
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addCliente({
      business_name: newClient.business_name || 'Cliente S.A.',
      fantasy_name: newClient.fantasy_name || newClient.business_name || '',
      cuit: newClient.cuit || '30-00000000-0',
      iva_condition: (newClient.iva_condition as CondicionIva) || 'Responsable Inscripto',
      address: newClient.address || '',
      city: newClient.city || 'Buenos Aires',
      zone: newClient.zone || 'Zona Norte',
      delivery_schedule: newClient.delivery_schedule || 'Sin horario fijo',
      price_list: (newClient.price_list as PriceListType) || 'mayorista',
      credit_limit: Number(newClient.credit_limit) || 500000,
      balance: Number(newClient.balance) || 0,
      phone: newClient.phone || '',
      whatsapp: newClient.whatsapp || newClient.phone || '',
      email: newClient.email || '',
      contact_person: newClient.contact_person || '',
      is_active: true
    });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Clientes y Ficha Comercial
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Gestión de fiambrerías, restaurantes y distribuidores. Listas de precios, límites de crédito y cuenta corriente
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#201d1c] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por razón social, nombre de fantasía, CUIT o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#781d28]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition ${
                selectedZone === z
                  ? 'bg-[#781d28] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {z === 'todas' ? 'Todas las Zonas' : z}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const isOverLimit = client.balance > client.credit_limit;
          const hasBalance = client.balance > 0;

          return (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#781d28]/40 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Cabecera Tarjeta */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                      {client.fantasy_name || client.business_name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-mono">CUIT: {client.cuit}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {client.iva_condition}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase font-mono ${
                    client.price_list === 'distribuidor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    client.price_list === 'minorista' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {client.price_list}
                  </span>
                </div>

                {/* Ubicación y Horarios de Entrega */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#781d28] shrink-0" />
                    <span className="truncate">{client.address} ({client.zone})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{client.delivery_schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{client.phone} ({client.contact_person || 'Encargado'})</span>
                  </div>
                </div>

                {/* Saldo de Cuenta Corriente y Límite */}
                <div className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">Saldo Deudor:</span>
                    <span className={`font-mono font-bold text-sm ${
                      hasBalance ? 'text-[#781d28] dark:text-[#f8a5af]' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(client.balance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>Límite de Crédito:</span>
                    <span className="font-mono">{formatCurrency(client.credit_limit)}</span>
                  </div>

                  {isOverLimit && (
                    <span className="block text-[9px] font-bold text-rose-600 uppercase tracking-wide">
                      ⚠️ Límite de crédito superado
                    </span>
                  )}
                </div>

              </div>

              {/* Botones de Acción */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="text-xs text-[#781d28] dark:text-[#f8a5af] font-semibold hover:underline"
                >
                  Ver Ficha
                </button>

                <div className="flex items-center space-x-1.5">
                  {hasBalance && (
                    <button
                      onClick={() => sendCobranzaReminderWhatsApp(client, state.empresa)}
                      title="Enviar recordatorio de pago por WhatsApp"
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Ficha Completa del Cliente */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">{selectedClient.fantasy_name || selectedClient.business_name}</h3>
                <p className="text-xs text-white/80">Razón Social: {selectedClient.business_name}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">CUIT</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{selectedClient.cuit}</span>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold">Condición IVA</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{selectedClient.iva_condition}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-1">
                <p className="text-stone-500 text-[10px] uppercase font-bold">Dirección de Reparto y Descarga</p>
                <p className="font-bold text-stone-800 dark:text-stone-200">{selectedClient.address}</p>
                <p className="text-stone-600 dark:text-stone-400">{selectedClient.city} - Zona: {selectedClient.zone}</p>
                <p className="text-stone-500 text-[11px] mt-1">Horario: {selectedClient.delivery_schedule}</p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">Saldo en Cuenta Corriente</span>
                  <span className="font-mono font-bold text-base text-[#781d28] dark:text-[#f8a5af]">
                    {formatCurrency(selectedClient.balance)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-semibold">Límite Aprobado</span>
                  <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                    {formatCurrency(selectedClient.credit_limit)}
                  </span>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => sendCobranzaReminderWhatsApp(selectedClient, state.empresa)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Estado de Cuenta por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-6 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base">Registrar Nuevo Cliente</h3>
                <p className="text-xs text-white/80">Alta de comercio para pedidos y reparto</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Fiambrería Las Heras S.A."
                    value={newClient.business_name}
                    onChange={(e) => setNewClient({ ...newClient, business_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nombre de Fantasía
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Fiambrería Las Heras"
                    value={newClient.fantasy_name}
                    onChange={(e) => setNewClient({ ...newClient, fantasy_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="30-71999888-2"
                    value={newClient.cuit}
                    onChange={(e) => setNewClient({ ...newClient, cuit: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Condición de IVA
                  </label>
                  <select
                    value={newClient.iva_condition}
                    onChange={(e: any) => setNewClient({ ...newClient, iva_condition: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributo">Monotributo</option>
                    <option value="Exento">Exento</option>
                    <option value="Consumidor Final">Consumidor Final</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Calle y número"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Zona de Reparto
                  </label>
                  <select
                    value={newClient.zone}
                    onChange={(e) => setNewClient({ ...newClient, zone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  >
                    <option value="Zona Norte">Zona Norte</option>
                    <option value="Zona Oeste">Zona Oeste</option>
                    <option value="Zona Sur">Zona Sur</option>
                    <option value="CABA Centro">CABA Centro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+54 9 11 4455-6677"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Lista de Precios Asignada
                  </label>
                  <select
                    value={newClient.price_list}
                    onChange={(e: any) => setNewClient({ ...newClient, price_list: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold"
                  >
                    <option value="mayorista">Mayorista (Fiambrerías)</option>
                    <option value="distribuidor">Distribuidor (Supermercados)</option>
                    <option value="minorista">Minorista (Público/Mostrador)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Horario habitual de entrega y recepción
                </label>
                <input
                  type="text"
                  placeholder="Ej: Martes y Jueves de 08:30 a 12:00"
                  value={newClient.delivery_schedule}
                  onChange={(e) => setNewClient({ ...newClient, delivery_schedule: e.target.value })}
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
                  Dar de Alta Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
