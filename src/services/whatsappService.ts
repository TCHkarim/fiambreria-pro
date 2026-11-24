import { Pedido, Cliente, ConfiguracionEmpresa } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const openWhatsApp = (phone: string, text: string) => {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(url, '_blank');
};

export const sendRemitoWhatsApp = (pedido: Pedido, cliente?: Cliente, empresa?: ConfiguracionEmpresa) => {
  const phone = cliente?.whatsapp || cliente?.phone || pedido.client_phone || '';
  const text = `🥓 *${empresa?.fantasy_name || 'Don Bautista - Fiambres & Embutidos'}*
📋 *Remito:* ${pedido.remito_number || pedido.order_number}
👤 *Cliente:* ${cliente?.business_name || pedido.client_name}
📅 *Fecha de Entrega:* ${formatDate(pedido.delivery_date)}

📦 *Detalle del Pedido:*
${pedido.items.map(i => `• ${i.quantity} ${i.unit} - ${i.product_name} (${formatCurrency(i.subtotal)})`).join('\n')}

💰 *Total Comprobante:* ${formatCurrency(pedido.total)}
🚚 *Chofer asignado:* ${pedido.delivery_person_name || 'En camino'}

¡Muchas gracias por su confianza en nuestros productos artesanales!`;

  openWhatsApp(phone, text);
};

export const sendCobranzaReminderWhatsApp = (cliente: Cliente, empresa?: ConfiguracionEmpresa) => {
  const phone = cliente.whatsapp || cliente.phone || '';
  const text = `👋 Hola *${cliente.contact_person || cliente.business_name}*, esperamos que estés muy bien.
Te escribimos desde la administración de *${empresa?.fantasy_name || 'Don Bautista Fiambres Artesanales'}*.

Le informamos que registra un saldo pendiente de cuenta corriente de:
💵 *${formatCurrency(cliente.balance)}*

🏦 *Datos para Transferencia Bancaria:*
• Banco: Santander Río
• Titular: Don Bautista Chacinados S.R.L.
• CUIT: ${empresa?.cuit || '30-71648923-8'}
• CBU: 0720261420000048912301
• Alias: *DON.BAUTISTA.CHAC*

Por favor, una vez realizada la transferencia, envíanos el comprobante por este medio para emitir tu recibo de cancelación. ¡Muchas gracias!`;

  openWhatsApp(phone, text);
};

export const sendOrderReadyWhatsApp = (pedido: Pedido, cliente?: Cliente, empresa?: ConfiguracionEmpresa) => {
  const phone = cliente?.whatsapp || cliente?.phone || pedido.client_phone || '';
  const text = `🎉 ¡Hola *${cliente?.contact_person || pedido.client_name}*!
Te avisamos desde *${empresa?.fantasy_name || 'Don Bautista'}* que tu pedido *${pedido.order_number}* ya está listo y preparado en frío para salir en la próxima hoja de ruta de tu zona (${pedido.client_zone}).

📦 *Total de piezas y kilos:* ${pedido.items.length} productos / ${formatCurrency(pedido.total)}.
¡Excelente jornada!`;

  openWhatsApp(phone, text);
};
