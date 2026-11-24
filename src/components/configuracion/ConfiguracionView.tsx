import React, { useState } from 'react';
import {
  Settings,
  Building,
  Users,
  History,
  MessageSquare,
  RotateCcw,
  Save,
  Check,
  Shield,
  Clock,
  Database
} from 'lucide-react';
import { store } from '../../services/store';
import { ConfiguracionEmpresa } from '../../types';

interface ConfiguracionViewProps {
  openSupabaseModal: () => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({ openSupabaseModal }) => {
  const state = store.getState();
  const [activeTab, setActiveTab] = useState<'empresa' | 'plantillas' | 'usuarios' | 'auditoria'>('empresa');
  const [empresaData, setEmpresaData] = useState<ConfiguracionEmpresa>(state.empresa);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateEmpresa(empresaData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todos los datos iniciales de fábrica? Se reiniciarán insumos, lotes y pedidos de prueba.')) {
      store.resetToDefaultData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Configuración y Registro de Actividad
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Datos fiscales de la fábrica, plantillas de WhatsApp, usuarios y auditoría de operaciones
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openSupabaseModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <Database className="w-4 h-4" />
            <span>Configurar Supabase</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-rose-600 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Demo</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        {[
          { id: 'empresa', label: 'Datos de la Fábrica y Fiscales', icon: Building },
          { id: 'plantillas', label: 'Mensajes de WhatsApp', icon: MessageSquare },
          { id: 'usuarios', label: 'Usuarios y Roles', icon: Users },
          { id: 'auditoria', label: 'Registro de Actividad (Auditoría)', icon: History },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'bg-[#781d28] text-white shadow-xs'
                  : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DATOS DE LA EMPRESA */}
      {activeTab === 'empresa' && (
        <form onSubmit={handleSaveEmpresa} className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Razón Social Oficial
              </label>
              <input
                type="text"
                value={empresaData.business_name}
                onChange={(e) => setEmpresaData({ ...empresaData, business_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nombre de Fantasía Comercial
              </label>
              <input
                type="text"
                value={empresaData.fantasy_name}
                onChange={(e) => setEmpresaData({ ...empresaData, fantasy_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                CUIT
              </label>
              <input
                type="text"
                value={empresaData.cuit}
                onChange={(e) => setEmpresaData({ ...empresaData, cuit: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Ingresos Brutos (IIBB)
              </label>
              <input
                type="text"
                value={empresaData.iibb}
                onChange={(e) => setEmpresaData({ ...empresaData, iibb: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Condición de IVA
              </label>
              <input
                type="text"
                value={empresaData.iva_condition}
                onChange={(e) => setEmpresaData({ ...empresaData, iva_condition: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Habilitación R.N.E. / SENASA
              </label>
              <input
                type="text"
                value={empresaData.rne_number}
                onChange={(e) => setEmpresaData({ ...empresaData, rne_number: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                R.N.P.A. por Defecto
              </label>
              <input
                type="text"
                value={empresaData.rnpa_default}
                onChange={(e) => setEmpresaData({ ...empresaData, rnpa_default: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Dirección de Planta
              </label>
              <input
                type="text"
                value={empresaData.address}
                onChange={(e) => setEmpresaData({ ...empresaData, address: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Teléfono de Fábrica
              </label>
              <input
                type="text"
                value={empresaData.phone}
                onChange={(e) => setEmpresaData({ ...empresaData, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Oficial Ventas
              </label>
              <input
                type="text"
                value={empresaData.whatsapp}
                onChange={(e) => setEmpresaData({ ...empresaData, whatsapp: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Datos guardados correctamente</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2 text-xs font-bold text-white bg-[#781d28] hover:bg-[#5c121c] rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PLANTILLAS DE WHATSAPP */}
      {activeTab === 'plantillas' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              Plantillas de Mensajes de WhatsApp
            </h3>
            <p className="text-xs text-stone-500">
              Personalizá el formato de los mensajes enviados automáticamente a los clientes
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mensaje de Remito y Despacho en Reparto
              </label>
              <textarea
                rows={3}
                value={empresaData.whatsapp_template_remito}
                onChange={(e) => setEmpresaData({ ...empresaData, whatsapp_template_remito: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Recordatorio de Cobranza con CBU / Alias
              </label>
              <textarea
                rows={3}
                value={empresaData.whatsapp_template_cobranza}
                onChange={(e) => setEmpresaData({ ...empresaData, whatsapp_template_cobranza: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USUARIOS Y ROLES */}
      {activeTab === 'usuarios' && (
        <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-right">Permisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {state.users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-stone-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500">{u.phone || '-'}</td>
                    <td className="py-3 px-4 text-right text-stone-400">
                      {u.role === 'admin' ? 'Acceso Total' : u.role === 'produccion' ? 'Planta y Recetas' : u.role === 'repartidor' ? 'Hoja de Ruta' : 'Ventas y Cobranzas'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORÍA (QUIÉN HIZO QUÉ Y CUÁNDO) */}
      {activeTab === 'auditoria' && (
        <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              Registro Histórico de Auditoría y Operaciones
            </h3>
            <span className="text-xs text-stone-400">
              {state.auditoria.length} eventos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Acción Realizada</th>
                  <th className="py-3 px-4">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 font-mono text-[11px]">
                {state.auditoria.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-4 text-stone-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-sans font-bold text-stone-800 dark:text-stone-200">
                      {log.user_name} ({log.user_role})
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-[#781d28] dark:text-[#f8a5af]">{log.module}</td>
                    <td className="py-3 px-4 font-sans font-medium text-stone-900 dark:text-stone-100">{log.action}</td>
                    <td className="py-3 px-4 font-sans text-stone-600 dark:text-stone-400 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
