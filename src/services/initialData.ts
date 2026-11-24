import {
  Insumo,
  Proveedor,
  Receta,
  OrdenProduccion,
  ProductoTerminado,
  LoteProducto,
  Cliente,
  Pedido,
  RepartoRuta,
  Cobranza,
  Cheque,
  ComprobanteFactura,
  MovimientoCaja,
  ControlTemperatura,
  ChecklistCalidad,
  DocumentoLegal,
  ConfiguracionEmpresa,
  AppNotification,
  User,
  AuditoriaLog
} from '../types';

export const initialUsers: User[] = [
  { id: 'usr-1', name: 'Martín Bossi (Admin)', email: 'admin@donbautista.com.ar', role: 'admin', phone: '+54 11 4455-8899' },
  { id: 'usr-2', name: 'Esteban Morales (Jefe de Planta)', email: 'produccion@donbautista.com.ar', role: 'produccion', phone: '+54 11 5566-7788' },
  { id: 'usr-3', name: 'Valeria Rinaldi (Ventas y Cuentas)', email: 'ventas@donbautista.com.ar', role: 'ventas', phone: '+54 11 3322-1100' },
  { id: 'usr-4', name: 'Rodrigo Benítez (Repartidor Zona Norte)', email: 'reparto@donbautista.com.ar', role: 'repartidor', phone: '+54 11 9988-7766' },
  { id: 'usr-5', name: 'Clara Domínguez (Administración)', email: 'contable@donbautista.com.ar', role: 'contable', phone: '+54 11 6655-4433' },
];

export const initialEmpresa: ConfiguracionEmpresa = {
  business_name: 'DON BAUTISTA CHACINADOS ARTESANALES S.R.L.',
  fantasy_name: 'Don Bautista - Fiambres & Embutidos',
  cuit: '30-71648923-8',
  iibb: '901-384729-1',
  iva_condition: 'Responsable Inscripto',
  address: 'Ruta 205 Km 64.5, Parque Industrial Cañuelas',
  city: 'Cañuelas',
  province: 'Buenos Aires',
  phone: '+54 11 4980-2211',
  whatsapp: '+54 9 11 5544-3322',
  email: 'ventas@donbautista.com.ar',
  start_activities_date: '15/03/2012',
  rne_number: 'RNE 02-048.912 (SENASA Estab. N° 4512)',
  rnpa_default: 'RNPA 02-581944',
  whatsapp_template_remito: '¡Hola {cliente}! Te adjuntamos el Remito N° {remito} por tu pedido de {monto}. Nuestro chofer {repartidor} está en camino. ¡Muchas gracias por elegirnos!',
  whatsapp_template_cobranza: 'Estimado {cliente}, le informamos que registra un saldo pendiente de {saldo}. Le recordamos los datos bancarios para transferencia: Alias DON.BAUTISTA.CHAC. ¡Saludos!',
  whatsapp_template_pedido_listo: '¡Hola {cliente}! Tu pedido #{pedido} ya fue elaborado y envasado al vacío. Sale en el próximo reparto de {zona}.'
};

export const initialProveedores: Proveedor[] = [
  {
    id: 'prov-1',
    business_name: 'Frigorífico Los Pampas S.A.',
    cuit: '30-65489123-4',
    contact_name: 'Horacio Gómez',
    phone: '+54 11 4687-3300',
    email: 'ventas@frigorificolospampas.com.ar',
    address: 'Av. Lisandro de la Torre 2400, Mataderos, CABA',
    payment_terms: 'Cheque 30 días',
    balance: 840000,
    notes: 'Proveedor principal de medias reses porcinas y cortes magros seleccionados.'
  },
  {
    id: 'prov-2',
    business_name: 'Especias & Aditivos Chacinados del Sur',
    cuit: '30-70984512-9',
    contact_name: 'Mariana Albarracín',
    phone: '+54 11 4720-9944',
    email: 'contacto@especialidadesdelsur.com.ar',
    address: 'Calle 14 N° 580, Berazategui, Buenos Aires',
    payment_terms: 'Transferencia 15 días',
    balance: 195000,
    notes: 'Certificaciones Kosher y Sin TACC para sales de cura, pimentón dulce y polifosfatos.'
  },
  {
    id: 'prov-3',
    business_name: 'Tripas & Envolturas Argentinas S.R.L.',
    cuit: '33-68945120-9',
    contact_name: 'Claudio Ferraro',
    phone: '+54 2323 42-1188',
    email: 'tripasferraro@envolturasarg.com.ar',
    address: 'Parque Industrial Luján Lote 42',
    payment_terms: 'Contado contra entrega',
    balance: 0,
    notes: 'Tripa natural porcina salada 38/42 mm y colágena recta para mortadelas.'
  },
  {
    id: 'prov-4',
    business_name: 'Envases Flexibles del Plata',
    cuit: '30-71120944-1',
    contact_name: 'Carla De la Torre',
    phone: '+54 11 5122-6600',
    email: 'pedidos@envasesplata.com.ar',
    address: 'Av. Márquez 1890, San Martín',
    payment_terms: 'Cheque 45 días',
    balance: 320000,
    notes: 'Bolsas multicapa termoencogibles al vacío y films de alta barrera.'
  }
];

