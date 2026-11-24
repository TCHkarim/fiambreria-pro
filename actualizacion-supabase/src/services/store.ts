import {
  User,
  UserRole,
  Insumo,
  MovimientoInsumo,
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
  IncidenciaCalidad,
  ConfiguracionEmpresa,
  AppNotification,
  AuditoriaLog,
  EtapaProduccionNombre
} from '../types';

import {
  initialUsers,
  initialEmpresa,
  initialProveedores,
  initialInsumos,
  initialRecetas,
  initialProductosTerminados,
  initialLotes,
  initialOrdenesProduccion,
  initialClientes,
  initialPedidos,
  initialRepartos,
  initialCobranzas,
  initialCheques,
  initialTemperaturas,
  initialChecklists,
  initialDocumentosLegales,
  initialMovimientosCaja,
  initialAuditoria,
  initialNotifications
} from './initialData';

export const STORAGE_KEY = 'la_artesana_fiambreria_data_v1';

export interface AppState {
  currentUser: User;
  users: User[];
  empresa: ConfiguracionEmpresa;
  proveedores: Proveedor[];
  insumos: Insumo[];
  movimientosInsumo: MovimientoInsumo[];
  recetas: Receta[];
  ordenesProduccion: OrdenProduccion[];
  productosTerminados: ProductoTerminado[];
  lotes: LoteProducto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  repartos: RepartoRuta[];
  cobranzas: Cobranza[];
  cheques: Cheque[];
  facturas: ComprobanteFactura[];
  movimientosCaja: MovimientoCaja[];
  temperaturas: ControlTemperatura[];
  checklists: ChecklistCalidad[];
  documentosLegales: DocumentoLegal[];
  incidencias: IncidenciaCalidad[];
  notificaciones: AppNotification[];
  auditoria: AuditoriaLog[];
}

const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  return {
    currentUser: initialUsers[0],
    users: initialUsers,
    empresa: initialEmpresa,
    proveedores: initialProveedores,
    insumos: initialInsumos,
    movimientosInsumo: [],
    recetas: initialRecetas,
    ordenesProduccion: initialOrdenesProduccion,
    productosTerminados: initialProductosTerminados,
    lotes: initialLotes,
    clientes: initialClientes,
    pedidos: initialPedidos,
    repartos: initialRepartos,
    cobranzas: initialCobranzas,
    cheques: initialCheques,
    facturas: [],
    movimientosCaja: initialMovimientosCaja,
    temperaturas: initialTemperaturas,
    checklists: initialChecklists,
    documentosLegales: initialDocumentosLegales,
    incidencias: [],
    notificaciones: initialNotifications,
    auditoria: initialAuditoria
  };
};

let state: AppState = loadState();
type Listener = (state: AppState) => void;
const listeners = new Set<Listener>();

// Gancho opcional: lo usa la sincronización con Supabase (sync.ts)
let persistHook: (() => void) | null = null;

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error persisting state to localStorage:', e);
  }
  listeners.forEach(fn => fn(state));
  if (persistHook) persistHook();
};

