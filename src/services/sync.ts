import { supabase, isConfigured } from './supabase';
import { store, STORAGE_KEY } from './store';
import type { AppState } from './store';

/**
 * Sincronización con Supabase.
 *
 * Cada colección del store (insumos, pedidos, lotes...) vive en una tabla
 * "doc_<nombre>" con columnas: id, data (jsonb), pos, created_at, updated_at.
 * La app sigue trabajando contra el store local (rápido y con modo offline);
 * este módulo sube los cambios y baja los datos remotos.
 */

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error';

interface Coleccion {
  key: keyof AppState;
  tabla: string;
  unica?: boolean; // objeto único (empresa) en lugar de lista
}

const COLECCIONES: Coleccion[] = [
  { key: 'empresa', tabla: 'doc_empresa', unica: true },
  { key: 'proveedores', tabla: 'doc_proveedores' },
  { key: 'insumos', tabla: 'doc_insumos' },
  { key: 'movimientosInsumo', tabla: 'doc_movimientos_insumo' },
  { key: 'recetas', tabla: 'doc_recetas' },
  { key: 'ordenesProduccion', tabla: 'doc_ordenes_produccion' },
  { key: 'productosTerminados', tabla: 'doc_productos_terminados' },
  { key: 'lotes', tabla: 'doc_lotes' },
  { key: 'clientes', tabla: 'doc_clientes' },
  { key: 'pedidos', tabla: 'doc_pedidos' },
  { key: 'repartos', tabla: 'doc_repartos' },
  { key: 'cobranzas', tabla: 'doc_cobranzas' },
  { key: 'cheques', tabla: 'doc_cheques' },
  { key: 'facturas', tabla: 'doc_facturas' },
  { key: 'movimientosCaja', tabla: 'doc_movimientos_caja' },
  { key: 'temperaturas', tabla: 'doc_temperaturas' },
  { key: 'checklists', tabla: 'doc_checklists' },
  { key: 'documentosLegales', tabla: 'doc_documentos_legales' },
  { key: 'incidencias', tabla: 'doc_incidencias' },
  { key: 'notificaciones', tabla: 'doc_notificaciones' },
  { key: 'auditoria', tabla: 'doc_auditoria' },
];

const DIRTY_KEY = 'la_artesana_sync_pendiente';
const PAGINA = 1000;
const LOTE_UPSERT = 200;
const LOTE_DELETE = 100;
const ID_UNICO = 'empresa';

interface Fila {
  id: string;
  data: unknown;
}

type Mapa = Map<string, string>;

// ---------- Estado interno ----------
let generacion = 0;
let listo = false;
let enviando = false;
let temporizador: ReturnType<typeof setTimeout> | null = null;
let intervalo: ReturnType<typeof setInterval> | null = null;
let ultimo: Record<string, Mapa> = {}; // lo último que sabemos que está en Supabase
let estado: SyncStatus = 'idle';
let ultimoError = '';
const oyentes = new Set<(s: SyncStatus, err: string) => void>();
let quitarEventos: Array<() => void> = [];

const setEstado = (s: SyncStatus, err = '') => {
  estado = s;
  ultimoError = err;
  oyentes.forEach(fn => fn(s, err));
};

export const getSyncStatus = () => ({ status: estado, error: ultimoError });

export const onSyncStatus = (fn: (s: SyncStatus, err: string) => void) => {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
};

// ---------- Utilidades ----------

// JSON con claves ordenadas: Postgres (jsonb) reordena las claves, así que
// comparamos siempre en forma canónica.
const canon = (v: unknown): string =>
  JSON.stringify(v, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.keys(val as Record<string, unknown>)
          .sort()
          .reduce((o: Record<string, unknown>, k) => {
            o[k] = (val as Record<string, unknown>)[k];
            return o;
          }, {})
      : val
  );

const trozos = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

const mensaje = (e: unknown): string => (e instanceof Error ? e.message : String(e));

