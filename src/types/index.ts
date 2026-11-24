// ==========================================
// TIPOS PRINCIPALES - LA ARTESANA FIAMBRERÍA
// ==========================================

export type UserRole = 'admin' | 'produccion' | 'ventas' | 'repartidor' | 'contable';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export type UnitOfMeasure = 'kg' | 'g' | 'l' | 'ml' | 'unidad' | 'metro';

export type InsumoCategory = 
  | 'carnes'
  | 'especias_condimentos'
  | 'aditivos_curantes'
  | 'tripas_envolturas'
  | 'envasado_packaging'
  | 'limpieza_higiene'
  | 'otros';

export interface Insumo {
  id: string;
  code: string;
  name: string;
  category: InsumoCategory;
  unit: UnitOfMeasure;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number; // en ARS
  supplier_id: string;
  supplier_name?: string;
  supplier_lot: string;
  expiration_date: string; // YYYY-MM-DD
  location?: string;
}

export interface MovimientoInsumo {
  id: string;
  insumo_id: string;
  insumo_name: string;
  type: 'ingreso' | 'egreso' | 'ajuste' | 'produccion';
  quantity: number;
  date: string;
  reason: string;
  user_name: string;
  batch_id?: string;
}

export interface Proveedor {
  id: string;
  business_name: string;
  cuit: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  payment_terms: string; // ej: "30 días fecha factura", "Contado contra entrega"
  balance: number; // Saldo adeudado a proveedor en ARS
  notes?: string;
}

export interface OrdenCompraItem {
  insumo_id: string;
  insumo_name: string;
  quantity: number;
  unit: UnitOfMeasure;
  unit_price: number;
  total: number;
}

export interface OrdenCompra {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  date: string;
  status: 'borrador' | 'enviada' | 'recibida' | 'cancelada';
  items: OrdenCompraItem[];
  total: number;
  invoice_number?: string;
  received_date?: string;
}

export interface RecetaIngrediente {
  insumo_id: string;
  insumo_name: string;
  quantity: number; // cantidad bruta requerida
  unit: UnitOfMeasure;
}

export interface Receta {
  id: string;
  code: string;
  product_name: string;
  category: 'cocidos' | 'curados_secos' | 'embutidos_frescos' | 'salazones' | 'especialidades';
  batch_size_kg: number; // Peso base de formulación en kg (ej: 100 kg)
  expected_yield_pct: number; // Rendimiento esperado en % (ej: 82% por merma de secado o 115% por inyección/cocción)
  expected_waste_pct: number; // Merma estimada en %
  ingredients: RecetaIngrediente[];
  instructions: string[];
  calculated_cost_per_kg: number; // Costo por kg calculado dinámicamente según precios actuales de insumos
  margins: {
    mayorista_pct: number;
    minorista_pct: number;
    distribuidor_pct: number;
  };
  prices: {
    mayorista: number;
    minorista: number;
    distribuidor: number;
  };
}

export type EtapaProduccionNombre = 
  | 'picado'
  | 'mezclado'
  | 'embutido'
  | 'coccion_estacionamiento'
  | 'enfriado'
  | 'envasado';

export interface EtapaProduccionLog {
  stage: EtapaProduccionNombre;
  stage_label: string;
  started_at: string;
  completed_at?: string;
  operator: string;
  temperature_c?: number;
  notes?: string;
  status: 'pendiente' | 'en_curso' | 'completada';
}

export interface LoteInsumoUsado {
  insumo_id: string;
  insumo_name: string;
  supplier_lot: string;
  quantity_used: number;
  unit: UnitOfMeasure;
}

export interface OrdenProduccion {
  id: string;
  code: string; // ej: OP-2026-034
  recipe_id: string;
  product_name: string;
  batch_number: string; // ej: LOT-JAM-26034
  target_quantity_kg: number;
  actual_quantity_kg: number;
  pieces_count: number;
  status: 'planificada' | 'en_proceso' | 'completada' | 'cancelada';
  current_stage: EtapaProduccionNombre | 'finalizado';
  stages_log: EtapaProduccionLog[];
  used_lots: LoteInsumoUsado[];
  yield_pct: number; // Rendimiento real
  waste_kg: number; // Merma real en kg
  planned_date: string;
  start_date?: string;
  end_date?: string;
  responsible_user: string;
  chamber_location: string;
  notes?: string;
}

