import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateUsuarioUseCase } from './use-cases/create-usuario.use-case';
import { UpdateUsuarioUseCase } from './use-cases/update-usuario.use-case';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';
import { DeactivateUsuarioUseCase } from './use-cases/deactivate-usuario.use-case';
import { ListUsuariosUseCase } from './use-cases/list-usuarios.use-case';
import { CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(
    private readonly createUsuarioUseCase: CreateUsuarioUseCase,
    private readonly updateUsuarioUseCase: UpdateUsuarioUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deactivateUsuarioUseCase: DeactivateUsuarioUseCase,
    private readonly listUsuariosUseCase: ListUsuariosUseCase,
  ) {}

  @Get()
  @Roles('DUENO', 'SUPERVISOR')
  async list() {
    return this.listUsuariosUseCase.execute();
  }

  @Post()
  @Roles('DUENO')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUsuarioDto) {
    return this.createUsuarioUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('DUENO')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    await this.updateUsuarioUseCase.execute(id, dto);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (id !== user.id && user.rol !== 'DUENO') {
      throw new Error('No autorizado');
    }
    await this.changePasswordUseCase.execute(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles('DUENO')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.deactivateUsuarioUseCase.execute(id, user.id);
  }
}