const marcarPendiente = (v: boolean) => {
  try {
    localStorage.setItem(DIRTY_KEY, v ? '1' : '0');
  } catch {
    /* sin acceso a localStorage */
  }
};

interface ItemLeido {
  id: string;
  json: string;
  data: unknown;
  pos: number;
}

const leer = (c: Coleccion, s: AppState): ItemLeido[] => {
  const valor = s[c.key] as unknown;
  if (c.unica) {
    return [{ id: ID_UNICO, json: canon(valor), data: valor, pos: 0 }];
  }
  const out: ItemLeido[] = [];
  (valor as Array<{ id?: string | number }>).forEach((it, idx) => {
    if (it && it.id !== undefined && it.id !== null) {
      out.push({ id: String(it.id), json: canon(it), data: it, pos: idx });
    }
  });
  return out;
};

// ---------- Descarga ----------

const traerTabla = async (tabla: string): Promise<Fila[]> => {
  const out: Fila[] = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await supabase
      .from(tabla)
      .select('id,data')
      .order('pos', { ascending: true })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(desde, desde + PAGINA - 1);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    const filas = (data ?? []) as Fila[];
    out.push(...filas);
    if (filas.length < PAGINA) break;
  }
  return out;
};

const traerTodo = async (): Promise<Record<string, Fila[]>> => {
  const resultado: Record<string, Fila[]> = {};
  await Promise.all(
    COLECCIONES.map(async c => {
      resultado[c.tabla] = await traerTabla(c.tabla);
    })
  );
  return resultado;
};

// Aplica lo que hay en Supabase al store local
const aplicarRemoto = (remoto: Record<string, Fila[]>) => {
  const actual = store.getState();
  const parcial: Record<string, unknown> = {};
  const nuevoUltimo: Record<string, Mapa> = {};

  for (const c of COLECCIONES) {
    const filas = remoto[c.tabla] ?? [];
    const mapa: Mapa = new Map();
    filas.forEach(f => mapa.set(f.id, canon(f.data)));
    nuevoUltimo[c.tabla] = mapa;

    if (c.unica) {
      if (filas[0] && canon(filas[0].data) !== canon(actual[c.key])) {
        parcial[c.key] = filas[0].data;
      }
    } else {
      const lista = filas.map(f => f.data);
      if (canon(lista) !== canon(actual[c.key])) {
        parcial[c.key] = lista;
      }
    }
  }

  ultimo = nuevoUltimo;
  if (Object.keys(parcial).length > 0) {
    store.replaceCollections(parcial as Partial<AppState>);
  }
};

// ---------- Subida ----------

const subirCambios = async () => {
  const s = store.getState();
  const ahora = new Date().toISOString();

  for (const c of COLECCIONES) {
    const previo = ultimo[c.tabla] ?? new Map<string, string>();
    const actuales = leer(c, s);
    const idsActuales = new Set(actuales.map(a => a.id));

    const nuevas: Array<Record<string, unknown>> = [];
    const cambiadas: Array<Record<string, unknown>> = [];
    for (const a of actuales) {
      const antes = previo.get(a.id);
      if (antes === undefined) {
        nuevas.push({ id: a.id, data: a.data, pos: a.pos, updated_at: ahora });
      } else if (antes !== a.json) {
        cambiadas.push({ id: a.id, data: a.data, updated_at: ahora });
      }
    }
    const borradas = [...previo.keys()].filter(id => !idsActuales.has(id));

    for (const lote of trozos(nuevas, LOTE_UPSERT)) {
      const { error } = await supabase.from(c.tabla).upsert(lote);
      if (error) throw new Error(`${c.tabla}: ${error.message}`);
    }
    for (const lote of trozos(cambiadas, LOTE_UPSERT)) {
      const { error } = await supabase.from(c.tabla).upsert(lote);
      if (error) throw new Error(`${c.tabla}: ${error.message}`);
    }
    for (const lote of trozos(borradas, LOTE_DELETE)) {
      const { error } = await supabase.from(c.tabla).delete().in('id', lote);
      if (error) throw new Error(`${c.tabla}: ${error.message}`);
    }

    ultimo[c.tabla] = new Map(actuales.map(a => [a.id, a.json] as [string, string]));
  }
};

