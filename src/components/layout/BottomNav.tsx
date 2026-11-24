import React from 'react';
import {
  LayoutDashboard,
  Factory,
  ShoppingCart,
  MapPin,
  Menu,
  ShoppingBag
} from 'lucide-react';
import { store } from '../../services/store';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  toggleSidebar
}) => {
  const state = store.getState();
  const role = state.currentUser.role;

  // Si el rol es repartidor, priorizamos la pestaña de reparto
  const pendingOrders = state.pedidos.filter(p => p.status === 'pendiente' || p.status === 'en_reparto').length;
  const activeRoutes = state.repartos.flatMap(r => r.stops).filter(s => s.status === 'pendiente').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1716]/95 backdrop-blur border-t border-[#e8ded4] dark:border-[#38312e] pb-safe transition-colors">
      <div className="grid grid-cols-5 h-15">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            currentTab === 'dashboard'
              ? 'text-[#781d28] dark:text-[#f8a5af] font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        {/* 2. Producción / Planta (o Catálogo para ventas) */}
        {role === 'ventas' ? (
          <button
            onClick={() => setCurrentTab('catalogo')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              currentTab === 'catalogo'
                ? 'text-[#781d28] dark:text-[#f8a5af] font-semibold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Catálogo</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('produccion')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              currentTab === 'produccion'
                ? 'text-[#781d28] dark:text-[#f8a5af] font-semibold'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Factory className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Producción</span>
          </button>
        )}

        {/* 3. Pedidos */}
        <button
          onClick={() => setCurrentTab('pedidos')}
          className={`flex flex-col items-center justify-center py-1 transition relative ${
            currentTab === 'pedidos'
              ? 'text-[#781d28] dark:text-[#f8a5af] font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Pedidos</span>
          {pendingOrders > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 bg-[#781d28] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingOrders}
            </span>
          )}
        </button>

        {/* 4. Reparto */}
        <button
          onClick={() => setCurrentTab('reparto')}
          className={`flex flex-col items-center justify-center py-1 transition relative ${
            currentTab === 'reparto'
              ? 'text-[#781d28] dark:text-[#f8a5af] font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Reparto</span>
          {activeRoutes > 0 && (
            <span className="absolute top-1.5 right-4 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeRoutes}
            </span>
          )}
        </button>

        {/* 5. Más / Menú completo */}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Módulos</span>
        </button>

      </div>
    </nav>
  );
};