export const initialInsumos: Insumo[] = [
  {
    id: 'ins-1',
    code: 'CAR-001',
    name: 'Carne de Cerdo Magra (Pernil/Paleta)',
    category: 'carnes',
    unit: 'kg',
    current_stock: 680,
    min_stock: 250,
    cost_per_unit: 4200,
    supplier_id: 'prov-1',
    supplier_name: 'Frigorífico Los Pampas S.A.',
    supplier_lot: 'LOT-PAMPA-8941',
    expiration_date: '2026-12-05',
    location: 'Cámara 1 - Desposte'
  },
  {
    id: 'ins-2',
    code: 'CAR-002',
    name: 'Tocino Dorsal de Cerdo (Lardo Firme)',
    category: 'carnes',
    unit: 'kg',
    current_stock: 220,
    min_stock: 80,
    cost_per_unit: 2900,
    supplier_id: 'prov-1',
    supplier_name: 'Frigorífico Los Pampas S.A.',
    supplier_lot: 'LOT-PAMPA-8942',
    expiration_date: '2026-12-10',
    location: 'Cámara 1 - Desposte'
  },
  {
    id: 'ins-3',
    code: 'CAR-003',
    name: 'Carne Vacuna Magra (Corte Nalga)',
    category: 'carnes',
    unit: 'kg',
    current_stock: 140,
    min_stock: 60,
    cost_per_unit: 5800,
    supplier_id: 'prov-1',
    supplier_name: 'Frigorífico Los Pampas S.A.',
    supplier_lot: 'LOT-PAMPA-8890',
    expiration_date: '2026-12-04',
    location: 'Cámara 1 - Desposte'
  },
  {
    id: 'ins-4',
    code: 'CAR-004',
    name: 'Bondiola de Cerdo Fresca Seleccionada',
    category: 'carnes',
    unit: 'kg',
    current_stock: 310,
    min_stock: 120,
    cost_per_unit: 6400,
    supplier_id: 'prov-1',
    supplier_name: 'Frigorífico Los Pampas S.A.',
    supplier_lot: 'LOT-PAMPA-8970',
    expiration_date: '2026-12-08',
    location: 'Cámara 1 - Desposte'
  },
  {
    id: 'ins-5',
    code: 'ESP-001',
    name: 'Sal Entrefina Pura sin TACC',
    category: 'especias_condimentos',
    unit: 'kg',
    current_stock: 450,
    min_stock: 100,
    cost_per_unit: 650,
    supplier_id: 'prov-2',
    supplier_name: 'Especias & Aditivos Chacinados del Sur',
    supplier_lot: 'ESP-SAL-2026-44',
    expiration_date: '2027-10-20',
    location: 'Depósito Seco - Estantería A1'
  },
  {
    id: 'ins-6',
    code: 'ADI-001',
    name: 'Sal Curante con Nitrito (Cura SENASA)',
    category: 'aditivos_curantes',
    unit: 'kg',
    current_stock: 35,
    min_stock: 15,
    cost_per_unit: 3400,
    supplier_id: 'prov-2',
    supplier_name: 'Especias & Aditivos Chacinados del Sur',
    supplier_lot: 'CUR-NIT-991',
    expiration_date: '2027-05-15',
    location: 'Armario de Curantes Cerrado'
  },
  {
    id: 'ins-7',
    code: 'ESP-002',
    name: 'Pimienta Negra en Grano Quebrada',
    category: 'especias_condimentos',
    unit: 'kg',
    current_stock: 48,
    min_stock: 20,
    cost_per_unit: 14500,
    supplier_id: 'prov-2',
    supplier_name: 'Especias & Aditivos Chacinados del Sur',
    supplier_lot: 'PIM-IND-401',
    expiration_date: '2027-08-30',
    location: 'Depósito Seco - Estantería A2'
  },
  {
    id: 'ins-8',
    code: 'ESP-003',
    name: 'Pistachos Pelados Tostados sin Sal',
    category: 'especias_condimentos',
    unit: 'kg',
    current_stock: 18,
    min_stock: 10,
    cost_per_unit: 26000,
    supplier_id: 'prov-2',
    supplier_name: 'Especias & Aditivos Chacinados del Sur',
    supplier_lot: 'PIST-IR-12',
    expiration_date: '2027-04-10',
    location: 'Depósito Seco - Estantería A3'
  },
  {
    id: 'ins-9',
    code: 'TRI-001',
    name: 'Tripa Porcina Calibrada 38/42 mm',
    category: 'tripas_envolturas',
    unit: 'metro',
    current_stock: 1200,
    min_stock: 400,
    cost_per_unit: 180,
    supplier_id: 'prov-3',
    supplier_name: 'Tripas & Envolturas Argentinas S.R.L.',
    supplier_lot: 'TRIP-POR-882',
    expiration_date: '2027-03-01',
    location: 'Cámara 3 - Frescos'
  },
  {
    id: 'ins-10',
    code: 'TRI-002',
    name: 'Tripa Fibrosa Recta Calibre 65 mm',
    category: 'tripas_envolturas',
    unit: 'metro',
    current_stock: 450,
    min_stock: 200,
    cost_per_unit: 310,
    supplier_id: 'prov-3',
    supplier_name: 'Tripas & Envolturas Argentinas S.R.L.',
    supplier_lot: 'TRIP-FIB-104',
    expiration_date: '2027-09-15',
    location: 'Depósito Seco - Estantería B1'
  },
  {
    id: 'ins-11',
    code: 'ENV-001',
    name: 'Bolsas Termoencogibles al Vacío 20x35',
    category: 'envasado_packaging',
    unit: 'unidad',
    current_stock: 2800,
    min_stock: 1000,
    cost_per_unit: 95,
    supplier_id: 'prov-4',
    supplier_name: 'Envases Flexibles del Plata',
    supplier_lot: 'ENV-VAC-908',
    expiration_date: '2028-01-01',
    location: 'Depósito Packaging'
  },
  {
    id: 'ins-12',
    code: 'ADI-002',
    name: 'Polifosfatos para Jamonería Grado Alim.',
    category: 'aditivos_curantes',
    unit: 'kg',
    current_stock: 8, // Stock bajo a propósito para alerta!
    min_stock: 25,
    cost_per_unit: 8900,
    supplier_id: 'prov-2',
    supplier_name: 'Especias & Aditivos Chacinados del Sur',
    supplier_lot: 'POL-AL-312',
    expiration_date: '2027-06-20',
    location: 'Armario de Curantes Cerrado'
  }
];

