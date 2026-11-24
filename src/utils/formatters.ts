// Formateadores y utilidades argentinas

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  // Si viene en formato YYYY-MM-DD
  if (dateString.includes('-') && dateString.length === 10) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  // Si viene con hora
  if (dateString.includes('-') && dateString.includes(' ')) {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year} ${timePart || ''}`.trim();
  }
  return dateString;
};

export const formatWeight = (kg: number, decimals = 2): string => {
  return `${(kg || 0).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} kg`;
};

export const formatNumber = (num: number, decimals = 0): string => {
  return (num || 0).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'pendiente':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'en_preparacion':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    case 'listo':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    case 'en_reparto':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800';
    case 'entregado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'cancelado':
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300';
  }
};

export const getProductionStageLabel = (stage: string) => {
  switch (stage) {
    case 'picado': return '1. Picado / Molienda';
    case 'mezclado': return '2. Mezclado / Ligado';
    case 'embutido': return '3. Embutido y Atado';
    case 'coccion_estacionamiento': return '4. Cocción / Estacionamiento';
    case 'enfriado': return '5. Enfriado';
    case 'envasado': return '6. Envasado y Etiquetado';
    case 'finalizado': return 'Lote Finalizado';
    default: return stage;
  }
};
