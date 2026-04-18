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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    VariantesModule,
    InventarioModule,
    PreciosModule,
    VentasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