export const initialRecetas: Receta[] = [
  {
    id: 'rec-1',
    code: 'REC-SAL-01',
    product_name: 'Salame Picado Grueso Tipo Tandil',
    category: 'curados_secos',
    batch_size_kg: 100,
    expected_yield_pct: 68, // 32% de merma por secado en cámara
    expected_waste_pct: 32,
    ingredients: [
      { insumo_id: 'ins-1', insumo_name: 'Carne de Cerdo Magra', quantity: 65, unit: 'kg' },
      { insumo_id: 'ins-3', insumo_name: 'Carne Vacuna Magra', quantity: 15, unit: 'kg' },
      { insumo_id: 'ins-2', insumo_name: 'Tocino Dorsal de Cerdo', quantity: 20, unit: 'kg' },
      { insumo_id: 'ins-5', insumo_name: 'Sal Entrefina', quantity: 2.6, unit: 'kg' },
      { insumo_id: 'ins-6', insumo_name: 'Sal Curante con Nitrito', quantity: 0.3, unit: 'kg' },
      { insumo_id: 'ins-7', insumo_name: 'Pimienta Negra Quebrada', quantity: 0.5, unit: 'kg' },
      { insumo_id: 'ins-9', insumo_name: 'Tripa Porcina 38/42 mm', quantity: 45, unit: 'metro' }
    ],
    instructions: [
      'Picar carnes a disco 12 mm y tocino a cubos de 8 mm a temperatura -2°C.',
      'Mezclar en amasadora durante 6 minutos hasta lograr punto de ligado homogéneo.',
      'Embutir en tripa porcina calibrada bien desgrasada evitando burbujas de aire.',
      'Atado tradicional con hilo de algodón 4 cabos y clipado en extremos.',
      'Estufado inicial 48 hs a 22°C y 85% HR para desarrollo de flora láctica.',
      'Maduración y secado en Secadero Tandil durante 21 días a 14°C y 75% HR.'
    ],
    calculated_cost_per_kg: 7150,
    margins: {
      mayorista_pct: 35,
      minorista_pct: 65,
      distribuidor_pct: 22
    },
    prices: {
      distribuidor: 8720,
      mayorista: 9650,
      minorista: 11800
    }
  },
  {
    id: 'rec-2',
    code: 'REC-JAM-01',
    product_name: 'Jamón Cocido Artesanal Natural Especial',
    category: 'cocidos',
    batch_size_kg: 100,
    expected_yield_pct: 108, // Rendimiento con salmuera natural masajeada
    expected_waste_pct: 5,
    ingredients: [
      { insumo_id: 'ins-1', insumo_name: 'Carne de Cerdo Magra (Pernil entero)', quantity: 95, unit: 'kg' },
      { insumo_id: 'ins-5', insumo_name: 'Sal Entrefina', quantity: 2.2, unit: 'kg' },
      { insumo_id: 'ins-6', insumo_name: 'Sal Curante con Nitrito', quantity: 0.25, unit: 'kg' },
      { insumo_id: 'ins-12', insumo_name: 'Polifosfatos para Jamonería', quantity: 0.4, unit: 'kg' },
      { insumo_id: 'ins-11', insumo_name: 'Bolsas Termoencogibles al Vacío', quantity: 18, unit: 'unidad' }
    ],
    instructions: [
      'Desposte manual y desgrasado de jamones enteros retirando cuero y hueso.',
      'Inyección de salmuera aromática a baja presión (12%).',
      'Masajeado en bombo al vacío durante 18 horas con descansos intermitentes.',
      'Enmoldado en moldes de acero inoxidable con prensas de resorte.',
      'Cocción lenta en horno a vapor hasta alcanzar 72°C en corazón de pieza.',
      'Enfriado rápido en lluvia de agua fría y reposo 24 hs en cámara a 2°C antes de envasar.'
    ],
    calculated_cost_per_kg: 5950,
    margins: {
      mayorista_pct: 35,
      minorista_pct: 60,
      distribuidor_pct: 22
    },
    prices: {
      distribuidor: 7260,
      mayorista: 8030,
      minorista: 9520
    }
  },
  {
    id: 'rec-3',
    code: 'REC-MOR-01',
    product_name: 'Mortadela con Pistachos y Granos de Pimienta',
    category: 'cocidos',
    batch_size_kg: 100,
    expected_yield_pct: 98,
    expected_waste_pct: 4,
    ingredients: [
      { insumo_id: 'ins-1', insumo_name: 'Carne de Cerdo Magra', quantity: 60, unit: 'kg' },
      { insumo_id: 'ins-3', insumo_name: 'Carne Vacuna Magra', quantity: 15, unit: 'kg' },
      { insumo_id: 'ins-2', insumo_name: 'Tocino Dorsal de Cerdo (Daditos)', quantity: 20, unit: 'kg' },
      { insumo_id: 'ins-8', insumo_name: 'Pistachos Pelados Tostados', quantity: 2.5, unit: 'kg' },
      { insumo_id: 'ins-7', insumo_name: 'Pimienta Negra Quebrada', quantity: 0.6, unit: 'kg' },
      { insumo_id: 'ins-10', insumo_name: 'Tripa Fibrosa Recta 65 mm', quantity: 22, unit: 'metro' }
    ],
    instructions: [
      'Cutterizado fino de carnes con hielo escamado hasta emulsionar a 12°C.',
      'Escaldado previo de los dados de tocino para fijación perfecta.',
      'Incorporación manual suave de los pistachos y granos de pimienta enteros.',
      'Embutido al vacío en tripa fibrosa calibre 65 mm.',
      'Cocción escalonada en horno hasta 70°C internos.',
      'Ducha fría y oreo 12 hs.'
    ],
    calculated_cost_per_kg: 6850,
    margins: {
      mayorista_pct: 38,
      minorista_pct: 65,
      distribuidor_pct: 25
    },
    prices: {
      distribuidor: 8560,
      mayorista: 9450,
      minorista: 11300
    }
  },
  {
    id: 'rec-4',
    code: 'REC-BON-01',
    product_name: 'Bondiola Curada Artesanal en Red',
    category: 'curados_secos',
    batch_size_kg: 100,
    expected_yield_pct: 66, // 34% merma de secado
    expected_waste_pct: 34,
    ingredients: [
      { insumo_id: 'ins-4', insumo_name: 'Bondiola de Cerdo Fresca', quantity: 98, unit: 'kg' },
      { insumo_id: 'ins-5', insumo_name: 'Sal Entrefina', quantity: 3.2, unit: 'kg' },
      { insumo_id: 'ins-6', insumo_name: 'Sal Curante con Nitrito', quantity: 0.3, unit: 'kg' },
      { insumo_id: 'ins-7', insumo_name: 'Pimienta Negra Quebrada', quantity: 0.8, unit: 'kg' },
      { insumo_id: 'ins-11', insumo_name: 'Bolsas Termoencogibles al Vacío', quantity: 35, unit: 'unidad' }
    ],
    instructions: [
      'Perfilado manual de bondiolas retirando excesos grasos externos.',
      'Curado seco en batea por frotación durante 7 días en cámara a 3°C.',
      'Lavado con vino blanco y secado superficial.',
      'Colocación en red elástica compresiva.',
      'Estacionamiento durante 45 días en secadero a 13°C y 78% humedad relativa.'
    ],
    calculated_cost_per_kg: 10200,
    margins: {
      mayorista_pct: 35,
      minorista_pct: 60,
      distribuidor_pct: 22
    },
    prices: {
      distribuidor: 12440,
      mayorista: 13770,
      minorista: 16320
    }
  }
];

