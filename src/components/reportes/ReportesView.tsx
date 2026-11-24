import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  Scale
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { generateReporteProduccionPDF } from '../../services/pdfService';

export const ReportesView: React.FC = () => {
  const state = store.getState();
  const [reportType, setReportType] = useState<'ventas' | 'produccion' | 'mermas'>('ventas');

  // Exportar datos a CSV / Excel
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'ventas') {
      csvContent += 'Nro Pedido,Fecha,Cliente,Zona,Total,Estado,Metodo Pago\n';
      state.pedidos.forEach(p => {
        csvContent += `"${p.order_number}","${p.date}","${p.client_name}","${p.client_zone}","${p.total}","${p.status}","${p.payment_method}"\n`;
      });
    } else if (reportType === 'produccion') {
      csvContent += 'Nro OP,Lote,Producto,Fecha,Objetivo Kg,Real Kg,Rendimiento Pct,Merma Kg,Responsable\n';
      state.ordenesProduccion.forEach(op => {
        csvContent += `"${op.code}","${op.batch_number}","${op.product_name}","${op.planned_date}","${op.target_quantity_kg}","${op.actual_quantity_kg}","${op.yield_pct}%","${op.waste_kg}","${op.responsible_user}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Reportes, Estadísticas y Exportaciones
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Análisis de ventas por producto, cliente y zona, mermas de producción y exportación a Excel / PDF
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a Excel (CSV)</span>
          </button>

          <button
            onClick={() => generateReporteProduccionPDF(state.ordenesProduccion, state.empresa)}
            className="px-3.5 py-2 bg-[#781d28] hover:bg-[#5c121c] text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Reporte */}
      <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        {[
          { id: 'ventas', label: 'Ventas por Producto y Cliente' },
          { id: 'produccion', label: 'Rendimientos y Producción' },
          { id: 'mermas', label: 'Análisis de Mermas y Desperdicio' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === t.id
                ? 'bg-[#781d28] text-white shadow-xs'
                : 'bg-white dark:bg-[#201d1c] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* REPORTE DE VENTAS */}
      {reportType === 'ventas' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ventas por Zona */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Distribución de Ventas por Zona Geográfica
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { zone: 'Zona Norte', amount: 1572832.9, pct: 54, color: 'bg-[#781d28]' },
                  { zone: 'CABA Centro', amount: 203878.95, pct: 18, color: 'bg-blue-600' },
                  { zone: 'Zona Oeste', amount: 196262.0, pct: 17, color: 'bg-amber-600' },
                  { zone: 'Zona Sur', amount: 120000.0, pct: 11, color: 'bg-purple-600' },
                ].map((z, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">{z.zone}</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{formatCurrency(z.amount)} ({z.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div style={{ width: `${z.pct}%` }} className={`h-full ${z.color} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ventas por Variedad de Chacinado */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Productos con Mayor Facturación
              </h3>
              <div className="space-y-2 text-xs">
                {state.productosTerminados.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-800 dark:text-stone-200">{p.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize">{p.category.replace('_', ' ')}</p>
                    </div>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {formatCurrency(p.prices.mayorista)}/{p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REPORTE DE PRODUCCIÓN Y RENDIMIENTOS */}
      {reportType === 'produccion' && (
        <div className="bg-white dark:bg-[#201d1c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6f0] dark:bg-stone-800/60 uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Orden / Lote</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Kilos Objetivo</th>
                  <th className="py-3 px-4">Kilos Reales Netos</th>
                  <th className="py-3 px-4">Rendimiento Real</th>
                  <th className="py-3 px-4">Merma (kg)</th>
                  <th className="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {state.ordenesProduccion.map((op) => (
                  <tr key={op.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {op.code}
                      <span className="block text-[10px] text-stone-400">{op.batch_number}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800 dark:text-stone-200">{op.product_name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">{formatWeight(op.target_quantity_kg)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {op.actual_quantity_kg > 0 ? formatWeight(op.actual_quantity_kg) : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {op.yield_pct > 0 ? `${op.yield_pct}%` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600">
                      {op.waste_kg > 0 ? formatWeight(op.waste_kg) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {op.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTE DE MERMAS */}
      {reportType === 'mermas' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#201d1c] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
            Control de Mermas por Desecación, Cocción y Recortes
          </h3>
          <p className="text-xs text-stone-500">
            En chacinados curados y secados (Salames, Bondiolas), la merma normal de agua en secadero oscila entre 30% y 35%. En jamones cocidos, la merma por desposte y cocción ronda el 4-6%.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Merma Promedio en Secadero de Salames
              </span>
              <p className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-400">30.4%</p>
              <p className="text-[11px] text-stone-400">Dentro del estándar artesanal óptimo (30% a 35%)</p>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Merma Promedio en Jamón Cocido y Horno Vapor
              </span>
              <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">4.8%</p>
              <p className="text-[11px] text-stone-400">Excelente retención y rendimiento con salmuera natural</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