export const store = {
  getState: (): AppState => state,

  // Conexión con Supabase: avisa cada vez que cambian los datos locales
  setPersistHook: (fn: (() => void) | null) => {
    persistHook = fn;
  },

  // Conexión con Supabase: reemplaza colecciones con los datos remotos (no dispara sincronización)
  replaceCollections: (partial: Partial<AppState>) => {
    state = { ...state, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error persisting state to localStorage:', e);
    }
    listeners.forEach(fn => fn(state));
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Auditoría
  logAudit: (action: string, module: string, details: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const newLog: AuditoriaLog = {
      id: 'aud-' + Date.now(),
      timestamp,
      user_name: state.currentUser.name,
      user_role: state.currentUser.role,
      action,
      module,
      details
    };
    state.auditoria = [newLog, ...state.auditoria];
    persist();
  },

  // Usuarios y Rol
  setCurrentUserRole: (role: UserRole) => {
    const foundUser = state.users.find(u => u.role === role) || {
      id: 'usr-' + role,
      name: `Usuario ${role.toUpperCase()}`,
      email: `${role}@donbautista.com.ar`,
      role
    };
    state.currentUser = foundUser;
    store.logAudit(`Cambio de rol activo a ${role}`, 'Seguridad', `Rol cambiado por el usuario`);
    persist();
  },

  // Notificaciones
  markNotificationAsRead: (id: string) => {
    state.notificaciones = state.notificaciones.map(n => n.id === id ? { ...n, is_read: true } : n);
    persist();
  },

  markAllNotificationsAsRead: () => {
    state.notificaciones = state.notificaciones.map(n => ({ ...n, is_read: true }));
    persist();
  },

  addNotification: (type: AppNotification['type'], title: string, description: string, link_module?: string) => {
    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      type,
      title,
      description,
      date: 'Ahora',
      is_read: false,
      link_module
    };
    state.notificaciones = [notif, ...state.notificaciones];
    persist();
  },

  // Insumos
  addInsumo: (insumo: Omit<Insumo, 'id'>) => {
    const newInsumo: Insumo = {
      ...insumo,
      id: 'ins-' + Date.now()
    };
    state.insumos = [newInsumo, ...state.insumos];
    store.logAudit('Alta de Insumo', 'Insumos', `Se dio de alta el insumo ${newInsumo.name} (${newInsumo.code})`);
    persist();
    return newInsumo;
  },

  updateInsumo: (id: string, data: Partial<Insumo>) => {
    state.insumos = state.insumos.map(ins => ins.id === id ? { ...ins, ...data } : ins);
    store.logAudit('Modificación de Insumo', 'Insumos', `Actualizado insumo ID: ${id}`);
    persist();
  },

  adjustInsumoStock: (insumoId: string, quantity: number, type: 'ingreso' | 'egreso' | 'ajuste', reason: string, supplierLot?: string) => {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (!insumo) return;

    let newStock = insumo.current_stock;
    if (type === 'ingreso') newStock += quantity;
    else if (type === 'egreso') newStock = Math.max(0, newStock - quantity);
    else if (type === 'ajuste') newStock = quantity;

    insumo.current_stock = newStock;
    if (supplierLot) insumo.supplier_lot = supplierLot;

    const mov: MovimientoInsumo = {
      id: 'mov-' + Date.now(),
      insumo_id: insumoId,
      insumo_name: insumo.name,
      type,
      quantity,
      date: new Date().toISOString().slice(0, 10),
      reason,
      user_name: state.currentUser.name
    };
    state.movimientosInsumo = [mov, ...state.movimientosInsumo];

    if (newStock <= insumo.min_stock) {
      store.addNotification('stock_bajo', `Stock Crítico: ${insumo.name}`, `Quedan ${newStock} ${insumo.unit}. Mínimo: ${insumo.min_stock} ${insumo.unit}.`, 'insumos');
    }

    store.logAudit(`Ajuste de Stock (${type})`, 'Insumos', `${insumo.name}: ${quantity} ${insumo.unit}. Motivo: ${reason}`);
    persist();
  },

  deleteInsumo: (id: string) => {
    state.insumos = state.insumos.filter(i => i.id !== id);
    store.logAudit('Baja de Insumo', 'Insumos', `Eliminado insumo ID: ${id}`);
    persist();
  },

  // Proveedores
  addProveedor: (prov: Omit<Proveedor, 'id'>) => {
    const newProv: Proveedor = {
      ...prov,
      id: 'prov-' + Date.now()
    };
    state.proveedores = [newProv, ...state.proveedores];
    store.logAudit('Alta Proveedor', 'Proveedores', `Registrado proveedor ${newProv.business_name}`);
    persist();
    return newProv;
  },

  updateProveedor: (id: string, data: Partial<Proveedor>) => {
    state.proveedores = state.proveedores.map(p => p.id === id ? { ...p, ...data } : p);
    store.logAudit('Modificación Proveedor', 'Proveedores', `Actualizado proveedor ID: ${id}`);
    persist();
  },

  // Recetas
  addReceta: (receta: Omit<Receta, 'id'>) => {
    const newReceta: Receta = {
      ...receta,
      id: 'rec-' + Date.now()
    };
    state.recetas = [newReceta, ...state.recetas];
    store.logAudit('Creación de Receta', 'Recetas', `Creada receta ${newReceta.product_name} (${newReceta.code})`);
    persist();
    return newReceta;
  },

  updateReceta: (id: string, data: Partial<Receta>) => {
    state.recetas = state.recetas.map(r => r.id === id ? { ...r, ...data } : r);
    store.logAudit('Modificación de Receta', 'Recetas', `Actualizada receta ID: ${id}`);
    persist();
  },

  // Producción y Lotes
  addOrdenProduccion: (opData: {
    recipe_id: string;
    target_quantity_kg: number;
    planned_date: string;
    responsible_user: string;
    chamber_location: string;
    notes?: string;
  }) => {
    const receta = state.recetas.find(r => r.id === opData.recipe_id);
    if (!receta) throw new Error('Receta no encontrada');

    const opNum = state.ordenesProduccion.length + 44;
    const code = `OP-2026-0${opNum}`;
    const batchPrefix = receta.code.replace('REC-', 'LOT-');
    const batch_number = `${batchPrefix}-2026-${String(opNum).padStart(2, '0')}`;

    const newOp: OrdenProduccion = {
      id: 'op-' + Date.now(),
      code,
      recipe_id: receta.id,
      product_name: receta.product_name,
      batch_number,
      target_quantity_kg: opData.target_quantity_kg,
      actual_quantity_kg: 0,
      pieces_count: 0,
      status: 'planificada',
      current_stage: 'picado',
      stages_log: [
        { stage: 'picado', stage_label: '1. Picado / Molienda', started_at: '', operator: opData.responsible_user, status: 'pendiente' },
        { stage: 'mezclado', stage_label: '2. Mezclado / Emulsión', started_at: '', operator: opData.responsible_user, status: 'pendiente' },
        { stage: 'embutido', stage_label: '3. Embutido / Atado', started_at: '', operator: opData.responsible_user, status: 'pendiente' },
        { stage: 'coccion_estacionamiento', stage_label: '4. Cocción / Estacionamiento', started_at: '', operator: opData.responsible_user, status: 'pendiente' },
        { stage: 'enfriado', stage_label: '5. Enfriado', started_at: '', operator: opData.responsible_user, status: 'pendiente' },
        { stage: 'envasado', stage_label: '6. Envasado al Vacío', started_at: '', operator: opData.responsible_user, status: 'pendiente' }
      ],
      used_lots: receta.ingredients.map(ing => {
        const ins = state.insumos.find(i => i.id === ing.insumo_id);
        const factor = opData.target_quantity_kg / (receta.batch_size_kg || 100);
        return {
          insumo_id: ing.insumo_id,
          insumo_name: ing.insumo_name,
          supplier_lot: ins?.supplier_lot || 'LOT-GENERAL',
          quantity_used: Number((ing.quantity * factor).toFixed(2)),
          unit: ing.unit
        };
      }),
      yield_pct: 0,
      waste_kg: 0,
      planned_date: opData.planned_date,
      responsible_user: opData.responsible_user,
      chamber_location: opData.chamber_location,
      notes: opData.notes
    };

    state.ordenesProduccion = [newOp, ...state.ordenesProduccion];
    store.logAudit('Nueva Orden de Producción', 'Producción', `Planificada orden ${code} para ${receta.product_name} (${opData.target_quantity_kg} kg)`);
    persist();
    return newOp;
  },

  advanceProductionStage: (opId: string, stage: EtapaProduccionNombre, notes?: string, temperature?: number) => {
    const op = state.ordenesProduccion.find(o => o.id === opId);
    if (!op) return;

    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    if (op.status === 'planificada') {
      op.status = 'en_proceso';
      op.start_date = timeStr;
      // Deducción automática de insumos
      op.used_lots.forEach(lot => {
        const ins = state.insumos.find(i => i.id === lot.insumo_id);
        if (ins) {
          ins.current_stock = Math.max(0, ins.current_stock - lot.quantity_used);
        }
      });
    }

    op.stages_log = op.stages_log.map(s => {
      if (s.stage === stage) {
        return {
          ...s,
          status: 'completada' as const,
          completed_at: timeStr,
          temperature_c: temperature,
          notes: notes || s.notes
        };
      }
      return s;
    });

    const stagesOrder: EtapaProduccionNombre[] = ['picado', 'mezclado', 'embutido', 'coccion_estacionamiento', 'enfriado', 'envasado'];
    const currentIndex = stagesOrder.indexOf(stage);
    if (currentIndex < stagesOrder.length - 1) {
      const nextStage = stagesOrder[currentIndex + 1];
      op.current_stage = nextStage;
      op.stages_log = op.stages_log.map(s => s.stage === nextStage ? { ...s, status: 'en_curso' as const, started_at: timeStr } : s);
    }

    store.logAudit('Avance de Etapa', 'Producción', `${op.code}: completada etapa ${stage}`);
    persist();
  },

  completeProduction: (opId: string, actualKg: number, pieces: number, wasteKg: number) => {
    const op = state.ordenesProduccion.find(o => o.id === opId);
    if (!op) return;

    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    op.status = 'completada';
    op.current_stage = 'finalizado';
    op.actual_quantity_kg = actualKg;
    op.pieces_count = pieces;
    op.waste_kg = wasteKg;
    op.yield_pct = Number(((actualKg / op.target_quantity_kg) * 100).toFixed(1));
    op.end_date = timeStr;

    // Calcular fecha de vencimiento según tipo (cocidos ~60-90 días, curados ~180 días)
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);
    const expiration_date = expDate.toISOString().slice(0, 10);

    // Buscar o vincular producto terminado
    let prod = state.productosTerminados.find(p => p.recipe_id === op.recipe_id);
    if (!prod) {
      prod = state.productosTerminados[0];
    }

    // Agregar lote a stock
    const newLote: LoteProducto = {
      id: 'lot-' + Date.now(),
      product_id: prod.id,
      product_name: prod.name,
      batch_number: op.batch_number,
      initial_kg: actualKg,
      current_kg: actualKg,
      pieces_count: pieces,
      production_date: now.toISOString().slice(0, 10),
      expiration_date,
      chamber_location: op.chamber_location || 'Cámara 3 - Despacho',
      status: 'disponible',
      op_id: op.id
    };

    state.lotes = [newLote, ...state.lotes];
    prod.stock_total_kg += actualKg;
    prod.stock_piezas += pieces;

    store.logAudit('Finalización de Lote', 'Producción', `Finalizado ${op.code} (${op.batch_number}): ${actualKg} kg netos generados`);
    persist();
  },

  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = {
      ...cliente,
      id: 'cli-' + Date.now()
    };
    state.clientes = [newCliente, ...state.clientes];
    store.logAudit('Alta de Cliente', 'Clientes', `Registrado cliente ${newCliente.business_name} (${newCliente.zone})`);
    persist();
    return newCliente;
  },

  updateCliente: (id: string, data: Partial<Cliente>) => {
    state.clientes = state.clientes.map(c => c.id === id ? { ...c, ...data } : c);
    store.logAudit('Modificación de Cliente', 'Clientes', `Actualizado cliente ID: ${id}`);
    persist();
  },

  // Pedidos
  addPedido: (pedidoData: Omit<Pedido, 'id' | 'order_number'>) => {
    const pedNum = state.pedidos.length + 1049;
    const order_number = `PED-${pedNum}`;
    const remito_number = `R-0001-0000${pedNum}`;

    const newPedido: Pedido = {
      ...pedidoData,
      id: 'ped-' + Date.now(),
      order_number,
      remito_number
    };

    state.pedidos = [newPedido, ...state.pedidos];

    // Si es cuenta corriente, impactar en saldo del cliente
    if (newPedido.payment_method === 'cuenta_corriente') {
      const cli = state.clientes.find(c => c.id === newPedido.client_id);
      if (cli) {
        cli.balance += newPedido.total;
      }
    }

    // Deducción de stock en lotes correspondientes
    newPedido.items.forEach(item => {
      const prod = state.productosTerminados.find(p => p.id === item.product_id);
      if (prod) {
        prod.stock_total_kg = Math.max(0, prod.stock_total_kg - item.quantity);
      }
    });

    store.addNotification('pedido_nuevo', `Nuevo Pedido ${order_number}`, `${newPedido.client_name}: ${newPedido.items.length} productos por un total de $${newPedido.total.toLocaleString('es-AR')}`, 'pedidos');
    store.logAudit('Creación de Pedido', 'Ventas', `Generado pedido ${order_number} por $${newPedido.total}`);
    persist();
    return newPedido;
  },

  updatePedidoStatus: (orderId: string, status: Pedido['status']) => {
    state.pedidos = state.pedidos.map(p => p.id === orderId ? { ...p, status } : p);
    store.logAudit('Cambio Estado Pedido', 'Ventas', `Pedido ${orderId} actualizado a ${status}`);
    persist();
  },

  repeatOrder: (orderId: string) => {
    const original = state.pedidos.find(p => p.id === orderId);
    if (!original) return;

    const today = new Date().toISOString().slice(0, 10);
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 2);

    return store.addPedido({
      ...original,
      date: today,
      delivery_date: delivery.toISOString().slice(0, 10),
      status: 'pendiente',
      payment_status: 'pendiente',
      paid_amount: 0
    });
  },

  // Reparto y Entregas
  addRepartoRuta: (ruta: Omit<RepartoRuta, 'id'>) => {
    const newRuta: RepartoRuta = {
      ...ruta,
      id: 'rep-' + Date.now()
    };
    state.repartos = [newRuta, ...state.repartos];
    store.logAudit('Creación de Hoja de Ruta', 'Reparto', `Ruta para ${newRuta.driver_name} en ${newRuta.zone}`);
    persist();
    return newRuta;
  },

  markDeliveryDone: (
    routeId: string,
    orderId: string,
    signature?: string,
    collectedAmount = 0,
    paymentMethod: 'efectivo' | 'transferencia' | 'cheque' | 'cuenta_corriente' = 'cuenta_corriente',
    photoUrl?: string,
    notes?: string
  ) => {
    const route = state.repartos.find(r => r.id === routeId);
    if (route) {
      route.stops = route.stops.map(s => {
        if (s.order_id === orderId) {
          return {
            ...s,
            status: 'entregado',
            delivered_at: new Date().toTimeString().slice(0, 5),
            collected_amount: collectedAmount,
            payment_method: paymentMethod,
            proof_signature: signature,
            proof_photo_url: photoUrl,
            notes: notes || s.notes
          };
        }
        return s;
      });
    }

    const ped = state.pedidos.find(p => p.id === orderId);
    if (ped) {
      ped.status = 'entregado';
      if (collectedAmount > 0) {
        ped.paid_amount = collectedAmount;
        ped.payment_status = collectedAmount >= ped.total ? 'pagado' : 'parcial';

        // Registrar cobranza oficial
        store.addCobranza({
          client_id: ped.client_id,
          client_name: ped.client_name,
          date: new Date().toISOString().slice(0, 10),
          amount: collectedAmount,
          payment_method: paymentMethod === 'cuenta_corriente' ? 'efectivo' : paymentMethod,
          reference_number: `Entrega reparto ${ped.order_number}`,
          notes: `Cobrado por chofer en domicilio de entrega.`,
          applied_to_orders: [ped.id]
        });
      }
    }

    store.logAudit('Entrega en Domicilio', 'Reparto', `Entregado pedido ${orderId}. Cobrado: $${collectedAmount}`);
    persist();
  },

  addRepartoExpense: (routeId: string, expense: { type: 'combustible' | 'peaje' | 'estacionamiento' | 'otro'; amount: number; notes?: string }) => {
    const route = state.repartos.find(r => r.id === routeId);
    if (!route) return;

    route.expenses.push({
      ...expense,
      id: 'exp-' + Date.now()
    });

    // Registrar también en caja diaria
    state.movimientosCaja = [
      {
        id: 'caj-' + Date.now(),
        date_time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
        type: 'egreso',
        category: expense.type === 'combustible' ? 'gasto_combustible' : 'otro',
        amount: expense.amount,
        payment_method: 'efectivo',
        description: `Gasto de reparto ${route.vehicle_plate}: ${expense.notes || expense.type}`,
        responsible: route.driver_name
      },
      ...state.movimientosCaja
    ];

    store.logAudit('Gasto de Reparto', 'Reparto', `${expense.type}: $${expense.amount} (${route.driver_name})`);
    persist();
  },

  // Cobranzas
  addCobranza: (cobranzaData: Omit<Cobranza, 'id' | 'receipt_number'>) => {
    const recNum = state.cobranzas.length + 1891;
    const receipt_number = `REC-0001-0000${recNum}`;

    const newCobranza: Cobranza = {
      ...cobranzaData,
      id: 'cob-' + Date.now(),
      receipt_number
    };

    state.cobranzas = [newCobranza, ...state.cobranzas];

    // Disminuir saldo adeudado del cliente
    const cli = state.clientes.find(c => c.id === newCobranza.client_id);
    if (cli) {
      cli.balance = Math.max(0, cli.balance - newCobranza.amount);
    }

    // Registrar ingreso a caja
    state.movimientosCaja = [
      {
        id: 'caj-' + Date.now(),
        date_time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
        type: 'ingreso',
        category: 'cobranza_cliente',
        amount: newCobranza.amount,
        payment_method: newCobranza.payment_method === 'mercado_pago' ? 'transferencia' : (newCobranza.payment_method as any),
        description: `Cobranza ${receipt_number} - ${newCobranza.client_name}`,
        responsible: state.currentUser.name
      },
      ...state.movimientosCaja
    ];

    store.logAudit('Registro de Cobranza', 'Cobranzas', `${receipt_number}: Cobrado $${newCobranza.amount} a ${newCobranza.client_name}`);
    persist();
    return newCobranza;
  },

  // Cheques
  addCheque: (chequeData: Omit<Cheque, 'id'>) => {
    const newCheque: Cheque = {
      ...chequeData,
      id: 'chq-' + Date.now()
    };
    state.cheques = [newCheque, ...state.cheques];
    store.logAudit('Ingreso de Cheque', 'Finanzas', `Cheque ${newCheque.check_number} de ${newCheque.bank} por $${newCheque.amount}`);
    persist();
    return newCheque;
  },

  updateChequeStatus: (id: string, status: Cheque['status'], endorsedTo?: string) => {
    state.cheques = state.cheques.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          endorsed_to_supplier: endorsedTo || c.endorsed_to_supplier
        };
      }
      return c;
    });
    store.logAudit('Actualización Cheque', 'Finanzas', `Cheque ID ${id} cambiado a estado ${status}`);
    persist();
  },

  // Caja Diaria
  addMovimientoCaja: (mov: Omit<MovimientoCaja, 'id' | 'date_time'>) => {
    const now = new Date();
    const newMov: MovimientoCaja = {
      ...mov,
      id: 'caj-' + Date.now(),
      date_time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
    };
    state.movimientosCaja = [newMov, ...state.movimientosCaja];
    store.logAudit(`Movimiento Caja (${newMov.type})`, 'Caja', `${newMov.category}: $${newMov.amount} - ${newMov.description}`);
    persist();
    return newMov;
  },

  // Temperatura & BPM
  addControlTemperatura: (tempData: Omit<ControlTemperatura, 'id' | 'is_alert'>) => {
    const is_alert = tempData.temperature_c < tempData.target_temp_min || tempData.temperature_c > tempData.target_temp_max;
    const newTemp: ControlTemperatura = {
      ...tempData,
      id: 'temp-' + Date.now(),
      is_alert
    };
    state.temperaturas = [newTemp, ...state.temperaturas];

    if (is_alert) {
      store.addNotification('temperatura', `¡Alerta de Temperatura en ${newTemp.chamber_name}!`, `Temperatura registrada: ${newTemp.temperature_c}°C fuera de rango (${newTemp.target_temp_min}°C a ${newTemp.target_temp_max}°C).`, 'trazabilidad');
    }

    store.logAudit('Control Temperatura', 'Calidad', `${newTemp.chamber_name}: ${newTemp.temperature_c}°C ${is_alert ? '¡ALERTA!' : 'OK'}`);
    persist();
    return newTemp;
  },

  addChecklist: (checklist: Omit<ChecklistCalidad, 'id'>) => {
    const newChk: ChecklistCalidad = {
      ...checklist,
      id: 'chk-' + Date.now()
    };
    state.checklists = [newChk, ...state.checklists];
    store.logAudit('Checklist de Higiene', 'Calidad', `Completado checklist de turno ${newChk.shift} en ${newChk.area}`);
    persist();
    return newChk;
  },

  addDocumentoLegal: (docData: Omit<DocumentoLegal, 'id' | 'status' | 'days_to_expire'>) => {
    const now = new Date();
    const exp = new Date(docData.expiration_date);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const status = diffDays < 0 ? 'vencido' : diffDays <= 30 ? 'por_vencer' : 'vigente';

    const newDoc: DocumentoLegal = {
      ...docData,
      id: 'doc-' + Date.now(),
      days_to_expire: diffDays,
      status
    };
    state.documentosLegales = [newDoc, ...state.documentosLegales];
    store.logAudit('Nuevo Certificado Legal', 'Calidad', `Cargado documento ${newDoc.title} (${newDoc.cert_number})`);
    persist();
    return newDoc;
  },

  // Configuración de Empresa
  updateEmpresa: (data: Partial<ConfiguracionEmpresa>) => {
    state.empresa = { ...state.empresa, ...data };
    store.logAudit('Actualización Configuración', 'Configuración', 'Modificados datos generales de la empresa');
    persist();
  },

  // Reset a valores iniciales de prueba
  resetToDefaultData: () => {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    persist();
  }
};