export const initialProductosTerminados: ProductoTerminado[] = [
  {
    id: 'prod-1',
    code: 'PT-SAL-01',
    name: 'Salame Picado Grueso Tipo Tandil (Bastón ~350g)',
    category: 'curados_secos',
    unit: 'kg',
    recipe_id: 'rec-1',
    stock_total_kg: 345.5,
    stock_piezas: 987,
    min_stock_kg: 100,
    prices: {
      distribuidor: 8720,
      mayorista: 9650,
      minorista: 11800
    },
    description: 'Elaborado con receta piamontesa tradicional de Tandil. Secado 21 días en tripa natural.'
  },
  {
    id: 'prod-2',
    code: 'PT-JAM-01',
    name: 'Jamón Cocido Artesanal Natural Especial (Pieza ~5.5kg)',
    category: 'cocidos',
    unit: 'kg',
    recipe_id: 'rec-2',
    stock_total_kg: 286.0,
    stock_piezas: 52,
    min_stock_kg: 150,
    prices: {
      distribuidor: 7260,
      mayorista: 8030,
      minorista: 9520
    },
    description: 'Pernil de cerdo puro seleccionado, bajo en sodio, cocción lenta al vapor y sin féculas agregadas.'
  },
  {
    id: 'prod-3',
    code: 'PT-MOR-01',
    name: 'Mortadela con Pistachos y Granos Enteros (Bocha ~3kg)',
    category: 'cocidos',
    unit: 'kg',
    recipe_id: 'rec-3',
    stock_total_kg: 165.0,
    stock_piezas: 55,
    min_stock_kg: 60,
    prices: {
      distribuidor: 8560,
      mayorista: 9450,
      minorista: 11300
    },
    description: 'Emulsión fina italiana con tocino en dados firmes, pistachos tostados y granos enteros de pimienta.'
  },
  {
    id: 'prod-4',
    code: 'PT-BON-01',
    name: 'Bondiola Curada al Vacío (Pieza ~1.8kg)',
    category: 'curados_secos',
    unit: 'kg',
    recipe_id: 'rec-4',
    stock_total_kg: 198.0,
    stock_piezas: 110,
    min_stock_kg: 80,
    prices: {
      distribuidor: 12440,
      mayorista: 13770,
      minorista: 16320
    },
    description: 'Curada 45 días en red de algodón. Veteado perfecto y aroma especiado inconfundible.'
  },
  {
    id: 'prod-5',
    code: 'PT-PAL-01',
    name: 'Paleta Cocida Fiambrera Primera (Pieza Rectangular ~4.5kg)',
    category: 'cocidos',
    unit: 'kg',
    stock_total_kg: 420.0,
    stock_piezas: 93,
    min_stock_kg: 150,
    prices: {
      distribuidor: 4890,
      mayorista: 5400,
      minorista: 6750
    },
    description: 'Paleta porcina seleccionada, excelente rendimiento al feteado fino para sandwichería.'
  },
  {
    id: 'prod-6',
    code: 'PT-QUE-01',
    name: 'Queso de Cerdo Artesanal a la Pimienta (Pieza ~2.5kg)',
    category: 'especialidades',
    unit: 'kg',
    stock_total_kg: 45.0, // Stock bajo
    stock_piezas: 18,
    min_stock_kg: 50,
    prices: {
      distribuidor: 4200,
      mayorista: 4800,
      minorista: 5900
    },
    description: 'Receta campera con gelatinas naturales de cocción, vinagre suave y bouquet de hierbas.'
  }
];

export const initialLotes: LoteProducto[] = [
  {
    id: 'lot-1',
    product_id: 'prod-1',
    product_name: 'Salame Picado Grueso Tipo Tandil',
    batch_number: 'LOT-SAL-2026-08',
    initial_kg: 200,
    current_kg: 180.5,
    pieces_count: 515,
    production_date: '2026-11-01',
    expiration_date: '2027-04-30',
    chamber_location: 'Secadero Tandil - Jaula B',
    status: 'disponible',
    op_id: 'op-101'
  },
  {
    id: 'lot-2',
    product_id: 'prod-1',
    product_name: 'Salame Picado Grueso Tipo Tandil',
    batch_number: 'LOT-SAL-2026-07',
    initial_kg: 190,
    current_kg: 42.0, // lote más antiguo, FEFO prioritario!
    pieces_count: 120,
    production_date: '2026-10-15',
    expiration_date: '2027-03-15', // Vence antes
    chamber_location: 'Cámara 2 - Despacho',
    status: 'disponible',
    op_id: 'op-98'
  },
  {
    id: 'lot-3',
    product_id: 'prod-2',
    product_name: 'Jamón Cocido Artesanal Natural Especial',
    batch_number: 'LOT-JAM-2026-14',
    initial_kg: 216,
    current_kg: 176.0,
    pieces_count: 32,
    production_date: '2026-11-18',
    expiration_date: '2027-01-18',
    chamber_location: 'Cámara 3 - Producto Terminado',
    status: 'disponible',
    op_id: 'op-102'
  },
  {
    id: 'lot-4',
    product_id: 'prod-3',
    product_name: 'Mortadela con Pistachos y Granos Enteros',
    batch_number: 'LOT-MOR-2026-09',
    initial_kg: 150,
    current_kg: 110.0,
    pieces_count: 37,
    production_date: '2026-11-10',
    expiration_date: '2027-02-10',
    chamber_location: 'Cámara 3 - Producto Terminado',
    status: 'disponible',
    op_id: 'op-100'
  },
  {
    id: 'lot-5',
    product_id: 'prod-4',
    product_name: 'Bondiola Curada al Vacío',
    batch_number: 'LOT-BON-2026-05',
    initial_kg: 132,
    current_kg: 98.0,
    pieces_count: 55,
    production_date: '2026-10-02',
    expiration_date: '2027-06-30',
    chamber_location: 'Secadero Tandil - Jaula C',
    status: 'disponible',
    op_id: 'op-95'
  }
];

