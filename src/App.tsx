import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { InsumosView } from './components/insumos/InsumosView';
import { ProveedoresView } from './components/proveedores/ProveedoresView';
import { RecetasView } from './components/recetas/RecetasView';
import { ProduccionView } from './components/produccion/ProduccionView';
import { TrazabilidadCalidadView } from './components/trazabilidad/TrazabilidadCalidadView';
import { StockTerminadoView } from './components/stock/StockTerminadoView';
import { ClientesView } from './components/clientes/ClientesView';
import { PedidosView } from './components/pedidos/PedidosView';
import { CatalogoPublicoView } from './components/catalogo/CatalogoPublicoView';
import { RepartoView } from './components/reparto/RepartoView';
import { CobranzasView } from './components/cobranzas/CobranzasView';
import { FinanzasView } from './components/finanzas/FinanzasView';
import { ReportesView } from './components/reportes/ReportesView';
import { ConfiguracionView } from './components/configuracion/ConfiguracionView';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';

export const App: React.FC = () => {
  // Suscripción al store reactivo
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('don_bautista_theme') === 'dark';
  });

  // Modales
  const [quickModalType, setQuickModalType] = useState<'pedido' | 'produccion' | 'insumo' | 'cobranza' | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Manejo de clase dark en <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('don_bautista_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('don_bautista_theme', 'light');
    }
  }, [isDark]);

  // Shortcut de teclado Ctrl + K para búsqueda global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickSuccess = (tabToOpen?: string) => {
    if (tabToOpen) {
      setCurrentTab(tabToOpen);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] dark:bg-[#141211] text-[#1b1918] dark:text-[#fafaf9] flex flex-col font-sans transition-colors">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openQuickModal={(type) => setQuickModalType(type)}
        openSearchModal={() => setSearchModalOpen(true)}
        openSupabaseModal={() => setSupabaseModalOpen(true)}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Contenedor Principal (Sidebar + Contenido) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Menú Lateral (Escritorio) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        {/* Área de Contenido Dinámico */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-full overflow-hidden">
          
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              openQuickModal={(type) => setQuickModalType(type)}
            />
          )}

          {currentTab === 'insumos' && <InsumosView />}

          {currentTab === 'proveedores' && <ProveedoresView />}

          {currentTab === 'recetas' && <RecetasView />}

          {currentTab === 'produccion' && <ProduccionView />}

          {currentTab === 'trazabilidad' && <TrazabilidadCalidadView />}

          {currentTab === 'stock' && <StockTerminadoView />}

          {currentTab === 'clientes' && <ClientesView />}

          {currentTab === 'pedidos' && (
            <PedidosView
              onNavigateToCatalog={() => setCurrentTab('catalogo')}
            />
          )}

          {currentTab === 'catalogo' && <CatalogoPublicoView />}

          {currentTab === 'reparto' && <RepartoView />}

          {currentTab === 'cobranzas' && <CobranzasView />}

          {currentTab === 'finanzas' && <FinanzasView />}

          {currentTab === 'reportes' && <ReportesView />}

          {currentTab === 'configuracion' && (
            <ConfiguracionView
              openSupabaseModal={() => setSupabaseModalOpen(true)}
            />
          )}

        </main>

      </div>

      {/* Navegación Inferior Móvil */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Modales Globales */}
      <QuickActionModal
        type={quickModalType}
        onClose={() => setQuickModalType(null)}
        onSuccess={handleQuickSuccess}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

    </div>
  );
};

export default App;