export interface ProductoTerminado {
  id: string;
  code: string;
  name: string;
  category: 'cocidos' | 'curados_secos' | 'embutidos_frescos' | 'salazones' | 'especialidades';
  unit: 'kg' | 'pieza';
  recipe_id?: string;
  stock_total_kg: number;
  stock_piezas: number;
  min_stock_kg: number;
  prices: {
    mayorista: number;
    minorista: number;
    distribuidor: number;
  };
  description: string;
  image_url?: string;
}

export interface LoteProducto {
  id: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  initial_kg: number;
  current_kg: number;
  pieces_count: number;
  production_date: string;
  expiration_date: string;
  chamber_location: string;
  status: 'en_maduracion' | 'disponible' | 'bajo_stock' | 'vencido' | 'agotado';
  op_id: string;
}

export interface ControlTemperatura {
  id: string;
  chamber_id: string;
  chamber_name: string;
  date_time: string;
  temperature_c: number;
  humidity_pct?: number;
  target_temp_min: number;
  target_temp_max: number;
  is_alert: boolean;
  operator: string;
  notes?: string;
}

export interface ChecklistCalidadItem {
  id: string;
  task: string;
  passed: boolean;
  notes?: string;
}

export interface ChecklistCalidad {
  id: string;
  date: string;
  shift: 'mañana' | 'tarde';
  area: 'desposte' | 'elaboracion' | 'embutido' | 'envasado' | 'camaras_frio';
  items: ChecklistCalidadItem[];
  operator: string;
  verified_by: string;
}

export interface DocumentoLegal {
  id: string;
  title: string;
  entity: 'SENASA' | 'Bromatología Municipal' | 'RNE' | 'RNPA' | 'Fumigación / MIP' | 'Análisis Microbiológico';
  cert_number: string;
  issue_date: string;
  expiration_date: string;
  days_to_expire: number;
  status: 'vigente' | 'por_vencer' | 'vencido';
  file_name?: string;
  notes?: string;
}

export interface IncidenciaCalidad {
  id: string;
  code: string;
  batch_number: string;
  product_name: string;
  date: string;
  severity: 'baja' | 'media' | 'alta' | 'critica';
  reason: string;
  action_taken: 'aislamiento' | 'reproceso' | 'destruccion' | 'retiro_mercado';
  affected_clients: string[];
  status: 'abierta' | 'en_analisis' | 'resuelta';
  reported_by: string;
  resolution_notes?: string;
}

export type CondicionIva = 'Responsable Inscripto' | 'Monotributo' | 'Exento' | 'Consumidor Final';
export type PriceListType = 'mayorista' | 'minorista' | 'distribuidor';

export interface Cliente {
  id: string;
  business_name: string; // Razón Social
  fantasy_name: string; // Nombre de Fantasía
  cuit: string;
  iva_condition: CondicionIva;
  address: string;
  city: string;
  zone: string; // ej: "Zona Norte", "Zona Oeste", "Zona Sur", "CABA Gourmet"
  delivery_schedule: string; // ej: "Martes y Jueves 08:00 a 13:00"
  price_list: PriceListType;
  credit_limit: number; // en ARS
  balance: number; // Saldo deudor en ARS (positivo = deuda del cliente)
  phone: string;
  whatsapp: string;
  email: string;
  contact_person: string;
  is_active: boolean;
  favorite_products?: string[];
}

export interface PedidoItem {
  product_id: string;
  product_name: string;
  batch_number?: string;
  quantity: number;
  unit: 'kg' | 'pieza';
  unit_price: number;
  subtotal: number;
}

export type PedidoEstado = 
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'en_reparto'
  | 'entregado'
  | 'cancelado';