export const initialOrdenesProduccion: OrdenProduccion[] = [
  {
    id: 'op-103',
    code: 'OP-2026-042',
    recipe_id: 'rec-1',
    product_name: 'Salame Picado Grueso Tipo Tandil',
    batch_number: 'LOT-SAL-2026-09',
    target_quantity_kg: 150,
    actual_quantity_kg: 104.5,
    pieces_count: 300,
    status: 'en_proceso',
    current_stage: 'coccion_estacionamiento',
    stages_log: [
      {
        stage: 'picado',
        stage_label: '1. Picado / Molienda',
        started_at: '2026-11-20 07:00',
        completed_at: '2026-11-20 08:30',
        operator: 'Esteban Morales',
        temperature_c: -1.5,
        status: 'completada',
        notes: 'Carne de cerdo disco 12mm y vacuno 8mm en frío perfecto.'
      },
      {
        stage: 'mezclado',
        stage_label: '2. Mezclado / Ligado',
        started_at: '2026-11-20 08:45',
        completed_at: '2026-11-20 09:15',
        operator: 'Esteban Morales',
        status: 'completada',
        notes: 'Homogeneización con sal entrefina y pimienta de lote PIM-IND-401.'
      },
      {
        stage: 'embutido',
        stage_label: '3. Embutido y Atado',
        started_at: '2026-11-20 09:30',
        completed_at: '2026-11-20 12:00',
        operator: 'Juan Pérez',
        status: 'completada',
        notes: 'Tripa porcina 38/42 mm sin roturas. 300 piezas atadas a mano.'
      },
      {
        stage: 'coccion_estacionamiento',
        stage_label: '4. Estufado / Secadero',
        started_at: '2026-11-20 13:00',
        operator: 'Esteban Morales',
        temperature_c: 14.2,
        status: 'en_curso',
        notes: 'En Secadero Tandil a 76% HR. Estimado retiro el 11/12/2026.'
      },
      {
        stage: 'enfriado',
        stage_label: '5. Enfriado',
        started_at: '',
        operator: 'Esteban Morales',
        status: 'pendiente'
      },
      {
        stage: 'envasado',
        stage_label: '6. Envasado y Etiquetado',
        started_at: '',
        operator: 'Equipo Envasado',
        status: 'pendiente'
      }
    ],
    used_lots: [
      { insumo_id: 'ins-1', insumo_name: 'Carne de Cerdo Magra', supplier_lot: 'LOT-PAMPA-8941', quantity_used: 97.5, unit: 'kg' },
      { insumo_id: 'ins-3', insumo_name: 'Carne Vacuna Magra', supplier_lot: 'LOT-PAMPA-8890', quantity_used: 22.5, unit: 'kg' },
      { insumo_id: 'ins-2', insumo_name: 'Tocino Dorsal de Cerdo', supplier_lot: 'LOT-PAMPA-8942', quantity_used: 30.0, unit: 'kg' },
      { insumo_id: 'ins-7', insumo_name: 'Pimienta Negra Quebrada', supplier_lot: 'PIM-IND-401', quantity_used: 0.75, unit: 'kg' }
    ],
    yield_pct: 69.6,
    waste_kg: 45.5,
    planned_date: '2026-11-20',
    start_date: '2026-11-20 07:00',
    responsible_user: 'Esteban Morales',
    chamber_location: 'Secadero Tandil - Jaula A',
    notes: 'Lote programado para pedidos de fiestas y distribuidores de Zona Norte.'
  },
  {
    id: 'op-104',
    code: 'OP-2026-043',
    recipe_id: 'rec-2',
    product_name: 'Jamón Cocido Artesanal Natural Especial',
    batch_number: 'LOT-JAM-2026-15',
    target_quantity_kg: 200,
    actual_quantity_kg: 0,
    pieces_count: 36,
    status: 'planificada',
    current_stage: 'picado',
    stages_log: [
      { stage: 'picado', stage_label: '1. Desposte y Selección', started_at: '', operator: 'Esteban Morales', status: 'pendiente' },
      { stage: 'mezclado', stage_label: '2. Inyección y Masajeado', started_at: '', operator: 'Esteban Morales', status: 'pendiente' },
      { stage: 'embutido', stage_label: '3. Enmoldado', started_at: '', operator: 'Esteban Morales', status: 'pendiente' },
      { stage: 'coccion_estacionamiento', stage_label: '4. Cocción al Vapor', started_at: '', operator: 'Esteban Morales', status: 'pendiente' },
      { stage: 'enfriado', stage_label: '5. Ducha Fría y Reposo', started_at: '', operator: 'Esteban Morales', status: 'pendiente' },
      { stage: 'envasado', stage_label: '6. Vacío y Etiquetado', started_at: '', operator: 'Equipo Envasado', status: 'pendiente' }
    ],
    used_lots: [],
    yield_pct: 0,
    waste_kg: 0,
    planned_date: '2026-11-25',
    responsible_user: 'Esteban Morales',
    chamber_location: 'Cámara 1 - Desposte',
    notes: 'Programada para iniciar desposte el miércoles temprano.'
  }
];

