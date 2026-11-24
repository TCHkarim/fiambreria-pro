import React from 'react';
import {
  LayoutDashboard,
  Wheat,
  Truck,
  BookOpen,
  Factory,
  ShieldCheck,
  PackageCheck,
  Users,
  ShoppingCart,
  MapPin,
  CircleDollarSign,
  ReceiptText,
  BarChart3,
  Settings,
  ShoppingBag,
  BadgeAlert
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../services/store';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  closeSidebar: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  closeSidebar
}) => {
  const state = store.getState();
  const currentRole = state.currentUser.role;

  // Calculamos contadores dinámicos para badges
  const pendingOrdersCount = state.pedidos.filter(p => p.status === 'pendiente' || p.status === 'en_preparacion').length;
  const activeProductionCount = state.ordenesProduccion.filter(o => o.status === 'en_proceso').length;
  const criticalStockCount = state.insumos.filter(i => i.current_stock <= i.min_stock).length;
  const todayDeliveriesCount = state.repartos.flatMap(r => r.stops).filter(s => s.status === 'pendiente').length;

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'produccion', 'ventas', 'repartidor', 'contable'] },
      ]
    },
    {
      title: 'PLANTA Y ELABORACIÓN',
      items: [
        { id: 'insumos', label: 'Materia Prima e Insumos', icon: Wheat, roles: ['admin', 'produccion', 'contable'], badge: criticalStockCount > 0 ? `${criticalStockCount} bajo` : undefined },
        { id: 'proveedores', label: 'Proveedores y Compras', icon: Truck, roles: ['admin', 'contable'] },
        { id: 'recetas', label: 'Recetas y Costos', icon: BookOpen, roles: ['admin', 'produccion', 'contable'] },
        { id: 'produccion', label: 'Producción y Lotes', icon: Factory, roles: ['admin', 'produccion'], badge: activeProductionCount > 0 ? activeProductionCount : undefined },
        { id: 'trazabilidad', label: 'Trazabilidad y Calidad', icon: ShieldCheck, roles: ['admin', 'produccion'] },
        { id: 'stock', label: 'Stock Producto Terminado', icon: PackageCheck, roles: ['admin', 'produccion', 'ventas'] },
      ]
    },
    {
      title: 'COMERCIAL Y LOGÍSTICA',
      items: [
        { id: 'clientes', label: 'Clientes y Cuentas', icon: Users, roles: ['admin', 'ventas', 'contable'] },
        { id: 'pedidos', label: 'Pedidos y Ventas', icon: ShoppingCart, roles: ['admin', 'ventas'], badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
        { id: 'catalogo', label: 'Catálogo WhatsApp', icon: ShoppingBag, roles: ['admin', 'ventas'] },
        { id: 'reparto', label: 'Reparto y Logística', icon: MapPin, roles: ['admin', 'ventas', 'repartidor'], badge: todayDeliveriesCount > 0 ? todayDeliveriesCount : undefined },
      ]
    },
    {
      title: 'ADMINISTRACIÓN Y FINANZAS',
      items: [
        { id: 'cobranzas', label: 'Cobranzas y Cheques', icon: CircleDollarSign, roles: ['admin', 'contable', 'ventas'] },
        { id: 'finanzas', label: 'Facturación y Caja', icon: ReceiptText, roles: ['admin', 'contable'] },
        { id: 'reportes', label: 'Reportes y Estadísticas', icon: BarChart3, roles: ['admin', 'contable', 'produccion'] },
        { id: 'configuracion', label: 'Configuración y Auditoría', icon: Settings, roles: ['admin'] },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    setCurrentTab(id);
    closeSidebar();
  };

  return (
    <>
      {/* Backdrop para móvil */}
      {isOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Menú Lateral */}
      <aside className={`
        fixed md:sticky top-0 md:top-16 left-0 z-50 md:z-30
        h-screen md:h-[calc(100vh-4rem)] w-64
        bg-[#faf6f0] dark:bg-[#191615] 
        border-r border-[#e8ded4] dark:border-[#38312e]
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Cabecera del sidebar en móvil */}
        <div className="p-4 border-b border-[#e8ded4] dark:border-[#38312e] md:hidden flex items-center justify-between">
          <span className="font-serif font-bold text-lg text-[#781d28] dark:text-[#f8a5af]">
            Menú de Opciones
          </span>
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        {/* Lista de navegación */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuSections.map((section, idx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(currentRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 font-sans">
                  {section.title}
                </h3>
                {visibleItems.map(item => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition
                        ${isActive
                          ? 'bg-[#781d28] text-white shadow-sm font-semibold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-[#f0e6da] dark:hover:bg-[#25201e]'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`
                          ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : typeof item.badge === 'string' && item.badge.includes('bajo')
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Pie de navegación / Info del Rol */}
        <div className="p-3 border-t border-[#e8ded4] dark:border-[#38312e] bg-[#f2e9de]/50 dark:bg-[#141110]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#781d28] text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentRole.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                {state.currentUser.name}
              </p>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-stone-500 dark:text-stone-400 capitalize truncate">
                  Rol: {currentRole}
                </p>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