export interface Pedido {
  id: string;
  order_number: string; // ej: PED-1045
  client_id: string;
  client_name: string;
  client_cuit: string;
  client_zone: string;
  client_address: string;
  client_phone: string;
  client_price_list: PriceListType;
  date: string;
  delivery_date: string;
  status: PedidoEstado;
  items: PedidoItem[];
  subtotal: number;
  discount_pct: number;
  tax_amount: number;
  total: number;
  payment_method: 'cuenta_corriente' | 'efectivo' | 'transferencia' | 'cheque';
  payment_status: 'pendiente' | 'parcial' | 'pagado';
  paid_amount: number;
  delivery_person_id?: string;
  delivery_person_name?: string;
  route_stop_order?: number;
  remito_number?: string;
  is_recurring?: boolean;
  recurring_day?: string;
  notes?: string;
}

export interface ParadaReparto {
  order_id: string;
  order_number: string;
  client_id: string;
  client_name: string;
  address: string;
  phone: string;
  total_amount: number;
  status: 'pendiente' | 'entregado' | 'no_entregado';
  delivered_at?: string;
  collected_amount?: number;
  payment_method?: 'efectivo' | 'transferencia' | 'cheque' | 'cuenta_corriente';
  proof_signature?: string; // Base64 data URL
  proof_photo_url?: string;
  notes?: string;
}

export interface RepartoRuta {
  id: string;
  date: string;
  zone: string;
  driver_id: string;
  driver_name: string;
  vehicle_plate: string;
  status: 'programada' | 'en_curso' | 'completada';
  stops: ParadaReparto[];
  expenses: {
    id: string;
    type: 'combustible' | 'peaje' | 'estacionamiento' | 'otro';
    amount: number;
    notes?: string;
  }[];
}

export interface Cobranza {
  id: string;
  receipt_number: string; // ej: REC-0001-00004521
  client_id: string;
  client_name: string;
  date: string;
  amount: number;
  payment_method: 'efectivo' | 'transferencia' | 'cheque' | 'mercado_pago';
  reference_number?: string;
  notes?: string;
  applied_to_orders?: string[];
}

export interface Cheque {
  id: string;
  check_number: string;
  bank: string;
  drawer_cuit: string; // CUIT librador
  drawer_name: string;
  client_id: string;
  client_name: string;
  amount: number;
  issue_date: string;
  due_date: string; // Fecha de cobro
  type: 'fisico' | 'echeq';
  status: 'en_cartera' | 'depositado' | 'cobrado' | 'rechazado' | 'endosado';
  endorsed_to_supplier?: string;
}

export interface ComprobanteFactura {
  id: string;
  invoice_type: 'Factura A' | 'Factura B' | 'Remito R';
  number: string; // ej: 0001-00008452
  client_id: string;
  client_name: string;
  client_cuit: string;
  date: string;
  net_amount: number;
  iva_21: number;
  iva_10_5: number;
  total: number;
  cae_mock: string;
  cae_due_date: string;
  order_id: string;
}

export interface MovimientoCaja {
  id: string;
  date_time: string;
  type: 'ingreso' | 'egreso';
  category: 
    | 'cobranza_cliente'
    | 'venta_mostrador'
    | 'gasto_combustible'
    | 'gasto_mantenimiento'
    | 'pago_proveedor'
    | 'sueldos_jornales'
    | 'servicios_luz_gas'
    | 'retiro_caja'
    | 'otro';
  amount: number;
  payment_method: 'efectivo' | 'transferencia' | 'cheque';
  description: string;
  responsible: string;
}

export interface AuditoriaLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  module: string;
  details: string;
}

export interface ConfiguracionEmpresa {
  business_name: string;
  fantasy_name: string;
  cuit: string;
  iibb: string;
  iva_condition: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  email: string;
  start_activities_date: string;
  rne_number: string; // Registro Nacional de Establecimiento
  rnpa_default: string; // Registro Nacional de Producto Alimenticio
  logo_url?: string;
  whatsapp_template_remito: string;
  whatsapp_template_cobranza: string;
  whatsapp_template_pedido_listo: string;
}

export interface AppNotification {
  id: string;
  type: 'stock_bajo' | 'vencimiento' | 'pedido_nuevo' | 'pago_atrasado' | 'temperatura';
  title: string;
  description: string;
  date: string;
  is_read: boolean;
  link_module?: string;
}