export const initialClientes: Cliente[] = [
  {
    id: 'cli-1',
    business_name: 'Fiambrería y Quesería La Tabla de Tandil S.A.',
    fantasy_name: 'La Tabla de Tandil',
    cuit: '30-71458921-2',
    iva_condition: 'Responsable Inscripto',
    address: 'Av. Maipú 2140',
    city: 'Vicente López',
    zone: 'Zona Norte',
    delivery_schedule: 'Martes y Viernes 09:00 a 13:00',
    price_list: 'mayorista',
    credit_limit: 1200000,
    balance: 485000,
    phone: '+54 11 4791-5522',
    whatsapp: '+54 9 11 4791-5522',
    email: 'compras@latabladetandil.com.ar',
    contact_person: 'Guillermo Fabbri',
    is_active: true,
    favorite_products: ['prod-1', 'prod-2', 'prod-4']
  },
  {
    id: 'cli-2',
    business_name: 'Distribuidora Gastronómica San Isidro S.R.L.',
    fantasy_name: 'San Isidro Gourmet',
    cuit: '30-68912445-9',
    iva_condition: 'Responsable Inscripto',
    address: 'Diego Carman 850',
    city: 'San Isidro',
    zone: 'Zona Norte',
    delivery_schedule: 'Lunes a Viernes 07:00 a 12:00',
    price_list: 'distribuidor',
    credit_limit: 3500000,
    balance: 1420000,
    phone: '+54 11 4743-1188',
    whatsapp: '+54 9 11 4743-1188',
    email: 'pagos@sanisidrogourmet.com.ar',
    contact_person: 'Verónica Castro',
    is_active: true,
    favorite_products: ['prod-1', 'prod-2', 'prod-3', 'prod-5']
  },
  {
    id: 'cli-3',
    business_name: 'Restaurante & Bodegón Don Carlos',
    fantasy_name: 'Bodegón Don Carlos',
    cuit: '20-24589120-4',
    iva_condition: 'Monotributo',
    address: 'Billinghurst 450',
    city: 'Almagro, CABA',
    zone: 'CABA Centro',
    delivery_schedule: 'Miércoles y Sábados 10:00 a 14:00',
    price_list: 'mayorista',
    credit_limit: 600000,
    balance: 195000,
    phone: '+54 11 4862-9011',
    whatsapp: '+54 9 11 4862-9011',
    email: 'bodegoncarlos@gmail.com',
    contact_person: 'Carlos Varela',
    is_active: true,
    favorite_products: ['prod-2', 'prod-4', 'prod-6']
  },
  {
    id: 'cli-4',
    business_name: 'Fiambrería El Picoteo de Ramos',
    fantasy_name: 'El Picoteo',
    cuit: '27-31458920-3',
    iva_condition: 'Monotributo',
    address: 'Av. de Mayo 620',
    city: 'Ramos Mejía',
    zone: 'Zona Oeste',
    delivery_schedule: 'Jueves 08:30 a 12:30',
    price_list: 'minorista',
    credit_limit: 400000,
    balance: 0,
    phone: '+54 11 4658-2234',
    whatsapp: '+54 9 11 4658-2234',
    email: 'elpicoteoramos@hotmail.com',
    contact_person: 'Lorena Sánchez',
    is_active: true,
    favorite_products: ['prod-1', 'prod-3']
  },
  {
    id: 'cli-5',
    business_name: 'Supermercados El Triunfo de Banfield S.A.',
    fantasy_name: 'Super El Triunfo',
    cuit: '30-70891234-5',
    iva_condition: 'Responsable Inscripto',
    address: 'Av. Alsina 1240',
    city: 'Banfield',
    zone: 'Zona Sur',
    delivery_schedule: 'Lunes y Jueves 08:00 a 11:00',
    price_list: 'distribuidor',
    credit_limit: 2000000,
    balance: 780000,
    phone: '+54 11 4242-7890',
    whatsapp: '+54 9 11 4242-7890',
    email: 'fiambreria@supereltriunfo.com.ar',
    contact_person: 'Nicolás Ferrero',
    is_active: true,
    favorite_products: ['prod-2', 'prod-5']
  }
];

export const initialPedidos: Pedido[] = [
  {
    id: 'ped-101',
    order_number: 'PED-1045',
    client_id: 'cli-1',
    client_name: 'La Tabla de Tandil',
    client_cuit: '30-71458921-2',
    client_zone: 'Zona Norte',
    client_address: 'Av. Maipú 2140, Vicente López',
    client_phone: '+54 9 11 4791-5522',
    client_price_list: 'mayorista',
    date: '2026-11-23',
    delivery_date: '2026-11-24',
    status: 'en_reparto',
    items: [
      { product_id: 'prod-1', product_name: 'Salame Picado Grueso Tipo Tandil', batch_number: 'LOT-SAL-2026-07', quantity: 15.0, unit: 'kg', unit_price: 9650, subtotal: 144750 },
      { product_id: 'prod-2', product_name: 'Jamón Cocido Artesanal Natural', batch_number: 'LOT-JAM-2026-14', quantity: 22.0, unit: 'kg', unit_price: 8030, subtotal: 176660 },
      { product_id: 'prod-4', product_name: 'Bondiola Curada al Vacío', batch_number: 'LOT-BON-2026-05', quantity: 9.0, unit: 'kg', unit_price: 13770, subtotal: 123930 }
    ],
    subtotal: 445340,
    discount_pct: 0,
    tax_amount: 93521.4,
    total: 538861.4,
    payment_method: 'cuenta_corriente',
    payment_status: 'pendiente',
    paid_amount: 0,
    delivery_person_id: 'usr-4',
    delivery_person_name: 'Rodrigo Benítez',
    route_stop_order: 1,
    remito_number: 'R-0001-00004128',
    notes: 'Entregar antes de las 11:00 hs. Fiambrera de guardia recibe con sello.'
  },
  {
    id: 'ped-102',
    order_number: 'PED-1046',
    client_id: 'cli-2',
    client_name: 'San Isidro Gourmet',
    client_cuit: '30-68912445-9',
    client_zone: 'Zona Norte',
    client_address: 'Diego Carman 850, San Isidro',
    client_phone: '+54 9 11 4743-1188',
    client_price_list: 'distribuidor',
    date: '2026-11-23',
    delivery_date: '2026-11-24',
    status: 'en_reparto',
    items: [
      { product_id: 'prod-1', product_name: 'Salame Picado Grueso Tipo Tandil', batch_number: 'LOT-SAL-2026-07', quantity: 30.0, unit: 'kg', unit_price: 8720, subtotal: 261600 },
      { product_id: 'prod-2', product_name: 'Jamón Cocido Artesanal Natural', batch_number: 'LOT-JAM-2026-14', quantity: 55.0, unit: 'kg', unit_price: 7260, subtotal: 399300 },
      { product_id: 'prod-5', product_name: 'Paleta Cocida Fiambrera Primera', quantity: 45.0, unit: 'kg', unit_price: 4890, subtotal: 220050 }
    ],
    subtotal: 880950,
    discount_pct: 3,
    tax_amount: 179450,
    total: 1033971.5,
    payment_method: 'cheque',
    payment_status: 'pendiente',
    paid_amount: 0,
    delivery_person_id: 'usr-4',
    delivery_person_name: 'Rodrigo Benítez',
    route_stop_order: 2,
    remito_number: 'R-0001-00004129',
    notes: 'Retirar eCheq firmado contra entrega.'
  },
  {
    id: 'ped-103',
    order_number: 'PED-1047',
    client_id: 'cli-3',
    client_name: 'Bodegón Don Carlos',
    client_cuit: '20-24589120-4',
    client_zone: 'CABA Centro',
    client_address: 'Billinghurst 450, Almagro',
    client_phone: '+54 9 11 4862-9011',
    client_price_list: 'mayorista',
    date: '2026-11-23',
    delivery_date: '2026-11-24',
    status: 'listo',
    items: [
      { product_id: 'prod-2', product_name: 'Jamón Cocido Artesanal Natural', batch_number: 'LOT-JAM-2026-14', quantity: 16.5, unit: 'kg', unit_price: 8030, subtotal: 132495 },
      { product_id: 'prod-6', product_name: 'Queso de Cerdo Artesanal', quantity: 7.5, unit: 'kg', unit_price: 4800, subtotal: 36000 }
    ],
    subtotal: 168495,
    discount_pct: 0,
    tax_amount: 35383.95,
    total: 203878.95,
    payment_method: 'transferencia',
    payment_status: 'pagado',
    paid_amount: 203878.95,
    remito_number: 'R-0001-00004130',
    notes: 'Pagó por adelantado con comprobante de transferencia bancaria.'
  },
  {
    id: 'ped-104',
    order_number: 'PED-1048',
    client_id: 'cli-4',
    client_name: 'El Picoteo',
    client_cuit: '27-31458920-3',
    client_zone: 'Zona Oeste',
    client_address: 'Av. de Mayo 620, Ramos Mejía',
    client_phone: '+54 9 11 4658-2234',
    client_price_list: 'minorista',
    date: '2026-11-23',
    delivery_date: '2026-11-25',
    status: 'pendiente',
    items: [
      { product_id: 'prod-1', product_name: 'Salame Picado Grueso Tipo Tandil', quantity: 8.0, unit: 'kg', unit_price: 11800, subtotal: 94400 },
      { product_id: 'prod-3', product_name: 'Mortadela con Pistachos', quantity: 6.0, unit: 'kg', unit_price: 11300, subtotal: 67800 }
    ],
    subtotal: 162200,
    discount_pct: 0,
    tax_amount: 34062,
    total: 196262,
    payment_method: 'efectivo',
    payment_status: 'pendiente',
    paid_amount: 0,
    notes: 'Pedido entrante vía WhatsApp para el reparto del jueves.'
  }
];

