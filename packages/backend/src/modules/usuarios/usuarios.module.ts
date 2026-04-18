import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { CreateUsuarioUseCase } from './use-cases/create-usuario.use-case';
import { UpdateUsuarioUseCase } from './use-cases/update-usuario.use-case';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';
import { DeactivateUsuarioUseCase } from './use-cases/deactivate-usuario.use-case';
import { ListUsuariosUseCase } from './use-cases/list-usuarios.use-case';
import { PrismaUsuarioRepository } from './infrastructure/prisma-usuario.repository';
import { I_USUARIO_REPOSITORY } from './repositories/usuario.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [UsuariosController],
  providers: [
    PrismaService,
    CreateUsuarioUseCase,
    UpdateUsuarioUseCase,
    ChangePasswordUseCase,
    DeactivateUsuarioUseCase,
    ListUsuariosUseCase,
    {
      provide: I_USUARIO_REPOSITORY,
      useClass: PrismaUsuarioRepository,
    },
  ],
  exports: [I_USUARIO_REPOSITORY, PrismaService],
})
export class UsuariosModule {}
