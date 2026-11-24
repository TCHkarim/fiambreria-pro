-- ====================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS - LA ARTESANA FIAMBRERÍA Y CHACINADOS
-- Para ejecutar en el SQL Editor de Supabase
-- ====================================================================

-- 1. TABLA DE USUARIOS Y ROLES
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('admin', 'produccion', 'ventas', 'repartidor', 'contable')),
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA DE PROVEEDORES
CREATE TABLE IF NOT EXISTS public.proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(150) NOT NULL,
    cuit VARCHAR(20) UNIQUE NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion TEXT,
    condicion_pago VARCHAR(100) DEFAULT '30 días',
    saldo NUMERIC(14, 2) DEFAULT 0.00,
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE INSUMOS Y MATERIA PRIMA
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_actual NUMERIC(12, 3) DEFAULT 0.000,
    stock_minimo NUMERIC(12, 3) DEFAULT 0.000,
    costo_unitario NUMERIC(14, 2) DEFAULT 0.00,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    lote_proveedor VARCHAR(50),
    fecha_vencimiento DATE,
    ubicacion VARCHAR(100),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. MOVIMIENTOS DE STOCK DE INSUMOS
CREATE TABLE IF NOT EXISTS public.movimientos_insumo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso', 'ajuste', 'produccion')),
    cantidad NUMERIC(12, 3) NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now(),
    motivo TEXT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    lote_id VARCHAR(50)
);

-- 5. TABLA DE RECETAS Y RENDIMIENTOS
CREATE TABLE IF NOT EXISTS public.recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tamanio_batch_kg NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    rendimiento_esperado_pct NUMERIC(6, 2) NOT NULL,
    merma_esperada_pct NUMERIC(6, 2) NOT NULL,
    ingredientes JSONB NOT NULL DEFAULT '[]'::jsonb,
    instrucciones JSONB DEFAULT '[]'::jsonb,
    costo_kilo_calculado NUMERIC(14, 2) DEFAULT 0.00,
    margenes JSONB NOT NULL,
    precios JSONB NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 6. ÓRDENES DE PRODUCCIÓN
CREATE TABLE IF NOT EXISTS public.ordenes_produccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(40) UNIQUE NOT NULL,
    receta_id UUID REFERENCES public.recetas(id),
    nombre_producto VARCHAR(150) NOT NULL,
    numero_lote VARCHAR(50) UNIQUE NOT NULL,
    kilos_objetivo NUMERIC(10, 2) NOT NULL,
    kilos_reales NUMERIC(10, 2) DEFAULT 0.00,
    cantidad_piezas INT DEFAULT 0,
    estado VARCHAR(30) DEFAULT 'planificada' CHECK (estado IN ('planificada', 'en_proceso', 'completada', 'cancelada')),
    etapa_actual VARCHAR(40) DEFAULT 'picado',
    etapas_log JSONB DEFAULT '[]'::jsonb,
    lotes_insumos_usados JSONB DEFAULT '[]'::jsonb,
    rendimiento_real_pct NUMERIC(6, 2) DEFAULT 0.00,
    merma_kg NUMERIC(10, 2) DEFAULT 0.00,
    fecha_planificada DATE NOT NULL,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    responsable VARCHAR(100),
    ubicacion_camara VARCHAR(100),
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 7. PRODUCTOS TERMINADOS Y LOTES
CREATE TABLE IF NOT EXISTS public.productos_terminados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    unidad VARCHAR(20) DEFAULT 'kg',
    receta_id UUID REFERENCES public.recetas(id),
    stock_total_kg NUMERIC(12, 2) DEFAULT 0.00,
    stock_piezas INT DEFAULT 0,
    stock_minimo_kg NUMERIC(12, 2) DEFAULT 0.00,
    precios JSONB NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.lotes_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.productos_terminados(id) ON DELETE CASCADE,
    numero_lote VARCHAR(50) UNIQUE NOT NULL,
    kilos_iniciales NUMERIC(10, 2) NOT NULL,
    kilos_actuales NUMERIC(10, 2) NOT NULL,
    cantidad_piezas INT DEFAULT 0,
    fecha_elaboracion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    ubicacion_camara VARCHAR(100),
    estado VARCHAR(30) DEFAULT 'disponible',
    orden_produccion_id UUID REFERENCES public.ordenes_produccion(id)
);