export const initialRepartos: RepartoRuta[] = [
  {
    id: 'rep-01',
    date: '2026-11-24',
    zone: 'Zona Norte - Circuito Gourmet',
    driver_id: 'usr-4',
    driver_name: 'Rodrigo Benítez',
    vehicle_plate: 'AF 482 CD (Mercedes-Benz Sprinter Frigorífico)',
    status: 'en_curso',
    stops: [
      {
        order_id: 'ped-101',
        order_number: 'PED-1045',
        client_id: 'cli-1',
        client_name: 'La Tabla de Tandil',
        address: 'Av. Maipú 2140, Vicente López',
        phone: '+54 9 11 4791-5522',
        total_amount: 538861.4,
        status: 'pendiente',
        payment_method: 'cuenta_corriente',
        notes: 'Parada 1: Recibe Guillermo. Dejar remito firmado.'
      },
      {
        order_id: 'ped-102',
        order_number: 'PED-1046',
        client_id: 'cli-2',
        client_name: 'San Isidro Gourmet',
        address: 'Diego Carman 850, San Isidro',
        phone: '+54 9 11 4743-1188',
        total_amount: 1033971.5,
        status: 'pendiente',
        payment_method: 'cheque',
        notes: 'Parada 2: Cobranza obligatoria de cheque en mano.'
      }
    ],
    expenses: [
      { id: 'exp-1', type: 'combustible', amount: 38000, notes: 'Carga de Gasoil Infinia YPF Panamericana Km 22' },
      { id: 'exp-2', type: 'peaje', amount: 3200, notes: 'TelePASE Acceso Norte' }
    ]
  }
];

export const initialCobranzas: Cobranza[] = [
  {
    id: 'cob-1',
    receipt_number: 'REC-0001-00001890',
    client_id: 'cli-3',
    client_name: 'Bodegón Don Carlos',
    date: '2026-11-23',
    amount: 203878.95,
    payment_method: 'transferencia',
    reference_number: 'TRANSF-BBVA-481923',
    notes: 'Cancelación total pedido PED-1047',
    applied_to_orders: ['ped-103']
  },
  {
    id: 'cob-2',
    receipt_number: 'REC-0001-00001889',
    client_id: 'cli-1',
    client_name: 'La Tabla de Tandil',
    date: '2026-11-19',
    amount: 350000,
    payment_method: 'cheque',
    reference_number: 'CHQ-GALICIA-849120',
    notes: 'Pago a cuenta de saldo acumulado anterior.'
  }
];

export const initialCheques: Cheque[] = [
  {
    id: 'chq-1',
    check_number: 'CHQ-84912011',
    bank: 'Banco Galicia',
    drawer_cuit: '30-71458921-2',
    drawer_name: 'La Tabla de Tandil S.A.',
    client_id: 'cli-1',
    client_name: 'La Tabla de Tandil',
    amount: 350000,
    issue_date: '2026-11-19',
    due_date: '2026-12-15',
    type: 'echeq',
    status: 'en_cartera'
  },
  {
    id: 'chq-2',
    check_number: 'CHQ-99120455',
    bank: 'Banco Santander Río',
    drawer_cuit: '30-68912445-9',
    drawer_name: 'San Isidro Gourmet S.R.L.',
    client_id: 'cli-2',
    client_name: 'San Isidro Gourmet',
    amount: 680000,
    issue_date: '2026-11-10',
    due_date: '2026-11-30', // Próximo a depositar
    type: 'echeq',
    status: 'en_cartera'
  },
  {
    id: 'chq-3',
    check_number: 'CHQ-12093844',
    bank: 'Banco Macro',
    drawer_cuit: '30-70891234-5',
    drawer_name: 'Supermercados El Triunfo S.A.',
    client_id: 'cli-5',
    client_name: 'Super El Triunfo',
    amount: 520000,
    issue_date: '2026-10-25',
    due_date: '2026-11-20',
    type: 'fisico',
    status: 'depositado'
  }
];

export const initialTemperaturas: ControlTemperatura[] = [
  {
    id: 'temp-1',
    chamber_id: 'cam-1',
    chamber_name: 'Cámara 1 - Desposte y Carnes Frescas',
    date_time: '2026-11-23 08:00',
    temperature_c: 1.8,
    humidity_pct: 82,
    target_temp_min: 0,
    target_temp_max: 3,
    is_alert: false,
    operator: 'Esteban Morales',
    notes: 'Temperatura óptima de desposte.'
  },
  {
    id: 'temp-2',
    chamber_id: 'cam-2',
    chamber_name: 'Secadero Tandil (Salames & Bondiolas)',
    date_time: '2026-11-23 08:30',
    temperature_c: 14.2,
    humidity_pct: 76,
    target_temp_min: 12,
    target_temp_max: 15,
    is_alert: false,
    operator: 'Esteban Morales',
    notes: 'Buena circulación de aire y flor blanca uniforme.'
  },
  {
    id: 'temp-3',
    chamber_id: 'cam-3',
    chamber_name: 'Cámara 3 - Despacho y Producto Terminado',
    date_time: '2026-11-23 09:00',
    temperature_c: 3.4,
    humidity_pct: 70,
    target_temp_min: 1,
    target_temp_max: 4,
    is_alert: false,
    operator: 'Esteban Morales',
    notes: 'Carga completa de jamones y mortadelas.'
  },
  {
    id: 'temp-4',
    chamber_id: 'horno-1',
    chamber_name: 'Horno de Vapor - Cocción Jamones',
    date_time: '2026-11-22 16:00',
    temperature_c: 78.5,
    humidity_pct: 95,
    target_temp_min: 75,
    target_temp_max: 82,
    is_alert: false,
    operator: 'Esteban Morales',
    notes: 'Ciclo de pasteurización de jamón cocido lote 14.'
  }
];

