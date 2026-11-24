import React, { useState, useRef } from 'react';
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  Fuel,
  Camera,
  X,
  FileCheck,
  ChevronLeft,
  PenTool
} from 'lucide-react';
import { ParadaReparto, RepartoRuta } from '../../types';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/formatters';

interface RepartidorMobileViewProps {
  route: RepartoRuta;
  onBackToDesktop?: () => void;
}

export const RepartidorMobileView: React.FC<RepartidorMobileViewProps> = ({
  route,
  onBackToDesktop
}) => {
  const [activeStop, setActiveStop] = useState<ParadaReparto | null>(null);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'cheque' | 'cuenta_corriente'>('efectivo');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState(35000);
  const [expenseType, setExpenseType] = useState<'combustible' | 'peaje' | 'otro'>('combustible');
  const [expenseNotes, setExpenseNotes] = useState('Carga Infinia YPF');

  // Canvas de Firma Digital
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Funciones de dibujo en canvas (funciona tanto para mouse como para touch en celular)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1b1918';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmDelivery = () => {
    if (!activeStop) return;
    let signatureUrl = '';
    if (canvasRef.current && hasSignature) {
      signatureUrl = canvasRef.current.toDataURL();
    }

    store.markDeliveryDone(
      route.id,
      activeStop.order_id,
      signatureUrl,
      collectedAmount,
      paymentMethod
    );

    setActiveStop(null);
    clearCanvas();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    store.addRepartoExpense(route.id, {
      type: expenseType,
      amount: expenseAmount,
      notes: expenseNotes
    });
    setShowExpenseModal(false);
  };

  const completedCount = route.stops.filter(s => s.status === 'entregado').length;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      
      {/* Barra Superior Móvil Chofer */}
      <div className="p-4 rounded-2xl bg-[#781d28] text-white flex items-center justify-between shadow-md">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-serif font-bold text-sm tracking-wide">Hoja de Ruta del Chofer</h3>
          </div>
          <p className="text-xs text-white/80">{route.driver_name} | {route.vehicle_plate}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xs font-semibold flex items-center space-x-1"
            title="Cargar Gasto de Combustible o Peaje"
          >
            <Fuel className="w-4 h-4" />
          </button>

          {onBackToDesktop && (
            <button
              onClick={onBackToDesktop}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs"
              title="Volver a vista de escritorio"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progreso de la Hoja de Ruta */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Zona: {route.zone}
          </span>
          <p className="text-[11px] text-stone-500">
            {completedCount} de {route.stops.length} paradas completadas
          </p>
        </div>

        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          {Math.round((completedCount / (route.stops.length || 1)) * 100)}% Listo
        </span>
      </div>

      {/* Lista de Paradas para el Chofer */}
      <div className="space-y-3">
        {route.stops.map((stop, idx) => {
          const isDone = stop.status === 'entregado';

          return (
            <div
              key={stop.order_id}
              className={`p-4 rounded-2xl border transition space-y-3 ${
                isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-75'
                  : 'bg-white dark:bg-[#201d1c] border-stone-200 dark:border-stone-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isDone ? 'bg-emerald-600 text-white' : 'bg-[#781d28] text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {stop.client_name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-mono">Remito: {stop.order_number}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100 block">
                    {formatCurrency(stop.total_amount)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${isDone ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stop.status}
                  </span>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-center space-x-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-[#781d28] shrink-0" />
                <span className="truncate">{stop.address}</span>
              </div>

              {/* Botones Móviles del Chofer: Llamar, Navegar con Google Maps, Marcar Entregado */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Llamar */}
                <a
                  href={`tel:${stop.phone}`}
                  className="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </a>

                {/* Google Maps */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address + ', Buenos Aires')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Mapa</span>
                </a>

                {/* Marcar Entregado */}
                <button
                  onClick={() => {
                    setActiveStop(stop);
                    setCollectedAmount(stop.payment_method === 'cuenta_corriente' ? 0 : stop.total_amount);
                  }}
                  disabled={isDone}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                    isDone
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Listo' : 'Entregar'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL DE ENTREGA CON FIRMA DIGITAL EN PANTALLA */}
      {activeStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-5 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm">Confirmar Entrega en Domicilio</h3>
                <p className="text-xs text-white/80">{activeStop.client_name}</p>
              </div>
              <button onClick={() => setActiveStop(null)} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Cobro en Mano */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Cobranza Recibida ($ ARS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(Number(e.target.value))}
                  className="w-full text-base font-bold font-mono p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center"
                />

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {(['efectivo', 'transferencia', 'cheque'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 rounded-lg font-semibold capitalize border ${
                        paymentMethod === m ? 'bg-[#781d28] text-white border-[#781d28]' : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas de Firma del Cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center space-x-1">
                    <PenTool className="w-3.5 h-3.5 text-[#781d28]" />
                    <span>Firma del Cliente (en pantalla)</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                  >
                    Borrar
                  </button>
                </div>

                <div className="rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair"
                  />
                </div>
                <p className="text-[10px] text-stone-400 text-center mt-1">
                  El cliente firma con el dedo sobre la pantalla
                </p>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={handleConfirmDelivery}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Entrega y Registrar Cobro</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal Cargar Gasto de Reparto */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#201d1c] w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="px-5 py-4 bg-[#781d28] text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm">Registrar Gasto de Vehículo</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tipo de Gasto
                </label>
                <select
                  value={expenseType}
                  onChange={(e: any) => setExpenseType(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                >
                  <option value="combustible">Combustible (Gasoil / Nafta)</option>
                  <option value="peaje">Peaje / TelePASE</option>
                  <option value="estacionamiento">Estacionamiento / Parquímetro</option>
                  <option value="otro">Mantenimiento de Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Monto ($ ARS)
                </label>
                <input
                  type="number"
                  min="100"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold font-mono p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Detalle / Estación de Servicio
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#781d28] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
