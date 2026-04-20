import {
  Injectable,
  Inject,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { I_CONTEO_REPOSITORY } from '../repositories/conteo.repository.interface';
import type { IConteoRepository, ConteoInventario } from '../repositories/conteo.repository.interface';
import { StartBlindCountDto } from '../dtos';

export interface StartBlindCountCommand {
  dto: StartBlindCountDto;
  usuarioId: string;
  usuarioRol: string;
}

@Injectable()
export class StartBlindCountUseCase {
  constructor(
    @Inject(I_CONTEO_REPOSITORY)
    private readonly conteoRepo: IConteoRepository,
  ) {}

  async execute(command: StartBlindCountCommand): Promise<ConteoInventario> {
    const { dto, usuarioId, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException(
        'Solo el due�o puede iniciar un conteo de inventario',
      );
    }

    const conteoActivo = await this.conteoRepo.findActivo();
    if (conteoActivo) {
      throw new ConflictException(
        `Ya existe un conteo en progreso (ID: ${conteoActivo.id}). Resu�lvelo antes de iniciar uno nuevo.`,
      );
    }

    return this.conteoRepo.iniciar({
      iniciadoPorId: usuarioId,
      varianteIds: dto.varianteIds,
      notas: dto.notas,
    });
  }
}