export const initialChecklists: ChecklistCalidad[] = [
  {
    id: 'chk-1',
    date: '2026-11-23',
    shift: 'mañana',
    area: 'elaboracion',
    items: [
      { id: 'item-1', task: 'Sanitización de mesas de acero y cutter con amonio cuaternario', passed: true, notes: 'Correcto' },
      { id: 'item-2', task: 'Control de indumentaria limpia, cofia y botas sanitarias de operarios', passed: true },
      { id: 'item-3', task: 'Calibración y tara de balanzas digitales de formulación', passed: true },
      { id: 'item-4', task: 'Control de cloro activo en agua de red industrial (0.5 a 1.5 ppm)', passed: true, notes: 'Medición: 0.9 ppm' }
    ],
    operator: 'Esteban Morales',
    verified_by: 'Martín Bossi (Admin)'
  }
];

export const initialDocumentosLegales: DocumentoLegal[] = [
  {
    id: 'doc-1',
    title: 'Habilitación Sanitaria Oficial SENASA',
    entity: 'SENASA',
    cert_number: 'HAB-SENASA-4512/2022',
    issue_date: '2022-04-10',
    expiration_date: '2027-04-10',
    days_to_expire: 502,
    status: 'vigente',
    file_name: 'habilitacion_senasa_4512.pdf',
    notes: 'Establecimiento elaborador de chacinados clase B.'
  },
  {
    id: 'doc-2',
    title: 'Certificado de Desinfección y Control de Plagas (MIP)',
    entity: 'Fumigación / MIP',
    cert_number: 'MIP-2026-1108',
    issue_date: '2026-11-05',
    expiration_date: '2026-12-05', // Vence pronto
    days_to_expire: 12,
    status: 'por_vencer',
    file_name: 'fumigacion_noviembre_2026.pdf',
    notes: 'Visita mensual programada con BioControl S.A.'
  },
  {
    id: 'doc-3',
    title: 'Análisis Microbiológico de Agua y Superficies (Bromatología)',
    entity: 'Bromatología Municipal',
    cert_number: 'LAB-BROM-894',
    issue_date: '2026-10-15',
    expiration_date: '2027-04-15',
    days_to_expire: 143,
    status: 'vigente',
    file_name: 'analisis_agua_octubre.pdf',
    notes: 'Ausencia de Salmonella, Listeria y coliformes totales.'
  }
];

export const initialMovimientosCaja: MovimientoCaja[] = [
  {
    id: 'caj-1',
    date_time: '2026-11-23 08:00',
    type: 'ingreso',
    category: 'cobranza_cliente',
    amount: 150000,
    payment_method: 'efectivo',
    description: 'Apertura de caja diaria y cobranza de mostrador',
    responsible: 'Clara Domínguez'
  },
  {
    id: 'caj-2',
    date_time: '2026-11-23 11:30',
    type: 'egreso',
    category: 'gasto_combustible',
    amount: 38000,
    payment_method: 'efectivo',
    description: 'Adelanto de combustible Sprinter reparto Zona Norte',
    responsible: 'Rodrigo Benítez'
  },
  {
    id: 'caj-3',
    date_time: '2026-11-23 14:00',
    type: 'ingreso',
    category: 'venta_mostrador',
    amount: 74500,
    payment_method: 'efectivo',
    description: 'Venta al paso fábrica (picadas y salames)',
    responsible: 'Valeria Rinaldi'
  }
];

export const initialAuditoria: AuditoriaLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-11-23 09:14',
    user_name: 'Valeria Rinaldi',
    user_role: 'ventas',
    action: 'Creación de pedido',
    module: 'Ventas',
    details: 'Generado PED-1045 para La Tabla de Tandil por $538.861,40'
  },
  {
    id: 'aud-2',
    timestamp: '2026-11-23 07:05',
    user_name: 'Esteban Morales',
    user_role: 'produccion',
    action: 'Inicio orden de producción',
    module: 'Producción',
    details: 'Iniciada OP-2026-042 (Salame Tandil lote LOT-SAL-2026-09)'
  },
  {
    id: 'aud-3',
    timestamp: '2026-11-23 08:35',
    user_name: 'Esteban Morales',
    user_role: 'produccion',
    action: 'Registro de temperatura',
    module: 'Calidad',
    details: 'Control en Secadero Tandil: 14.2°C y 76% HR'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'stock_bajo',
    title: 'Insumo Crítico: Polifosfatos para Jamonería',
    description: 'Stock actual: 8 kg. Por debajo del mínimo de 25 kg. Reponer urgente con Especias del Sur.',
    date: 'Hoy, 09:15',
    is_read: false,
    link_module: 'insumos'
  },
  {
    id: 'notif-2',
    type: 'vencimiento',
    title: 'Certificado MIP Fumigación por vencer',
    description: 'Vence en 12 días (05/12/2026). Requiere coordinar inspección mensual.',
    date: 'Hoy, 08:00',
    is_read: false,
    link_module: 'trazabilidad'
  },
  {
    id: 'notif-3',
    type: 'pedido_nuevo',
    title: 'Nuevo pedido en cola: El Picoteo',
    description: 'Pedido PED-1048 registrado por $196.262 para entrega el jueves.',
    date: 'Hoy, 10:40',
    is_read: false,
    link_module: 'pedidos'
  },
  {
    id: 'notif-4',
    type: 'pago_atrasado',
    title: 'Saldo en cuenta corriente: San Isidro Gourmet',
    description: 'Deuda acumulada de $1.420.000 (cercano al límite de crédito de $3.500.000).',
    date: 'Ayer, 18:20',
    is_read: false,
    link_module: 'cobranzas'
  }
];
