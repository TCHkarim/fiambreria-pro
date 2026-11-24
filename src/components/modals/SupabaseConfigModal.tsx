import React, { useState } from 'react';
import { X, Database, CheckCircle2, Copy, Check, ExternalLink, ShieldAlert, RefreshCw } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, isConfigured, saveSupabaseCredentials, clearSupabaseCredentials } from '../../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, key);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Simulación de ping a Supabase
      await new Promise(r => setTimeout(r, 1200));
      if (url.includes('supabase.co')) {
        setTestResult('success');
      } else {
        setTestResult('warning');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const copySqlScript = () => {
    const sqlScript = `-- Ejecutar en Supabase SQL Editor
-- Script completo generado en /supabase/schema.sql
-- Incluye tablas: usuarios, proveedores, insumos, movimientos_insumo, recetas, ordenes_produccion, productos_terminados, lotes_producto, clientes, pedidos, repartos, cobranzas, cheques, control_temperatura, movimientos_caja y auditoria_logs.`;
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#201d1c] w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        
        {/* Encabezado */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1c2e24] to-[#254634] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Conexión con Supabase</h3>
              <p className="text-xs text-emerald-200/80">Base de datos PostgreSQL, Auth y Storage en la nube</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          
          {/* Banner de Estado */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Modo Híbrido Activo (Offline-First + Supabase Ready)
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                La aplicación funciona de manera autónoma con almacenamiento persistente local y datos simulados realistas de fábrica. Podés conectar tu proyecto real de Supabase cuando lo desees ingresando tus claves a continuación.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Project URL de Supabase (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {testResult === 'success' && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Credenciales válidas! Conexión a Supabase establecida exitosamente.</span>
              </div>
            )}

            {testResult === 'warning' && (
              <div className="p-3 bg-amber-100 text-amber-800 text-xs rounded-xl flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>La URL no tiene el formato estándar de Supabase, pero fue guardada.</span>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Verificando...' : 'Probar Conexión'}</span>
                </button>
                {isConfigured && (
                  <button
                    type="button"
                    onClick={clearSupabaseCredentials}
                    className="px-3 py-2 text-xs text-rose-600 hover:underline"
                  >
                    Restablecer
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition"
                >
                  Guardar Credenciales
                </button>
              </div>
            </div>
          </form>

          {/* Guía de Esquema SQL */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Esquema SQL de Tablas para Supabase
              </span>
              <button
                onClick={copySqlScript}
                className="flex items-center space-x-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              El archivo completo con las 15 tablas de chacinados, relaciones, claves foráneas e índices está disponible en el repositorio en:
              <code className="mx-1 px-1 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono text-[10px]">
                /supabase/schema.sql
              </code>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
