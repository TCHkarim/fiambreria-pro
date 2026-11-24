# Don Bautista - Fábrica de Chacinados y Fiambres Artesanales 🥓
### Sistema Integral de Producción, Trazabilidad, Stock FEFO, Reparto y Ventas

Aplicación web completa, moderna y responsive (adaptada a pantallas de escritorio y dispositivos móviles de choferes y operarios de planta) desarrollada para una fábrica elaboradora y distribuidora de fiambres y embutidos (jamón cocido artesanal, salames de Tandil y Caroya, mortadelas con pistacho, bondiolas curadas, etc.).

---

## 🥩 Circuito Integral Cubierto

1. **Dashboard Gerencial:**
   - Métricas de ventas en pesos argentinos ($ ARS).
   - Kilos totales elaborados en planta y rendimiento medio de fórmulas.
   - Alertas críticas de insumos por debajo del stock mínimo y lotes próximos a vencer.
   - Entregas programadas del día y cuentas por cobrar.
   - Gráfico de evolución semanal mayorista vs minorista y mix de producción.
2. **Materia Prima e Insumos:**
   - Alta de cortes de carne de cerdo (pernil, paleta, tocino/lardo dorsal) y vacuna, sal entrefina, sales de cura SENASA, especias, tripas naturales/colágenas y bolsas termoencogibles al vacío.
   - Registro de lote de proveedor y fecha de vencimiento.
   - Control de ingresos, egresos y ajustes manuales con registro de motivo.
3. **Proveedores y Compras:**
   - Ficha de frigoríficos y proveedores de especias/tripas (CUIT, plazos de pago 30/60 días, saldos).
   - Historial comparativo de evolución de precios de carnes e insumos (últimos 90 días).
4. **Recetas, Costos y Listas de Precios:**
   - Fórmulas maestras (BOM) con porcentaje de rendimiento esperado y merma de secado/cocción.
   - Costo por kilo calculado automáticamente según cotizaciones actuales de insumos.
   - Márgenes y listas de precios automáticas: **Mayorista**, **Minorista** y **Distribuidor**.
5. **Producción en 6 Etapas y Generación de Lotes:**
   - Órdenes de producción (OP) con fecha, responsable y objetivo en kg.
   - Descuento automático de materia prima en planta al iniciar la orden.
   - **Línea de tiempo de 6 etapas:**
     1. Picado / Molienda
     2. Mezclado / Ligado
     3. Embutido / Atado
     4. Estufado / Cocción / Secadero
     5. Enfriado
     6. Envasado al Vacío y Rotulado
   - Registro de temperatura en etapa, fecha/hora y operario.
   - Kilos reales pesados, merma real y rendimiento efectivo.
   - Generación automática de número de lote (ej: `LOT-SAL-2026-09`) y vencimiento.
6. **Trazabilidad y Calidad (BPM):**
   - **Genealogía completa interactiva:** Desde cualquier lote de producto terminado hacia atrás (lotes de insumos de proveedores) y hacia adelante (a qué clientes y con qué remitos se entregó).
   - Registro diario de temperaturas y humedad en cámaras frías y hornos.
   - Checklists de sanitización e higiene de turnos mañana/tarde.
   - Bóveda de habilitaciones y certificados oficiales (SENASA, Bromatología, RNE, RNPA, Fumigación MIP) con días restantes de vigencia.
7. **Stock de Producto Terminado (FEFO):**
   - Lotes ordenados automáticamente bajo criterio **FEFO (First Expired, First Out)**.
   - Indicadores de días restantes (verde >60d, amarillo <30d, rojo <15d).
   - Ubicación física en cámaras (Secadero Tandil, Cámara 2, Cámara 3).
8. **Clientes y Cuentas Corrientes:**
   - Ficha completa con Razón Social, CUIT, Condición de IVA, zona y horarios de descarga.
   - Lista de precios asignada y límite de crédito comercial.
   - Saldo deudor en tiempo real y recordatorio de cobro por WhatsApp con CBU/Alias.
9. **Pedidos, Ventas y Remitos Oficiales:**
   - Carga ágil de pedidos por kg o piezas.
   - Generación de **Remito "R" en PDF** con diseño oficial, datos de emisor y cliente, código de barras simulado y conformidad de entrega.
   - Envío de remito y estado por WhatsApp con 1 clic.
   - Opción de repetición de pedido y pedidos semanales recurrentes.
10. **Catálogo Digital para Clientes (WhatsApp):**
    - Pantalla pública para que los clientes elijan fiambres, ingresen su comercio/dirección y envíen el pedido formateado directamente al WhatsApp de ventas de la fábrica.
11. **Reparto y Logística Móvil (con Firma Digital en Pantalla):**
    - Hoja de ruta organizada por zona y paradas (1, 2, 3...).
    - **Modo Celular para Chofer:** Botones rápidos de llamada telefónica directa, navegación GPS con Google Maps y confirmación de entrega con pad de **firma digital en pantalla** del cliente y cobro en mano.
    - Rendición de gastos de combustible y peajes.
12. **Cobranzas y Cartera de Cheques:**
    - Recibos oficiales "X" en PDF.
    - Cartera de cheques comunes y eCheqs con vencimiento, depósito o endoso a proveedores.
13. **Facturación, Caja Diaria y Finanzas:**
    - Registro de facturación con IVA discriminado (21% y 10.5%), CAE y código QR preparado para web service ARCA/AFIP.
    - Caja diaria con ingresos, egresos, gastos de planta y arqueo.
    - Rentabilidad neta por producto.
14. **Reportes y Exportaciones:**
    - Exportación de listados a Excel (formato CSV) y reportes de producción en PDF.
15. **Configuración, Roles y Auditoría:**
    - Cambio instantáneo de roles: **Administrador**, **Producción**, **Ventas**, **Repartidor** y **Contable** con control estricto de visibilidad.
    - Registro histórico de auditoría (quién hizo qué y cuándo con timestamps).
    - Conector nativo de Supabase (`/supabase/schema.sql`).

---

## 🚀 Puesta en Marcha

Para iniciar el servidor de desarrollo local:
```bash
npm run dev
```

Para generar la compilación de producción:
```bash
npm run build
```

---

## 🗄️ Conexión con Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Copia el archivo `supabase/schema.sql` y ejecútalo en el **SQL Editor** de tu panel de Supabase.
3. En la app web, haz clic en el botón de base de datos en la barra superior o en **Configuración > Configurar Supabase** e ingresa tu `Project URL` y `Anon Public Key`.
