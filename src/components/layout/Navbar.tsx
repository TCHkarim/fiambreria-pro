import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  UserCheck,
  Moon,
  Sun,
  PlusCircle,
  RotateCcw,
  Database,
  ExternalLink,
  ShieldAlert,
  Clock,
  DollarSign,
  Package
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../services/store';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openQuickModal: (type: 'pedido' | 'produccion' | 'insumo' | 'cobranza') => void;
  openSearchModal: () => void;
  openSupabaseModal: () => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openQuickModal,
  openSearchModal,
  openSupabaseModal,
  toggleSidebar,
  sidebarOpen,
  isDark,
  setIsDark
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const state = store.getState();
  const unreadCount = state.notificaciones.filter(n => !n.is_read).length;

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Administrador', desc: 'Acceso total a todos los módulos y configuración' },
    { role: 'produccion', label: 'Producción', desc: 'Recetas, órdenes de elaboración, mermas y calidad' },
    { role: 'ventas', label: 'Ventas', desc: 'Pedidos, clientes, listas de precios y catálogo' },
    { role: 'repartidor', label: 'Repartidor', desc: 'Hoja de ruta móvil, entregas, firmas y cobranzas' },
    { role: 'contable', label: 'Administración / Contable', desc: 'Caja, cheques, compras, proveedores y finanzas' },
  ];

  const handleSelectRole = (role: UserRole) => {
    store.setCurrentUserRole(role);
    setShowRoleDropdown(false);
    // Redirigir a vista adecuada si el rol no tiene acceso a la actual
    if (role === 'repartidor') {
      setCurrentTab('reparto');
    } else if (role === 'produccion' && (currentTab === 'cobranzas' || currentTab === 'finanzas')) {
      setCurrentTab('produccion');
    } else if (role === 'ventas' && (currentTab === 'recetas' || currentTab === 'finanzas')) {
      setCurrentTab('pedidos');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a1716]/95 backdrop-blur border-b border-[#e8ded4] dark:border-[#38312e] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Lado Izquierdo: Toggle Móvil y Marca */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-[#781d28] dark:text-[#e67383] hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="Abrir menú lateral"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div 
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#781d28] to-[#9b2837] dark:from-[#b52638] dark:to-[#781d28] flex items-center justify-center text-white shadow-md shadow-[#781d28]/20 group-hover:scale-105 transition-transform">
                <span className="text-xl font-bold tracking-wider font-serif">DB</span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-lg font-bold font-serif tracking-tight text-[#1b1918] dark:text-stone-100 leading-none">
                    DON BAUTISTA
                  </h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-[#f7e8ea] text-[#781d28] dark:bg-[#781d28]/30 dark:text-[#f8a5af]">
                    ARTESANAL
                  </span>
                </div>
                <p className="text-[11px] text-[#78716c] dark:text-stone-400 font-medium tracking-wide">
                  Chacinados & Fiambres de Calidad
                </p>
              </div>
            </div>
          </div>

          {/* Centro: Búsqueda Rápida (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <button
              onClick={openSearchModal}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-xl border border-stone-200/80 dark:border-stone-700/80 transition"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-stone-400" />
                <span>Buscar productos, lotes, clientes o pedidos...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded shadow-xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Lado Derecho: Acciones, Notificaciones, Selector de Rol y Perfil */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Botón Nuevo Rápido */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#781d28] hover:bg-[#5c121c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>

              {showQuickMenu && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#24201e] rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowQuickMenu(false)}
                >
                  <button
                    onClick={() => openQuickModal('pedido')}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>Nuevo Pedido de Venta</span>
                  </button>
                  <button
                    onClick={() => openQuickModal('produccion')}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-[#781d28] dark:text-[#f8a5af]" />
                    <span>Nueva Orden de Producción</span>
                  </button>
                  <button
                    onClick={() => openQuickModal('cobranza')}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>Registrar Cobranza</span>
                  </button>
                  <button
                    onClick={() => openQuickModal('insumo')}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center space-x-2 border-t border-stone-100 dark:border-stone-800"
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <span>Ingreso de Materia Prima</span>
                  </button>
                </div>
              )}
            </div>

            {/* Búsqueda en móvil */}
            <button
              onClick={openSearchModal}
              className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Catálogo Público Link */}
            <button
              onClick={() => setCurrentTab('catalogo')}
              title="Abrir Catálogo Digital para Clientes"
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 transition"
            >
              <span>Catálogo WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Botón Supabase Connection */}
            <button
              onClick={openSupabaseModal}
              title="Configuración de Supabase / Base de datos"
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition relative"
            >
              <Database className="w-5 h-5" />
            </button>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition relative"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#24201e] rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                      Alertas y Notificaciones ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => store.markAllNotificationsAsRead()}
                        className="text-xs text-[#781d28] dark:text-[#f8a5af] hover:underline"
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                    {state.notificaciones.length === 0 ? (
                      <p className="p-4 text-xs text-stone-500 text-center">No hay notificaciones pendientes</p>
                    ) : (
                      state.notificaciones.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            store.markNotificationAsRead(n.id);
                            if (n.link_module) setCurrentTab(n.link_module);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition ${
                            !n.is_read ? 'bg-[#fbf4f5] dark:bg-[#2b1f21]' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-stone-800 dark:text-stone-200">{n.title}</p>
                              <p className="text-stone-600 dark:text-stone-400 mt-0.5">{n.description}</p>
                              <span className="text-[10px] text-stone-400 mt-1 block">{n.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
              aria-label="Cambiar tema oscuro/claro"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-600" />}
            </button>

            {/* Selector de Rol Activo (Simulador de Permisos) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/70 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-[#781d28]/10 dark:bg-[#e67383]/20 text-[#781d28] dark:text-[#f8a5af] flex items-center justify-center font-bold text-xs uppercase">
                  {state.currentUser.role.slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                    {state.currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-[#781d28] dark:text-[#f8a5af] font-medium capitalize leading-none">
                    {state.currentUser.role}
                  </p>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#24201e] rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                      Cambiar Rol Activo (Simulador de Accesos)
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Probá cómo cada perfil ve y opera la plataforma:
                    </p>
                  </div>
                  <div className="p-1 space-y-1">
                    {rolesList.map((r) => {
                      const isSelected = state.currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => handleSelectRole(r.role)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-[#f7e8ea] text-[#781d28] dark:bg-[#781d28]/30 dark:text-[#f8a5af] font-semibold'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSelected ? 'bg-[#781d28] dark:bg-[#e67383]' : 'bg-stone-300 dark:bg-stone-600'}`} />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold">{r.label}</span>
                              {isSelected && <span className="text-[10px] font-normal opacity-80">(Activo)</span>}
                            </div>
                            <p className="text-[11px] opacity-75 font-normal leading-tight mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
