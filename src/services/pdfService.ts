import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pedido, Cliente, ConfiguracionEmpresa, Cobranza, OrdenProduccion } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const generateRemitoPDF = (
  pedido: Pedido,
  cliente?: Cliente,
  empresa?: ConfiguracionEmpresa
) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [120, 29, 40]; // Bordó artesanal #781D28

  // Encabezado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.business_name || 'DON BAUTISTA CHACINADOS S.R.L.', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FÁBRICA DE FIAMBRES Y EMBUTIDOS ARTESANALES - SENASA Estab. N° 4512', 14, 18);
  doc.text(`${empresa?.address || 'Ruta 205 Km 64.5'}, ${empresa?.city || 'Cañuelas'} | Tel: ${empresa?.phone || '+54 11 4980-2211'}`, 14, 23);

  // Recuadro Tipo Comprobante (R)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(95, 8, 20, 20, 2, 2, 'FD');
  doc.setTextColor(120, 29, 40);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('R', 101.5, 21);

  doc.setFontSize(7);
  doc.text('COD. 091', 99, 26);

  // Número y Fecha
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`REMITO: ${pedido.remito_number || 'R-0001-0000' + pedido.order_number.replace('PED-', '')}`, 125, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Emisión: ${formatDate(pedido.date)}`, 125, 18);
  doc.text(`Fecha Entrega: ${formatDate(pedido.delivery_date)}`, 125, 23);

  // Cuadro de Datos de Empresa y Cliente
  doc.setDrawColor(220, 210, 200);
  doc.roundedRect(14, 34, 182, 38, 2, 2, 'D');

  // Columna Izquierda: Emisor
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR:', 18, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`CUIT: ${empresa?.cuit || '30-71648923-8'}`, 18, 46);
  doc.text(`Ingresos Brutos: ${empresa?.iibb || '901-384729-1'}`, 18, 51);
  doc.text(`IVA: ${empresa?.iva_condition || 'Responsable Inscripto'}`, 18, 56);
  doc.text(`R.N.E.: ${empresa?.rne_number || '02-048.912'}`, 18, 61);

  // Línea divisoria vertical
  doc.line(105, 34, 105, 72);

  // Columna Derecha: Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATARIO / CLIENTE:', 110, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Razón Social: ${cliente?.business_name || pedido.client_name}`, 110, 46);
  doc.text(`CUIT: ${cliente?.cuit || pedido.client_cuit || 'Consumidor Final'}`, 110, 51);
  doc.text(`Cond. IVA: ${cliente?.iva_condition || 'Responsable Inscripto'}`, 110, 56);
  doc.text(`Dirección: ${pedido.client_address || cliente?.address || '-'}`, 110, 61);
  doc.text(`Zona / Horario: ${pedido.client_zone} | ${cliente?.delivery_schedule || 'Sin restricción'}`, 110, 66);

  // Tabla de Productos y Lotes
  const tableData = pedido.items.map((item, index) => [
    (index + 1).toString(),
    item.product_name,
    item.batch_number || 'LOT-GENERAL',
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unit_price),
    formatCurrency(item.subtotal)
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['#', 'Descripción del Producto', 'Lote Asignado', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 245, 240],
    },
  });

  // Totales y Notas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  doc.roundedRect(14, finalY + 5, 120, 25, 2, 2, 'D');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES DE ENTREGA:', 18, finalY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(pedido.notes || 'Mercadería transportada bajo refrigeración reglamentaria (0°C a 5°C).', 18, finalY + 17);
  doc.text(`Repartidor asignado: ${pedido.delivery_person_name || 'Transporte Don Bautista'}`, 18, finalY + 23);

  // Recuadro de Total
  doc.roundedRect(138, finalY + 5, 58, 25, 2, 2, 'FD');
  doc.setFillColor(245, 235, 230);
  doc.setFontSize(8);
  doc.text('Subtotal:', 142, finalY + 11);
  doc.text(formatCurrency(pedido.subtotal), 175, finalY + 11);
  doc.text('IVA (21%):', 142, finalY + 16);
  doc.text(formatCurrency(pedido.tax_amount), 175, finalY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(120, 29, 40);
  doc.text('TOTAL:', 142, finalY + 24);
  doc.text(formatCurrency(pedido.total), 172, finalY + 24);

  // Firmas de Conformidad
  const signY = finalY + 45;
  doc.setTextColor(60, 60, 60);
  doc.line(20, signY, 80, signY);
  doc.line(130, signY, 190, signY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Entregó Conforme (Firma y Aclaración)', 25, signY + 5);
  doc.text('Recibió Conforme (Firma, Aclaración y DNI/Sello)', 132, signY + 5);

  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text('Documento no válido como factura. Mercadería controlada en origen bajo normas de inocuidad SENASA.', 14, 285);

  // Guardar archivo
  doc.save(`Remito_${pedido.order_number}_${pedido.client_name.replace(/\s+/g, '_')}.pdf`);
};

export const generateReciboPDF = (
  cobranza: Cobranza,
  cliente?: Cliente,
  empresa?: ConfiguracionEmpresa
) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [120, 29, 40];

  // Encabezado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.business_name || 'DON BAUTISTA CHACINADOS S.R.L.', 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RECIBO OFICIAL DE COBRANZA - CUENTA CORRIENTE', 14, 18);

  // Recuadro X
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(95, 6, 20, 18, 2, 2, 'FD');
  doc.setTextColor(120, 29, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('X', 102, 17);
  doc.setFontSize(6);
  doc.text('DOCUMENTO NO VÁLIDO', 96, 21);

  // Datos
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECIBO N°: ${cobranza.receipt_number}`, 125, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${formatDate(cobranza.date)}`, 125, 18);

  // Cuerpo
  doc.setDrawColor(220, 210, 200);
  doc.roundedRect(14, 32, 182, 60, 2, 2, 'D');

  doc.setFontSize(9);
  doc.text(`Recibimos de: `, 20, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cliente?.business_name || cobranza.client_name}`, 48, 42);

  doc.setFont('helvetica', 'normal');
  doc.text(`CUIT / DNI: `, 20, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cliente?.cuit || '-'}`, 48, 50);

  doc.setFont('helvetica', 'normal');
  doc.text(`La suma de: `, 20, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 29, 40);
  doc.text(`${formatCurrency(cobranza.amount)}`, 48, 58);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`En concepto de: `, 20, 66);
  doc.text(`${cobranza.notes || 'Cancelación de saldo comercial de cuenta corriente'}`, 48, 66);

  doc.text(`Forma de pago: `, 20, 74);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cobranza.payment_method.toUpperCase()} ${cobranza.reference_number ? `(Ref: ${cobranza.reference_number})` : ''}`, 48, 74);

  doc.setFont('helvetica', 'normal');
  doc.text(`Saldo actual deudor de la cuenta: `, 20, 84);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(cliente?.balance || 0)}`, 75, 84);

  // Firma
  doc.line(130, 120, 185, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Por Don Bautista Chacinados', 135, 125);

  doc.save(`Recibo_${cobranza.receipt_number}_${cobranza.client_name.replace(/\s+/g, '_')}.pdf`);
};

export const generateReporteProduccionPDF = (
  ordenes: OrdenProduccion[],
  empresa?: ConfiguracionEmpresa
) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [120, 29, 40];

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa?.business_name || 'DON BAUTISTA CHACINADOS', 14, 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('INFORME CONSOLIDADO DE PRODUCCIÓN, RENDIMIENTOS Y MERMAS', 14, 17);

  const tableData = ordenes.map((op) => [
    op.code,
    op.batch_number,
    op.product_name,
    formatDate(op.planned_date),
    `${op.target_quantity_kg} kg`,
    `${op.actual_quantity_kg} kg`,
    `${op.yield_pct}%`,
    `${op.waste_kg} kg`,
    op.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['OP N°', 'Lote', 'Producto', 'Fecha', 'Obj. (kg)', 'Real (kg)', 'Rend. %', 'Merma', 'Estado']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });

  doc.save(`Reporte_Produccion_${new Date().toISOString().slice(0, 10)}.pdf`);
};
