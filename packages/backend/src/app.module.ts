import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ProductosModule } from './modules/productos/productos.module';
import { VariantesModule } from './modules/variantes/variantes.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { PreciosModule } from './modules/precios/precios.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { AjustesModule } from './modules/ajustes/ajustes.module';
import { DevolucionesModule } from './modules/devoluciones/devoluciones.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { CierreCajaModule } from './modules/cierre-caja/cierre-caja.module';
import { ConteoInventarioModule } from './modules/conteo-inventario/conteo-inventario.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { CacheModule } from './shared/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    VariantesModule,
    InventarioModule,
    PreciosModule,
    VentasModule,
    AjustesModule,
    DevolucionesModule,
    AuditoriaModule,
    CierreCajaModule,
    ConteoInventarioModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
