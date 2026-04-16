-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DUENO', 'SUPERVISOR', 'EMPLEADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('PENDIENTE', 'COMPLETADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('VENTA_CREADA', 'VENTA_ANULADA', 'STOCK_AJUSTADO', 'PRECIO_ACTUALIZADO', 'USUARIO_CREADO', 'USUARIO_DESACTIVADO', 'COMPRA_REGISTRADA', 'CIERRE_CAJA', 'CONTEO_INVENTARIO', 'DEVOLUCION_REGISTRADA', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variantes" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'PENDIENTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_items" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_snapshot" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "venta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones" (
    "id" TEXT NOT NULL,
    "venta_id" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "cantidad_unidades" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_historial" (
    "id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "precio_anterior" DECIMAL(10,2) NOT NULL,
    "precio_nuevo" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "precios_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres_caja" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "monto_esperado" DECIMAL(10,2) NOT NULL,
    "monto_real" DECIMAL(10,2) NOT NULL,
    "diferencia" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierres_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteos_inventario" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "diferencias_json" JSONB NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conteos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_evento" "TipoEvento" NOT NULL,
    "payload" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex
CREATE INDEX "usuarios_activo_idx" ON "usuarios"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expira_en_idx" ON "refresh_tokens"("expira_en");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE INDEX "categorias_activo_idx" ON "categorias"("activo");

-- CreateIndex
CREATE INDEX "productos_categoria_id_idx" ON "productos"("categoria_id");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "productos_nombre_idx" ON "productos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_sku_key" ON "variantes"("sku");

-- CreateIndex
CREATE INDEX "variantes_producto_id_idx" ON "variantes"("producto_id");

-- CreateIndex
CREATE INDEX "variantes_sku_idx" ON "variantes"("sku");

-- CreateIndex
CREATE INDEX "variantes_activo_idx" ON "variantes"("activo");

-- CreateIndex
CREATE INDEX "variantes_stock_idx" ON "variantes"("stock");

-- CreateIndex
CREATE INDEX "ventas_usuario_id_idx" ON "ventas"("usuario_id");

-- CreateIndex
CREATE INDEX "ventas_estado_idx" ON "ventas"("estado");

-- CreateIndex
CREATE INDEX "ventas_metodo_pago_idx" ON "ventas"("metodo_pago");

-- CreateIndex
CREATE INDEX "ventas_creado_en_idx" ON "ventas"("creado_en");

-- CreateIndex
CREATE INDEX "venta_items_venta_id_idx" ON "venta_items"("venta_id");

-- CreateIndex
CREATE INDEX "venta_items_variante_id_idx" ON "venta_items"("variante_id");

-- CreateIndex
CREATE INDEX "devoluciones_venta_id_idx" ON "devoluciones"("venta_id");

-- CreateIndex
CREATE INDEX "devoluciones_creado_en_idx" ON "devoluciones"("creado_en");

-- CreateIndex
CREATE INDEX "proveedores_activo_idx" ON "proveedores"("activo");

-- CreateIndex
CREATE INDEX "compras_variante_id_idx" ON "compras"("variante_id");

-- CreateIndex
CREATE INDEX "compras_proveedor_id_idx" ON "compras"("proveedor_id");

-- CreateIndex
CREATE INDEX "compras_creado_en_idx" ON "compras"("creado_en");

-- CreateIndex
CREATE INDEX "precios_historial_variante_id_idx" ON "precios_historial"("variante_id");

-- CreateIndex
CREATE INDEX "precios_historial_usuario_id_idx" ON "precios_historial"("usuario_id");

-- CreateIndex
CREATE INDEX "precios_historial_fecha_idx" ON "precios_historial"("fecha");

-- CreateIndex
CREATE INDEX "cierres_caja_usuario_id_idx" ON "cierres_caja"("usuario_id");

-- CreateIndex
CREATE INDEX "cierres_caja_creado_en_idx" ON "cierres_caja"("creado_en");

-- CreateIndex
CREATE INDEX "conteos_inventario_usuario_id_idx" ON "conteos_inventario"("usuario_id");

-- CreateIndex
CREATE INDEX "conteos_inventario_creado_en_idx" ON "conteos_inventario"("creado_en");

-- CreateIndex
CREATE INDEX "audit_logs_usuario_id_idx" ON "audit_logs"("usuario_id");

-- CreateIndex
CREATE INDEX "audit_logs_tipo_evento_idx" ON "audit_logs"("tipo_evento");

-- CreateIndex
CREATE INDEX "audit_logs_creado_en_idx" ON "audit_logs"("creado_en");

-- CreateIndex
CREATE INDEX "audit_logs_checksum_idx" ON "audit_logs"("checksum");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_items" ADD CONSTRAINT "venta_items_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_items" ADD CONSTRAINT "venta_items_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_historial" ADD CONSTRAINT "precios_historial_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_historial" ADD CONSTRAINT "precios_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteos_inventario" ADD CONSTRAINT "conteos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
