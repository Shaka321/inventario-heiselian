import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { IProductoRepository } from '../repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../repositories/producto.repository.interface';
import type { ICategoriaRepository } from '../../categorias/repositories/categoria.repository.interface';
import { I_CATEGORIA_REPOSITORY } from '../../categorias/repositories/categoria.repository.interface';
import { CreateProductoDto } from '../dtos';
import * as crypto from 'crypto';

@Injectable()
export class CreateProductoUseCase {
  constructor(
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
    @Inject(I_CATEGORIA_REPOSITORY)
    private readonly categoriaRepo: ICategoriaRepository,
  ) {}

  async execute(dto: CreateProductoDto): Promise<{ id: string }> {
    const categoria = await this.categoriaRepo.findById(dto.categoriaId);
    if (!categoria || !categoria.activo) {
      throw new NotFoundException('Categoria no encontrada o inactiva');
    }

    const existente = await this.productoRepo.findByNombre(
      dto.nombre,
      dto.categoriaId,
    );
    if (existente) {
      throw new ConflictException(
        'Ya existe un producto con ese nombre en esta categoria',
      );
    }

    const producto = {
      id: crypto.randomUUID(),
      nombre: dto.nombre.trim(),
      categoriaId: dto.categoriaId,
      activo: true,
      creadoEn: new Date(),
    };

    await this.productoRepo.save(producto);
    return { id: producto.id };
  }
}