const programar = (ms: number) => {
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(ejecutarSubida, ms);
};

async function ejecutarSubida() {
  temporizador = null;
  if (!listo) return;
  if (enviando) {
    programar(500);
    return;
  }
  enviando = true;
  setEstado('syncing');
  try {
    await subirCambios();
    if (!temporizador) marcarPendiente(false);
    setEstado('ok');
  } catch (e) {
    setEstado('error', mensaje(e));
    programar(15000); // reintenta solo
  } finally {
    enviando = false;
  }
}

const alCambiarLocal = () => {
  if (!listo) return;
  marcarPendiente(true);
  programar(800);
};

const traerYAplicar = async () => {
  if (!listo || enviando || temporizador) return;
  try {
    const remoto = await traerTodo();
    // si mientras tanto el usuario hizo cambios, no pisamos nada
    if (!listo || enviando || temporizador) return;
    if ((remoto['doc_empresa'] ?? []).length === 0) return;
    aplicarRemoto(remoto);
  } catch {
    /* sin conexión: se reintenta en la próxima vuelta */
  }
};

// ---------- API pública ----------

export const stopSync = () => {
  generacion++;
  listo = false;
  if (temporizador) clearTimeout(temporizador);
  temporizador = null;
  if (intervalo) clearInterval(intervalo);
  intervalo = null;
  quitarEventos.forEach(fn => fn());
  quitarEventos = [];
  store.setPersistHook(null);
};

/**
 * Carga inicial. Lanza un error si no se puede conectar o si faltan las tablas.
 * - Si Supabase está vacío: sube los datos locales (carga inicial).
 * - Si hay cambios locales sin subir: los sube primero.
 * - Si no: reemplaza los datos locales por los de Supabase.
 */
export const startSync = async (): Promise<void> => {
  if (!isConfigured) return;
  stopSync();
  const gen = generacion;
  setEstado('syncing');

  try {
    const remoto = await traerTodo();
    if (gen !== generacion) return;

    const tieneDatos = (remoto['doc_empresa'] ?? []).length > 0;
    const pendiente = localStorage.getItem(DIRTY_KEY) === '1';

    if (!tieneDatos || pendiente) {
      ultimo = {};
      await subirCambios();
      if (gen !== generacion) return;
    } else {
      aplicarRemoto(remoto);
    }
    marcarPendiente(false);
  } catch (e) {
    if (gen === generacion) setEstado('error', mensaje(e));
    throw e;
  }

  listo = true;
  store.setPersistHook(alCambiarLocal);

  const alEnfocar = () => {
    void traerYAplicar();
  };
  const alVolver = () => {
    if (document.visibilityState === 'visible') void traerYAplicar();
  };
  const alConectar = () => programar(200);
  window.addEventListener('focus', alEnfocar);
  document.addEventListener('visibilitychange', alVolver);
  window.addEventListener('online', alConectar);
  quitarEventos = [
    () => window.removeEventListener('focus', alEnfocar),
    () => document.removeEventListener('visibilitychange', alVolver),
    () => window.removeEventListener('online', alConectar),
  ];
  intervalo = setInterval(() => {
    if (document.visibilityState === 'visible') void traerYAplicar();
  }, 120000);

  setEstado('ok');
  void traerYAplicar();
};

/** Sube ya mismo lo que esté pendiente (se usa antes de cerrar sesión). Devuelve false si no pudo. */
export const flushSync = async (): Promise<boolean> => {
  if (!listo) return true;
  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }
  if (enviando) return false;
  enviando = true;
  try {
    await subirCambios();
    marcarPendiente(false);
    return true;
  } catch {
    return false; // queda marcado como pendiente
  } finally {
    enviando = false;
  }
};

/** Borra la copia local de los datos (al cerrar sesión). */
export const limpiarDatosLocales = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DIRTY_KEY);
  } catch {
    /* nada */
  }
};
