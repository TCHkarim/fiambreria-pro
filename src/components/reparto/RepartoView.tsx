import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Plus,
  Phone,
  CheckCircle2,
  DollarSign,
  Fuel,
  Smartphone,
  ExternalLink,
  Users,
  Navigation,
  FileText
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RepartidorMobileView } from './RepartidorMobileView';

export const RepartoView: React.FC = () => {
  const state = store.getState();
  const [selectedRoute, setSelectedRoute] = useState(state.repartos[0]);
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Si el usuario tiene rol 'repartidor', mostramos directamente la vista de celular
  if (state.currentUser.role === 'repartidor' || isMobileMode) {
    return (
      <div className="space-y-4">
        {state.currentUser.role !== 'repartidor' && (
          <div className="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Modo Simulador de Celular del Repartidor (con Firma en Pantalla)
            </span>
            <button
              onClick={() => setIsMobileMode(false)}
              className="text-[#781d28] dark:text-[#f8a5af] font-bold hover:underline"
            >
              Volver a Vista Escritorio
            </button>
          </div>
        )}
        <RepartidorMobileView
          route={selectedRoute}
          onBackToDesktop={() => setIsMobileMode(false)}
        />
      </div>
    );
  }

  // Cálculos de la ruta
  const totalRuta = selectedRoute.stops.reduce((acc, s) => acc + s.total_amount, 0);
  const totalCobrado = selectedRoute.stops.reduce((acc, s) => acc + (s.collected_amount || 0), 0);
  const totalGastos = selectedRoute.expenses.reduce((acc, e) => acc + e.amount, 0);
  const paradasEntregadas = selectedRoute.stops.filter(s => s.status === 'entregado').length;

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Reparto y Logística de Distribución
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Hojas de ruta por zona, choferes, orden de paradas, gastos de combustible y control de entregas
          </p>
        </div>

        {/* Botón para probar vista de celular */}
        <button
          onClick={() => setIsMobileMode(true)}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Abrir Vista Celular Chofer</span>
        </button>
      </div>

      {/* Tarjeta de Resumen de la Ruta de Hoy */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#781d28]/10 text-[#781d28] dark:text-[#f8a5af] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {selectedRoute.zone}
              </h3>
              <p className="text-xs text-stone-500">
                Chofer: <strong>{selectedRoute.driver_name}</strong> | Vehículo: <span className="font-mono">{selectedRoute.vehicle_plate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
              {selectedRoute.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* KPIs de la Hoja de Ruta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
            <span className="text-[10px] text-stone-400 block font-semibold">Mercadería en Ruta</span>
            <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              {formatCurrency(totalRuta)}
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
            <span className="text-[10px] text-stone-400 block font-semibold">Cobrado en Mano</span>
            <span className="font-serif font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCobrado)}
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
            <span className="text-[10px] text-stone-400 block font-semibold">Gastos (Gasoil / Peajes)</span>
            <span className="font-serif font-bold text-sm text-rose-600 dark:text-rose-400">
              {formatCurrency(totalGastos)}
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
            <span className="text-[10px] text-stone-400 block font-semibold">Avance Paradas</span>
            <span className="font-serif font-bold text-sm text-blue-600 dark:text-blue-400">
              {paradasEntregadas} / {selectedRoute.stops.length} entregadas
            </span>
          </div>
        </div>
      </div>

      {/* Paradas Programadas en Orden de Recorrido */}
      <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
            Orden de Paradas y Entregas Programadas
          </h3>
          <span className="text-xs text-stone-400">
            Secuencia lógica de recorrido por GPS
          </span>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
          {selectedRoute.stops.map((stop, idx) => (
            <div key={stop.order_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">{stop.client_name}</h4>
                    <span className="font-mono text-[10px] text-stone-400">{stop.order_number}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{stop.address}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5 italic">{stop.notes || 'Recepción en puerta comercial'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 block">
                    {formatCurrency(stop.total_amount)}
                  </span>
                  <span className="text-[10px] text-stone-400 capitalize">{stop.payment_method?.replace('_', ' ')}</span>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                  stop.status === 'entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {stop.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control de Gastos de la Flota */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-[#781d28]" />
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              Gastos de Combustible y Peajes Rendidos
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-600">
            Total: {formatCurrency(totalGastos)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {selectedRoute.expenses.map((exp, idx) => (
            <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="font-bold capitalize text-stone-800 dark:text-stone-200">{exp.type}</span>
                <p className="text-[11px] text-stone-500">{exp.notes}</p>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(exp.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
