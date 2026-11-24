-- ====================================================================
-- DON BAUTISTA - ESQUEMA DE BASE DE DATOS (Supabase)
-- Ejecutar UNA VEZ en: Supabase > SQL Editor > New query > pegar > Run
-- Se puede volver a ejecutar sin problema (no borra datos).
-- ====================================================================
--
-- Cada módulo de la app guarda sus registros en una tabla "doc_<módulo>":
--   id          identificador del registro (el mismo que usa la app)
--   data        el registro completo (jsonb)
--   pos         posición original en la lista (para mantener el orden)
--   created_at  fecha de creación
--   updated_at  fecha de última modificación
--
-- Seguridad: solo pueden leer y escribir los usuarios que iniciaron sesión
-- (Row Level Security). El acceso anónimo queda bloqueado.

do $$
declare
  nombre text;
  tabla  text;
  modulos text[] := array[
    'empresa',
    'proveedores',
    'insumos',
    'movimientos_insumo',
    'recetas',
    'ordenes_produccion',
    'productos_terminados',
    'lotes',
    'clientes',
    'pedidos',
    'repartos',
    'cobranzas',
    'cheques',
    'facturas',
    'movimientos_caja',
    'temperaturas',
    'checklists',
    'documentos_legales',
    'incidencias',
    'notificaciones',
    'auditoria'
  ];
begin
  foreach nombre in array modulos loop
    tabla := 'doc_' || nombre;

    execute format(
      'create table if not exists public.%I (
         id         text primary key,
         data       jsonb not null,
         pos        integer not null default 0,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now()
       )', tabla);

    execute format('alter table public.%I enable row level security', tabla);

    -- Sin acceso anónimo; acceso completo para usuarios con sesión iniciada
    execute format('revoke all on public.%I from anon', tabla);
    execute format('grant select, insert, update, delete on public.%I to authenticated', tabla);

    execute format('drop policy if exists "acceso_usuarios_autenticados" on public.%I', tabla);
    execute format(
      'create policy "acceso_usuarios_autenticados" on public.%I
         for all to authenticated using (true) with check (true)', tabla);
  end loop;
end $$;

-- ====================================================================
-- DESPUÉS DE EJECUTAR ESTO, EN EL PANEL DE SUPABASE:
--
-- 1) Authentication > Users > Add user > Create new user
--    Cargá tu email y una contraseña, y activá "Auto Confirm User".
--
-- 2) Authentication > Sign In / Providers (o "Settings"):
--    DESACTIVÁ "Allow new users to sign up".
--    Importante: si queda activado, cualquier persona con la dirección
--    de tu app podría registrarse y ver tus datos.
-- ====================================================================
