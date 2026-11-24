import React, { useEffect, useState } from 'react';
import { supabase, isConfigured } from '../../services/supabase';
import {
  startSync,
  stopSync,
  flushSync,
  limpiarDatosLocales,
  onSyncStatus,
  getSyncStatus,
} from '../../services/sync';
import type { SyncStatus } from '../../services/sync';

interface Props {
  children: React.ReactNode;
}

/**
 * Si Supabase está configurado (variables VITE_SUPABASE_*), exige iniciar sesión
 * y sincroniza los datos. Si no está configurado, la app funciona en modo demostración.
 */
export const AuthGate: React.FC<Props> = ({ children }) => {
  if (!isConfigured) return <>{children}</>;
  return <GateConfigurado>{children}</GateConfigurado>;
};

const pantalla =
  'min-h-screen flex items-center justify-center bg-[#faf6f0] dark:bg-[#141211] text-[#1b1918] dark:text-[#fafaf9] p-4';
const tarjeta =
  'w-full max-w-sm rounded-2xl border border-[#e8ded4] dark:border-[#38312e] bg-white dark:bg-[#1f1b1a] p-6 shadow-sm';
const boton =
  'w-full rounded-lg bg-[#781d28] hover:bg-[#5c121c] text-white font-semibold py-2.5 transition-colors disabled:opacity-60';

const GateConfigurado: React.FC<Props> = ({ children }) => {
  const [revisando, setRevisando] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [fase, setFase] = useState<'sin_sesion' | 'cargando' | 'listo' | 'error'>('sin_sesion');
  const [errorCarga, setErrorCarga] = useState('');
  const [reintento, setReintento] = useState(0);

  // Sesión de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setRevisando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUserId(sesion?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Carga inicial de datos al iniciar sesión
  useEffect(() => {
    if (!userId) {
      setFase('sin_sesion');
      return;
    }
    let cancelado = false;
    setFase('cargando');
    startSync()
      .then(() => {
        if (!cancelado) setFase('listo');
      })
      .catch(e => {
        if (!cancelado) {
          setErrorCarga(e instanceof Error ? e.message : String(e));
          setFase('error');
        }
      });
    return () => {
      cancelado = true;
      stopSync();
    };
  }, [userId, reintento]);

  const salir = async () => {
    const ok = await flushSync();
    if (!ok && !window.confirm('Hay cambios que todavía no se pudieron guardar en la nube. Si salís ahora se pierden. ¿Salir igual?')) {
      return;
    }
    stopSync();
    limpiarDatosLocales();
    await supabase.auth.signOut();
  };

  if (revisando) {
    return (
      <div className={pantalla}>
        <p className="text-sm opacity-70">Cargando…</p>
      </div>
    );
  }

  if (!userId) return <Login />;

  if (fase === 'cargando' || fase === 'sin_sesion') {
    return (
      <div className={pantalla}>
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#781d28] border-t-transparent" />
          <p className="text-sm opacity-70">Cargando datos de la fábrica…</p>
        </div>
      </div>
    );
  }

  if (fase === 'error') {
    return (
      <div className={pantalla}>
        <div className={tarjeta}>
          <h1 className="text-lg font-bold mb-2">No se pudo conectar con la base de datos</h1>
          <p className="text-sm opacity-80 mb-3">
            Revisá que hayas ejecutado el archivo <code>supabase/schema.sql</code> en el SQL Editor de Supabase y que las
            variables de entorno estén bien cargadas.
          </p>
          <p className="text-xs rounded bg-black/5 dark:bg-white/10 p-2 mb-4 break-words">{errorCarga}</p>
          <button className={boton} onClick={() => setReintento(n => n + 1)}>
            Reintentar
          </button>
          <button className="mt-2 w-full text-sm underline opacity-70" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <EstadoSync onSalir={salir} />
    </>
  );
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ingresar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
    setEnviando(false);
    if (err) setError('Email o contraseña incorrectos.');
  };

  return (
    <div className={pantalla}>
      <form onSubmit={ingresar} className={tarjeta}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#781d28] text-xl font-bold text-white">
          DB
        </div>
        <h1 className="text-center text-xl font-bold">Don Bautista</h1>
        <p className="mb-5 text-center text-sm opacity-70">Ingresá para acceder al sistema</p>

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[#e8ded4] dark:border-[#38312e] bg-transparent px-3 py-2 outline-none focus:border-[#781d28]"
        />

        <label className="mb-1 block text-sm font-medium">Contraseña</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={clave}
          onChange={e => setClave(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[#e8ded4] dark:border-[#38312e] bg-transparent px-3 py-2 outline-none focus:border-[#781d28]"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={enviando} className={boton}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

const textoEstado: Record<SyncStatus, string> = {
  idle: 'En espera',
  syncing: 'Guardando…',
  ok: 'Guardado en la nube',
  error: 'Sin conexión, reintentando…',
};

const colorEstado: Record<SyncStatus, string> = {
  idle: 'bg-stone-400',
  syncing: 'bg-amber-500',
  ok: 'bg-emerald-500',
  error: 'bg-red-500',
};

const EstadoSync: React.FC<{ onSalir: () => void }> = ({ onSalir }) => {
  const [info, setInfo] = useState(getSyncStatus());

  useEffect(() => onSyncStatus((status, error) => setInfo({ status, error })), []);

  return (
    <div
      className="fixed left-3 bottom-20 md:bottom-3 z-40 flex items-center gap-2 rounded-full border border-[#e8ded4] dark:border-[#38312e] bg-white/95 dark:bg-[#1f1b1a]/95 px-3 py-1.5 text-xs shadow"
      title={info.error || undefined}
    >
      <span className={`h-2 w-2 rounded-full ${colorEstado[info.status]}`} />
      <span>{textoEstado[info.status]}</span>
      <button onClick={onSalir} className="ml-1 underline opacity-70 hover:opacity-100">
        Salir
      </button>
    </div>
  );
};