-- 8. CLIENTES Y CONDICIONES COMERCIALES
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(150) NOT NULL,
    nombre_fantasia VARCHAR(150),
    cuit VARCHAR(20) UNIQUE NOT NULL,
    condicion_iva VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'Buenos Aires',
    zona VARCHAR(80) NOT NULL,
    horario_entrega VARCHAR(100),
    lista_precio VARCHAR(30) DEFAULT 'mayorista',
    limite_credito NUMERIC(14, 2) DEFAULT 0.00,
    saldo NUMERIC(14, 2) DEFAULT 0.00,
    telefono VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(100),
    contacto VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 9. PEDIDOS Y VENTAS
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido VARCHAR(40) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    fecha_entrega DATE,
    estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'en_reparto', 'entregado', 'cancelado')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(14, 2) DEFAULT 0.00,
    descuento_pct NUMERIC(5, 2) DEFAULT 0.00,
    iva NUMERIC(14, 2) DEFAULT 0.00,
    total NUMERIC(14, 2) DEFAULT 0.00,
    metodo_pago VARCHAR(40) DEFAULT 'cuenta_corriente',
    estado_pago VARCHAR(30) DEFAULT 'pendiente',
    monto_pagado NUMERIC(14, 2) DEFAULT 0.00,
    repartidor_id UUID REFERENCES public.usuarios(id),
    orden_parada INT,
    numero_remito VARCHAR(40),
    es_recurrente BOOLEAN DEFAULT false,
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 10. REPARTO Y HOJAS DE RUTA
CREATE TABLE IF NOT EXISTS public.repartos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    zona VARCHAR(80) NOT NULL,
    repartidor_id UUID REFERENCES public.usuarios(id),
    patente_vehiculo VARCHAR(20),
    estado VARCHAR(30) DEFAULT 'programada',
    paradas JSONB DEFAULT '[]'::jsonb,
    gastos JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 11. COBRANZAS Y CHEQUES
CREATE TABLE IF NOT EXISTS public.cobranzas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_recibo VARCHAR(40) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id),
    fecha DATE DEFAULT CURRENT_DATE,
    monto NUMERIC(14, 2) NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL,
    referencia VARCHAR(100),
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cheques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cheque VARCHAR(50) NOT NULL,
    banco VARCHAR(100) NOT NULL,
    cuit_librador VARCHAR(20),
    nombre_librador VARCHAR(120),
    cliente_id UUID REFERENCES public.clientes(id),
    monto NUMERIC(14, 2) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_cobro DATE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'echeq',
    estado VARCHAR(30) DEFAULT 'en_cartera',
    endosado_a VARCHAR(120),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- 12. CONTROL DE TEMPERATURAS Y BPM
CREATE TABLE IF NOT EXISTS public.control_temperatura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camara_id VARCHAR(50) NOT NULL,
    camara_nombre VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMPTZ DEFAULT now(),
    temperatura_c NUMERIC(5, 2) NOT NULL,
    humedad_pct NUMERIC(5, 2),
    es_alerta BOOLEAN DEFAULT false,
    operador VARCHAR(100),
    notas TEXT
);

-- 13. CAJA DIARIA Y AUDITORÍA
CREATE TABLE IF NOT EXISTS public.movimientos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_hora TIMESTAMPTZ DEFAULT now(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    categoria VARCHAR(50) NOT NULL,
    monto NUMERIC(14, 2) NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL,
    descripcion TEXT NOT NULL,
    responsable VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    usuario_nombre VARCHAR(100) NOT NULL,
    usuario_rol VARCHAR(30) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(60) NOT NULL,
    detalles TEXT
);
